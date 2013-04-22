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
  var Layout = require( 'JOIST/Layout' );

  /**
   *
   * @param name
   * @param tabs
   * @param options optional parameters for starting tab and home values, so that developers can easily specify the startup scenario for quick development
   * @constructor
   */
  function Sim( name, tabs, options ) {
    var sim = this;

    //Set the HTML page title to the localized title
    //TODO: When a sim is embedded on a page, we shouldn't retitle the page
    $( 'title' ).html( name );

    //Default values are to show the home screen with the 1st tab selected
    options = options || {};
    var home = options.home || true;  //TODO home is a lousy name, maybe showHomeScreen?

    //If there is only one tab, do not show the home screen
    if ( tabs.length == 1 ) {
      home = false;
    }

    this.tabs = tabs;

    //This model represents where the simulation is, whether it is on the home screen or a tab, and which tab it is on or is highlighted in the home screen
    this.simModel = new Fort.Model( {home: home, tabIndex: options.tabIndex || 0 } );

    //TODO should probably look for this div to see if it exists, then create only if it doesn't exist.
    //Add a div for the scene to the DOM
    var $sceneDiv = $( "<div>" );
    $sceneDiv.attr( 'id', 'sim' );
    $sceneDiv.css( 'position', 'absolute' );
    $( 'body' ).append( $sceneDiv );

    //Create the scene
    this.scene = new Scene( $sceneDiv, {allowDevicePixelRatioScaling: true} );
    this.scene.initializeStandaloneEvents(); // sets up listeners on the document with preventDefault(), and forwards those events to our scene
    this.scene.resizeOnWindowResize(); // the scene gets resized to the full screen size

    var homeScreen = new HomeScreen( name, tabs, this.simModel );
    var navigationBar = new NavigationBar( tabs, this.simModel );

    //The simNode contains the home screen or the play area
    var simNode = new Node();

    //The playAreaContainer contains the PlayArea itself, which will be swapped out based on which icon the user selected in the navigation bar.
    //Without this layerSplit, the performance significantly declines on both Win8/Chrome and iPad3/Safari
    var playAreaContainer = new Node( {layerSplit: true} );

    //TODO navigationBar must currently be behind play area or DOM elements will get no events
    //The tabNode contains the playAreaContainer and the navigation bar
    //Permit sims to put the navigation bar in the front with an option.  TODO: work on sims or framework to make this option unnecessary.
    var tabNode = new Node( {children: options.navigationBarInFront ? [playAreaContainer, navigationBar] : [navigationBar, playAreaContainer]} );
    this.scene.addChild( simNode );

    //TODO change the background color to HomeScreen.backgroundColor when on the home screen
    //When the user presses the home icon, then show the home screen, otherwise show the tabNode.
    this.simModel.link( 'home', function( home ) { simNode.children = [home ? homeScreen : tabNode];} );

    function resize() {

      //TODO: This will have to change when sims are embedded on a page instead of taking up an entire page
      var width = $( window ).width();
      var height = $( window ).height();

      //scale up the navigation bar according to the aspect ratio of the current tab (hopefully same throughout the sim!)
      //TODO: how to enforce consistent size for navigation bar and home screen?
      navigationBar.resetTransform();
      var scale = sim.tabs[sim.simModel.tabIndex].view.getLayoutScale( width, height );
      navigationBar.setScaleMagnitude( scale );
      navigationBar.bottom = height;
      navigationBar.centerX = width / 2;

      homeScreen.resetTransform();
      homeScreen.setScaleMagnitude( scale );

      //center vertically
      if ( scale >= width / Layout.width ) {
        homeScreen.translate( 0, (height - Layout.simHeight * scale) / 2 / scale );
      }

      //center horizontally
      else {
        homeScreen.translate( (width - Layout.width * scale) / 2 / scale, 0 );
      }

      //Layout each of the tabs
      _.each( tabs, function( m ) { m.view.layout( width, height - navigationBar.height ); } );

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
    //TODO set document.bgColor=tabs[tabIndex].backgroundColor (if undefined, default to 'white'?)
    //When the user selects a different tab, show it on the screen
    this.simModel.link( 'tabIndex', function( tabIndex ) { playAreaContainer.children = [tabs[tabIndex].view]; } );

    //Fit to the window and render the initial scene
    $( window ).resize( resize );
    resize();
  }

  Sim.prototype.start = function() {
    var sim = this;

    //Make sure requestAnimationFrame is defined
    Util.polyfillRequestAnimationFrame();

    // place the rAF *before* the render() to assure as close to 60fps with the setTimeout fallback.
    //http://paulirish.com/2011/requestanimationframe-for-smart-animating/
    (function animationLoop() {
      requestAnimationFrame( animationLoop );

      //Update the active tab, but not if the user is on the home screen
      if ( !sim.simModel.home ) {
        var dt = 0.04;//TODO: put real time elapsed in seconds
        sim.tabs[sim.simModel.tabIndex].model.step( dt );
      }
      sim.scene.updateScene();
    })();
  };

  return Sim;
} );