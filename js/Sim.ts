// Copyright 2013-2023, University of Colorado Boulder

/**
 * Main class that represents one simulation.
 * Provides default initialization, such as polyfills as well.
 * If the simulation has only one screen, then there is no homescreen, home icon or screen icon in the navigation bar.
 *
 * The type for the contained Screen instances is Screen<any,any> since we do not want to parameterize Sim<[{M1,V1},{M2,V2}]
 * etc.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chris Malley (PixelZoom, Inc.)
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import animationFrameTimer from '../../axon/js/animationFrameTimer.js';
import BooleanProperty from '../../axon/js/BooleanProperty.js';
import createObservableArray from '../../axon/js/createObservableArray.js';
import DerivedProperty from '../../axon/js/DerivedProperty.js';
import Emitter from '../../axon/js/Emitter.js';
import NumberProperty from '../../axon/js/NumberProperty.js';
import Property from '../../axon/js/Property.js';
import stepTimer from '../../axon/js/stepTimer.js';
import Bounds2 from '../../dot/js/Bounds2.js';
import Dimension2 from '../../dot/js/Dimension2.js';
import Random from '../../dot/js/Random.js';
import DotUtils from '../../dot/js/Utils.js'; // eslint-disable-line default-import-match-filename
import platform from '../../phet-core/js/platform.js';
import optionize from '../../phet-core/js/optionize.js';
import StringUtils from '../../phetcommon/js/util/StringUtils.js';
import BarrierRectangle from '../../scenery-phet/js/BarrierRectangle.js';
import { animatedPanZoomSingleton, Color, globalKeyStateTracker, Node, Utils, voicingManager, voicingUtteranceQueue } from '../../scenery/js/imports.js';
import '../../sherpa/lib/game-up-camera-1.0.0.js';
import soundManager from '../../tambo/js/soundManager.js';
import PhetioAction from '../../tandem/js/PhetioAction.js';
import PhetioObject, { PhetioObjectOptions } from '../../tandem/js/PhetioObject.js';
import Tandem from '../../tandem/js/Tandem.js';
import NumberIO from '../../tandem/js/types/NumberIO.js';
import audioManager from './audioManager.js';
import Heartbeat from './Heartbeat.js';
import Helper from './Helper.js';
import HomeScreen from './HomeScreen.js';
import HomeScreenView from './HomeScreenView.js';
import joist from './joist.js';
import JoistStrings from './JoistStrings.js';
import LookAndFeel from './LookAndFeel.js';
import MemoryMonitor from './MemoryMonitor.js';
import NavigationBar from './NavigationBar.js';
import packageJSON from './packageJSON.js';
import PreferencesModel from './preferences/PreferencesModel.js';
import Profiler from './Profiler.js';
import QueryParametersWarningDialog from './QueryParametersWarningDialog.js';
import Screen, { AnyScreen } from './Screen.js';
import ScreenSelectionSoundGenerator from './ScreenSelectionSoundGenerator.js';
import ScreenshotGenerator from './ScreenshotGenerator.js';
import selectScreens from './selectScreens.js';
import SimDisplay from './SimDisplay.js';
import SimInfo from './SimInfo.js';
import LegendsOfLearningSupport from './thirdPartySupport/LegendsOfLearningSupport.js';
import Toolbar from './toolbar/Toolbar.js';
import updateCheck from './updateCheck.js';
import TReadOnlyProperty from '../../axon/js/TReadOnlyProperty.js';
import { CreditsData } from './CreditsNode.js';
import { PopupableNode } from '../../sun/js/Popupable.js';
import PickOptional from '../../phet-core/js/types/PickOptional.js';
import Multilink from '../../axon/js/Multilink.js';
import ReadOnlyProperty from '../../axon/js/ReadOnlyProperty.js';
import Combination from '../../dot/js/Combination.js';
import Permutation from '../../dot/js/Permutation.js';
import ArrayIO from '../../tandem/js/types/ArrayIO.js';
import StringIO from '../../tandem/js/types/StringIO.js';
import { Locale } from './i18n/localeProperty.js';

// constants
const PROGRESS_BAR_WIDTH = 273;
const SUPPORTS_GESTURE_DESCRIPTION = platform.android || platform.mobileSafari;

// globals
phet.joist.elapsedTime = 0; // in milliseconds, use this in Tween.start for replicable playbacks

// When the simulation is going to be used to play back a recorded session, the simulation must be put into a special
// mode in which it will only update the model + view based on the playback clock events rather than the system clock.
// This must be set before the simulation is launched in order to ensure that no errant stepSimulation steps are called
// before the playback events begin.  This value is overridden for playback by PhetioEngineIO.
// (phet-io)
phet.joist.playbackModeEnabledProperty = new BooleanProperty( phet.chipper.queryParameters.playbackMode );

assert && assert( typeof phet.chipper.brand === 'string', 'phet.chipper.brand is required to run a sim' );

type SelfOptions = {

  credits?: CreditsData;

  // a {Node} placed onto the home screen (if available)
  homeScreenWarningNode?: null | Node;

  // The PreferencesModel defines the available features for the simulation that are controllable
  // through the Preferences Dialog. Will not be null! This is a workaround to prevent creating a "default" PreferencesModel
  preferencesModel?: PreferencesModel | null;

  // Passed to SimDisplay, but a top level option for API ease.
  webgl?: boolean;
};

export type SimOptions = SelfOptions & PickOptional<PhetioObject, 'phetioDesigned'>;

export default class Sim extends PhetioObject {

  // (joist-internal)
  public readonly simNameProperty: TReadOnlyProperty<string>;

  // Indicates sim construction completed, and that all screen models and views have been created.
  // This was added for PhET-iO but can be used by any client. This does not coincide with the end of the Sim
  // constructor (because Sim has asynchronous steps that finish after the constructor is completed)
  private readonly _isConstructionCompleteProperty = new Property<boolean>( false );
  public readonly isConstructionCompleteProperty: TReadOnlyProperty<boolean> = this._isConstructionCompleteProperty;

  // Stores the effective window dimensions that the simulation will be taking up
  public readonly dimensionProperty: TReadOnlyProperty<Dimension2>;

  // Indicates when the sim resized.  This Action is implemented so it can be automatically played back.
  private readonly resizeAction: PhetioAction<[ number, number ]>;

  // (joist-internal)
  private readonly navigationBar: NavigationBar;
  public readonly homeScreen: HomeScreen | null;

  // Sim screens normally update by implementing model.step(dt) or view.step(dt).  When that is impossible or
  // relatively awkward, it is possible to listen for a callback when a frame begins, when a frame is being processed
  // or after the frame is complete.  See https://github.com/phetsims/joist/issues/534

  // Indicates when a frame starts.  Listen to this Emitter if you have an action that must be
  // performed before the step begins.
  public readonly frameStartedEmitter = new Emitter();

  public readonly frameEndedEmitter = new Emitter( {
    tandem: Tandem.GENERAL_MODEL.createTandem( 'frameEndedEmitter' ),
    phetioHighFrequency: true,
    phetioDocumentation: 'Indicates when a frame ends. Listen to this Emitter if you have an action that must be ' +
                         'performed after the model and view step completes.'
  } );

  // Steps the simulation. This Action is implemented so it can be automatically
  // played back for PhET-iO record/playback.  Listen to this Action if you have an action that happens during the
  // simulation step.
  public readonly stepSimulationAction: PhetioAction<[ number ]>;

  // the ordered list of sim-specific screens that appear in this runtime of the sim
  public readonly simScreens: AnyScreen[];

  // all screens that appear in the runtime of this sim, with the homeScreen first if it was created
  public readonly screens: AnyScreen[];

  // the displayed name in the sim. This depends on what screens are shown this runtime (effected by query parameters).
  public readonly displayedSimNameProperty: TReadOnlyProperty<string>;
  public readonly selectedScreenProperty: Property<AnyScreen>;

  // true if all possible screens are present (order-independent)
  private readonly allScreensCreated: boolean;

  private availableScreensProperty!: Property<number[]>;
  public activeSimScreensProperty!: ReadOnlyProperty<AnyScreen[]>;

  // When the sim is active, scenery processes inputs and stepSimulation(dt) runs from the system clock.
  // Set to false for when the sim will be paused.
  public readonly activeProperty: BooleanProperty = new BooleanProperty( true, {
    tandem: Tandem.GENERAL_MODEL.createTandem( 'activeProperty' ),
    phetioFeatured: true,
    phetioDocumentation: 'Determines whether the entire simulation is running and processing user input. ' +
                         'Setting this property to false pauses the simulation, and prevents user interaction.'
  } );

  // indicates whether the browser tab containing the simulation is currently visible
  public readonly browserTabVisibleProperty: TReadOnlyProperty<boolean>;

  // (joist-internal) - How the home screen and navbar are scaled. This scale is based on the
  // HomeScreen's layout bounds to support a consistently sized nav bar and menu. If this scale was based on the
  // layout bounds of the current screen, there could be differences in the nav bar across screens.
  public readonly scaleProperty = new NumberProperty( 1 );

  // (joist-internal) global bounds for the entire simulation. null before first resize
  public readonly boundsProperty = new Property<Bounds2 | null>( null );

  // (joist-internal) global bounds for the screen-specific part (excludes the navigation bar), null before first resize
  public readonly screenBoundsProperty = new Property<Bounds2 | null>( null );

  public readonly lookAndFeel = new LookAndFeel();
  private readonly memoryMonitor = new MemoryMonitor();

  // public (read-only) {boolean} - if true, add support specific to accessible technology that work with touch devices.
  private readonly supportsGestureDescription: boolean;

  // If any sim screen has keyboard help content, trigger creation of a keyboard help button.
  public readonly hasKeyboardHelpContent: boolean;

  // if PhET-iO is currently setting the state of the simulation. See PhetioStateEngine for details. This must be
  // declared before soundManager.initialized is called.
  public readonly isSettingPhetioStateProperty: TReadOnlyProperty<boolean>;

  // if PhET-iO is currently setting the state of the simulation and in the process of clearing dynamic elements as a
  // precursor to setting the state of those elements. See PhetioStateEngine for details. This must be
  // declared before soundManager.initialized is called.
  public readonly isClearingPhetioDynamicElementsProperty: TReadOnlyProperty<boolean>;

  // (joist-internal)
  public readonly version: string = packageJSON.version;

  // number of animation frames that have occurred
  public frameCounter = 0;

  // Whether the window has resized since our last updateDisplay()
  private resizePending = true;

  // Make our locale available
  public readonly locale: Locale = phet.chipper.locale || 'en';

  // create this only after all other members have been set on Sim
  private readonly simInfo: SimInfo;
  public readonly display: SimDisplay;

  // The Toolbar is not created unless requested with a PreferencesModel.
  private readonly toolbar: Toolbar | null = null;

  // Manages state related to preferences. Enabled features for preferences are provided through the
  // PreferencesModel.
  public readonly preferencesModel: PreferencesModel;

  // list of nodes that are "modal" and hence block input with the barrierRectangle.  Used by modal dialogs
  // and the PhetMenu
  private modalNodeStack = createObservableArray<PopupableNode>();

  // (joist-internal) Semi-transparent black barrier used to block input events when a dialog (or other popup)
  // is present, and fade out the background.
  private readonly barrierRectangle = new BarrierRectangle( this.modalNodeStack );

  // layer for popups, dialogs, and their backgrounds and barriers
  // TODO: How should we handle the popup for navigation? Can we set this to private? https://github.com/phetsims/joist/issues/841
  public readonly topLayer = new Node( {
    children: [ this.barrierRectangle ]
  } ) as TopLayerNode;

  // root node for the Display
  public readonly rootNode: Node;

  // Keep track of the previous time for computing dt, and initially signify that time hasn't been recorded yet.
  private lastStepTime = -1;
  private lastAnimationFrameTime = -1;

  // (joist-internal) Bind the animation loop so it can be called from requestAnimationFrame with the right this.
  private readonly boundRunAnimationLoop: () => void;
  private readonly updateBackground: () => void;
  public readonly credits: CreditsData;

  /**
   * @param simNameProperty - the name of the simulation, to be displayed in the navbar and homescreen
   * @param allSimScreens - the possible screens for the sim in order of declaration (does not include the home screen)
   * @param [providedOptions] - see below for options
   */
  public constructor( simNameProperty: TReadOnlyProperty<string>, allSimScreens: AnyScreen[], providedOptions?: SimOptions ) {

    window.phetSplashScreenDownloadComplete();

    assert && assert( allSimScreens.length >= 1, 'at least one screen is required' );

    const options = optionize<SimOptions, SelfOptions, PhetioObjectOptions>()( {

      credits: {},

      // a {Node} placed onto the home screen (if available)
      homeScreenWarningNode: null,

      // If a PreferencesModel supports any preferences, the sim will include the PreferencesDialog and a
      // button in the NavigationBar to open it. Simulation conditions (like what locales are available) might enable
      // a PreferencesDialog by default. But PreferencesModel has many options you can provide.
      preferencesModel: null,

      // Passed to SimDisplay, but a top level option for API ease.
      webgl: SimDisplay.DEFAULT_WEBGL,

      // phet-io
      phetioState: false,
      phetioReadOnly: true,
      tandem: Tandem.ROOT
    }, providedOptions );

    if ( !options.preferencesModel ) {
      options.preferencesModel = new PreferencesModel();
    }

    // Some options are used by sim and SimDisplay. Promote webgl to top level sim option out of API ease, but it is
    // passed to the SimDisplay.
    const simDisplayOptions: {
      webgl: boolean;
      tandem: Tandem;
      preferencesModel: PreferencesModel;
    } = {
      webgl: options.webgl,
      tandem: Tandem.GENERAL_VIEW.createTandem( 'display' ),
      preferencesModel: options.preferencesModel
    };

    super( options );

    this.credits = options.credits;

    this.simNameProperty = simNameProperty;

    // playbackModeEnabledProperty cannot be changed after Sim construction has begun, hence this listener is added before
    // anything else is done, see https://github.com/phetsims/phet-io/issues/1146
    phet.joist.playbackModeEnabledProperty.lazyLink( () => {
      throw new Error( 'playbackModeEnabledProperty cannot be changed after Sim construction has begun' );
    } );

    assert && this.isConstructionCompleteProperty.lazyLink( isConstructionComplete => {
      assert && assert( isConstructionComplete, 'Sim construction should never uncomplete' );
    } );

    const dimensionProperty = new Property( new Dimension2( 0, 0 ), {
      valueComparisonStrategy: 'equalsFunction'
    } );

    // Note: the public API is TReadOnlyProperty
    this.dimensionProperty = dimensionProperty;

    this.resizeAction = new PhetioAction<[ number, number ]>( ( width, height ) => {
      assert && assert( width > 0 && height > 0, 'sim should have a nonzero area' );

      dimensionProperty.value = new Dimension2( width, height );

      // Gracefully support bad dimensions, see https://github.com/phetsims/joist/issues/472
      if ( width === 0 || height === 0 ) {
        return;
      }
      const scale = Math.min( width / HomeScreenView.LAYOUT_BOUNDS.width, height / HomeScreenView.LAYOUT_BOUNDS.height );

      // 40 px high on iPad Mobile Safari
      const navBarHeight = scale * NavigationBar.NAVIGATION_BAR_SIZE.height;
      this.navigationBar.layout( scale, width, navBarHeight );
      this.navigationBar.y = height - navBarHeight;
      this.display.setSize( new Dimension2( width, height ) );
      const screenHeight = height - this.navigationBar.height;

      if ( this.toolbar ) {
        this.toolbar.layout( scale, screenHeight );
      }

      // The available bounds for screens and top layer children - though currently provided
      // full width and height, will soon be reduced when menus (specifically the Preferences
      // Toolbar) takes up screen space.
      const screenMinX = this.toolbar ? this.toolbar.getDisplayedWidth() : 0;
      const availableScreenBounds = new Bounds2( screenMinX, 0, width, screenHeight );

      // Layout each of the screens
      _.each( this.screens, m => m.view.layout( availableScreenBounds ) );

      this.topLayer.children.forEach( child => {
        child.layout && child.layout( availableScreenBounds );
      } );

      // Fixes problems where the div would be way off center on iOS7
      if ( platform.mobileSafari ) {
        window.scrollTo( 0, 0 );
      }

      // update our scale and bounds properties after other changes (so listeners can be fired after screens are resized)
      this.scaleProperty.value = scale;
      this.boundsProperty.value = new Bounds2( 0, 0, width, height );
      this.screenBoundsProperty.value = availableScreenBounds.copy();

      // set the scale describing the target Node, since scale from window resize is applied to each ScreenView,
      // (children of the PanZoomListener targetNode)
      animatedPanZoomSingleton.listener!.setTargetScale( scale );

      // set the bounds which accurately describe the panZoomListener targetNode, since it would otherwise be
      // inaccurate with the very large BarrierRectangle
      animatedPanZoomSingleton.listener!.setTargetBounds( this.boundsProperty.value );

      // constrain the simulation pan bounds so that it cannot be moved off screen
      animatedPanZoomSingleton.listener!.setPanBounds( this.boundsProperty.value );
    }, {
      tandem: Tandem.GENERAL_MODEL.createTandem( 'resizeAction' ),
      parameters: [
        { name: 'width', phetioType: NumberIO },
        { name: 'height', phetioType: NumberIO }
      ],
      phetioPlayback: true,
      phetioEventMetadata: {

        // resizeAction needs to always be playbackable because it acts independently of any other playback event.
        // Because of its unique nature, it should be a "top-level" `playback: true` event so that it is never marked as
        // `playback: false`. There are cases where it is nested under another `playback: true` event, like when the
        // wrapper launches the simulation, that cannot be avoided. For this reason, we use this override.
        alwaysPlaybackableOverride: true
      },
      phetioDocumentation: 'Executes when the sim is resized. Values are the sim dimensions in CSS pixels.'
    } );

    this.stepSimulationAction = new PhetioAction( dt => {
      this.frameStartedEmitter.emit();

      // increment this before we can have an exception thrown, to see if we are missing frames
      this.frameCounter++;

      // Apply time scale effects here before usage
      dt *= phet.chipper.queryParameters.speed;

      if ( this.resizePending ) {
        this.resizeToWindow();
      }

      // If the user is on the home screen, we won't have a Screen that we'll want to step.  This must be done after
      // fuzz mouse, because fuzzing could change the selected screen, see #130
      const screen = this.selectedScreenProperty.value;

      // cap dt based on the current screen, see https://github.com/phetsims/joist/issues/130
      dt = Math.min( dt, screen.maxDT );

      // TODO: we are /1000 just to *1000?  Seems wasteful and like opportunity for error. See https://github.com/phetsims/joist/issues/387
      // Store the elapsed time in milliseconds for usage by Tween clients
      phet.joist.elapsedTime += dt * 1000;

      // timer step before model/view steps, see https://github.com/phetsims/joist/issues/401
      // Note that this is vital to support Interactive Description and the utterance queue.
      stepTimer.emit( dt );

      // If the dt is 0, we will skip the model step (see https://github.com/phetsims/joist/issues/171)
      if ( screen.model.step && dt ) {
        screen.model.step( dt );
      }

      // If using the TWEEN animation library, then update tweens before rendering the scene.
      // Update the tweens after the model is updated but before the view step.
      // See https://github.com/phetsims/joist/issues/401.
      //TODO https://github.com/phetsims/joist/issues/404 run TWEENs for the selected screen only
      if ( window.TWEEN ) {
        window.TWEEN.update( phet.joist.elapsedTime );
      }

      this.display.step( dt );

      // View step is the last thing before updateDisplay(), so we can do paint updates there.
      // See https://github.com/phetsims/joist/issues/401.
      screen.view.step( dt );

      // Do not update the display while PhET-iO is customizing, or it could show the sim before it is fully ready for display.
      if ( !( Tandem.PHET_IO_ENABLED && !phet.phetio.phetioEngine.isReadyForDisplay ) ) {
        this.display.updateDisplay();
      }

      if ( phet.chipper.queryParameters.memoryLimit ) {
        this.memoryMonitor.measure();
      }
      this.frameEndedEmitter.emit();
    }, {
      tandem: Tandem.GENERAL_MODEL.createTandem( 'stepSimulationAction' ),
      parameters: [ {
        name: 'dt',
        phetioType: NumberIO,
        phetioDocumentation: 'The amount of time stepped in each call, in seconds.'
      } ],
      phetioHighFrequency: true,
      phetioPlayback: true,
      phetioDocumentation: 'A function that steps time forward.'
    } );

    const screensTandem = Tandem.GENERAL_MODEL.createTandem( 'screens' );

    const screenData = selectScreens(
      allSimScreens,
      phet.chipper.queryParameters.homeScreen,
      QueryStringMachine.containsKey( 'homeScreen' ),
      phet.chipper.queryParameters.initialScreen,
      QueryStringMachine.containsKey( 'initialScreen' ),
      phet.chipper.queryParameters.screens,
      QueryStringMachine.containsKey( 'screens' ),
      selectedSimScreens => {
        const possibleScreenIndices = selectedSimScreens.map( screen => {
          return allSimScreens.indexOf( screen ) + 1;
        } );
        const validValues = _.flatten( Combination.combinationsOf( possibleScreenIndices ).map( subset => Permutation.permutationsOf( subset ) ) )
          .filter( array => array.length > 0 ).sort();

        // Controls the subset (and order) of screens that appear to the user. Separate from the ?screens query parameter
        // for phet-io purposes. See https://github.com/phetsims/joist/issues/827
        this.availableScreensProperty = new Property( possibleScreenIndices, {
          tandem: screensTandem.createTandem( 'availableScreensProperty' ),
          isValidValue: value => _.some( validValues, validValue => _.isEqual( value, validValue ) ),
          phetioFeatured: true,
          phetioValueType: ArrayIO( NumberIO ),
          phetioDocumentation: 'Controls which screens are available, and the order they are displayed.'
        } );

        this.activeSimScreensProperty = new DerivedProperty( [ this.availableScreensProperty ], screenIndices => {
          return screenIndices.map( index => allSimScreens[ index - 1 ] );
        } );
      },
      selectedSimScreens => {
        return new HomeScreen( this.simNameProperty, () => this.selectedScreenProperty, selectedSimScreens, this.activeSimScreensProperty, {
          tandem: options.tandem.createTandem( window.phetio.PhetioIDUtils.HOME_SCREEN_COMPONENT_NAME ),
          warningNode: options.homeScreenWarningNode
        } );
      }
    );

    this.homeScreen = screenData.homeScreen;
    this.simScreens = screenData.selectedSimScreens;
    this.screens = screenData.screens;
    this.allScreensCreated = screenData.allScreensCreated;

    this.selectedScreenProperty = new Property<AnyScreen>( screenData.initialScreen, {
      tandem: screensTandem.createTandem( 'selectedScreenProperty' ),
      phetioFeatured: true,
      phetioDocumentation: 'Determines which screen is selected in the simulation',
      validValues: this.screens,
      phetioValueType: Screen.ScreenIO
    } );

    // If the activeSimScreens changes, we'll want to update what the active screen (or selected screen) is for specific
    // cases.
    this.activeSimScreensProperty.lazyLink( screens => {
      const screen = this.selectedScreenProperty.value;
      if ( screen === this.homeScreen ) {
        if ( screens.length === 1 ) {
          // If we're on the home screen and it switches to a 1-screen sim, go to that screen
          this.selectedScreenProperty.value = screens[ 0 ];
        }
        else if ( !screens.includes( this.homeScreen.model.selectedScreenProperty.value ) ) {
          // If we're on the home screen and our "selected" screen disappears, select the first sim screen
          this.homeScreen.model.selectedScreenProperty.value = screens[ 0 ];
        }
      }
      else if ( !screens.includes( screen ) ) {
        // If we're on a screen that "disappears", go to the first screen
        this.selectedScreenProperty.value = screens[ 0 ];
      }
    } );

    this.displayedSimNameProperty = new DerivedProperty( [
      this.availableScreensProperty,
      this.simNameProperty,
      this.selectedScreenProperty,
      JoistStrings.simTitleWithScreenNamePatternStringProperty,

      // We just need notifications on any of these changing, return args as a unique value to make sure listeners fire.
      DerivedProperty.deriveAny( this.simScreens.map( screen => screen.nameProperty ), ( ...args ) => [ ...args ] )
    ], ( availableScreens, simName, selectedScreen, titleWithScreenPattern ) => {
      const screenName = selectedScreen.nameProperty.value;

      const isMultiScreenSimDisplayingSingleScreen = availableScreens.length === 1 && allSimScreens.length > 1;

      // update the titleText based on values of the sim name and screen name
      if ( isMultiScreenSimDisplayingSingleScreen && simName && screenName ) {

        // If the 'screens' query parameter selects only 1 screen and both the sim and screen name are not the empty
        // string, then update the nav bar title to include a hyphen and the screen name after the sim name.
        return StringUtils.fillIn( titleWithScreenPattern, {
          simName: simName,
          screenName: screenName
        } );
      }
      else if ( isMultiScreenSimDisplayingSingleScreen && screenName ) {
        return screenName;
      }
      else {
        return simName;
      }
    }, {
      tandem: Tandem.GENERAL_MODEL.createTandem( 'displayedSimNameProperty' ),
      phetioFeatured: true,
      phetioValueType: StringIO,
      phetioDocumentation: 'Customize this string by editing its dependencies.'
    } );

    // Local variable is settable...
    const browserTabVisibleProperty = new BooleanProperty( true, {
      tandem: Tandem.GENERAL_MODEL.createTandem( 'browserTabVisibleProperty' ),
      phetioDocumentation: 'Indicates whether the browser tab containing the simulation is currently visible',
      phetioReadOnly: true,
      phetioFeatured: true
    } );

    // ... but the public class attribute is read-only
    this.browserTabVisibleProperty = browserTabVisibleProperty;

    // set the state of the property that indicates if the browser tab is visible
    document.addEventListener( 'visibilitychange', () => {
      browserTabVisibleProperty.set( document.visibilityState === 'visible' );
    }, false );

    assert && assert( window.phet.joist.launchCalled, 'Sim must be launched using simLauncher, ' +
                                                      'see https://github.com/phetsims/joist/issues/142' );

    this.supportsGestureDescription = phet.chipper.queryParameters.supportsInteractiveDescription && SUPPORTS_GESTURE_DESCRIPTION;
    this.hasKeyboardHelpContent = _.some( this.simScreens, simScreen => !!simScreen.createKeyboardHelpNode );

    assert && assert( !window.phet.joist.sim, 'Only supports one sim at a time' );
    window.phet.joist.sim = this;

    this.isSettingPhetioStateProperty = Tandem.PHET_IO_ENABLED ?
                                        phet.phetio.phetioEngine.phetioStateEngine.isSettingStateProperty :
                                        new BooleanProperty( false );

    this.isClearingPhetioDynamicElementsProperty = Tandem.PHET_IO_ENABLED ?
                                                   phet.phetio.phetioEngine.phetioStateEngine.isClearingDynamicElementsProperty :
                                                   new BooleanProperty( false );

    // commented out because https://github.com/phetsims/joist/issues/553 is deferred for after GQIO-oneone
    // if ( PHET_IO_ENABLED ) {
    //   this.engagementMetrics = new EngagementMetrics( this );
    // }

    this.preferencesModel = options.preferencesModel;

    // initialize audio and audio subcomponents
    audioManager.initialize( this );

    // hook up sound generation for screen changes
    if ( this.preferencesModel.audioModel.supportsSound ) {
      soundManager.addSoundGenerator(
        new ScreenSelectionSoundGenerator( this.selectedScreenProperty, this.homeScreen, { initialOutputLevel: 0.5 } ),
        {
          categoryName: 'user-interface'
        }
      );
    }

    // Make ScreenshotGenerator available globally so it can be used in preload files such as PhET-iO.
    window.phet.joist.ScreenshotGenerator = ScreenshotGenerator;

    // If the locale query parameter was specified, then we may be running the all.html file, so adjust the title.
    // See https://github.com/phetsims/chipper/issues/510
    this.simNameProperty.link( simName => {
      $( 'title' ).html( simName );
    } );

    // For now the Toolbar only includes controls for Voicing and is only constructed when that feature is supported.
    if ( this.preferencesModel.audioModel.supportsVoicing ) {
      this.toolbar = new Toolbar( this.preferencesModel.audioModel.toolbarEnabledProperty, this.selectedScreenProperty,
        this.lookAndFeel );

      // when the Toolbar positions update, resize the sim to fit in the available space
      this.toolbar.rightPositionProperty.lazyLink( () => {
        this.resize( this.boundsProperty.value!.width, this.boundsProperty.value!.height );
      } );
    }

    this.display = new SimDisplay( simDisplayOptions );
    this.rootNode = this.display.rootNode;

    Helper.initialize( this, this.display );

    Multilink.multilink( [ this.activeProperty, phet.joist.playbackModeEnabledProperty ], ( active, playbackModeEnabled: boolean ) => {

      // If in playbackMode is enabled, then the display must be interactive to support PDOM event listeners during
      // playback (which often come directly from sim code and not from user input).
      if ( playbackModeEnabled ) {
        this.display.interactive = true;
        globalKeyStateTracker.enabled = true;
      }
      else {

        // When the sim is inactive, make it non-interactive, see https://github.com/phetsims/scenery/issues/414
        this.display.interactive = active;
        globalKeyStateTracker.enabled = active;
      }
    } );

    document.body.appendChild( this.display.domElement );

    Heartbeat.start( this );

    this.navigationBar = new NavigationBar( this, Tandem.GENERAL_VIEW.createTandem( 'navigationBar' ) );

    this.updateBackground = () => {
      this.lookAndFeel.backgroundColorProperty.value = Color.toColor( this.selectedScreenProperty.value.backgroundColorProperty.value );
    };

    this.lookAndFeel.backgroundColorProperty.link( backgroundColor => {
      this.display.backgroundColor = backgroundColor;
    } );

    this.selectedScreenProperty.link( () => this.updateBackground() );

    // When the user switches screens, interrupt the input on the previous screen.
    // See https://github.com/phetsims/scenery/issues/218
    this.selectedScreenProperty.lazyLink( ( newScreen, oldScreen ) => oldScreen.view.interruptSubtreeInput() );

    this.simInfo = new SimInfo( this );

    // Set up PhET-iO, must be done after phet.joist.sim is assigned
    Tandem.PHET_IO_ENABLED && phet.phetio.phetioEngine.onSimConstructionStarted(
      this.simInfo,
      this.isConstructionCompleteProperty,
      this.frameEndedEmitter,
      this.display
    );

    this.isSettingPhetioStateProperty.lazyLink( isSettingState => {
      if ( !isSettingState ) {
        this.updateViews();
      }
    } );

    this.boundRunAnimationLoop = this.runAnimationLoop.bind( this );

    // Third party support
    phet.chipper.queryParameters.legendsOfLearning && new LegendsOfLearningSupport( this ).start();
  }

  /**
   * Update the views of the sim. This is meant to run after the state has been set to make sure that all view
   * elements are in sync with the new, current state of the sim. (even when the sim is inactive, as in the state
   * wrapper).
   */
  private updateViews(): void {

    // Trigger layout code
    this.resizeToWindow();

    this.selectedScreenProperty.value.view.step && this.selectedScreenProperty.value.view.step( 0 );

    // Clear all UtteranceQueue outputs that may have collected Utterances while state-setting logic occurred.
    // This is transient. https://github.com/phetsims/utterance-queue/issues/22 and https://github.com/phetsims/scenery/issues/1397
    this.display.descriptionUtteranceQueue.clear();
    voicingUtteranceQueue.clear();

    // Update the display asynchronously since it can trigger events on pointer validation, see https://github.com/phetsims/ph-scale/issues/212
    animationFrameTimer.runOnNextTick( () => phet.joist.display.updateDisplay() );
  }

  private finishInit( screens: AnyScreen[] ): void {

    _.each( screens, screen => {
      screen.view.layerSplit = true;
      this.display.simulationRoot.addChild( screen.view );
    } );
    this.display.simulationRoot.addChild( this.navigationBar );

    if ( this.preferencesModel.audioModel.supportsVoicing ) {
      assert && assert( this.toolbar, 'toolbar should exist for voicing' );
      this.display.simulationRoot.addChild( this.toolbar! );
      this.display.simulationRoot.pdomOrder = [ this.toolbar! ];

      // If Voicing is not "fully" enabled, only the toolbar is able to produce Voicing output.
      // All other simulation components should not voice anything. This must be called only after
      // all ScreenViews have been constructed.
      voicingManager.voicingFullyEnabledProperty.link( fullyEnabled => {
        this.setSimVoicingVisible( fullyEnabled );
      } );
    }

    this.selectedScreenProperty.link( currentScreen => {
      screens.forEach( screen => {
        const visible = screen === currentScreen;

        // Make the selected screen visible and active, other screens invisible and inactive.
        // screen.isActiveProperty should change only while the screen is invisible, https://github.com/phetsims/joist/issues/418
        if ( visible ) {
          screen.activeProperty.set( visible );
        }
        screen.view.setVisible( visible );
        if ( !visible ) {
          screen.activeProperty.set( visible );
        }
      } );
      this.updateBackground();

      if ( !this.isSettingPhetioStateProperty.value ) {

        // Zoom out again after changing screens so we don't pan to the center of the focused ScreenView,
        // and so user has an overview of the new screen, see https://github.com/phetsims/joist/issues/682.
        animatedPanZoomSingleton.listener!.resetTransform();
      }
    } );

    this.display.simulationRoot.addChild( this.topLayer );

    // Fit to the window and render the initial scene
    // Can't synchronously do this in Firefox, see https://github.com/phetsims/vegas/issues/55 and
    // https://bugzilla.mozilla.org/show_bug.cgi?id=840412.
    const resizeListener = () => {

      // Don't resize on window size changes if we are playing back input events.
      // See https://github.com/phetsims/joist/issues/37
      if ( !phet.joist.playbackModeEnabledProperty.value ) {
        this.resizePending = true;
      }
    };
    $( window ).resize( resizeListener );
    window.addEventListener( 'resize', resizeListener );
    window.addEventListener( 'orientationchange', resizeListener );
    window.visualViewport && window.visualViewport.addEventListener( 'resize', resizeListener );
    this.resizeToWindow();

    // Kick off checking for updates, if that is enabled
    updateCheck.check();

    // If there are warnings, show them in a dialog
    if ( QueryStringMachine.warnings.length ) {
      const warningDialog = new QueryParametersWarningDialog( QueryStringMachine.warnings, {
        closeButtonListener: () => {
          warningDialog.hide();
          warningDialog.dispose();
        }
      } );
      warningDialog.show();
    }
  }

  /*
   * Adds a popup in the global coordinate frame. If the popup is model, it displays a semi-transparent black input
   * barrier behind it. A modal popup prevent the user from interacting with the reset of the application until the
   * popup is hidden. Use hidePopup() to hide the popup.
   * @param popup - the popup, must implemented node.hide(), called by hidePopup
   * @param isModal - whether popup is modal
   */
  public showPopup( popup: PopupableNode, isModal: boolean ): void {
    assert && assert( popup );
    assert && assert( !!popup.hide, 'Missing popup.hide() for showPopup' );
    assert && assert( !this.topLayer.hasChild( popup ), 'popup already shown' );
    if ( isModal ) {
      this.rootNode.interruptSubtreeInput();
      this.modalNodeStack.push( popup );

      // pdom - modal dialogs should be the only readable content in the sim
      this.setPDOMViewsVisible( false );

      // voicing - responses from Nodes hidden by the modal dialog should not voice.
      this.setNonModalVoicingVisible( false );
    }
    if ( popup.layout ) {
      popup.layout( this.screenBoundsProperty.value! );
    }
    this.topLayer.addChild( popup );
  }

  /*
   * Hides a popup that was previously displayed with showPopup()
   * @param popup
   * @param isModal - whether popup is modal
   */
  public hidePopup( popup: PopupableNode, isModal: boolean ): void {
    assert && assert( popup && this.modalNodeStack.includes( popup ) );
    assert && assert( this.topLayer.hasChild( popup ), 'popup was not shown' );
    if ( isModal ) {
      this.modalNodeStack.remove( popup );
      if ( this.modalNodeStack.length === 0 ) {

        // After hiding all popups, Voicing becomes enabled for components in the simulation window only if
        // "Sim Voicing" switch is on.
        this.setNonModalVoicingVisible( voicingManager.voicingFullyEnabledProperty.value );

        // pdom - when the dialog is hidden, make all ScreenView content visible to assistive technology
        this.setPDOMViewsVisible( true );
      }
    }
    this.topLayer.removeChild( popup );
  }

  private resizeToWindow(): void {
    this.resizePending = false;
    this.resize( window.innerWidth, window.innerHeight ); // eslint-disable-line bad-sim-text
  }

  private resize( width: number, height: number ): void {
    this.resizeAction.execute( width, height );
  }

  public start(): void {

    // In order to animate the loading progress bar, we must schedule work with setTimeout
    // This array of {function} is the work that must be completed to launch the sim.
    const workItems: Array<() => void> = [];

    // Schedule instantiation of the screens
    this.screens.forEach( screen => {
      workItems.push( () => {

        // Screens may share the same instance of backgroundProperty, see joist#441
        if ( !screen.backgroundColorProperty.hasListener( this.updateBackground ) ) {
          screen.backgroundColorProperty.link( this.updateBackground );
        }
        screen.initializeModel();
      } );
      workItems.push( () => {
        screen.initializeView( this.simNameProperty, this.displayedSimNameProperty, this.screens.length, this.homeScreen === screen );
      } );
    } );

    // loop to run startup items asynchronously so the DOM can be updated to show animation on the progress bar
    const runItem = ( i: number ) => {
      setTimeout( // eslint-disable-line bad-sim-text
        () => {
          workItems[ i ]();

          // Move the progress ahead by one so we show the full progress bar for a moment before the sim starts up

          const progress = DotUtils.linear( 0, workItems.length - 1, 0.25, 1.0, i );

          // Support iOS Reading Mode, which saves a DOM snapshot after the progressBarForeground has already been
          // removed from the document, see https://github.com/phetsims/joist/issues/389
          if ( document.getElementById( 'progressBarForeground' ) ) {

            // Grow the progress bar foreground to the right based on the progress so far.
            document.getElementById( 'progressBarForeground' )!.setAttribute( 'width', `${progress * PROGRESS_BAR_WIDTH}` );
          }
          if ( i + 1 < workItems.length ) {
            runItem( i + 1 );
          }
          else {
            setTimeout( () => { // eslint-disable-line bad-sim-text
              this.finishInit( this.screens );

              // Make sure requestAnimationFrame is defined
              Utils.polyfillRequestAnimationFrame();

              // Option for profiling
              // if true, prints screen initialization time (total, model, view) to the console and displays
              // profiling information on the screen
              if ( phet.chipper.queryParameters.profiler ) {
                Profiler.start( this );
              }

              // Notify listeners that all models and views have been constructed, and the Sim is ready to be shown.
              // Used by PhET-iO. This does not coincide with the end of the Sim constructor (because Sim has
              // asynchronous steps that finish after the constructor is completed )
              this._isConstructionCompleteProperty.value = true;

              // place the requestAnimationFrame *before* rendering to assure as close to 60fps with the setTimeout fallback.
              // http://paulirish.com/2011/requestanimationframe-for-smart-animating/
              // Launch the bound version so it can easily be swapped out for debugging.
              // Schedules animation updates and runs the first step()
              this.boundRunAnimationLoop();

              // If the sim is in playback mode, then flush the timer's listeners. This makes sure that anything kicked
              // to the next frame with `timer.runOnNextTick` during startup (like every notification about a PhET-iO
              // instrumented element in phetioEngine.phetioObjectAdded()) can clear out before beginning playback.
              if ( phet.joist.playbackModeEnabledProperty.value ) {
                let beforeCounts = null;
                if ( assert ) {
                  beforeCounts = Array.from( Random.allRandomInstances ).map( n => n.numberOfCalls );
                }

                stepTimer.emit( 0 );

                if ( assert ) {
                  const afterCounts = Array.from( Random.allRandomInstances ).map( n => n.numberOfCalls );
                  assert && assert( _.isEqual( beforeCounts, afterCounts ),
                    `Random was called more times in the playback sim on startup, before: ${beforeCounts}, after: ${afterCounts}` );
                }
              }

              // After the application is ready to go, remove the splash screen and progress bar.  Note the splash
              // screen is removed after one step(), so the rendering is ready to go when the progress bar is hidden.
              // no-op otherwise and will be disposed by phetioEngine.
              if ( !Tandem.PHET_IO_ENABLED || phet.preloads.phetio.queryParameters.phetioStandalone ) {
                window.phetSplashScreen.dispose();
              }
              // Sanity check that there is no phetio object in phet brand, see https://github.com/phetsims/phet-io/issues/1229
              phet.chipper.brand === 'phet' && assert && assert( !Tandem.PHET_IO_ENABLED, 'window.phet.preloads.phetio should not exist for phet brand' );

              // Communicate sim load (successfully) to joist/tests/test-sims.html
              if ( phet.chipper.queryParameters.continuousTest ) {
                phet.chipper.reportContinuousTestResult( {
                  type: 'continuous-test-load'
                } );
              }
              if ( phet.chipper.queryParameters.postMessageOnLoad ) {
                window.parent && window.parent.postMessage( JSON.stringify( {
                  type: 'load',
                  url: window.location.href
                } ), '*' );
              }
            }, 25 ); // pause for a few milliseconds with the progress bar filled in before going to the home screen
          }
        },

        // The following sets the amount of delay between each work item to make it easier to see the changes to the
        // progress bar.  A total value is divided by the number of work items.  This makes it possible to see the
        // progress bar when few work items exist, such as for a single screen sim, but allows things to move
        // reasonably quickly when more work items exist, such as for a four-screen sim.
        30 / workItems.length
      );
    };
    runItem( 0 );
  }

  // Bound to this.boundRunAnimationLoop so it can be run in window.requestAnimationFrame
  private runAnimationLoop(): void {
    window.requestAnimationFrame( this.boundRunAnimationLoop );

    // Only run animation frames for an active sim. If in playbackMode, playback logic will handle animation frame
    // stepping manually.
    if ( this.activeProperty.value && !phet.joist.playbackModeEnabledProperty.value ) {

      // Handle Input fuzzing before stepping the sim because input events occur outside of sim steps, but not before the
      // first sim step (to prevent issues like https://github.com/phetsims/equality-explorer/issues/161).
      this.frameCounter > 0 && this.display.fuzzInputEvents();

      this.stepOneFrame();
    }

    // The animation frame timer runs every frame
    const currentTime = Date.now();
    animationFrameTimer.emit( getDT( this.lastAnimationFrameTime, currentTime ) );
    this.lastAnimationFrameTime = currentTime;

    if ( Tandem.PHET_IO_ENABLED ) {

      // PhET-iO batches messages to be sent to other frames, messages must be sent whether the sim is active or not
      phet.phetio.phetioCommandProcessor.onAnimationLoop( this );
    }
  }

  // Run a single frame including model, view and display updates, used by Legends of Learning
  public stepOneFrame(): void {

    // Compute the elapsed time since the last frame, or guess 1/60th of a second if it is the first frame
    const currentTime = Date.now();
    const dt = getDT( this.lastStepTime, currentTime );
    this.lastStepTime = currentTime;

    // Don't run the simulation on steps back in time (see https://github.com/phetsims/joist/issues/409)
    if ( dt > 0 ) {
      this.stepSimulation( dt );
    }
  }

  /**
   * Update the simulation model, view, scenery display with an elapsed time of dt.
   * @param dt - in seconds
   * (phet-io)
   */
  public stepSimulation( dt: number ): void {
    this.stepSimulationAction.execute( dt );
  }

  /**
   * Hide or show all accessible content related to the sim ScreenViews, and navigation bar. This content will
   * remain visible, but not be tab navigable or readable with a screen reader. This is generally useful when
   * displaying a pop up or modal dialog.
   */
  public setPDOMViewsVisible( visible: boolean ): void {
    for ( let i = 0; i < this.screens.length; i++ ) {
      this.screens[ i ].view.pdomVisible = visible;
    }

    this.navigationBar.pdomVisible = visible;
    this.homeScreen && this.homeScreen.view.setPDOMVisible( visible );
    this.toolbar && this.toolbar.setPDOMVisible( visible );
  }

  /**
   * Set the voicingVisible state of simulation components. When false, ONLY the Toolbar
   * and its buttons will be able to announce Voicing utterances. This is used by the
   * "Sim Voicing" switch in the toolbar which will disable all Voicing in the sim so that
   * only Toolbar content is announced.
   */
  public setSimVoicingVisible( visible: boolean ): void {
    this.setNonModalVoicingVisible( visible );
    this.topLayer && this.topLayer.setVoicingVisible( visible );
  }

  /**
   * Sets voicingVisible on all elements "behind" the modal node stack. In this case, voicing should not work for those
   * components when set to false.
   * @param visible
   */
  public setNonModalVoicingVisible( visible: boolean ): void {
    for ( let i = 0; i < this.screens.length; i++ ) {
      this.screens[ i ].view.voicingVisible = visible; // home screen is the first item, if created
    }

    this.navigationBar.voicingVisible = visible;
  }
}

type LayoutNode = Node & {
  layout?: ( layoutBounds: Bounds2 ) => void;
};

// This Node supports children that have layout.
type TopLayerNode = {
  addChild( child: LayoutNode ): void;
  children: LayoutNode[];
} & Node;

/**
 * Compute the dt since the last event
 * @param lastTime - milliseconds, time of the last event
 * @param currentTime - milliseconds, current time.  Passed in instead of computed so there is no "slack" between measurements
 */
function getDT( lastTime: number, currentTime: number ): number {

  // Compute the elapsed time since the last frame, or guess 1/60th of a second if it is the first frame
  return ( lastTime === -1 ) ? 1 / 60 :
         ( currentTime - lastTime ) / 1000.0;
}

joist.register( 'Sim', Sim );