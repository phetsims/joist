// Copyright 2021-2025, University of Colorado Boulder

/**
 * Wrap the Display class in sim-specific logic. This includes fuzzing support, browser workarounds that have come up
 * over the years, and many listeners added the Display Instance.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chris Malley (PixelZoom, Inc.)
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 * @author Michael Kauzmann (PhET Interactive Simulations)
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import BooleanProperty from '../../axon/js/BooleanProperty.js';
import type TProperty from '../../axon/js/TProperty.js';
import optionize from '../../phet-core/js/optionize.js';
import platform from '../../phet-core/js/platform.js';
import { QueryStringMachine } from '../../query-string-machine/js/QueryStringMachineModule.js';
import KeyboardFuzzer from '../../scenery/js/accessibility/KeyboardFuzzer.js';
import { styleForHiddenPDOM } from '../../scenery/js/accessibility/pdom/PDOMSiblingStyle.js';
import Display, { type DisplayOptions } from '../../scenery/js/display/Display.js';
import InputFuzzer from '../../scenery/js/input/InputFuzzer.js';
import animatedPanZoomSingleton from '../../scenery/js/listeners/animatedPanZoomSingleton.js';
import Node, { type RendererType } from '../../scenery/js/nodes/Node.js';
import scenery from '../../scenery/js/scenery.js';
import Utils from '../../scenery/js/util/Utils.js';
import '../../sherpa/lib/game-up-camera-1.0.0.js';
import Tandem from '../../tandem/js/Tandem.js';
import DynamicStringTest from './DynamicStringTest.js';
import joist from './joist.js';
import type PreferencesModel from './preferences/PreferencesModel.js';

type SelfOptions = {
  webgl?: boolean;
  rootRenderer?: RendererType;
  preferencesModel: PreferencesModel;
};
export type SimDisplayOptions = SelfOptions & DisplayOptions;

export default class SimDisplay extends Display {

  // root for the simulation and the target for AnimatedPanZoomListener to support magnification since the Display rootNode
  // cannot be transformed
  public readonly simulationRoot = new Node();
  private readonly inputFuzzer: InputFuzzer;
  private readonly keyboardFuzzer: KeyboardFuzzer;

  private readonly supportsPanAndZoomProperty: TProperty<boolean>;

  // In non-accessible simulations, there are cases where we want a focusable element in the sim.
  private focusablePlaceholder: HTMLElement | null = null;

  // For consistent option defaults
  public static readonly DEFAULT_WEBGL = false;

  public constructor( providedOptions: SimDisplayOptions ) {

    const options = optionize<SimDisplayOptions, SelfOptions, DisplayOptions>()( {

      // the default renderer for the rootNode, see #221, #184 and https://github.com/phetsims/molarity/issues/24
      rootRenderer: 'svg',

      // Sims that do not use WebGL trigger a ~ 0.5 second pause shortly after the sim starts up, so sims must opt in to
      // webgl support, see https://github.com/phetsims/scenery/issues/621
      webgl: SimDisplay.DEFAULT_WEBGL,

      // {boolean} - Whether to allow WebGL 2x scaling when antialiasing is detected. If running out of memory on
      // things like iPad 2s (e.g. https://github.com/phetsims/scenery/issues/859), this can be turned to false.
      allowBackingScaleAntialiasing: true,

      // prevent overflow that can cause iOS bugginess, see https://github.com/phetsims/phet-io/issues/341
      allowSceneOverflow: false,

      // Indicate whether webgl is allowed to facilitate testing on non-webgl platforms, see https://github.com/phetsims/scenery/issues/289
      allowWebGL: phet.chipper.queryParameters.webgl,
      assumeFullWindow: true, // a bit faster if we can assume no coordinate translations are needed for the display.

      forceSVGRefresh: phet.chipper.queryParameters.forceSVGRefresh,

      // pdom accessibility (interactive description)
      accessibility: phet.chipper.queryParameters.supportsInteractiveDescription,

      preventMultitouch: phet.chipper.queryParameters.preventMultitouch,
      interruptMultitouch: phet.chipper.queryParameters.interruptMultitouch,

      // phet-io
      tandem: Tandem.REQUIRED
    }, providedOptions );

    options.interactiveHighlightsEnabledProperty = options.preferencesModel.visualModel.interactiveHighlightsEnabledProperty;

    // override rootRenderer using query parameter, see #221 and #184
    options.rootRenderer = phet.chipper.queryParameters.rootRenderer || options.rootRenderer;

    // Supplied query parameters override options (but default values for non-supplied query parameters do not).
    if ( QueryStringMachine.containsKey( 'webgl' ) ) {
      options.webgl = phet.chipper.queryParameters.webgl;
    }

    Utils.setWebGLEnabled( options.webgl );

    // override window.open with a semi-API-compatible function, so fuzzing doesn't open new windows.
    if ( phet.chipper.isFuzzEnabled() ) {

      // @ts-expect-error - it isn't yet clear how to define objects to window just yet
      window.open = function() {
        return {
          focus: _.noop,
          blur: _.noop
        };
      };
    }

    document.body.style.padding = '0';
    document.body.style.margin = '0';
    document.body.style.overflow = 'hidden';

    // check to see if the sim div already exists in the DOM under the body. This is the case for https://github.com/phetsims/scenery/issues/174 (iOS offline reading list)
    if ( document.getElementById( 'sim' ) && document.getElementById( 'sim' )!.parentNode === document.body ) {
      document.body.removeChild( document.getElementById( 'sim' )! );
    }

    // Prevents selection cursor issues in Safari, see https://github.com/phetsims/scenery/issues/476
    document.onselectstart = function() { return false; };

    super( new Node( { renderer: options.rootRenderer } ), options );

    this.simulationRoot = new Node();
    this.rootNode.addChild( this.simulationRoot );

    // Workaround for Chrome SVG bugs that seem to happen on pan-zoom, see https://github.com/phetsims/scenery/issues/1507
    // Done here so that we don't require continual refreshes.
    if ( platform.chromium ) {
      this.simulationRoot.transformEmitter.addListener( () => {
        this.refreshSVGOnNextFrame();
      } );
    }

    // Seeding by default a random value for reproducible fuzzes if desired
    const fuzzerSeed = phet.chipper.queryParameters.randomSeed * Math.PI;

    this.inputFuzzer = new InputFuzzer( this, fuzzerSeed );
    this.keyboardFuzzer = new KeyboardFuzzer( this, fuzzerSeed );

    this.supportsPanAndZoomProperty = new BooleanProperty( phet.chipper.queryParameters.supportsPanAndZoom, {
      tandem: options.tandem.createTandem( 'supportsPanAndZoomProperty' ),
      phetioFeatured: true
    } );

    this.domElement.id = 'sim';

    if ( phet.chipper.queryParameters.sceneryLog ) {

      // @ts-expect-error - until scenery.js is converted to typescript, which is non-trivial (I tried)
      scenery.enableLogging( phet.chipper.queryParameters.sceneryLog );
    }

    if ( phet.chipper.queryParameters.sceneryStringLog ) {

      // @ts-expect-error - until scenery.js is converted to typescript, which is non-trivial (I tried)
      scenery.switchLogToString();
    }

    // See https://github.com/phetsims/chipper/issues/1319
    if ( phet.chipper.queryParameters.stringTest === 'dynamic' ) {
      const dynamicStringTest = new DynamicStringTest();
      window.addEventListener( 'keydown', event => dynamicStringTest.handleEvent( event ) );
    }

    this.initializeEvents( {
      tandem: Tandem.GENERAL_CONTROLLER.createTandem( 'input' )
    } ); // sets up listeners on the document with preventDefault(), and forwards those events to our scene

    window.phet.joist.rootNode = this.rootNode; // make the scene available for debugging
    window.phet.joist.display = this; // make the display available for debugging

    // Pass through query parameters to scenery for showing supplemental information
    this.setPointerDisplayVisible( phet.chipper.queryParameters.showPointers );
    this.setPointerAreaDisplayVisible( phet.chipper.queryParameters.showPointerAreas );
    this.setHitAreaDisplayVisible( phet.chipper.queryParameters.showHitAreas );
    this.setCanvasNodeBoundsVisible( phet.chipper.queryParameters.showCanvasNodeBounds );
    this.setFittedBlockBoundsVisible( phet.chipper.queryParameters.showFittedBlockBounds );

    // magnification support - always initialized for consistent PhET-iO API, but only conditionally added to Display
    animatedPanZoomSingleton.initialize( this.simulationRoot, {
      tandem: options.tandem.createTandem( 'panZoomListener' ),

      // We want to manually step our singleton in simulations, so that we can
      // disable the pan-and-zoom based on a Property.
      stepEmitter: null
    } );
    const animatedPanZoomListener = animatedPanZoomSingleton.listener;

    this.supportsPanAndZoomProperty.link( supported => {
      if ( supported ) {
        this.addInputListener( animatedPanZoomListener );
      }
      else if ( this.hasInputListener( animatedPanZoomListener ) ) {
        this.removeInputListener( animatedPanZoomListener );
      }
    } );

    // If the page is loaded from the back-forward cache, then reload the page to avoid bugginess,
    // see https://github.com/phetsims/joist/issues/448
    window.addEventListener( 'pageshow', event => {
      if ( event.persisted ) {
        window.location.reload();
      }
    } );
  }

  /**
   * Handle synthetic input event fuzzing
   */
  public fuzzInputEvents(): void {

    // If fuzz parameter is used then fuzzTouch and fuzzMouse events should be fired
    const fuzzTouch = phet.chipper.queryParameters.fuzzTouch || phet.chipper.queryParameters.fuzz;
    const fuzzMouse = phet.chipper.queryParameters.fuzzMouse || phet.chipper.queryParameters.fuzz;

    // fire or synthesize input events
    if ( fuzzMouse || fuzzTouch ) {
      this.inputFuzzer.fuzzEvents(
        phet.chipper.queryParameters.fuzzRate,
        fuzzMouse,
        fuzzTouch,
        phet.chipper.queryParameters.fuzzPointers
      );
    }

    // fire or synthesize keyboard input events
    if ( phet.chipper.queryParameters.fuzzBoard && document.hasFocus() ) {
      assert && assert( phet.chipper.queryParameters.supportsInteractiveDescription, 'fuzzBoard can only run with interactive description enabled.' );
      this.keyboardFuzzer.fuzzBoardEvents( phet.chipper.queryParameters.fuzzRate );
    }
  }

  public step( dt: number ): void {
    if ( this.supportsPanAndZoomProperty.value ) {

      // animate the PanZoomListener, for smooth panning/scaling
      animatedPanZoomSingleton.listener.step( dt );
    }
  }

  /**
   * In simulations that do not support Interactive Description or any keyboard-focusable content, the simulation is a
   * black box that cannot even receive browser focus. In some cases, this can be buggy.
   *
   * For example using global
   * keyboard listeners without any ability to focus in the sim is buggy in iframes: https://github.com/phetsims/circuit-construction-kit-common/issues/1027
   *
   * This function will return null when the simDisplay is accessible because this element is not needed when there
   * are any other focusable elements in the sim (which is assumed to be true in any simulation PDOM).
   */
  public getFocusablePlaceholder(): HTMLElement | null {
    if ( this.focusablePlaceholder ) {
      return this.focusablePlaceholder;
    }
    else if ( !this.isAccessible() ) {
      this.focusablePlaceholder = document.createElement( 'div' );
      this.focusablePlaceholder.tabIndex = 0;
      const content = document.createElement( 'span' );
      const string = 'This is an interactive sim. It changes as you play with it.';
      content.innerHTML = string;
      content.ariaLabel = string;
      content.setAttribute( 'style', styleForHiddenPDOM ); // Hide this from visual output
      this.focusablePlaceholder.appendChild( content );
      document.body.appendChild( this.focusablePlaceholder );
      return this.focusablePlaceholder;
    }
    else {
      return null;
    }
  }
}

joist.register( 'SimDisplay', SimDisplay );