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
   * @param {Dimension2} barSize initial dimensions of the navigation bar
   * @param {Sim} sim
   * @param {Screen[]} screens
   * @param {Object} [options]
   * @constructor
   */
  function NavigationBar( barSize, sim, screens, options ) {

    options = _.extend( {
      tandem: null
    }, options );

    this.screens = screens;

    var navigationBar = this;
    Node.call( this );

    this.background = new Rectangle( 0, 0, 0, 0, { pickable: false } );
    sim.lookAndFeel.navigationBarFillProperty.link( function( navigationBarFill ) {
      navigationBar.background.fill = navigationBarFill;
    } );
    this.addChild( this.background );

    this.phetButton = new PhetButton( sim, sim.lookAndFeel.navigationBarTextFillProperty, {
      tandem: options.tandem ? options.tandem.createTandem( 'phetButton' ) : null
    } );
    this.addChild( this.phetButton );

    this.titleLabel = new Text( sim.name, { font: new PhetFont( 18 ), pickable: false } );
    sim.lookAndFeel.navigationBarTextFillProperty.link( function( navigationBarTextFill ) {
      navigationBar.titleLabel.fill = navigationBarTextFill;
    } );
    this.addChild( this.titleLabel );

    // Create screen buttons and home buttonm, irrelevant for single-screen sims.
    if ( screens.length > 1 ) {

      //TODO wow is this wasteful
      // Create screen buttons once so we can get their dimensions
      var buttons = _.map( screens, function( screen ) {
        return new NavigationBarScreenButton(
          sim.lookAndFeel.navigationBarFillProperty,
          sim.screenIndexProperty,
          sim.screens,
          screen,
          barSize.height,
          0 );
      } );
      var maxWidth = Math.max( 50, _.max( buttons, function( button ) {return button.width;} ).width );

      // Create screen buttons again with equivalent sizes
      buttons = _.map( screens, function( screen ) {
        return new NavigationBarScreenButton( sim.lookAndFeel.navigationBarFillProperty,
          sim.screenIndexProperty,
          sim.screens,
          screen,
          barSize.height,
          maxWidth, {
            tandem: options.tandem && options.tandem.createTandem( screen.tandemScreenName + 'Button' )
          } );
      } );

      // Put screen buttons in a horizontal box
      this.buttonHBox = new HBox( { children: buttons, spacing: 4 } );
      this.addChild( this.buttonHBox );

      // Create the home button
      this.homeButton = new HomeButton( sim.lookAndFeel.navigationBarFillProperty, function() {
        sim.showHomeScreen = true;
      } );
      this.addChild( this.homeButton );
    }

    this.layout( 1, barSize.width, barSize.height );
  }

  return inherit( Node, NavigationBar, {

    /**
     * Called when the navigation bar layout needs to be updated.
     * @param {number} scale
     * @param {number} width
     * @param {number} height
     * @public
     */
    layout: function( scale, width, height ) {

      // background
      this.background.rectWidth = width;
      this.background.rectHeight = height;

      // title
      var titleInset = 10;
      var distanceBetweenTitleAndFirstScreenIcon = 20;
      this.titleLabel.setScaleMagnitude( scale );
      this.titleLabel.left = titleInset;
      this.titleLabel.centerY = height / 2;

      // PhET button
      this.phetButton.setScaleMagnitude( scale );
      this.phetButton.right = width - PhetButton.HORIZONTAL_INSET;
      this.phetButton.bottom = height - PhetButton.VERTICAL_INSET;

      // Lay out the screen buttons and home button from left to right
      if ( this.screens.length !== 1 ) {

        this.buttonHBox.setScaleMagnitude( scale );

        // Center the screen buttons
        this.buttonHBox.centerX = width / 2;
        this.buttonHBox.top = 2;

        // Center the home icon vertically and make it a bit larger than the icons and text, see https://github.com/phetsims/joist/issues/127
        this.homeButton.setScaleMagnitude( scale * 1.1 );
        this.homeButton.left = this.buttonHBox.right + 15;
        this.homeButton.centerY = this.background.rectHeight / 2;

        // If the title overlaps the screen icons, scale it down.  See #128
        var availableWidth = this.buttonHBox.left - titleInset - distanceBetweenTitleAndFirstScreenIcon;
        var titleWidth = this.titleLabel.width;
        if ( titleWidth > availableWidth ) {
          this.titleLabel.setScaleMagnitude( scale * availableWidth / titleWidth );
        }
      }
    }
  } );
} );