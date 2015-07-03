// Copyright 2002-2013, University of Colorado Boulder

/**
 * The navigation bar at the bottom of the screen.
 * For a single-screen sim, it shows the name of the sim at the far left and the PhET button at the far right.
 * For a multi-screen sim, it additionally shows buttons for each screen, and a home button.
 *
 * @author Sam Reid
 * @author Chris Malley (PixelZoom, Inc.)
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
   * Creates a nav bar.
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

    assert && assert( _.findIndex( screens, function( screen ) {
        return ( screen.navigationBarIcon.width !== screens[0].navigationBarIcon.width ) || ( screen.navigationBarIcon.height !== screens[0].navigationBarIcon.height );
      } ) === -1,
    'all navigation bar icons must have the same size' );

    this.screens = screens;

    var navigationBar = this;
    Node.call( this );

    // The bar's background
    this.background = new Rectangle( 0, 0, 0, 0, { pickable: false } );
    sim.lookAndFeel.navigationBarFillProperty.link( function( navigationBarFill ) {
      navigationBar.background.fill = navigationBarFill;
    } );
    this.addChild( this.background );

    // Sim title, at left end of bar
    this.titleLabel = new Text( sim.name, { font: new PhetFont( 18 ), pickable: false } );
    sim.lookAndFeel.navigationBarTextFillProperty.link( function( navigationBarTextFill ) {
      navigationBar.titleLabel.fill = navigationBarTextFill;
    } );
    this.addChild( this.titleLabel );

    // PhET button, at right end of bar
    this.phetButton = new PhetButton( sim, sim.lookAndFeel.navigationBarFillProperty, sim.lookAndFeel.navigationBarTextFillProperty, {
      tandem: options.tandem ? options.tandem.createTandem( 'phetButton' ) : null
    } );
    this.addChild( this.phetButton );

    // Create the home button and screen buttons (irrelevant for single-screen sims).
    if ( screens.length > 1 ) {

      // Create the home button
      this.homeButton = new HomeButton( sim.lookAndFeel.navigationBarFillProperty, function() {
        sim.showHomeScreen = true;
      } );
      this.addChild( this.homeButton );

      var screenButtons = _.map( screens, function( screen ) {
        return new NavigationBarScreenButton(
          sim.lookAndFeel.navigationBarFillProperty,
          sim.screenIndexProperty,
          sim.screens,
          screen,
          barSize.height, {
            tandem: options.tandem && options.tandem.createTandem( screen.tandemScreenName + 'Button' )
          } );
      } );

      // Get width of max screen button
      var maxScreenButtonWidth = Math.max( 50, _.max( screenButtons, function( button ) {return button.width;} ).width );

      // Put all screen buttons under a parent, to simplify layout
      this.screenButtonsParent = new Node( { children: screenButtons } );
      var xSpacing = 0;
      for ( var i = 1; i < screenButtons.length; i++ ) {
        screenButtons[ i ].centerX = screenButtons[i-1 ].centerX + maxScreenButtonWidth + xSpacing;
      }
      this.addChild( this.screenButtonsParent );
    }

    this.layout( 1, barSize.width, barSize.height );
  }

  return inherit( Node, NavigationBar, {

    /**
     * Called when the navigation bar layout needs to be updated, typically when the browser window is resized.
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

        this.screenButtonsParent.setScaleMagnitude( scale );

        // Center the screen buttons
        this.screenButtonsParent.centerX = width / 2;
        this.screenButtonsParent.top = 2;

        // Center the home icon vertically and make it a bit larger than the icons and text, see https://github.com/phetsims/joist/issues/127
        this.homeButton.setScaleMagnitude( scale * 1.1 );
        this.homeButton.left = this.screenButtonsParent.right + 15;
        this.homeButton.centerY = this.background.rectHeight / 2;

        // If the title overlaps the screen icons, scale it down.  See #128
        var availableWidth = this.screenButtonsParent.left - titleInset - distanceBetweenTitleAndFirstScreenIcon;
        var titleWidth = this.titleLabel.width;
        if ( titleWidth > availableWidth ) {
          this.titleLabel.setScaleMagnitude( scale * availableWidth / titleWidth );
        }
      }
    }
  } );
} );