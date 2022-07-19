// Copyright 2021-2022, University of Colorado Boulder

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

import optionize from '../../phet-core/js/optionize.js';
import { DisplayOptions, KeyboardFuzzer, RendererType } from '../../scenery/js/imports.js';
import { Display } from '../../scenery/js/imports.js';
import { InputFuzzer } from '../../scenery/js/imports.js';
import { animatedPanZoomSingleton } from '../../scenery/js/imports.js';
import { Node } from '../../scenery/js/imports.js';
import { scenery } from '../../scenery/js/imports.js';
import { Utils } from '../../scenery/js/imports.js';
import '../../sherpa/lib/game-up-camera-1.0.0.js';
import Tandem from '../../tandem/js/Tandem.js';
import HighlightVisibilityController from './HighlightVisibilityController.js';
import joist from './joist.js';
import PreferencesManager from './preferences/PreferencesManager.js';

type SelfOptions = {
  webgl?: boolean;
  rootRenderer?: RendererType;
  preferencesManager?: PreferencesManager | null;
};
export type SimDisplayOptions = SelfOptions & DisplayOptions;

export default class SimDisplay extends Display {

  // root for the simulation and the target for MultiListener to support magnification since the Display rootNode
  // cannot be transformed
  public readonly simulationRoot = new Node();
  private readonly inputFuzzer: InputFuzzer;
  private readonly keyboardFuzzer: KeyboardFuzzer;

  // Add a listener to the Display that controls visibility of various highlights in response to user input.
  private readonly highlightVisibilityController: HighlightVisibilityController;

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
      // things like iPad 2s (e.g. https://github.com/phetsims/scenery/issues/859), this can be turned to false to help.
      allowBackingScaleAntialiasing: true,

      // prevent overflow that can cause iOS bugginess, see https://github.com/phetsims/phet-io/issues/341
      allowSceneOverflow: false,

      // Indicate whether webgl is allowed to facilitate testing on non-webgl platforms, see https://github.com/phetsims/scenery/issues/289
      allowWebGL: phet.chipper.queryParameters.webgl,
      assumeFullWindow: true, // a bit faster if we can assume no coordinate translations are needed for the display.

      // See Sim.js for full documentation
      preferencesManager: null, // {PreferencesManager|null}

      // pdom accessibility (interactive description)
      accessibility: phet.chipper.queryParameters.supportsInteractiveDescription,

      // phet-io
      tandem: Tandem.REQUIRED
    }, providedOptions );

    // override rootRenderer using query parameter, see #221 and #184
    options.rootRenderer = phet.chipper.queryParameters.rootRenderer || options.rootRenderer;

    // Supplied query parameters override options (but default values for non-supplied query parameters do not).
    if ( QueryStringMachine.containsKey( 'webgl' ) ) {
      options.webgl = phet.chipper.queryParameters.webgl;
    }

    Utils.setWebGLEnabled( options.webgl );

    // override window.open with a semi-API-compatible function, so fuzzing doesn't open new windows.
    if ( phet.chipper.isFuzzEnabled() ) {

      // @ts-ignore
      window.open = function() {
        return {
          focus: _.noop,
          blur: _.noop
        };
      };
    }

    const $body = $( 'body' );

    // prevent scrollbars
    $body.css( 'padding', '0' ).css( 'margin', '0' ).css( 'overflow', 'hidden' );

    // check to see if the sim div already exists in the DOM under the body. This is the case for https://github.com/phetsims/scenery/issues/174 (iOS offline reading list)
    if ( document.getElementById( 'sim' ) && document.getElementById( 'sim' )!.parentNode === document.body ) {
      document.body.removeChild( document.getElementById( 'sim' )! );
    }

    // Prevents selection cursor issues in Safari, see https://github.com/phetsims/scenery/issues/476
    document.onselectstart = function() { return false; };

    super( new Node( { renderer: options.rootRenderer } ), options );

    this.simulationRoot = new Node();
    this.rootNode.addChild( this.simulationRoot );

    // Seeding by default a random value for reproducable fuzzes if desired
    const fuzzerSeed = phet.chipper.queryParameters.randomSeed * Math.PI;

    this.inputFuzzer = new InputFuzzer( this, fuzzerSeed );
    this.keyboardFuzzer = new KeyboardFuzzer( this, fuzzerSeed );

    this.domElement.id = 'sim';

    if ( phet.chipper.queryParameters.supportsInteractiveDescription ) {

      // for now interactive description is only in english
      // NOTE: When translatable this will need to update with language, change to phet.chipper.local
      this.pdomRootElement!.lang = 'en';
    }

    this.highlightVisibilityController = new HighlightVisibilityController( this, options.preferencesManager );

    if ( phet.chipper.queryParameters.sceneryLog ) {

      // @ts-ignore
      scenery.enableLogging( phet.chipper.queryParameters.sceneryLog );
    }

    if ( phet.chipper.queryParameters.sceneryStringLog ) {

      // @ts-ignore
      scenery.switchLogToString();
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
      tandem: Tandem.GENERAL_VIEW.createTandem( 'panZoomListener' )
    } );
    if ( phet.chipper.queryParameters.supportsPanAndZoom ) {
      this.addInputListener( animatedPanZoomSingleton.listener! );
    }

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
}

joist.register( 'SimDisplay', SimDisplay );