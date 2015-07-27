// Copyright 2002-2015, University of Colorado Boulder

/**
 * The navigation bar at the bottom of the screen.
 * For a single-screen sim, it shows the name of the sim at the far left and the PhET button at the far right.
 * For a multi-screen sim, it additionally shows buttons for each screen, and a home button.
 *
 * Layout of NavigationBar adapts to different text widths, icon widths, and numbers of screens, and attempts to
 * perform an "optimal" layout. The sim title is initially constrained to a max percentage of the bar width,
 * and that's used to compute how much space is available for screen buttons.  After creation and layout of the
 * screen buttons, we then compute how much space is actually available for the sim title, and use that to
 * constrain the title's width.
 *
 * @author Sam Reid
 * @author Chris Malley (PixelZoom, Inc.)
 */
define( function( require ) {
  'use strict';

  // modules
  var HomeButton = require( 'JOIST/HomeButton' );
  var inherit = require( 'PHET_CORE/inherit' );
  var NavigationBarScreenButton = require( 'JOIST/NavigationBarScreenButton' );
  var Node = require( 'SCENERY/nodes/Node' );
  var PhetButton = require( 'JOIST/PhetButton' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var Screen = require( 'JOIST/Screen' );
  var Text = require( 'SCENERY/nodes/Text' );

  // constants
  var TITLE_LEFT_MARGIN = 10;
  var TITLE_RIGHT_MARGIN = 25;
  var PHET_BUTTON_LEFT_MARGIN = TITLE_RIGHT_MARGIN;
  var PHET_BUTTON_RIGHT_MARGIN = PhetButton.HORIZONTAL_INSET; // same position as PhetButton on home screen
  var PHET_BUTTON_BOTTOM_MARGIN = PhetButton.VERTICAL_INSET; // same position as PhetButton on home screen
  var HOME_BUTTON_LEFT_MARGIN = 8;
  var SCREEN_BUTTON_SPACING = 0;
  var MINIMUM_SCREEN_BUTTON_WIDTH = 60; // Make sure each button is at least a minimum width so they don't get too close
                                        // together, see #279

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

    // all icons must have a valid aspect ratio, which matches either navbar or homescreen icon dimensions, see joist#263
    if ( screens.length > 1 ) {
      var navbarIconAspectRatio = Screen.NAVBAR_ICON_SIZE.width / Screen.NAVBAR_ICON_SIZE.height;
      var homeScreenIconAspectRatio = Screen.HOME_SCREEN_ICON_SIZE.width / Screen.HOME_SCREEN_ICON_SIZE.height;
      assert && assert( _.filter( screens, function( screen ) {
          var iconAspectRatio = screen.navigationBarIcon.width / screen.navigationBarIcon.height;
          if ( iconAspectRatio !== navbarIconAspectRatio && iconAspectRatio !== homeScreenIconAspectRatio ){
            console.log( 'screen.name = ' + screen.name );
            debugger;
          }
          return iconAspectRatio === navbarIconAspectRatio || iconAspectRatio === homeScreenIconAspectRatio;
        } ).length === screens.length,
        'all navigation bar icons must have a valid aspect ratio' );
    }

    this.screens = screens;

    Node.call( this );

    // The bar's background
    this.background = new Rectangle( 0, 0, barSize.width, barSize.height );
    sim.lookAndFeel.navigationBarFillProperty.linkAttribute( this.background, 'fill' );
    this.addChild( this.background );

    // Sim title
    var title = new Text( sim.name, {
      font: new PhetFont( 18 )
    } );
    sim.lookAndFeel.navigationBarTextFillProperty.linkAttribute( title, 'fill' );
    this.titleParent = new Node( { children: [ title ] } ); // wrap in a parent node, so we can scale the parent without affecting title.maxWidth
    this.addChild( this.titleParent );

    // PhET button
    this.phetButton = new PhetButton( sim, sim.lookAndFeel.navigationBarFillProperty, sim.lookAndFeel.navigationBarTextFillProperty, {
      tandem: options.tandem ? options.tandem.createTandem( 'phetButton' ) : null
    } );
    this.addChild( this.phetButton );

    if ( screens.length === 1 ) {
      /* single-screen sim */

      // title can occupy all space to the left of the PhET button
      title.maxWidth = this.background.width - TITLE_LEFT_MARGIN - TITLE_RIGHT_MARGIN - this.phetButton.width - PHET_BUTTON_RIGHT_MARGIN;
    }
    else {
      /* multi-screen sim */

      // Start with the assumption that the title can occupy (at most) this percentage of the bar.
      var maxTitleWidth = Math.min( this.titleParent.width, 0.25 * this.background.width );

      // Create the home button
      this.homeButton = new HomeButton( barSize.height, sim.lookAndFeel.navigationBarFillProperty, {
        listener: function() {
          sim.showHomeScreen = true;
        },
        tandem: options.tandem && options.tandem.createTandem( 'homeButton' )
      } );
      this.addChild( this.homeButton );

      /*
       * Allocate remaining horizontal space equally for screen buttons, assuming they will be centered in the navbar.
       * Computations here reflect the left-to-right layout of the navbar.
       */
      // available width left of center
      var availableLeft = ( this.background.width / 2 ) - TITLE_LEFT_MARGIN - maxTitleWidth - TITLE_RIGHT_MARGIN;
      // available width right of center
      var availableRight = ( this.background.width / 2 ) - HOME_BUTTON_LEFT_MARGIN - this.homeButton.width - PHET_BUTTON_LEFT_MARGIN - this.phetButton.width - PHET_BUTTON_RIGHT_MARGIN;
      // total available width for the screen buttons when they are centered
      var availableTotal = 2 * Math.min( availableLeft, availableRight );
      // width per screen button
      var screenButtonWidth = ( availableTotal - ( screens.length - 1 ) * SCREEN_BUTTON_SPACING ) / screens.length;

      // Create the screen buttons
      var screenButtons = _.map( screens, function( screen ) {
        return new NavigationBarScreenButton(
          sim.lookAndFeel.navigationBarFillProperty,
          sim.screenIndexProperty,
          sim.screens,
          screen,
          barSize.height, {
            maxButtonWidth: screenButtonWidth,
            tandem: options.tandem && options.tandem.createTandem( screen.tandemScreenName + 'Button' )
          } );
      } );

      // Layout out screen buttons horizontally, with equal distance between their centers
      // Make sure each button is at least a minimum size, so they don't get too close together, see #279
      var maxScreenButtonWidth = Math.max( MINIMUM_SCREEN_BUTTON_WIDTH, _.max( screenButtons, function( button ) {
        return button.width;
      } ).width );

      // Compute the distance between *centers* of each button
      var spaceBetweenButtons = maxScreenButtonWidth + SCREEN_BUTTON_SPACING;
      for ( var i = 0; i < screenButtons.length; i++ ) {

        // Equally space the centers of the buttons around the origin of their parent (screenButtonsParent)
        screenButtons[ i ].centerX = spaceBetweenButtons * ( i - ( screenButtons.length - 1 ) / 2 );
      }

      // Put all screen buttons under a parent, to simplify layout
      this.screenButtonsParent = new Node( {
        children: screenButtons,
        // NOTE: these layout settings are duplicated in layout(), but are necessary due to title's maxWidth requiring layout
        x: this.background.centerX, // since we have buttons centered around our origin, this centers the buttons
        centerY: this.background.centerY,
        maxWidth: availableTotal // in case we have so many screens that the screen buttons need to be scaled down
      } );
      this.addChild( this.screenButtonsParent );

      // Now determine the actual width constraint for the sim title.
      title.maxWidth = this.screenButtonsParent.left - TITLE_LEFT_MARGIN - TITLE_RIGHT_MARGIN;
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

      // resize the background
      this.background.rectWidth = width;
      this.background.rectHeight = height;

      // title at left end
      this.titleParent.setScaleMagnitude( scale );
      this.titleParent.left = this.background.left + TITLE_LEFT_MARGIN;
      this.titleParent.centerY = this.background.centerY;

      // PhET button at right end
      this.phetButton.setScaleMagnitude( scale );
      this.phetButton.right = width - PHET_BUTTON_RIGHT_MARGIN;
      this.phetButton.bottom = height - PHET_BUTTON_BOTTOM_MARGIN;

      // For multi-screen sims ...
      if ( this.screens.length !== 1 ) {

        // screen buttons centered.  The screen buttons are centered around the origin in the screenButtonsParent, so 
        // the screenButtonsParent can be put at x=center of the navbar
        this.screenButtonsParent.setScaleMagnitude( scale );
        this.screenButtonsParent.x = this.background.centerX;
        this.screenButtonsParent.centerY = this.background.centerY;

        // home button to the right of screen buttons
        this.homeButton.setScaleMagnitude( scale );
        this.homeButton.left = this.screenButtonsParent.right + HOME_BUTTON_LEFT_MARGIN;
        this.homeButton.centerY = this.background.centerY;
      }
    }
  } );
} );