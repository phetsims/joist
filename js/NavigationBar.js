// Copyright 2013-2015, University of Colorado Boulder

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
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chris Malley (PixelZoom, Inc.)
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( function( require ) {
  'use strict';

  // modules
  var Dimension2 = require( 'DOT/Dimension2' );
  var HomeButton = require( 'JOIST/HomeButton' );
  var inherit = require( 'PHET_CORE/inherit' );
  var platform = require( 'PHET_CORE/platform' );
  var NavigationBarScreenButton = require( 'JOIST/NavigationBarScreenButton' );
  var HomeScreenView = require( 'JOIST/HomeScreenView' );
  var Node = require( 'SCENERY/nodes/Node' );
  var PhetButton = require( 'JOIST/PhetButton' );
  var KeyboardHelpButton = require( 'JOIST/KeyboardHelpButton' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var Text = require( 'SCENERY/nodes/Text' );
  var joist = require( 'JOIST/joist' );

  // constants
  var NAVIGATION_BAR_SIZE = new Dimension2( HomeScreenView.LAYOUT_BOUNDS.width, 40 );
  var TITLE_LEFT_MARGIN = 10;
  var TITLE_RIGHT_MARGIN = 25;
  var PHET_BUTTON_LEFT_MARGIN = 13;
  var PHET_BUTTON_RIGHT_MARGIN = PhetButton.HORIZONTAL_INSET; // same position as PhetButton on home screen
  var PHET_BUTTON_BOTTOM_MARGIN = PhetButton.VERTICAL_INSET; // same position as PhetButton on home screen
  var KEYBOARD_HELP_BUTTON_LEFT_MARGIN = 50;
  var HOME_BUTTON_LEFT_MARGIN = 5;
  var HOME_BUTTON_RIGHT_MARGIN = HOME_BUTTON_LEFT_MARGIN;
  var SCREEN_BUTTON_SPACING = 0;
  var MINIMUM_SCREEN_BUTTON_WIDTH = 60; // Make sure each button is at least a minimum width so they don't get too close together, see #279

  /**
   * Creates a nav bar.
   * @param {Sim} sim
   * @param {Screen[]} screens
   * @param {Tandem} tandem
   * @constructor
   */
  function NavigationBar( sim, screens, tandem ) {

    // @private
    this.screens = screens;

    Node.call( this );

    // @private - The bar's background (resized in layout)
    this.background = new Rectangle( 0, 0, NAVIGATION_BAR_SIZE.width, NAVIGATION_BAR_SIZE.height, {
      pickable: true
    } );
    sim.lookAndFeel.navigationBarFillProperty.linkAttribute( this.background, 'fill' );
    this.addChild( this.background );

    // @private - Everything else besides the background in the navigation bar (used for scaling)
    this.barContents = new Node();
    this.addChild( this.barContents );

    // Sim title
    this.titleTextNode = new Text( sim.name, {
      font: new PhetFont( 16 ),
      tandem: tandem.createTandem( 'titleTextNode' )
    } );
    sim.lookAndFeel.navigationBarTextFillProperty.linkAttribute( this.titleTextNode, 'fill' );
    this.barContents.addChild( this.titleTextNode );

    // @public (joist-internal) - PhET button. The transform of this is tracked, so we can mirror it over to the
    // homescreen's button. See https://github.com/phetsims/joist/issues/304.
    this.phetButton = new PhetButton( sim, sim.lookAndFeel.navigationBarFillProperty, sim.lookAndFeel.navigationBarTextFillProperty, tandem.createTandem( 'phetButton' ) );
    this.barContents.addChild( this.phetButton );

    // @private - Pops open a dialog with information about keyboard navigation
    this.keyboardHelpButton = new KeyboardHelpButton( sim, sim.lookAndFeel.navigationBarFillProperty, tandem.createTandem( 'keyboardHelpButton' ) );

    // only show the keyboard help button if the sim is accessible, there is keyboard help content, and we are
    // not in mobile safari
    if ( sim.accessible && sim.keyboardHelpNode && !platform.mobileSafari ) {
      this.barContents.addChild( this.keyboardHelpButton );
    } 

    if ( screens.length === 1 ) {
      /* single-screen sim */

      // title can occupy all space to the left of the PhET button
      this.titleTextNode.maxWidth = HomeScreenView.LAYOUT_BOUNDS.width - TITLE_LEFT_MARGIN - TITLE_RIGHT_MARGIN -
                                    this.phetButton.width - PHET_BUTTON_RIGHT_MARGIN - this.keyboardHelpButton.width - KEYBOARD_HELP_BUTTON_LEFT_MARGIN;
    }
    else {
      /* multi-screen sim */

      // Start with the assumption that the title can occupy (at most) this percentage of the bar.
      var maxTitleWidth = Math.min( this.titleTextNode.width, 0.20 * HomeScreenView.LAYOUT_BOUNDS.width );

      // @private - Create the home button
      this.homeButton = new HomeButton(
        NAVIGATION_BAR_SIZE.height,
        sim.lookAndFeel.navigationBarFillProperty,
        tandem.createTandem( 'homeButton' ), {
          listener: function() {
            sim.showHomeScreenProperty.value = true;
          }
        } );
      this.barContents.addChild( this.homeButton );

      /*
       * Allocate remaining horizontal space equally for screen buttons, assuming they will be centered in the navbar.
       * Computations here reflect the left-to-right layout of the navbar.
       */
      // available width left of center
      var availableLeft = ( HomeScreenView.LAYOUT_BOUNDS.width / 2 ) - TITLE_LEFT_MARGIN - maxTitleWidth - TITLE_RIGHT_MARGIN -
                            this.homeButton.width - HOME_BUTTON_RIGHT_MARGIN;

      // available width right of center
      var availableRight = ( HomeScreenView.LAYOUT_BOUNDS.width / 2 ) - this.phetButton.width - PHET_BUTTON_RIGHT_MARGIN -
                             this.keyboardHelpButton.width - KEYBOARD_HELP_BUTTON_LEFT_MARGIN;

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
            tandem: tandem.createTandem( screen.tandem.tail + 'Button' )
          } );
      } );

      // Layout out screen buttons horizontally, with equal distance between their centers
      // Make sure each button is at least a minimum size, so they don't get too close together, see #279
      var maxScreenButtonWidth = Math.max( MINIMUM_SCREEN_BUTTON_WIDTH, _.maxBy( screenButtons, function( button ) {
        return button.width;
      } ).width );

      // Compute the distance between *centers* of each button
      var spaceBetweenButtons = maxScreenButtonWidth + SCREEN_BUTTON_SPACING;
      for ( var i = 0; i < screenButtons.length; i++ ) {

        // Equally space the centers of the buttons around the origin of their parent (screenButtonsContainer)
        screenButtons[ i ].centerX = spaceBetweenButtons * ( i - ( screenButtons.length - 1 ) / 2 );
      }

      // @private - Put all screen buttons under a parent, to simplify layout
      this.screenButtonsContainer = new Node( {
        children: screenButtons,
        // NOTE: these layout settings are duplicated in layout(), but are necessary due to title's maxWidth requiring layout
        x: this.background.centerX, // since we have buttons centered around our origin, this centers the buttons
        centerY: this.background.centerY,
        maxWidth: availableTotal // in case we have so many screens that the screen buttons need to be scaled down
      } );
      this.barContents.addChild( this.screenButtonsContainer );

      this.accessibleOrder = [ this.screenButtonsContainer, this.homeButton ];

      // Now determine the actual width constraint for the sim title.
      this.titleTextNode.maxWidth = this.screenButtonsContainer.left - TITLE_LEFT_MARGIN - TITLE_RIGHT_MARGIN -
                                HOME_BUTTON_RIGHT_MARGIN - this.homeButton.width - HOME_BUTTON_LEFT_MARGIN;
    }


    // initial layout (that doesn't need to change when we are re-layed out)
    this.titleTextNode.left = TITLE_LEFT_MARGIN;
    this.titleTextNode.centerY = NAVIGATION_BAR_SIZE.height / 2;
    this.phetButton.bottom = NAVIGATION_BAR_SIZE.height - PHET_BUTTON_BOTTOM_MARGIN;
    this.keyboardHelpButton.centerY = this.phetButton.centerY;
    if ( this.screens.length !== 1 ) {
      this.screenButtonsContainer.centerY = NAVIGATION_BAR_SIZE.height / 2;
      this.homeButton.centerY = NAVIGATION_BAR_SIZE.height / 2;
    }

    this.layout( 1, NAVIGATION_BAR_SIZE.width, NAVIGATION_BAR_SIZE.height );

    // a11y - container tag name for all accessible buttons in the nav bar
    this.tagName = 'div';
  }

  joist.register( 'NavigationBar', NavigationBar );

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
      this.keyboardHelpButton.right = this.phetButton.left - PHET_BUTTON_LEFT_MARGIN;

      // For multi-screen sims ...
      if ( this.screens.length !== 1 ) {
        // screen buttons and home screen button are centered.  These buttons are centered
        // around the origin in the screenButtonsContainer, so the screenButtonsContainer can
        // be put at the center of the navbar, shifted by the width of the home button.
        this.screenButtonsContainer.x = right / 2 + this.homeButton.width / 2;

        // home button to the left of screen buttons
        this.homeButton.right = this.screenButtonsContainer.left - HOME_BUTTON_RIGHT_MARGIN;

        // max width relative to position of home button
        this.titleTextNode.maxWidth = this.homeButton.left - TITLE_LEFT_MARGIN - TITLE_RIGHT_MARGIN;
      }
    }
  }, {

    // @public
    NAVIGATION_BAR_SIZE: NAVIGATION_BAR_SIZE
  } );
} );