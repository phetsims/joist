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
  var HBox = require( 'SCENERY/nodes/HBox' );
  var Text = require( 'SCENERY/nodes/Text' );
  var HomeButton = require( 'JOIST/HomeButton' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var inherit = require( 'PHET_CORE/inherit' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var PhetButton = require( 'JOIST/PhetButton' );
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

      //Create buttons once so we can get their dimensions
      var buttons = _.map( screens, function( screen ) {
        return new NavigationBarScreenButton( sim, screen, thisNode.navBarHeight, whiteColorScheme, 0 );
      } );
      var maxWidth = Math.max( 50, _.max( buttons,function( button ) {return button.width;} ).width );

      //Create buttons again with equivalent sizes
      buttons = _.map( screens, function( screen ) {
        return new NavigationBarScreenButton( sim, screen, thisNode.navBarHeight, whiteColorScheme, maxWidth );
      } );

      this.buttonHBox = new HBox( {children: buttons, spacing: 4} );
      this.addChild( this.buttonHBox );

      //add the home icon
      this.homeIcon = new HomeButton( whiteColorScheme ? '#222' : 'white', whiteColorScheme ? '#444' : 'gray', whiteColorScheme );
      this.homeIcon.addListener( function() {model.showHomeScreen = true;} );
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