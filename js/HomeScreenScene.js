// Copyright 2013, University of Colorado

/**
 * The scenery.Scene for the navigation bar at the bottom of the screen.
 * Navigation bar has its own top level div so that it won't obscure mouse events to the sim (or vice versa) if one using a covering canvas.
 * Also makes it easier to set the background of the TabView independently from the background of the NavigationBar.
 * Putting the popup menu in its own canvas makes it much more responsive on chrome (not canary)
 * TODO: is accessibility going to be a problem if it is split into its own scene?  I presume not since we have to handle the "sim embedded on a page with other materials" problem anyways.
 * TODO: Is putting multiple scenes going to mess up pan/zoom?  I home not since pan/zoom should work on "sim embedded on a page with other materials" anyways.
 *
 * @author Sam Reid
 */
define( function( require ) {
  "use strict";

  var HomeScreen = require( 'JOIST/HomeScreen' );
  var Scene = require( 'SCENERY/Scene' );
  var inherit = require( 'PHET_CORE/inherit' );

  function HomeScreenScene( sim, name, tabs, simModel ) {
    var homeScreenScene = this;

    this.$div = $( "<div>" ).attr( 'id', 'homeScreen' ).css( 'position', 'absolute' ).css( 'background', 'black' );

    //Create the scene
    Scene.call( this, this.$div, {allowDevicePixelRatioScaling: true, accessible: true} );
    this.initializeStandaloneEvents(); // sets up listeners on the document with preventDefault(), and forwards those events to our scene
    this.resizeOnWindowResize(); // sets up listeners on the document with preventDefault(), and forwards those events to our scene

    this.homeScreen = new HomeScreen( name, tabs, sim.simModel );
    this.addChild( this.homeScreen );

    function resize() {

      //TODO: This will have to change when sims are embedded on a page instead of taking up an entire page
      var width = $( window ).width();
      var height = $( window ).height();

      homeScreenScene.homeScreen.layout( width, height );
    }

    //Fit to the window and render the initial scene
    $( window ).resize( resize );
    resize();
  }

  inherit( HomeScreenScene, Scene, {
//    layout: function( scale, width, height ) {
//      this.resize( width, height );
//      this.$div.offset( {top: window.innerHeight - height, left: 0} );
//      this.navigationBar.layout( scale, width, height );
//    }
  } );

  return HomeScreenScene;
} );