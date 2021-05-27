// Copyright 2013-2015, University of Colorado Boulder

/**
 * Main class that represents one simulation.
 * Provides default initialization, such as polyfills as well.
 * If the simulation has only one screen, then there is no homescreen, home icon or screen icon in the navigation bar.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Bounds2 = require( 'DOT/Bounds2' );
  var Dimension2 = require( 'DOT/Dimension2' );
  var NavigationBar = require( 'JOIST/NavigationBar' );
  var HomeScreen = require( 'JOIST/HomeScreen' );
  var HomeScreenView = require( 'JOIST/HomeScreenView' );
  var UpdateCheck = require( 'JOIST/UpdateCheck' );
  var Util = require( 'SCENERY/util/Util' );
  var Display = require( 'SCENERY/display/Display' );
  var Node = require( 'SCENERY/nodes/Node' );
  var ButtonListener = require( 'SCENERY/input/ButtonListener' );
  var PropertySet = require( 'AXON/PropertySet' );
  var ObservableArray = require( 'AXON/ObservableArray' );
  var platform = require( 'PHET_CORE/platform' );
  var Timer = require( 'PHET_CORE/Timer' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var Profiler = require( 'JOIST/Profiler' );
  var Input = require( 'SCENERY/input/Input' );
  var LookAndFeel = require( 'JOIST/LookAndFeel' );
  var ScreenshotGenerator = require( 'JOIST/ScreenshotGenerator' );
  var StringUtils = require( 'PHETCOMMON/util/StringUtils' );
  var packageJSON = require( 'JOIST/packageJSON' );
  var PhetButton = require( 'JOIST/PhetButton' );
  var joist = require( 'JOIST/joist' );

  // strings
  var titlePatternString = require( 'string!JOIST/titlePattern' );

  /**
   * Main Sim constructor
   * @param {string} name - the name of the simulation, to be displayed in the navbar and homescreen
   * @param {Screen[]} screens - the screens for the sim
   * @param {Object} [options] - see below for options
   * @constructor
   *
   * Events:
   * - resized( bounds, screenBounds, scale ): Fires when the sim is resized.
   */
  function Sim( name, screens, options ) {
    var sim = this;

    // globals will be attached to window.phet.joist
    window.phet.joist = window.phet.joist || {};

    options = _.extend( {

      // whether to show the home screen, or go immediately to the screen indicated by screenIndex
      showHomeScreen: phet.chipper.queryParameters.homeScreen,

      // index of the screen that will be selected at startup
      screenIndex: 0,

      // whether to run the screen indicated by screenIndex as a standalone sim
      standalone: false,

      // credits, see AboutDialog for format
      credits: {},

      // a {Node} placed into the Options dialog (if available)
      optionsNode: null,

      // a {Node} placed onto the home screen (if available)
      homeScreenWarningNode: null,

      // if true, records the scenery input events and sends them to a server that can store them
      recordInputEventLog: false,

      // TODO: Is this still needed?
      playbackMode: !!phet.chipper.getQueryParameter( 'playbackMode' ),

      // when playing back a recorded scenery input event log, use the specified filename.  Please see getEventLogName for more
      inputEventLogName: undefined,

      // Whether events should be batched until they need to be fired. If false, events will be fired immediately, not
      // waiting for the next animation frame
      batchEvents: false,

      // this function is currently (9-5-2014) specific to Energy Skate Park: Basics, which shows Save/Load buttons in
      // the PhET menu.  This interface is not very finalized and will probably be changed for future versions,
      // so don't rely on it.
      showSaveAndLoad: false,

      // If true, there will be a border shown around the home screen icons.  Use this option if the home screen icons
      // have the same color as the background, as in Color Vision.
      showSmallHomeScreenIconFrame: false,

      // Whether accessibility features are enabled or not.
      accessibility: !!phet.chipper.getQueryParameter( 'accessibility' ),

      // the default renderer for the rootNode, see #221, #184 and https://github.com/phetsims/molarity/issues/24
      rootRenderer: platform.edge ? 'canvas' : 'svg',

      // support for exporting instances from the sim
      tandem: null
    }, options );

    // @private - Export for usage in phetio.js
    this.tandem = options.tandem;

    // @private - store this for access from prototype functions, assumes that it won't be changed later
    this.options = options;

    // @private - TODO: Is this still needed?
    this.playbackMode = options.playbackMode;

    // override rootRenderer using query parameter, see #221 and #184
    options.rootRenderer = phet.chipper.getQueryParameter( 'rootRenderer' ) || options.rootRenderer;

    //Default values are to show the home screen with the 1st screen selected
    var showHomeScreen = ( _.isUndefined( options.showHomeScreen ) ) ? true : options.showHomeScreen;

    var initialScreen = phet.chipper.queryParameters.initialScreen;

    //If specifying 'screens' then use 1-based (not zero-based) and "." delimited string such as "1.3.4" to get the 1st, 3rd and 4th screen
    if ( phet.chipper.getQueryParameter( 'screens' ) ) {
      var newScreens = [];
      phet.chipper.getQueryParameter( 'screens' ).split( '.' ).map( function( screenString ) {
        return parseInt( screenString, 10 );
      } ).forEach( function( userIndex ) {
        var screenIndex = userIndex - 1; // screens query parameter is 1-based
        if ( screenIndex < 0 || screenIndex > screens.length - 1 ) {
          throw new Error( 'invalid screen index: ' + userIndex );
        }
        newScreens.push( screens[ screenIndex ] );
      } );

      // If the user specified an initial screen other than the homescreen and specified a subset of screens
      // remap the selected 1-based index from the original screens list to the filtered screens list.
      if ( initialScreen !== 0 ) {
        var index = _.indexOf( newScreens, screens[ initialScreen - 1 ] );
        assert && assert( index !== -1, 'screen not found' );
        initialScreen = index + 1;
      }

      screens = newScreens;
    }

    //If there is only one screen, do not show the home screen
    if ( screens.length === 1 || initialScreen !== 0 ) {
      showHomeScreen = false;
    }

    PropertySet.call( this, {

      // @public (joist-internal) - True if the home screen is showing
      showHomeScreen: showHomeScreen,

      // @public (joist-internal) - The selected index
      screenIndex: initialScreen === 0 ? 0 : initialScreen - 1,

      // @public (joist-internal, read-only) - how the home screen and navbar are scaled
      scale: 1,

      // @public (joist-internal, read-only) - global bounds for the entire simulation
      bounds: null,

      // @public (joist-internal, read-only) - global bounds for the screen-specific part (excludes the navigation bar)
      screenBounds: null,

      // @public (joist-internal, read-only) - {Screen|null} - The current screen, or null if showing the home screen
      currentScreen: null,

      // Flag for if the sim is active (alive) and the user is able to interact with the sim.
      // If the sim is active, the model.step, view.step, Timer and TWEEN will run.
      // Set to false for when the sim will be controlled externally, such as through record/playback or other controls.
      // @public
      active: true,

      // @public
      showPointerAreas: !!phet.chipper.getQueryParameter( 'showPointerAreas' ),

      // @public
      showPointers: !!phet.chipper.getQueryParameter( 'showPointers' ),

      // @public
      showCanvasNodeBounds: !!phet.chipper.getQueryParameter( 'showCanvasNodeBounds' ),

      // @public
      showFittedBlockBounds: !!phet.chipper.getQueryParameter( 'showFittedBlockBounds' )
    }, {
      // Tandems for properties in this PropertySet
      tandemSet: options.tandem ? {
        active: options.tandem.createTandem( 'sim.active' ),
        screenIndex: options.tandem.createTandem( 'sim.screenIndex' ),
        showHomeScreen: options.tandem.createTandem( 'sim.showHomeScreen' )
      } : {}
    } );

    // Many other components use addInstance at the end of their constructor but in this case we must register early
    // to (a) enable the SimIFrameAPI as soon as possible and (b) to enable subsequent component registrations,
    // which require the sim to be registered
    options.tandem && options.tandem.createTandem( 'sim' ).addInstance( this );

    // @public
    this.lookAndFeel = new LookAndFeel();

    assert && assert( window.phet.joist.launchCalled, 'Sim must be launched using SimLauncher, ' +
                                                      'see https://github.com/phetsims/joist/issues/142' );

    // @private
    this.destroyed = false;

    assert && assert( !window.phet.joist.sim, 'Only supports one sim at a time' );
    window.phet.joist.sim = sim;

    // Make ScreenshotGenerator available globally so it can be used in preload files such as PhET-iO.
    window.phet.joist.ScreenshotGenerator = ScreenshotGenerator;

    this.name = name;                   // @public (joist-internal)
    this.version = packageJSON.version; // @public (joist-internal)
    this.credits = options.credits;     // @public (joist-internal)

    // @private - number of animation frames that have occurred
    this.frameCounter = 0;

    // used to store input events and requestAnimationFrame cycles
    this.inputEventLog = [];                 // @public (joist-internal)
    this.inputEventBounds = Bounds2.NOTHING; // @public (joist-internal)

    // @public (joist-internal) - mouse event fuzzing parameters, average number of mouse events to synthesize per frame
    this.fuzzMouseAverage = 10;

    // @public - Make our locale available
    this.locale = phet.chipper.locale || 'en';

    //Set the HTML page title to the localized title
    //TODO: When a sim is embedded on a page, we shouldn't retitle the page
    $( 'title' ).html( StringUtils.format( titlePatternString, name, sim.version ) );

    // if nothing else specified, try to use the options for showHomeScreen & screenIndex from query parameters,
    // to facilitate testing easily in different screens
    function stringToBoolean( string ) { return string === 'true'; }

    // Query parameters override options.
    if ( phet.chipper.getQueryParameter( 'showHomeScreen' ) ) {
      options.showHomeScreen = stringToBoolean( phet.chipper.getQueryParameter( 'showHomeScreen' ) );
    }

    if ( phet.chipper.getQueryParameter( 'recordInputEventLog' ) ) {
      // enables recording of Scenery's input events, request animation frames, and dt's so the sim can be played back
      options.recordInputEventLog = true;
      options.inputEventLogName = phet.chipper.getQueryParameter( 'recordInputEventLog' );
    }

    if ( phet.chipper.getQueryParameter( 'playbackInputEventLog' ) ) {
      // instead of loading like normal, download a previously-recorded event sequence and play it back (unique to the browser and window size)
      options.playbackInputEventLog = true;
      options.inputEventLogName = phet.chipper.getQueryParameter( 'playbackInputEventLog' );
    }

    if ( phet.chipper.getQueryParameter( 'fuzzMouse' ) ) {
      // ignore any user input events, and instead fire mouse events randomly in an effort to cause an exception
      options.fuzzMouse = true;
      if ( phet.chipper.getQueryParameter( 'fuzzMouse' ) !== 'undefined' ) {
        sim.fuzzMouseAverage = parseFloat( phet.chipper.getQueryParameter( 'fuzzMouse' ) );
      }

      // override window.open with a semi-API-compatible function, so fuzzing doesn't open new windows.
      window.open = function() {
        return {
          focus: function() {},
          blur: function() {}
        };
      };
    }

    // ignore any user input events, and instead fire touch events randomly in an effort to cause an exception
    options.fuzzTouches = !!phet.chipper.getQueryParameter( 'fuzzTouches' );

    this.trigger1( 'startedSimConstructor', {
      sessionID: phet.chipper.getQueryParameter( 'sessionID' ) || null,
      simName: this.name,
      simVersion: this.version,
      url: window.location.href,
      randomSeed: window.phet.chipper.randomSeed
    } );

    var $body = $( 'body' );

    // prevent scrollbars
    $body.css( 'padding', '0' ).css( 'margin', '0' ).css( 'overflow', 'hidden' );

    // check to see if the sim div already exists in the DOM under the body. This is the case for https://github.com/phetsims/scenery/issues/174 (iOS offline reading list)
    if ( document.getElementById( 'sim' ) && document.getElementById( 'sim' ).parentNode === document.body ) {
      document.body.removeChild( document.getElementById( 'sim' ) );
    }

    // Prevents selection cursor issues in Safari, see https://github.com/phetsims/scenery/issues/476
    document.onselectstart = function() {
      return false;
    };

    // @private
    this.rootNode = new Node( { renderer: options.rootRenderer } );

    // @private
    this.display = new Display( sim.rootNode, {
      allowSceneOverflow: true, // we take up the entire browsable area, so we don't care about clipping

      // Indicate whether webgl is allowed to facilitate testing on non-webgl platforms, see https://github.com/phetsims/scenery/issues/289
      allowWebGL: phet.chipper.getQueryParameter( 'webgl' ) !== 'false',

      accessibility: options.accessibility,
      isApplication: false
    } );

    // When the sim is inactive, make it non-interactive, see https://github.com/phetsims/scenery/issues/414
    this.activeProperty.link( function( active ) {
      sim.display.interactive = active;
    } );

    var simDiv = sim.display.domElement;
    simDiv.id = 'sim';
    simDiv.setAttribute( 'aria-hidden', true );
    document.body.appendChild( simDiv );

    // for preventing Safari from going to sleep. see https://github.com/phetsims/joist/issues/140
    var heartbeatDiv = this.heartbeatDiv = document.createElement( 'div' );
    heartbeatDiv.style.opacity = 0;
    // Extra style (also used for accessibility) that makes it take up no visual layout space.
    // Without this, it could cause some layout issues. See https://github.com/phetsims/gravity-force-lab/issues/39
    heartbeatDiv.style.position = 'absolute';
    heartbeatDiv.style.left = '0';
    heartbeatDiv.style.top = '0';
    heartbeatDiv.style.width = '0';
    heartbeatDiv.style.height = '0';
    heartbeatDiv.style.clip = 'rect(0,0,0,0)';
    heartbeatDiv.setAttribute( 'aria-hidden', true ); // hide div from screen readers (a11y)
    document.body.appendChild( heartbeatDiv );

    if ( phet.chipper.getQueryParameter( 'sceneryLog' ) ) {
      var logNames = phet.chipper.getQueryParameter( 'sceneryLog' );
      if ( logNames === undefined || logNames === 'undefined' ) {
        this.display.scenery.enableLogging();
      }
      else {
        this.display.scenery.enableLogging( logNames.split( '.' ) );
      }
    }

    if ( phet.chipper.getQueryParameter( 'sceneryStringLog' ) ) {
      this.display.scenery.switchLogToString();
    }

    this.display.initializeWindowEvents( { batchDOMEvents: this.options.batchEvents } ); // sets up listeners on the document with preventDefault(), and forwards those events to our scene
    window.phet.joist.rootNode = this.rootNode; // make the scene available for debugging
    window.phet.joist.display = this.display; // make the display available for debugging

    this.showPointersProperty.link( function( showPointers ) {
      sim.display.setPointerDisplayVisible( !!showPointers );
    } );

    this.showPointerAreasProperty.link( function( showPointerAreas ) {
      sim.display.setPointerAreaDisplayVisible( !!showPointerAreas );
    } );

    this.showCanvasNodeBoundsProperty.link( function( showCanvasNodeBounds ) {
      sim.display.setCanvasNodeBoundsVisible( !!showCanvasNodeBounds );
    } );

    this.showFittedBlockBoundsProperty.link( function( showFittedBlockBounds ) {
      sim.display.setFittedBlockBoundsVisible( !!showFittedBlockBounds );
    } );

    function sleep( millis ) {
      var date = new Date();
      var curDate;
      do {
        curDate = new Date();
      } while ( curDate - date < millis );
    }

    /*
     * These are used to make sure our sims still behave properly with an artificially higher load (so we can test what happens
     * at 30fps, 5fps, etc). There tend to be bugs that only happen on less-powerful devices, and these functions facilitate
     * testing a sim for robustness, and allowing others to reproduce slow-behavior bugs.
     */
    window.phet.joist.makeEverythingSlow = function() {
      window.setInterval( function() { sleep( 64 ); }, 16 );
    };
    window.phet.joist.makeRandomSlowness = function() {
      window.setInterval( function() { sleep( Math.ceil( 100 + Math.random() * 200 ) ); }, Math.ceil( 100 + Math.random() * 200 ) );
    };

    // @public
    this.screens = screens;

    // Multi-screen sims get a home screen.
    if ( screens.length > 1 ) {
      this.homeScreen = new HomeScreen( this, {
        warningNode: options.homeScreenWarningNode,
        showSmallHomeScreenIconFrame: options.showSmallHomeScreenIconFrame,
        tandem: options.tandem ? options.tandem.createTandem( 'homeScreen' ) : null
      } );
      this.homeScreen.initializeModelAndView();
    }
    else {
      this.homeScreen = null;
    }

    // @public (joist-internal)
    this.navigationBar = new NavigationBar( this, screens, {
      tandem: options.tandem ? options.tandem.createTandem( 'navigationBar' ) : null
    } );

    // @public (joist-internal)
    this.updateBackground = function() {
      sim.lookAndFeel.backgroundColor = sim.currentScreen ?
                                        sim.currentScreen.backgroundColor.toCSS() :
                                        sim.homeScreen.backgroundColor.toCSS();
    };

    this.lookAndFeel.backgroundColorProperty.link( function( backgroundColor ) {
      sim.display.backgroundColor = backgroundColor;
    } );

    this.multilink( [ 'showHomeScreen', 'screenIndex' ], function( showHomeScreen, screenIndex ) {
      sim.currentScreen = showHomeScreen ? null : screens[ screenIndex ];
      sim.updateBackground();
    } );

    // Instantiate the screens. Currently this is done eagerly, but this pattern leaves open the door for loading things
    // in the background.
    _.each( screens, function( screen ) {
      screen.backgroundColorProperty.link( sim.updateBackground );
      screen.initializeModelAndView();
    } );

    // ModuleIndex should always be defined.  On startup screenIndex=0 to highlight the 1st screen.
    // When moving from a screen to the homescreen, the previous screen should be highlighted

    if ( this.homeScreen ) {
      this.rootNode.addChild( this.homeScreen.view );
    }
    _.each( screens, function( screen ) {
      screen.view.layerSplit = true;
      sim.rootNode.addChild( screen.view );
    } );
    this.rootNode.addChild( this.navigationBar );

    if ( this.homeScreen ) {

      // Once both the navbar and homescreen have been added, link the PhET button positions together.
      // See https://github.com/phetsims/joist/issues/304.
      PhetButton.linkPhetButtonTransform( this.homeScreen, this.navigationBar, this.rootNode );
    }

    this.multilink( [ 'screenIndex', 'showHomeScreen' ], function( screenIndex, showHomeScreen ) {
      if ( sim.homeScreen ) {
        sim.homeScreen.view.setVisible( showHomeScreen );
      }
      for ( var i = 0; i < screens.length; i++ ) {
        screens[ i ].view.setVisible( !showHomeScreen && screenIndex === i );
      }
      sim.navigationBar.setVisible( !showHomeScreen );
      sim.updateBackground();
    } );

    // layer for popups, dialogs, and their backgrounds and barriers
    this.topLayer = new Node();
    this.rootNode.addChild( this.topLayer );

    // @private list of nodes that are "modal" and hence block input with the barrierRectangle.  Used by modal dialogs
    // and the PhetMenu
    this.modalNodeStack = new ObservableArray(); // {Node} with node.hide()

    // @public (joist-internal) Semi-transparent black barrier used to block input events when a dialog (or other popup)
    // is present, and fade out the background.
    this.barrierRectangle = new Rectangle( 0, 0, 1, 1, 0, 0, {
      fill: 'rgba(0,0,0,0.3)',
      pickable: true
    } );
    this.topLayer.addChild( this.barrierRectangle );
    this.modalNodeStack.lengthProperty.link( function( numBarriers ) {
      sim.barrierRectangle.visible = numBarriers > 0;
    } );
    this.barrierRectangle.addInputListener( new ButtonListener( {
      fire: function( event ) {
        sim.barrierRectangle.trigger0( 'startedCallbacksForFired' );
        assert && assert( sim.modalNodeStack.length > 0 );
        sim.modalNodeStack.get( sim.modalNodeStack.length - 1 ).hide();
        sim.barrierRectangle.trigger0( 'endedCallbacksForFired' );
      }
    } ) );
    options.tandem && options.tandem.createTandem( 'sim.barrierRectangle' ).addInstance( this.barrierRectangle );

    // Fit to the window and render the initial scene
    $( window ).resize( function() { sim.resizeToWindow(); } );
    window.addEventListener( 'orientationchange', function() { sim.resizeToWindow(); } );
    window.visualViewport && window.visualViewport.addEventListener( 'resize', function() { sim.resizeToWindow(); } );
    this.resizeToWindow();

    // Kick off checking for updates, if that is enabled
    UpdateCheck.check();

    // @public (joist-internal) - Keep track of the previous time for computing dt, and initially signify that time
    // hasn't been recorded yet.
    this.lastTime = -1;

    // @public (joist-internal) - Bind the animation loop so it can be called from requestAnimationFrame with the right
    // this
    this.boundRunAnimationLoop = null;
    this.boundRunAnimationLoop = this.runAnimationLoop.bind( this );
    this.trigger0( 'simulationStarted' );

    // Signify the end of simulation startup.  Used by PhET-iO.
    this.trigger0( 'endedSimConstructor' );
  }

  joist.register( 'Sim', Sim );

  return inherit( PropertySet, Sim, {

    /*
     * Adds a popup in the global coordinate frame, and optionally displays a semi-transparent black input barrier behind it.
     * Use hidePopup() to remove it.
     * @param {Node} node - Should have node.hide() implemented to hide the popup (should subsequently call
     *                      sim.hidePopup()).
     * @param {boolean} isModal - Whether to display the semi-transparent black input barrier behind it.
     * @public
     */
    showPopup: function( node, isModal ) {
      assert && assert( node );
      assert && assert( !!node.hide, 'Missing node.hide() for showPopup' );
      assert && assert( !this.topLayer.hasChild( node ), 'Popup already shown' );

      if ( isModal ) {
        this.modalNodeStack.push( node );
      }
      this.topLayer.addChild( node );

      Input.pushFocusContext( node.getTrails()[ 0 ] );
    },

    /*
     * Hides a popup that was previously displayed with showPopup()
     * @param {Node} node
     * @param {boolean} isModal - Whether the previous popup was modal (or not)
     * @public
     */
    hidePopup: function( node, isModal ) {
      assert && assert( node && this.modalNodeStack.contains( node ) );
      assert && assert( this.topLayer.hasChild( node ), 'Popup was not shown' );

      if ( isModal ) {
        this.modalNodeStack.remove( node );
      }
      Input.popFocusContext( node.getTrails()[ 0 ] );

      this.topLayer.removeChild( node );
    },

    /**
     * @public (joist-internal)
     */
    resizeToWindow: function() {
      this.resize( window.innerWidth, window.innerHeight );
    },

    // @public (joist-internal)
    resize: function( width, height ) {
      var sim = this;

      var scale = Math.min( width / HomeScreenView.LAYOUT_BOUNDS.width, height / HomeScreenView.LAYOUT_BOUNDS.height );

      this.barrierRectangle.rectWidth = width / scale;
      this.barrierRectangle.rectHeight = height / scale;

      // 40 px high on iPad Mobile Safari
      var navBarHeight = scale * NavigationBar.NAVIGATION_BAR_SIZE.height;
      sim.navigationBar.layout( scale, width, navBarHeight );
      sim.navigationBar.y = height - navBarHeight;
      sim.display.setSize( new Dimension2( width, height ) );

      var screenHeight = height - sim.navigationBar.height;

      // Layout each of the screens
      _.each( sim.screens, function( m ) {
        m.view.layout( width, screenHeight );
      } );

      // Resize the layer with all of the dialogs, etc.
      sim.topLayer.setScaleMagnitude( scale );

      sim.homeScreen && sim.homeScreen.view.layout( width, height );

      // Startup can give spurious resizes (seen on ipad), so defer to the animation loop for painting

      // Fixes problems where the div would be way off center on iOS7
      if ( platform.mobileSafari ) {
        window.scrollTo( 0, 0 );
      }

      // update our scale and bounds properties after other changes (so listeners can be fired after screens are resized)
      this.scale = scale;
      this.bounds = new Bounds2( 0, 0, width, height );
      this.screenBounds = new Bounds2( 0, 0, width, screenHeight );

      // Signify that the sim has been resized.
      // {Bounds2} bounds - the size of the window.innerWidth and window.innerHeight, which depends on the scale
      // {Bounds2} screenBounds - subtracts off the size of the navbar from the height
      // {number} scale - the overall scaling factor for elements in the view
      this.trigger( 'resized', this.bounds, this.screenBounds, this.scale );
    },

    // @public (joist-internal)
    start: function() {

      // Make sure requestAnimationFrame is defined
      Util.polyfillRequestAnimationFrame();

      // Option for profiling
      // if true, prints screen initialization time (total, model, view) to the console and displays
      // profiling information on the screen
      if ( phet.chipper.getQueryParameter( 'profiler' ) ) {
        Profiler.start( this );
      }

      // place the rAF *before* the render() to assure as close to 60fps with the setTimeout fallback.
      // http://paulirish.com/2011/requestanimationframe-for-smart-animating/
      // Launch the bound version so it can easily be swapped out for debugging.
      this.boundRunAnimationLoop();

      // Communicate sim load (successfully) to joist/tests/test-sims.html
      if ( phet.chipper.getQueryParameter( 'postMessageOnLoad' ) ) {
        window.parent && window.parent.postMessage( JSON.stringify( {
          type: 'load',
          url: window.location.href
        } ), '*' );
      }
    },

    // Destroy a sim so that it will no longer consume any resources. Formerly used in Smorgasbord.  May not be used by
    // anything else at the moment.
    // @public (joist-internal)
    destroy: function() {
      this.destroyed = true;
      var simDiv = this.display.domElement;
      simDiv.parentNode && simDiv.parentNode.removeChild( simDiv );
    },

    // @public (phet-io) - Disable the animation frames for playback via input events, see #303
    disableRequestAnimationFrame: function() {
      this.boundRunAnimationLoop = function() {};
    },

    // @private - Bound to this.boundRunAnimationLoop so it can be run in window.requestAnimationFrame
    runAnimationLoop: function() {

      if ( !this.destroyed ) {
        window.requestAnimationFrame( this.boundRunAnimationLoop );
      }

      // Compute the elapsed time since the last frame, or guess 1/60th of a second if it is the first frame
      var time = Date.now();
      var elapsedTimeMilliseconds = (this.lastTime === -1) ? (1000.0 / 60.0) : (time - this.lastTime);
      this.lastTime = time;

      // Convert to seconds
      var dt = elapsedTimeMilliseconds / 1000.0;
      this.stepSimulation( dt );
    },

    /**
     * Update the simulation model, view, scenery display with an elapsed time of dt.
     * @param {number} dt in seconds
     * @public (phet-io)
     */
    stepSimulation: function( dt ) {

      var screen;

      this.trigger0( 'frameStarted' );

      // increment this before we can have an exception thrown, to see if we are missing frames
      this.frameCounter++;

      phetAllocation && phetAllocation( 'loop' );

      // prevent Safari from going to sleep, see https://github.com/phetsims/joist/issues/140
      if ( this.frameCounter % 1000 === 0 ) {
        this.heartbeatDiv.innerHTML = Math.random();
      }

      // fire or synthesize input events
      if ( this.options.fuzzMouse ) {
        this.display.fuzzMouseEvents( this.fuzzMouseAverage );
      }
      else if ( this.options.fuzzTouches ) {
        // TODO: we need more state tracking of individual touch points to do this properly
      }
      else {

        // if any input events were received and batched, fire them now.
        if ( this.options.batchEvents ) {

          // if any input events were received and batched, fire them now, but only if the sim is active
          // The sim may be inactive if interactivity was disabled by API usage such as the SimIFrameAPI
          if ( this.active ) {
            this.display._input.fireBatchedEvents();
          }
          else {

            // If the sim was inactive (locked), then discard any scenery events instead of buffering them and applying
            // them later.
            this.display._input.clearBatchedEvents();
          }
        }
      }

      // Step the models, timers and tweens, but only if the sim is active.
      // It may be inactive if it has been paused through the SimIFrameAPI
      if ( this.active ) {

        // Update the active screen, but not if the user is on the home screen
        if ( !this.showHomeScreen ) {

          // step model and view (both optional)
          screen = this.screens[ this.screenIndex ];

          // If the DT is 0, we will skip the model step (see https://github.com/phetsims/joist/issues/171)
          if ( screen.model.step && dt ) {
            screen.model.step( dt );
          }
          if ( screen.view.step ) {
            screen.view.step( dt );
          }
        }

        Timer.step( dt );

        // If using the TWEEN animation library, then update all of the tweens (if any) before rendering the scene.
        // Update the tweens after the model is updated but before the scene is redrawn.
        if ( window.TWEEN ) {
          window.TWEEN.update();
        }
      }
      this.display.updateDisplay();

      this.trigger1( 'frameCompleted', dt );
    }
  } );
} );