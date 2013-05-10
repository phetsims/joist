// Copyright 2013, University of Colorado

/**
 * The scenery.Scene for the navigation bar at the bottom of the screen.
 * Navigation bar has its own top level div so that it won't obscure mouse events to the sim (or vice versa) if one using a covering canvas.
 * Also makes it easier to set the background of the TabView independently from the background of the NavigationBar.
 * Putting the popup menu in its own canvas makes it much more responsive on chrome (not canary)
 * TODO: is accessibility going to be a problem if it is split into its own scene?  I presume not since we have to handle the "sim embedded on a page with other materials" problem anyways.
 *
 * @author Sam Reid
 */
define( function( require ) {
  "use strict";

  var Fort = require( 'FORT/Fort' );
  var Util = require( 'SCENERY/util/Util' );
  var NavigationBar = require( 'JOIST/NavigationBar' );
  var HomeScreen = require( 'JOIST/HomeScreen' );
  var Scene = require( 'SCENERY/Scene' );
  var Node = require( 'SCENERY/nodes/Node' );
  var HBox = require( 'SCENERY/nodes/HBox' );
  var Text = require( 'SCENERY/nodes/Text' );
  var FontAwesomeNode = require( 'SUN/FontAwesomeNode' );
  var BoundsNode = require( 'SUN/BoundsNode' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var inherit = require( 'PHET_CORE/inherit' );

  function NavigationBarScene( sim, tabs, simModel ) {
    var navigationBarScene = this;

    this.$div = $( "<div>" ).attr( 'id', 'navigationBar' ).css( 'position', 'absolute' ).css( 'background', 'black' );

    //Create the scene
    Scene.call( this, this.$div, {allowDevicePixelRatioScaling: true, accessible: true} );
    this.initializeStandaloneEvents(); // sets up listeners on the document with preventDefault(), and forwards those events to our scene

    this.navigationBar = new NavigationBar( sim, tabs, simModel );
    this.addChild( this.navigationBar );
  }

  inherit( NavigationBarScene, Scene, {
    layout: function( scale, width, height ) {
      this.resize( width, height );
      this.$div.offset( {top: window.innerHeight - height, left: 0} );
      this.navigationBar.layout( scale, width, height );
    }
  } );

  return NavigationBarScene;
} );