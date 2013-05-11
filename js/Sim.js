// Copyright 2013, University of Colorado

/**
 * Main class that represents one simulation.
 * Provides default initialization, such as polyfills as well.
 * If the simulation has only one tab, then there is no home screen, home icon or tab icon in the navigation bar.
 *
 * @author Sam Reid
 */
define( function( require ) {
  'use strict';

  var Fort = require( 'FORT/Fort' );
  var Util = require( 'SCENERY/util/Util' );
  var NavigationBar = require( 'JOIST/NavigationBar' );
  var HomeScreen = require( 'JOIST/HomeScreen' );
  var Scene = require( 'SCENERY/Scene' );
  var Node = require( 'SCENERY/nodes/Node' );
  var version = require( 'version' );

  //For Data logging and visualization
  var wiretap = require( 'FORT/wiretap' );
  var LogPointers = require( 'JOIST/share/LogPointers' );

  /**
   *
   * @param name
   * @param tabs
   * @param options optional parameters for starting tab and home values, so that developers can easily specify the startup scenario for quick development
   * @constructor
   */
  function Sim( name, tabs, options ) {
    var sim = this;
    this.overlays = [];

    this.name = name;
    this.version = version();

    //Set the HTML page title to the localized title
    //TODO: When a sim is embedded on a page, we shouldn't retitle the page
    $( 'title' ).html( name );

    //Default values are to show the home screen with the 1st tab selected
    options = options || {};
    var showHomeScreen = ( _.isUndefined( options.showHomeScreen ) ) ? true : options.showHomeScreen;

    //If there is only one tab, do not show the home screen
    if ( tabs.length === 1 ) {
      showHomeScreen = false;
    }

    sim.tabs = tabs;

    //This model represents where the simulation is, whether it is on the home screen or a tab, and which tab it is on or is highlighted in the home screen
    sim.simModel = new Fort.Model( {showHomeScreen: showHomeScreen, tabIndex: options.tabIndex || 0 } );

    var $body = $( 'body' );

    //TODO should probably look for this div to see if it exists, then create only if it doesn't exist.
    //Add a div for the sim to the DOM
    var $simDiv = $( "<div>" ).attr( 'id', 'sim' ).css( 'position', 'absolute' );
    $body.append( $simDiv );

    //Create the scene
    //Leave accessibility as a flag while in development
    sim.scene = new Scene( $simDiv, {allowDevicePixelRatioScaling: true, accessible: true} );
    sim.scene.initializeStandaloneEvents(); // sets up listeners on the document with preventDefault(), and forwards those events to our scene
    window.simScene = sim.scene; // make the scene available for debugging

    this.navigationBar = new NavigationBar( this, tabs, sim.simModel );
    this.homeScreen = new HomeScreen( name, tabs, sim.simModel );

    //The simNode contains the home screen or the play area
    var simNode = new Node();

    //The viewContainer contains the TabView itself, which will be swapped out based on which icon the user selected in the navigation bar.
    //Without this layerSplit, the performance significantly declines on both Win8/Chrome and iPad3/Safari
    //TODO: Test this after rewriting into multiple divs/scenes
    var viewContainer = new Node( {layerSplit: true} );

    sim.scene.addChild( simNode );
    sim.scene.addChild( sim.navigationBar );
    sim.scene.addChild( sim.homeScreen );

    var updateBackground = function() {
      if ( sim.simModel.showHomeScreen ) {
        $simDiv.css( 'background', 'black' );
      }
      else {
        $simDiv.css( 'background', tabs[sim.simModel.tabIndex].backgroundColor || 'white' );
      }
    };

    //When the user presses the home icon, then show the home screen, otherwise show the tabNode.
    this.simModel.link( 'showHomeScreen', function( showHomeScreen ) {
      simNode.children = showHomeScreen ? [] : [viewContainer];
      if ( showHomeScreen ) {
        sim.navigationBar.visible = false;
        sim.homeScreen.visible = true;
      }
      else {
        sim.navigationBar.visible = true;
        sim.homeScreen.visible = false;
      }
      updateBackground();
    } );

    function resize() {

      //TODO: This will have to change when sims are embedded on a page instead of taking up an entire page
      var width = $( window ).width();
      var height = $( window ).height();

      //Use Mobile Safari layout bounds to size the home screen and navigation bar
      var scale = Math.min( width / 768, height / 504 );

      //40 px high on Mobile Safari
      var navBarHeight = scale * 40;
      sim.navigationBar.layout( scale, width, navBarHeight );
      sim.navigationBar.bottom = height;
      sim.scene.resize( width, height );

      //Layout each of the tabs
      _.each( tabs, function( m ) { m.view.layout( width, height - sim.navigationBar.height ); } );

      sim.homeScreen.layout( width, height );
      //Startup can give spurious resizes (seen on ipad), so defer to the animation loop for painting
    }

    //Instantiate the tabs
    //Currently this is done eagerly, but this pattern leaves open the door for loading things in the background.
    _.each( tabs, function( m ) {
      m.model = m.createModel();
      m.view = m.createView( m.model );
    } );

    //SR: ModuleIndex should always be defined.  On startup tabIndex=0 to highlight the 1st tab.
    //    When moving from a tab to the homescreen, the previous tab should be highlighted
    //When the user selects a different tab, show it on the screen
    this.simModel.link( 'tabIndex', function( tabIndex ) {
      viewContainer.children = [tabs[tabIndex].view];
      updateBackground();
    } );

    updateBackground();

    //Fit to the window and render the initial scene
    $( window ).resize( resize );
    resize();
  }

  Sim.prototype.start = function() {
    var sim = this;

    //Keep track of the previous time for computing dt, and initially signify that time hasn't been recorded yet.
    var lastTime = -1;

    //Make sure requestAnimationFrame is defined
    Util.polyfillRequestAnimationFrame();

    //Record the pointers (if logging is enabled)
//    var logPointers = new LogPointers();
//    logPointers.startLogging();
//
//    //For debugging, display the pointers
//    logPointers.showPointers();

    // place the rAF *before* the render() to assure as close to 60fps with the setTimeout fallback.
    //http://paulirish.com/2011/requestanimationframe-for-smart-animating/
    (function animationLoop() {
      window.requestAnimationFrame( animationLoop );

      //Update the active tab, but not if the user is on the home screen
      if ( !sim.simModel.showHomeScreen ) {

        //Compute the elapsed time since the last frame, or guess 1/60th of a second if it is the first frame
        var time = Date.now();
        var elapsedTimeMilliseconds = (lastTime === -1) ? (1000.0 / 60.0) : (time - lastTime);
        lastTime = time;

        //Convert to seconds
        var dt = elapsedTimeMilliseconds / 1000.0;
        sim.tabs[sim.simModel.tabIndex].model.step( dt );
      }
      sim.scene.updateScene();
      for ( var i = 0; i < sim.overlays.length; i++ ) {
        var overlay = sim.overlays[i];
        overlay.updateScene();
      }
    })();
  };

  Sim.prototype.startPlayback = function( log ) {
    var sim = this;
    var logIndex = 0;
    var playbackTime = log[0].time;

    //Make sure requestAnimationFrame is defined
    Util.polyfillRequestAnimationFrame();

    //Display the pointers
//    new LogPointers().showPointers();

    // place the rAF *before* the render() to assure as close to 60fps with the setTimeout fallback.
    //http://paulirish.com/2011/requestanimationframe-for-smart-animating/
    (function animationLoop() {
      window.requestAnimationFrame( animationLoop );

      //Update the sim based on the given log
      logIndex = wiretap.stepUntil( log, playbackTime, logIndex );

      playbackTime += 17;//ms between frames at 60fp

      sim.scene.updateScene();
      for ( var i = 0; i < sim.overlays.length; i++ ) {
        var overlay = sim.overlays[i];
        overlay.updateScene();
      }
    })();
  };

  //Adds a node to a new scenery.Scene that will be managed by this Sim.  Has a background shading so it will focus on the specified node.
  //Used for about dialogs and other focusing popups.
  Sim.prototype.createAndAddOverlay = function( node ) {
    var $overlayDiv = $( "<div>" ).attr( 'class', 'sim-overlay' ).css( 'position', 'absolute' ).css( 'z-index', 999 ).css( 'background-color', 'rgba(0,0,0,0.5)' );
    $( 'body' ).append( $overlayDiv );

    var scene = new Scene( $overlayDiv, {allowDevicePixelRatioScaling: true} );
    scene.initializeStandaloneEvents(); // sets up listeners on the document with preventDefault(), and forwards those events to our scene
    scene.resizeOnWindowResize();

    scene.addChild( node );
    scene.updateScene();
    this.overlays.push( scene );
    return scene;
  };

  Sim.prototype.removeOverlay = function( scene ) {
    this.overlays.splice( this.overlays.indexOf( scene ), 1 );
    scene.$main.detach();
  };

  return Sim;
} );
