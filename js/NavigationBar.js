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
 * The bar is composed of a background (always pixel-perfect), and expandable content (that gets scaled as one part).
 * If we are width-constrained, the navigation bar is in a 'compact' state where the children of the content (e.g.
 * home button, screen buttons, phet menu, title) do not change positions. If we are height-constrained, the amount
 * available to the bar expands, so we lay out the children to fit. See https://github.com/phetsims/joist/issues/283
 * for more details on how this is done.
 *
 * @author Sam Reid
 * @author Chris Malley (PixelZoom, Inc.)
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( function( require ) {
  'use strict';

  // modules
  var Dimension2 = require( 'DOT/Dimension2' );
  var HomeButton = require( 'JOIST/HomeButton' );
  var inherit = require( 'PHET_CORE/inherit' );
  var NavigationBarScreenButton = require( 'JOIST/NavigationBarScreenButton' );
  var HomeScreenView = require( 'JOIST/HomeScreenView' );
  var Node = require( 'SCENERY/nodes/Node' );
  var PhetButton = require( 'JOIST/PhetButton' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var Screen = require( 'JOIST/Screen' );
  var Text = require( 'SCENERY/nodes/Text' );

  // constants
  var NAVIGATION_BAR_SIZE = new Dimension2( HomeScreenView.LAYOUT_BOUNDS.width, 40 );
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
   * @param {Sim} sim
   * @param {Screen[]} screens
   * @param {Object} [options]
   * @constructor
   */
  function NavigationBar( sim, screens, options ) {

    options = _.extend( {
      tandem: null
    }, options );

    // all icons must have a valid aspect ratio, which matches either navbar or homescreen icon dimensions, see joist#263
    if ( screens.length > 1 ) {
      var navbarIconAspectRatio = Screen.NAVBAR_ICON_SIZE.width / Screen.NAVBAR_ICON_SIZE.height;
      var homeScreenIconAspectRatio = Screen.HOME_SCREEN_ICON_SIZE.width / Screen.HOME_SCREEN_ICON_SIZE.height;
      for ( var screenIndex = 0; screenIndex < screens.length; screenIndex++ ) {
        var screen = screens[ screenIndex ];
        var iconAspectRatio = screen.navigationBarIcon.width / screen.navigationBarIcon.height;
        var validAspectRatio = iconAspectRatio === navbarIconAspectRatio || iconAspectRatio === homeScreenIconAspectRatio;
        assert && assert( validAspectRatio, 'NavigationBar icons for screen ' + screenIndex + ' did not have a valid aspect ratio.' );
      }
    }

    this.screens = screens;

    Node.call( this );

    // The bar's background (resized in layout)
    this.background = new Rectangle( 0, 0, NAVIGATION_BAR_SIZE.width, NAVIGATION_BAR_SIZE.height );
    sim.lookAndFeel.navigationBarFillProperty.linkAttribute( this.background, 'fill' );
    this.addChild( this.background );

    // Everything else besides the background in the navigation bar (used for scaling)
    this.barContents = new Node();
    this.addChild( this.barContents );

    // Sim title
    var title = new Text( sim.name, {
      font: new PhetFont( 18 )
    } );
    sim.lookAndFeel.navigationBarTextFillProperty.linkAttribute( title, 'fill' );
    this.barContents.addChild( title );

    // PhET button
    this.phetButton = new PhetButton( sim, sim.lookAndFeel.navigationBarFillProperty, sim.lookAndFeel.navigationBarTextFillProperty, {
      tandem: options.tandem ? options.tandem.createTandem( 'phetButton' ) : null
    } );
    this.barContents.addChild( this.phetButton );

    if ( screens.length === 1 ) {
      /* single-screen sim */

      // title can occupy all space to the left of the PhET button
      title.maxWidth = HomeScreenView.LAYOUT_BOUNDS.width - TITLE_LEFT_MARGIN - TITLE_RIGHT_MARGIN - this.phetButton.width - PHET_BUTTON_RIGHT_MARGIN;
    }
    else {
      /* multi-screen sim */

      // Start with the assumption that the title can occupy (at most) this percentage of the bar.
      var maxTitleWidth = Math.min( title.width, 0.25 * HomeScreenView.LAYOUT_BOUNDS.width );

      // Create the home button
      this.homeButton = new HomeButton( NAVIGATION_BAR_SIZE.height, sim.lookAndFeel.navigationBarFillProperty, {
        listener: function() {
          sim.showHomeScreen = true;
        },
        tandem: options.tandem && options.tandem.createTandem( 'homeButton' )
      } );
      this.barContents.addChild( this.homeButton );

      /*
       * Allocate remaining horizontal space equally for screen buttons, assuming they will be centered in the navbar.
       * Computations here reflect the left-to-right layout of the navbar.
       */
      // available width left of center
      var availableLeft = ( HomeScreenView.LAYOUT_BOUNDS.width / 2 ) - TITLE_LEFT_MARGIN - maxTitleWidth - TITLE_RIGHT_MARGIN;

      // available width right of center
      var availableRight = ( HomeScreenView.LAYOUT_BOUNDS.width / 2 ) - HOME_BUTTON_LEFT_MARGIN - this.homeButton.width -
                           PHET_BUTTON_LEFT_MARGIN - this.phetButton.width - PHET_BUTTON_RIGHT_MARGIN;

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
          NAVIGATION_BAR_SIZE.height, {
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

        // Equally space the centers of the buttons around the origin of their parent (screenButtonsContainer)
        screenButtons[ i ].centerX = spaceBetweenButtons * ( i - ( screenButtons.length - 1 ) / 2 );
      }

      // Put all screen buttons under a parent, to simplify layout
      this.screenButtonsContainer = new Node( {
        children: screenButtons,
        // NOTE: these layout settings are duplicated in layout(), but are necessary due to title's maxWidth requiring layout
        x: this.background.centerX, // since we have buttons centered around our origin, this centers the buttons
        centerY: this.background.centerY,
        maxWidth: availableTotal // in case we have so many screens that the screen buttons need to be scaled down
      } );
      this.barContents.addChild( this.screenButtonsContainer );

      // Now determine the actual width constraint for the sim title.
      title.maxWidth = this.screenButtonsContainer.left - TITLE_LEFT_MARGIN - TITLE_RIGHT_MARGIN;
    }

    // initial layout (that doesn't need to change when we are re-layed out)
    title.left = TITLE_LEFT_MARGIN;
    title.centerY = NAVIGATION_BAR_SIZE.height / 2;
    this.phetButton.bottom = NAVIGATION_BAR_SIZE.height - PHET_BUTTON_BOTTOM_MARGIN;
    if ( this.screens.length !== 1 ) {
      this.screenButtonsContainer.centerY = NAVIGATION_BAR_SIZE.height / 2;
      this.homeButton.centerY = NAVIGATION_BAR_SIZE.height / 2;
    }

    this.layout( 1, NAVIGATION_BAR_SIZE.width, NAVIGATION_BAR_SIZE.height );
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

      // scale the entire bar contents
      this.barContents.setScaleMagnitude( scale );

      // determine our local-coordinate 'right' side of the screen, so we can expand if necessary
      var right;
      if ( NAVIGATION_BAR_SIZE.width * scale < width ) {
        // expanded
        right = width / scale;
      }
      else {
        // compact
        right = NAVIGATION_BAR_SIZE.width;
      }

      // horizontal positioning
      this.phetButton.right = right - PHET_BUTTON_RIGHT_MARGIN;

      // For multi-screen sims ...
      if ( this.screens.length !== 1 ) {
        // screen buttons centered.  The screen buttons are centered around the origin in the screenButtonsContainer, so
        // the screenButtonsContainer can be put at x=center of the navbar
        this.screenButtonsContainer.x = right / 2;

        // home button to the right of screen buttons
        this.homeButton.left = this.screenButtonsContainer.right + HOME_BUTTON_LEFT_MARGIN;
      }
    }
  }, {
    NAVIGATION_BAR_SIZE: NAVIGATION_BAR_SIZE
  } );
} );