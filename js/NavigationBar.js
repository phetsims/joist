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
  var Brand = require( 'BRAND/Brand' );
  var AdaptedFromPhETText = require( 'JOIST/AdaptedFromPhETText' );

  /**
   * Create a nav bar.  Layout assumes all of the screen widths are the same.
   * @param {Dimension2} barSize initial dimensions of the navigation bar
   * @param {Sim} sim
   * @param {Screen[]} screens
   * @param {PropertySet} model see joist.Sim
   * @constructor
   */
  function NavigationBar( barSize, sim, screens, model ) {

    var thisNode = this;
    this.screens = screens;

    this.navBarWidth = barSize.width;
    this.navBarHeight = barSize.height;
    this.navBarScale = 1;

    //Renderer must be specified here because the node is added directly to the scene (instead of to some other node that already has svg renderer
    Node.call( this );
    this.background = new Rectangle( 0, 0, 0, 0, { pickable: false } );
    this.addChild( this.background );
    sim.link( 'useInvertedColors', function( whiteColorScheme ) {
      thisNode.background.fill = whiteColorScheme ? 'white' : 'black';
    } );

    this.phetButton = new PhetButton( sim );
    this.addChild( this.phetButton );

    this.titleLabel = new Text( sim.name, { font: new PhetFont( 18 ), pickable: false } );
    this.addChild( this.titleLabel );
    sim.link( 'useInvertedColors', function( whiteColorScheme ) {
      thisNode.titleLabel.fill = whiteColorScheme ? 'black' : 'white';
    } );

    if ( screens.length > 1 ) {

      //Create buttons once so we can get their dimensions
      var buttons = _.map( screens, function( screen ) {
        return new NavigationBarScreenButton( sim, screen, thisNode.navBarHeight, 0 );
      } );
      var maxWidth = Math.max( 50, _.max( buttons, function( button ) {return button.width;} ).width );

      //Create buttons again with equivalent sizes
      buttons = _.map( screens, function( screen ) {
        return new NavigationBarScreenButton( sim, screen, thisNode.navBarHeight, maxWidth );
      } );

      this.buttonHBox = new HBox( { children: buttons, spacing: 4 } );
      this.addChild( this.buttonHBox );

      //add the home button
      this.homeButton = new HomeButton( 'white', 'gray', '#222', '#444', sim.useInvertedColorsProperty, model );
      this.addChild( this.homeButton );

      // if the branding specifies to show "adapted from PhET" in the navbar, show it here
      if ( Brand.adaptedFromPhET === true ) {
        this.adaptedFromText = new AdaptedFromPhETText( sim.useInvertedColorsProperty );
        this.addChild( this.adaptedFromText );
      }
    }
  }

  return inherit( Node, NavigationBar, {
    relayout: function() {
      var navigationBar = this;
      navigationBar.background.rectHeight = this.navBarHeight;
      navigationBar.background.rectWidth = this.navBarWidth;

      if ( this.buttonHBox ) {
        this.buttonHBox.setScaleMagnitude( navigationBar.navBarScale );
      }

      var titleInset = 10;
      var distanceBetweenTitleAndFirstScreenIcon = 20;
      this.titleLabel.setScaleMagnitude( this.navBarScale );
      this.titleLabel.centerY = this.navBarHeight / 2;
      this.titleLabel.left = titleInset;

      //Lay out the components from left to right
      if ( this.screens.length !== 1 ) {

        //put the center right in the middle
        this.buttonHBox.centerX = this.navBarWidth / 2;
        this.buttonHBox.top = 2;

        //Center the home icon vertically and make it a bit larger than the icons and text, see https://github.com/phetsims/joist/issues/127
        navigationBar.homeButton.setScaleMagnitude( this.navBarScale * 1.1 );
        navigationBar.homeButton.centerY = navigationBar.background.rectHeight / 2;
        navigationBar.homeButton.left = navigationBar.buttonHBox.right + 15;

        //If the title overlaps the screen icons, scale it down.  See #128
        var availableSpace = this.buttonHBox.left - titleInset - distanceBetweenTitleAndFirstScreenIcon;
        var size = this.titleLabel.width;
        if ( size > availableSpace ) {
          this.titleLabel.setScaleMagnitude( this.navBarScale * availableSpace / size );
        }
      }
      this.phetButton.setScaleMagnitude( this.navBarScale );
      this.phetButton.right = this.navBarWidth - PhetButton.HORIZONTAL_INSET;
      this.phetButton.bottom = this.navBarHeight - PhetButton.VERTICAL_INSET;

      if ( this.adaptedFromText ) {
        this.adaptedFromText.updateLayout( this.navBarScale, this.phetButton );
      }
    },
    layout: function( scale, width, height, windowHeight ) {
      this.navBarScale = scale;
      this.navBarWidth = width;
      this.navBarHeight = height;
      this.relayout();
    }
  } );
} );