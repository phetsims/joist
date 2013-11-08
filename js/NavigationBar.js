// Copyright 2002-2013, University of Colorado Boulder

/**
 * The navigation bar at the bottom of the screen.
 * For a single-screen sim, it shows the name of the sim at the left and the PhET Logo and options menu at the right.
 * For a multi-screen sim, it shows icons for all of the other screens, with the screen name at the left and the PhET Logo and options menu at the right.
 *
 * @author Sam Reid
 */
define( function( require ) {
  'use strict';

  var Node = require( 'SCENERY/nodes/Node' );
  var Path = require( 'SCENERY/nodes/Path' );
  var HBox = require( 'SCENERY/nodes/HBox' );
  var VBox = require( 'SCENERY/nodes/VBox' );
  var Text = require( 'SCENERY/nodes/Text' );
  var FontAwesomeNode = require( 'SUN/FontAwesomeNode' );
  var Panel = require( 'SUN/Panel' );
  var HomeButton = require( 'SCENERY_PHET/HomeButton' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var inherit = require( 'PHET_CORE/inherit' );
  var PhetMenu = require( 'JOIST/PhetMenu' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Shape = require( 'KITE/Shape' );
  var LinearGradient = require( 'SCENERY/util/LinearGradient' );
  var PhetButton = require( 'JOIST/PhetButton' );
  var ButtonListener = require( 'SCENERY/input/ButtonListener' );
  var Highlight = require( 'JOIST/Highlight' );
  var NavigationBarScreenButton = require( 'JOIST/NavigationBarScreenButton' );

  /**
   * Create a nav bar.  Layout assumes all of the screen widths are the same.
   * @param {Sim} sim
   * @param {Array<Screen>} screens
   * @param {PropertySet} model see joist.Sim
   * @param {Boolean} whiteColorScheme true if the color scheme should be white, false if it should be black
   * @constructor
   */
  function NavigationBar( sim, screens, model, whiteColorScheme ) {

    var thisNode = this;
    this.screens = screens;

    this.navBarHeight = 40;
    this.navBarScale = 1;
    this.navBarWidth = 768;

    //Renderer must be specified here because the node is added directly to the scene (instead of to some other node that already has svg renderer
    Node.call( this, {renderer: 'svg'} );
    this.background = new Rectangle( 0, 0, 0, 0, {fill: whiteColorScheme ? 'white' : 'black', pickable: false} );
    this.addChild( this.background );

    this.hbox = new PhetButton( sim, whiteColorScheme );
    this.addChild( this.hbox );

    this.titleLabel = new Text( sim.name, {font: new PhetFont( 18 ), fill: whiteColorScheme ? 'black' : 'white', pickable: false} );
    this.addChild( this.titleLabel );

    if ( screens.length > 1 ) {
      var buttons = _.map( screens, function( screen ) {
        return new NavigationBarScreenButton( sim, screen, thisNode.navBarHeight, whiteColorScheme );
      } );

      this.buttonHBox = new HBox( {children: buttons} );
      this.addChild( this.buttonHBox );

      //add the home icon
      this.homeIcon = new HomeButton( whiteColorScheme ? '#222' : 'white' );
      var homeHighlight = Highlight.createHighlight( this.homeIcon.width + 10, this.homeIcon.height + 5 );
      homeHighlight.bottom = this.homeIcon.bottom + 3;
      homeHighlight.x = -5;
      this.homeIcon.addChild( homeHighlight );

      //Hide the highlight on the home icon if the home icon is pressed
      model.showHomeScreenProperty.link( function( showHomeScreen ) { if ( showHomeScreen ) { homeHighlight.visible = false; } } );
      this.homeIcon.addInputListener( { down: function() { model.showHomeScreen = true; }} );
      this.homeIcon.addInputListener( Highlight.createHighlightListener( homeHighlight ) );
      this.homeIcon.addPeer( '<input type="button" aria-label="Home Screen">', {click: function() {model.showHomeScreen = true;}, tabIndex: 100} );
      this.addChild( this.homeIcon );
    }
  }

  return inherit( Node, NavigationBar, {
    relayout: function() {
      var navigationBar = this;
      navigationBar.background.rectHeight = this.navBarHeight;
      navigationBar.background.rectWidth = this.navBarWidth;
      var screenIndex = navigationBar.screenIndex;

      if ( this.buttonHBox ) {
        this.buttonHBox.setScaleMagnitude( navigationBar.navBarScale );
      }

      this.titleLabel.setScaleMagnitude( this.navBarScale );
      this.titleLabel.centerY = this.navBarHeight / 2;
      this.titleLabel.left = 10;

      //Lay out the components from left to right
      if ( this.screens.length !== 1 ) {

        //put the center right in the middle
        this.buttonHBox.centerX = this.navBarWidth / 2;
        this.buttonHBox.top = 2;

        navigationBar.homeIcon.setScaleMagnitude( this.navBarScale );
        navigationBar.homeIcon.top = 2;
        navigationBar.homeIcon.left = navigationBar.buttonHBox.right + 15;
      }
      this.hbox.setScaleMagnitude( this.navBarScale );
      this.hbox.right = this.navBarWidth - 5;
      this.hbox.centerY = this.navBarHeight / 2;
    },
    layout: function( scale, width, height, windowHeight ) {
      this.navBarScale = scale;
      this.navBarWidth = width;
      this.navBarHeight = height;
      this.relayout();
    }} );
} );