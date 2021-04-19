// Copyright 2013-2020, University of Colorado Boulder

/**
 * Main class that represents one simulation.
 * Provides default initialization, such as polyfills as well.
 * If the simulation has only one screen, then there is no homescreen, home icon or screen icon in the navigation bar.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chris Malley (PixelZoom, Inc.)
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Action from '../../axon/js/Action.js';
import animationFrameTimer from '../../axon/js/animationFrameTimer.js';
import BooleanProperty from '../../axon/js/BooleanProperty.js';
import createObservableArray from '../../axon/js/createObservableArray.js';
import DerivedProperty from '../../axon/js/DerivedProperty.js';
import Emitter from '../../axon/js/Emitter.js';
import NumberProperty from '../../axon/js/NumberProperty.js';
import Property from '../../axon/js/Property.js';
import stepTimer from '../../axon/js/stepTimer.js';
import StringProperty from '../../axon/js/StringProperty.js';
import Bounds2 from '../../dot/js/Bounds2.js';
import Dimension2 from '../../dot/js/Dimension2.js';
import Random from '../../dot/js/Random.js';
import DotUtils from '../../dot/js/Utils.js';
import merge from '../../phet-core/js/merge.js';
import platform from '../../phet-core/js/platform.js';
import StringUtils from '../../phetcommon/js/util/StringUtils.js';
import BarrierRectangle from '../../scenery-phet/js/BarrierRectangle.js';
import globalKeyStateTracker from '../../scenery/js/accessibility/globalKeyStateTracker.js';
import KeyboardFuzzer from '../../scenery/js/accessibility/KeyboardFuzzer.js';
import KeyboardUtils from '../../scenery/js/accessibility/KeyboardUtils.js';
import Display from '../../scenery/js/display/Display.js';
import InputFuzzer from '../../scenery/js/input/InputFuzzer.js';
import animatedPanZoomSingleton from '../../scenery/js/listeners/animatedPanZoomSingleton.js';
import Node from '../../scenery/js/nodes/Node.js';
import scenery from '../../scenery/js/scenery.js';
import Utils from '../../scenery/js/util/Utils.js';
import '../../sherpa/lib/game-up-camera-1.0.0.js';
import soundManager from '../../tambo/js/soundManager.js';
import Tandem from '../../tandem/js/Tandem.js';
import NumberIO from '../../tandem/js/types/NumberIO.js';
import Heartbeat from './Heartbeat.js';
import HomeScreen from './HomeScreen.js';
import HomeScreenView from './HomeScreenView.js';
import joist from './joist.js';
import joistStrings from './joistStrings.js';
import LookAndFeel from './LookAndFeel.js';
import MemoryMonitor from './MemoryMonitor.js';
import NavigationBar from './NavigationBar.js';
import packageJSON from './packageJSON.js';
import Profiler from './Profiler.js';
import QueryParametersWarningDialog from './QueryParametersWarningDialog.js';
import Screen from './Screen.js';
import ScreenSelectionSoundGenerator from './ScreenSelectionSoundGenerator.js';
import ScreenshotGenerator from './ScreenshotGenerator.js';
import selectScreens from './selectScreens.js';
import SimInfo from './SimInfo.js';
import LegendsOfLearningSupport from './thirdPartySupport/LegendsOfLearningSupport.js';
import updateCheck from './updateCheck.js';

// constants
const PROGRESS_BAR_WIDTH = 273;
const SUPPORTS_GESTURE_DESCRIPTION = platform.android || platform.mobileSafari;

// strings needed for the IE warning dialog
joistStrings.ieErrorPage.platformError;
joistStrings.ieErrorPage.ieIsNotSupported;
joistStrings.ieErrorPage.useDifferentBrowser;

// globals
phet.joist.elapsedTime = 0; // in milliseconds, use this in Tween.start for replicable playbacks

// When the simulation is going to be used to play back a recorded session, the simulation must be put into a special
// mode in which it will only update the model + view based on the playback clock events rather than the system clock.
// This must be set before the simulation is launched in order to ensure that no errant stepSimulation steps are called
// before the playback events begin.  This value is overridden for playback by PhetioEngineIO.
// @public (phet-io)
phet.joist.playbackModeEnabledProperty = new BooleanProperty( phet.chipper.queryParameters.playbackMode );

assert && assert( typeof phet.chipper.brand === 'string', 'phet.chipper.brand is required to run a sim' );

class Sim {

  /**
   * @param {string} name - the name of the simulation, to be displayed in the navbar and homescreen
   * @param {Screen[]} allSimScreens - the possible screens for the sim in order of declaration (does not include the home screen)
   * @param {Object} [options] - see below for options
   */
  constructor( name, allSimScreens, options ) {

    window.phetSplashScreenDownloadComplete();

    assert && assert( allSimScreens.length >= 1, 'at least one screen is required' );

    options = merge( {

      // credits, see AboutDialog for format
      credits: {},

      // {null|function(tandem:Tandem):Node} creates the content for the Options dialog
      createOptionsDialogContent: null,

      // a {Node} placed onto the home screen (if available)
      homeScreenWarningNode: null,

      // if true, records the scenery input events and sends them to a server that can store them
      recordInputEventLog: false,

      // when playing back a recorded scenery input event log, use the specified filename.  Please see getEventLogName for more
      inputEventLogName: undefined,

      // {boolean} - true when this sim supports a keyboard help button on the navigation bar that shows keyboard help
      // content. This content is specific to each screen, see Screen.keyboardHelpNode for more info.
      hasKeyboardHelpContent: false,

      // the default renderer for the rootNode, see #221, #184 and https://github.com/phetsims/molarity/issues/24
      rootRenderer: 'svg',

      // {VibrationManager|null} - Responsible for managing vibration feedback for a sim. Experimental, and
      // not used frequently. The vibrationManager instance is passed through options so that tappi doesn't have to
      // become a dependency for all sims yet. If this gets more use, this will likely change.
      vibrationManager: null,

      // Sims that do not use WebGL trigger a ~ 0.5 second pause shortly after the sim starts up, so sims must opt in to
      // webgl support, see https://github.com/phetsims/scenery/issues/621
      webgl: false,

      // {boolean} - Whether to allow WebGL 2x scaling when antialiasing is detected. If running out of memory on
      // things like iPad 2s (e.g. https://github.com/phetsims/scenery/issues/859), this can be turned to false to help.
      allowBackingScaleAntialiasing: true

    }, options );

    // @public - used by PhetButton and maybe elsewhere
    this.options = options;

    // override rootRenderer using query parameter, see #221 and #184
    options.rootRenderer = phet.chipper.queryParameters.rootRenderer || options.rootRenderer;

    // @public {Property.<string>} (joist-internal)
    this.simNameProperty = new StringProperty( name, {
      tandem: Tandem.GENERAL_MODEL.createTandem( 'simNameProperty' ),
      phetioFeatured: true,
      phetioDocumentation: 'The name of the sim. Changing this value will update the title text on the navigation bar ' +
                           'and the title text on the home screen, if it exists.'
    } );

    // playbackModeEnabledProperty cannot be changed after Sim construction has begun, hence this listener is added before
    // anything else is done, see https://github.com/phetsims/phet-io/issues/1146
    phet.joist.playbackModeEnabledProperty.lazyLink( playbackModeEnabled => {
      throw new Error( 'playbackModeEnabledProperty cannot be changed after Sim construction has begun' );
    } );

    // @public {Property} that indicates sim construction completed, and that all screen models and views have been created.
    // This was added for PhET-iO but can be used by any client. This does not coincide with the end of the Sim
    // constructor (because Sim has asynchronous steps that finish after the constructor is completed)
    this.isConstructionCompleteProperty = new Property( false );
    assert && this.isConstructionCompleteProperty.lazyLink( isConstructionComplete => {
      assert && assert( isConstructionComplete, 'Sim construction should never uncomplete' );
    } );

    // Supplied query parameters override options (but default values for non-supplied query parameters do not).
    if ( QueryStringMachine.containsKey( 'webgl' ) ) {
      options.webgl = phet.chipper.queryParameters.webgl;
    }

    Utils.setWebGLEnabled( options.webgl );

    // @public - Action that indicates when the sim resized.  This Action is implemented so it can be automatically played back.
    this.resizeAction = new Action( ( width, height ) => {
      assert && assert( width > 0 && height > 0, 'sim should have a nonzero area' );

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

      // Layout each of the screens
      _.each( this.screens, m => m.view.layout( width, screenHeight ) );
      this.topLayer.children.forEach( child => child.layout && child.layout( width, screenHeight ) );

      // Fixes problems where the div would be way off center on iOS7
      if ( platform.mobileSafari ) {
        window.scrollTo( 0, 0 );
      }

      // update our scale and bounds properties after other changes (so listeners can be fired after screens are resized)
      this.scaleProperty.value = scale;
      this.boundsProperty.value = new Bounds2( 0, 0, width, height );
      this.screenBoundsProperty.value = new Bounds2( 0, 0, width, screenHeight );

      // set the scale describing the target Node, since scale from window resize is applied to each ScreenView,
      // (children of the PanZoomListener targetNode)
      animatedPanZoomSingleton.listener.setTargetScale( scale );

      // set the bounds which accurately describe the panZoomListener targetNode, since it would otherwise be
      // inaccurate with the very large BarrierRectangle
      animatedPanZoomSingleton.listener.setTargetBounds( this.boundsProperty.value );

      // constrain the simulation pan bounds so that it cannot be moved off screen
      animatedPanZoomSingleton.listener.setPanBounds( this.boundsProperty.value );
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

    // Sim screens normally update by implementing model.step(dt) or view.step(dt).  When that is impossible or
    // relatively awkward, it is possible to listen for a callback when a frame begins, when a frame is being processed
    // or after the frame is complete.  See https://github.com/phetsims/joist/issues/534

    // @public Emitter that indicates when a frame starts.  Listen to this Emitter if you have an action that must be
    // performed before the step begins.
    this.frameStartedEmitter = new Emitter();

    // @public Emitter that indicates when a frame ends.  Listen to this Emitter if you have an action that must be
    // performed after the step completes.
    this.frameEndedEmitter = new Emitter( {
      tandem: Tandem.GENERAL_MODEL.createTandem( 'frameEndedEmitter' ),
      phetioHighFrequency: true
    } );

    // @public {Action} Action that steps the simulation. This Action is implemented so it can be automatically
    // played back for PhET-iO record/playback.  Listen to this Action if you have an action that happens during the
    // simulation step.
    this.stepSimulationAction = new Action( dt => {
      this.frameStartedEmitter.emit();

      // increment this before we can have an exception thrown, to see if we are missing frames
      this.frameCounter++;

      // Apply any scaling effects here before it is used.
      dt *= phet.chipper.queryParameters.speed;

      if ( this.resizePending ) {
        this.resizeToWindow();
      }

      // If the user is on the home screen, we won't have a Screen that we'll want to step.  This must be done after
      // fuzz mouse, because fuzzing could change the selected screen, see #130
      const screen = this.screenProperty.value;

      // cap dt based on the current screen, see https://github.com/phetsims/joist/issues/130
      if ( screen.maxDT ) {
        dt = Math.min( dt, screen.maxDT );
      }

      // TODO: we are /1000 just to *1000?  Seems wasteful and like opportunity for error. See https://github.com/phetsims/joist/issues/387
      // Store the elapsed time in milliseconds for usage by Tween clients
      phet.joist.elapsedTime += dt * 1000;

      // timer step before model/view steps, see https://github.com/phetsims/joist/issues/401
      // Note that this is vital to support Interactive Description and the utterance queue.
      stepTimer.emit( dt );

      // If the DT is 0, we will skip the model step (see https://github.com/phetsims/joist/issues/171)
      if ( screen.model.step && dt ) {
        screen.model.step( dt );
      }

      // If using the TWEEN animation library, then update all of the tweens (if any) before rendering the scene.
      // Update the tweens after the model is updated but before the view step.
      // See https://github.com/phetsims/joist/issues/401.
      //TODO https://github.com/phetsims/joist/issues/404 run TWEENs for the selected screen only
      if ( window.TWEEN ) {
        window.TWEEN.update( phet.joist.elapsedTime );
      }

      if ( phet.chipper.queryParameters.supportsPanAndZoom ) {

        // animate the PanZoomListener, for smooth panning/scaling
        animatedPanZoomSingleton.listener.step( dt );
      }

      // if provided, update the vibrationManager which tracks time sequences of on/off vibration
      if ( this.vibrationManager ) {
        this.vibrationManager.step( dt );
      }

      // View step is the last thing before updateDisplay(), so we can do paint updates there.
      // See https://github.com/phetsims/joist/issues/401.
      if ( screen.view.step ) {
        screen.view.step( dt );
      }
      this.display.updateDisplay();

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

    const homeScreenQueryParameter = phet.chipper.queryParameters.homeScreen;
    const initialScreenIndex = phet.chipper.queryParameters.initialScreen;
    const screensQueryParameter = phet.chipper.queryParameters.screens;

    const screenData = selectScreens(
      allSimScreens,
      homeScreenQueryParameter,
      QueryStringMachine.containsKey( 'homeScreen' ),
      initialScreenIndex,
      QueryStringMachine.containsKey( 'initialScreen' ),
      screensQueryParameter,
      QueryStringMachine.containsKey( 'screens' ),
      selectedSimScreens => {
        return new HomeScreen( this.simNameProperty, () => this.screenProperty, selectedSimScreens, Tandem.ROOT.createTandem( window.phetio.PhetioIDUtils.HOME_SCREEN_COMPONENT_NAME ), {
          warningNode: options.homeScreenWarningNode
        } );
      }
    );

    // @public (read-only) {HomeScreen|null}
    this.homeScreen = screenData.homeScreen;

    // @public (read-only) {Screen[]} - the ordered list of sim-specific screens that appear in this runtime of the sim
    this.simScreens = screenData.selectedSimScreens;

    // @public (read-only) {Screen[]} - all screens that appear in the runtime of this sim, with the homeScreen first if
    // it was created
    this.screens = screenData.screens;

    // @public (read-only) {boolean} - true if all possible screens are present (order-independent)
    this.allScreensCreated = screenData.allScreensCreated;

    // @public {Property.<Screen>}
    this.screenProperty = new Property( screenData.initialScreen, {
      tandem: Tandem.GENERAL_MODEL.createTandem( 'screenProperty' ),
      phetioFeatured: true,
      phetioDocumentation: 'Determines which screen is selected in the simulation',
      validValues: this.screens,
      phetioType: Property.PropertyIO( Screen.ScreenIO )
    } );

    // @public - the displayed name in the sim. This depends on what screens are shown this runtime (effected by query parameters).
    this.displayedSimNameProperty = new DerivedProperty( [ this.simNameProperty, this.simScreens[ 0 ].nameProperty ],
      ( simName, screenName ) => {
        const isMultiScreenSimDisplayingSingleScreen = this.simScreens.length === 1 && allSimScreens.length !== this.simScreens.length;

        // update the titleText based on values of the sim name and screen name
        if ( isMultiScreenSimDisplayingSingleScreen && simName && screenName ) {

          // If the 'screens' query parameter selects only 1 screen and both the sim and screen name are not the empty
          // string, then update the nav bar title to include a hyphen and the screen name after the sim name.
          return StringUtils.fillIn( joistStrings.simTitleWithScreenNamePattern, {
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
      } );

    // @public - When the sim is active, scenery processes inputs and stepSimulation(dt) runs from the system clock.
    // Set to false for when the sim will be paused.  If the sim has playbackModeEnabledProperty set to true, the
    // activeProperty will automatically be set to false so the timing and inputs can be controlled by the playback engine
    this.activeProperty = new BooleanProperty( !phet.joist.playbackModeEnabledProperty.value, {
      tandem: Tandem.GENERAL_MODEL.createTandem( 'activeProperty' ),
      phetioFeatured: true,
      phetioDocumentation: 'Determines whether the entire simulation is running and processing user input. ' +
                           'Setting this property to false pauses the simulation, and prevents user interaction.'
    } );

    // @public (read-only) - property that indicates whether the browser tab containing the simulation is currently visible
    this.browserTabVisibleProperty = new BooleanProperty( true, {
      tandem: Tandem.GENERAL_MODEL.createTandem( 'browserTabVisibleProperty' ),
      phetioDocumentation: 'Indicates whether the browser tab containing the simulation is currently visible',
      phetioReadOnly: true,
      phetioFeatured: true
    } );

    // set the state of the property that indicates if the browser tab is visible
    document.addEventListener( 'visibilitychange', () => {
      this.browserTabVisibleProperty.set( document.visibilityState === 'visible' );
    }, false );

    // @public (joist-internal, read-only) - How the home screen and navbar are scaled. This scale is based on the
    // HomeScreen's layout bounds to support a consistently sized nav bar and menu. If this scale was based on the
    // layout bounds of the current screen, there could be differences in the nav bar across screens.
    this.scaleProperty = new NumberProperty( 1 );

    // @public (joist-internal, read-only) {Property.<Bounds2>|null} - global bounds for the entire simulation. null
    //                                                                 before first resize
    this.boundsProperty = new Property( null );

    // @public (joist-internal, read-only) {Property.<Bounds2>|null} - global bounds for the screen-specific part
    //                                                            (excludes the navigation bar), null before first resize
    this.screenBoundsProperty = new Property( null );

    // @public
    this.lookAndFeel = new LookAndFeel();
    assert && assert( window.phet.joist.launchCalled, 'Sim must be launched using simLauncher, ' +
                                                      'see https://github.com/phetsims/joist/issues/142' );

    // @private
    this.destroyed = false;

    // @public {MemoryMonitor}
    this.memoryMonitor = new MemoryMonitor();

    // @public (joist-internal, read-only) {boolean} - used to specify if the sim is set up to support accessibility,
    // even if this specific runtime turns it on/off via a query parameter. Most of the time this should not be used;
    // instead see phet.chipper.queryParameters.supportsInteractiveDescription. This is to support a consistent API for PhET-iO, see https://github.com/phetsims/phet-io/issues/1457
    this.accessibilityPartOfTheAPI = packageJSON.phet.features && packageJSON.phet.features.supportsInteractiveDescription;

    // public (read-only) {boolean} - if true, add support specific to accessible technology that work with touch devices.
    this.supportsGestureDescription = phet.chipper.queryParameters.supportsInteractiveDescription && SUPPORTS_GESTURE_DESCRIPTION;

    // @public (joist-internal, read-only)
    this.hasKeyboardHelpContent = options.hasKeyboardHelpContent;

    assert && assert( !window.phet.joist.sim, 'Only supports one sim at a time' );
    window.phet.joist.sim = this;

    // @public (read-only) {Property.<boolean>} - if PhET-iO is currently setting the state of the simulation.
    // See PhetioStateEngine for details. This must be declared before soundManager.initialized is called.
    this.isSettingPhetioStateProperty = Tandem.PHET_IO_ENABLED ?
                                        new DerivedProperty(
                                          [ phet.phetio.phetioEngine.phetioStateEngine.isSettingStateProperty ],
                                          _.identity ) :
                                        new BooleanProperty( false );

    // commented out because https://github.com/phetsims/joist/issues/553 is deferred for after GQIO-oneone
    // if ( PHET_IO_ENABLED ) {
    //   this.engagementMetrics = new EngagementMetrics( this );
    // }

    // Set/update global flag values that enable and configure the sound library.  These can be controlled through sim
    // flags or query params.

    // @public (joist-internal, read-only) {boolean} - true if the simulation supports sound and sound is enabled
    this.supportsSound = ( packageJSON.phet.supportsSound || phet.chipper.queryParameters.supportsSound ) &&
                         ( phet.chipper.queryParameters.sound === 'enabled' ||
                           phet.chipper.queryParameters.sound === 'muted' );

    // @public (joist-internal, read-only) {boolean} - used to specify if the sim is set up to support sound, even if
    // this specific runtime turns it off via a query parameter. Most of the time this should not be used; instead see
    // Sim.supportsSound. This is to support a consistent API for PhET-iO, see https://github.com/phetsims/joist/issues/573
    this.soundPartOfTheAPI = packageJSON.phet.supportsSound;

    // @public (joist-internal, read-only) {boolean} - true if the simulation supports enhanced sound, cannot support
    // enhanced without supporting sound in general
    this.supportsEnhancedSound = this.supportsSound &&
                                 ( packageJSON.phet.supportsEnhancedSound ||
                                   phet.chipper.queryParameters.supportsEnhancedSound );

    // Initialize the sound library if enabled, then hook up sound generation for screen changes.
    if ( this.supportsSound ) {
      soundManager.initialize(
        this.isConstructionCompleteProperty,
        this.browserTabVisibleProperty,
        this.activeProperty,
        this.isSettingPhetioStateProperty
      );
      soundManager.addSoundGenerator(
        new ScreenSelectionSoundGenerator( this.screenProperty, this.homeScreen, { initialOutputLevel: 0.5 } ),
        {
          categoryName: 'user-interface'
        }
      );
    }

    // @private {null|VibrationManager} - The singleton instance of VibrationManager. Experimental and not frequently
    // used. If used more generally, reference will no longer be needed as joist will have access to vibrationManager
    // through when tappi becomes a sim lib.
    this.vibrationManager = options.vibrationManager;
    if ( this.vibrationManager ) {
      this.vibrationManager.initialize( this.browserTabVisibleProperty, this.activeProperty );
    }

    // Make ScreenshotGenerator available globally so it can be used in preload files such as PhET-iO.
    window.phet.joist.ScreenshotGenerator = ScreenshotGenerator;

    this.version = packageJSON.version; // @public (joist-internal)
    this.credits = options.credits; // @public (joist-internal)

    // @private - number of animation frames that have occurred
    this.frameCounter = 0;

    // @private {boolean} - Whether the window has resized since our last updateDisplay()
    this.resizePending = true;

    // @public - Make our locale available
    this.locale = phet.chipper.locale || 'en';

    // If the locale query parameter was specified, then we may be running the all.html file, so adjust the title.
    // See https://github.com/phetsims/chipper/issues/510
    if ( QueryStringMachine.containsKey( 'locale' ) ) {
      $( 'title' ).html( name );
    }

    // enables recording of Scenery's input events, request animation frames, and dt's so the sim can be played back
    if ( phet.chipper.queryParameters.recordInputEventLog ) {
      options.recordInputEventLog = true;
      options.inputEventLogName = phet.chipper.queryParameters.recordInputEventLog;
    }

    // instead of loading like normal, download a previously-recorded event sequence and play it back (unique to the browser and window size)
    if ( phet.chipper.queryParameters.playbackInputEventLog ) {
      options.playbackInputEventLog = true;
      options.inputEventLogName = phet.chipper.queryParameters.playbackInputEventLog;
    }

    // override window.open with a semi-API-compatible function, so fuzzing doesn't open new windows.
    if ( phet.chipper.isFuzzEnabled() ) {
      window.open = function() {
        return {
          focus: function() {},
          blur: function() {}
        };
      };
    }

    const $body = $( 'body' );

    // prevent scrollbars
    $body.css( 'padding', '0' ).css( 'margin', '0' ).css( 'overflow', 'hidden' );

    // check to see if the sim div already exists in the DOM under the body. This is the case for https://github.com/phetsims/scenery/issues/174 (iOS offline reading list)
    if ( document.getElementById( 'sim' ) && document.getElementById( 'sim' ).parentNode === document.body ) {
      document.body.removeChild( document.getElementById( 'sim' ) );
    }

    // Prevents selection cursor issues in Safari, see https://github.com/phetsims/scenery/issues/476
    document.onselectstart = function() { return false; };

    // @public - root node for the Display
    this.rootNode = new Node( { renderer: options.rootRenderer } );

    // root for the simulation and the target for MultiListener to support magnification since the Display rootNode
    // cannot be transformed
    this.simulationRoot = new Node();
    this.rootNode.addChild( this.simulationRoot );

    // @private
    this.display = new Display( this.rootNode, {

      // prevent overflow that can cause iOS bugginess, see https://github.com/phetsims/phet-io/issues/341
      allowSceneOverflow: false,

      // Indicate whether webgl is allowed to facilitate testing on non-webgl platforms, see https://github.com/phetsims/scenery/issues/289
      allowWebGL: phet.chipper.queryParameters.webgl,
      accessibility: phet.chipper.queryParameters.supportsInteractiveDescription,
      voicing: phet.chipper.queryParameters.supportsVoicing,
      assumeFullWindow: true, // a bit faster if we can assume no coordinate translations are needed for the display.
      allowBackingScaleAntialiasing: options.allowBackingScaleAntialiasing,

      // phet-io
      tandem: Tandem.GENERAL_VIEW.createTandem( 'display' )
    } );

    // Seeding by default a random value for reproducable fuzzes if desired
    const fuzzerSeed = phet.chipper.queryParameters.randomSeed * Math.PI;

    // @private {InputFuzzer}
    this.inputFuzzer = new InputFuzzer( this.display, fuzzerSeed );

    // @private {KeyboardFuzzer}
    this.keyboardFuzzer = new KeyboardFuzzer( this.display, fuzzerSeed );

    // When the sim is inactive, make it non-interactive, see https://github.com/phetsims/scenery/issues/414
    this.activeProperty.link( active => {
      this.display.interactive = active;
      globalKeyStateTracker.enabled = active;

      // The sim must remain inactive while playbackModeEnabledProperty is true
      if ( active ) {
        assert && assert( !phet.joist.playbackModeEnabledProperty.value, 'The sim must remain inactive while playbackModeEnabledProperty is true' );
      }
    } );

    this.display.domElement.id = 'sim';
    document.body.appendChild( this.display.domElement );

    if ( phet.chipper.queryParameters.supportsInteractiveDescription ) {

      // for now interactive description is only in english
      // NOTE: When translatable this will need to update with language, change to phet.chipper.local
      this.display.pdomRootElement.lang = 'en';

      // If a down event is received we will make the focus highlights invisible. Is is to support iOS + VO accessibility
      // when that platform only provides pointer events (and nothing from the PDOM). We need to keep focus on elements
      // even when the focus highlights aren't shown. Also, if you have a down event on anything that isn't the
      // currently focused element, then it will remove focus from all Displays.
      // See https://github.com/phetsims/scenery/issues/1137
      this.display.addInputListener( {
        down: event => {

          // in the voicing prototype we want the focus highlight to remain visible with
          // mouse/touch presses
          if ( !phet.chipper.queryParameters.supportsVoicing ) {

            // An AT might have sent a down event outside of the display, if this happened we will not do anything
            // to change focus
            if ( this.display.bounds.containsPoint( event.pointer.point ) ) {

              // in response to pointer events, always hide the focus highlight so it isn't distracting
              this.display.focusHighlightsVisibleProperty.value = false;

              // no need to do this work unless some element in the simulation has focus
              if ( Display.focusedNode ) {

                // if the event trail doesn't include the focusedNode, clear it - otherwise DOM focus is kept on the
                // active element so that it can remain the target for assistive devices using pointer events
                // on behalf of the user, see https://github.com/phetsims/scenery/issues/1137
                if ( !event.trail.nodes.includes( Display.focusedNode ) ) {
                  Display.focus = null;
                }
              }
            }
          }
        }
      } );

      const setHighlightsVisible = () => { this.display.focusHighlightsVisibleProperty.value = true; };
      const focusHighlightVisibleListener = {};

      // restore display of focus highlights if we receive PDOM events. Exclude focus-related events here
      // so that we can support some iOS cases where we want PDOM behavior even though iOS + VO only provided pointer
      // events. See https://github.com/phetsims/scenery/issues/1137 for details.
      [ 'click', 'input', 'change', 'keydown', 'keyup' ].forEach( eventType => {
        focusHighlightVisibleListener[ eventType ] = setHighlightsVisible;
      } );
      this.display.addInputListener( focusHighlightVisibleListener );

      // When tabbing into the sim, make focus highlights visible - on keyup because the keydown is likely to have
      // occurred on an element outside of the DOM scope.
      globalKeyStateTracker.keyupEmitter.addListener( event => {
        if ( KeyboardUtils.isKeyEvent( event, KeyboardUtils.KEY_TAB ) ) {
          setHighlightsVisible();
        }
      } );
    }

    Heartbeat.start( this );

    if ( phet.chipper.queryParameters.sceneryLog ) {
      scenery.enableLogging( phet.chipper.queryParameters.sceneryLog );
    }

    if ( phet.chipper.queryParameters.sceneryStringLog ) {
      scenery.switchLogToString();
    }

    this.display.initializeEvents( {
      tandem: Tandem.GENERAL_CONTROLLER.createTandem( 'input' )
    } ); // sets up listeners on the document with preventDefault(), and forwards those events to our scene
    window.phet.joist.rootNode = this.rootNode; // make the scene available for debugging
    window.phet.joist.display = this.display; // make the display available for debugging

    // Pass through query parameters to scenery for showing supplemental information
    this.display.setPointerDisplayVisible( phet.chipper.queryParameters.showPointers );
    this.display.setPointerAreaDisplayVisible( phet.chipper.queryParameters.showPointerAreas );
    this.display.setHitAreaDisplayVisible( phet.chipper.queryParameters.showHitAreas );
    this.display.setCanvasNodeBoundsVisible( phet.chipper.queryParameters.showCanvasNodeBounds );
    this.display.setFittedBlockBoundsVisible( phet.chipper.queryParameters.showFittedBlockBounds );

    // @public (joist-internal)
    this.navigationBar = new NavigationBar( this, Tandem.GENERAL_VIEW.createTandem( 'navigationBar' ) );

    // magnification support - always initialized for consistent PhET-iO API, but only conditionally added to Display
    animatedPanZoomSingleton.initialize( this.simulationRoot, {
      tandem: Tandem.GENERAL_VIEW.createTandem( 'panZoomListener' )
    } );
    if ( phet.chipper.queryParameters.supportsPanAndZoom ) {
      this.display.addInputListener( animatedPanZoomSingleton.listener );
    }

    // @public (joist-internal)
    this.updateBackground = () => {
      this.lookAndFeel.backgroundColorProperty.value = this.screenProperty.value.backgroundColorProperty.value;
    };

    this.lookAndFeel.backgroundColorProperty.link( backgroundColor => {
      this.display.backgroundColor = backgroundColor;
    } );

    this.screenProperty.link( () => this.updateBackground() );

    // When the user switches screens, interrupt the input on the previous screen.
    // See https://github.com/phetsims/scenery/issues/218
    this.screenProperty.lazyLink( ( newScreen, oldScreen ) => oldScreen.view.interruptSubtreeInput() );

    // If the page is loaded from the back-forward cache, then reload the page to avoid bugginess,
    // see https://github.com/phetsims/joist/issues/448
    window.addEventListener( 'pageshow', event => {
      if ( event.persisted ) {
        window.location.reload();
      }
    } );

    // @public (read-only) {SimInfo} - create this only after all other members have been set on Sim
    this.simInfo = new SimInfo( this );

    // Set up PhET-iO, must be done after phet.joist.sim is assigned
    Tandem.PHET_IO_ENABLED && phet.phetio.phetioEngine.onSimConstructionStarted( this );

    // Third party support
    phet.chipper.queryParameters.legendsOfLearning && new LegendsOfLearningSupport( this ).start();
  }

  /**
   * Get the single utteranceQueue instance to be used by the PhET sim to make aria-live alerts.
   * @public
   * @returns {UtteranceQueue}
   */
  get utteranceQueue() {
    return this.display.utteranceQueue;
  }

  /**
   * Get the single UtteranceQueue instance used for alerts spoken with SpeechSynthesis.
   * @public
   * @returns {UtteranceQueue}
   */
  get voicingUtteranceQueue() {
    return this.display.voicingUtteranceQueue;
  }

  /**
   * @param {Screen[]} screens
   * @private
   */
  finishInit( screens ) {

    _.each( screens, screen => {
      screen.view.layerSplit = true;
      this.simulationRoot.addChild( screen.view );
    } );
    this.simulationRoot.addChild( this.navigationBar );

    this.screenProperty.link( currentScreen => {
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
        animatedPanZoomSingleton.listener.resetTransform();
      }
    } );

    // layer for popups, dialogs, and their backgrounds and barriers
    this.topLayer = new Node();
    this.simulationRoot.addChild( this.topLayer );

    // @private list of nodes that are "modal" and hence block input with the barrierRectangle.  Used by modal dialogs
    // and the PhetMenu
    this.modalNodeStack = createObservableArray(); // {Node} with node.hide()

    // @public (joist-internal) Semi-transparent black barrier used to block input events when a dialog (or other popup)
    // is present, and fade out the background.
    this.barrierRectangle = new BarrierRectangle(
      this.modalNodeStack, {
        fill: 'rgba(0,0,0,0.3)',
        pickable: true,
        tandem: Tandem.GENERAL_VIEW.createTandem( 'barrierRectangle' ),
        phetioDocumentation: 'Semi-transparent barrier used to block input events when a dialog is shown, also fades out the background'
      } );
    this.topLayer.addChild( this.barrierRectangle );

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

    // @private - Keep track of the previous time for computing dt, and initially signify that time hasn't been recorded yet.
    this.lastStepTime = -1;
    this.lastAnimationFrameTime = -1;

    // @public (joist-internal)
    // Bind the animation loop so it can be called from requestAnimationFrame with the right this.
    this.boundRunAnimationLoop = this.runAnimationLoop.bind( this );

    // show any query parameter warnings in a dialog
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
   * Adds a popup in the global coordinate frame, and optionally displays a semi-transparent black input barrier behind it.
   * Use hidePopup() to remove it.
   * @param {Node} node - Should have node.hide() implemented to hide the popup (should subsequently call
   *                      sim.hidePopup()).
   * @param {boolean} isModal - Whether to display the semi-transparent black input barrier behind it.
   * @public
   */
  showPopup( node, isModal ) {
    assert && assert( node );
    assert && assert( !!node.hide, 'Missing node.hide() for showPopup' );
    assert && assert( !this.topLayer.hasChild( node ), 'Popup already shown' );
    if ( isModal ) {
      this.modalNodeStack.push( node );
    }
    if ( node.layout ) {
      node.layout( this.screenBoundsProperty.value.width, this.screenBoundsProperty.value.height );
    }
    this.topLayer.addChild( node );
  }

  /*
   * Hides a popup that was previously displayed with showPopup()
   * @param {Node} node
   * @param {boolean} isModal - Whether the previous popup was modal (or not)
   * @public
   */
  hidePopup( node, isModal ) {
    assert && assert( node && this.modalNodeStack.includes( node ) );
    assert && assert( this.topLayer.hasChild( node ), 'Popup was not shown' );
    if ( isModal ) {
      this.modalNodeStack.remove( node );
    }
    this.topLayer.removeChild( node );
  }

  /**
   * @public (joist-internal)
   */
  resizeToWindow() {
    this.resizePending = false;
    this.resize( window.innerWidth, window.innerHeight );
  }

  // @public (joist-internal, phet-io)
  resize( width, height ) {
    this.resizeAction.execute( width, height );
  }

  // Destroy a sim so that it will no longer consume any resources. Formerly used in Smorgasbord.  May not be used by
  // anything else at the moment.

  // @public (joist-internal)
  start() {

    // In order to animate the loading progress bar, we must schedule work with setTimeout
    // This array of {function} is the work that must be completed to launch the sim.
    const workItems = [];

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
        screen.initializeView( this.simNameProperty.value, this.displayedSimNameProperty.value, this.screens.length, this.homeScreen === screen );
      } );
    } );

    // loop to run startup items asynchronously so the DOM can be updated to show animation on the progress bar
    const runItem = i => {
      setTimeout( // eslint-disable-line bad-sim-text
        () => {
          workItems[ i ]();

          // Move the progress ahead by one so we show the full progress bar for a moment before the sim starts up

          const progress = DotUtils.linear( 0, workItems.length - 1, 0.25, 1.0, i );

          // Support iOS Reading Mode, which saves a DOM snapshot after the progressBarForeground has already been
          // removed from the document, see https://github.com/phetsims/joist/issues/389
          if ( document.getElementById( 'progressBarForeground' ) ) {

            // Grow the progress bar foreground to the right based on the progress so far.
            document.getElementById( 'progressBarForeground' ).setAttribute( 'width', `${progress * PROGRESS_BAR_WIDTH}` );
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
              this.isConstructionCompleteProperty.value = true;

              // place the requestAnimationFrame *before* rendering to assure as close to 60fps with the setTimeout fallback.
              // http://paulirish.com/2011/requestanimationframe-for-smart-animating/
              // Launch the bound version so it can easily be swapped out for debugging.
              // Schedules animation updates and runs the first step()
              this.boundRunAnimationLoop();

              // If the sim is in playback mode, then flush the timer's listeners. This makes sure that anything kicked
              // to the next frame with `timer.runOnNextTick` during startup (like every notification about a PhET-iO
              // instrumented element in phetioEngine.phetioObjectAdded()) can clear out before beginning playback.
              if ( phet.joist.playbackModeEnabledProperty.value ) {
                const beforeCounts = Array.from( Random.allRandomInstances ).map( n => n.numberOfCalls );
                stepTimer.emit( 0 );
                const afterCounts = Array.from( Random.allRandomInstances ).map( n => n.numberOfCalls );
                assert && assert( _.isEqual( beforeCounts, afterCounts ),
                  `Random was called more times in the playback sim on startup, before: ${beforeCounts}, after: ${afterCounts}` );
              }

              // After the application is ready to go, remove the splash screen and progress bar.  Note the splash
              // screen is removed after one step(), so the rendering is ready to go when the progress bar is hidden.
              window.phetSplashScreen.dispose();

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

  // @public (joist-internal)
  destroy() {
    this.destroyed = true;
    this.display.domElement.parentNode && this.display.domElement.parentNode.removeChild( this.display.domElement );
  }

  // @private - Bound to this.boundRunAnimationLoop so it can be run in window.requestAnimationFrame
  runAnimationLoop() {
    if ( !this.destroyed ) {
      window.requestAnimationFrame( this.boundRunAnimationLoop );
    }

    // Setting the activeProperty to false pauses the sim and also enables optional support for playback back recorded
    // events (if playbackModeEnabledProperty) is true
    if ( this.activeProperty.value ) {

      // Handle Input fuzzing before stepping the sim because input events occur outside of sim steps, but not before the
      // first sim step (to prevent issues like https://github.com/phetsims/equality-explorer/issues/161).
      this.frameCounter > 0 && this.fuzzInputEvents();

      this.stepOneFrame();
    }

    // The animation frame timer runs every frame
    const currentTime = Date.now();
    animationFrameTimer.emit( getDT( this.lastAnimationFrameTime, currentTime ) );
    this.lastAnimationFrameTime = currentTime;

    // PhET-iO batches messages to be sent to other frames, messages must be sent whether the sim is active or not
    Tandem.PHET_IO_ENABLED && phet.phetio.phetioCommandProcessor.onAnimationLoop( this );
  }

  // @private - run a single frame including model, view and display updates
  stepOneFrame() {

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
   * @param {number} dt in seconds
   * @public (phet-io)
   */
  stepSimulation( dt ) {
    this.stepSimulationAction.execute( dt );
  }

  /**
   * Handle synthetic input event fuzzing
   * @private
   */
  fuzzInputEvents() {

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
    if ( phet.chipper.queryParameters.fuzzBoard ) {
      assert && assert( phet.chipper.queryParameters.supportsInteractiveDescription, 'fuzzBoard can only run with interactive description enabled.' );
      this.keyboardFuzzer.fuzzBoardEvents( phet.chipper.queryParameters.fuzzRate );
    }
  }

  /**
   * Hide or show all accessible content related to the sim ScreenViews, and navigation bar. This content will
   * remain visible, but not be tab navigable or readable with a screen reader. This is generally useful when
   * displaying a pop up or modal dialog.
   * @param {boolean} visible
   * @public
   */
  setAccessibleViewsVisible( visible ) {
    for ( let i = 0; i < this.screens.length; i++ ) {
      this.screens[ i ].view.pdomVisible = visible;
    }

    this.navigationBar.pdomVisible = visible;
    this.homeScreen && this.homeScreen.view.setPDOMVisible( visible );
  }
}

/**
 * Compute the dt since the last event
 * @param {number} lastTime - milliseconds, time of the last event
 * @param {number} currentTime - milliseconds, current time.  Passed in instead of computed so there is no "slack" between measurements
 * @returns {number} - seconds
 */
function getDT( lastTime, currentTime ) {

  // Compute the elapsed time since the last frame, or guess 1/60th of a second if it is the first frame
  return ( lastTime === -1 ) ? 1 / 60 :
         ( currentTime - lastTime ) / 1000.0;
}

joist.register( 'Sim', Sim );
export default Sim;