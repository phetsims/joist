// Copyright 2013-2020, University of Colorado Boulder

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
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */

import DerivedProperty from '../../axon/js/DerivedProperty.js';
import StringProperty from '../../axon/js/StringProperty.js';
import Dimension2 from '../../dot/js/Dimension2.js';
import PhetFont from '../../scenery-phet/js/PhetFont.js';
import PDOMPeer from '../../scenery/js/accessibility/pdom/PDOMPeer.js';
import Node from '../../scenery/js/nodes/Node.js';
import Rectangle from '../../scenery/js/nodes/Rectangle.js';
import Text from '../../scenery/js/nodes/Text.js';
import A11yButtonsHBox from './A11yButtonsHBox.js';
import HomeButton from './HomeButton.js';
import HomeScreen from './HomeScreen.js';
import HomeScreenView from './HomeScreenView.js';
import joist from './joist.js';
import joistStrings from './joistStrings.js';
import NavigationBarScreenButton from './NavigationBarScreenButton.js';
import PhetButton from './PhetButton.js';

// constants
// for layout of the NavigationBar, used in the following way:
// [
//  {TITLE_LEFT_MARGIN}Title{TITLE_RIGHT_MARGIN}
//  {HOME_BUTTON_LEFT_MARGIN}HomeButton{HOME_BUTTON_RIGHT_MARGIN} (if visible)
//  {ScreenButtons centered} (if visible)
//  a11yButtonsHBox (if present){PHET_BUTTON_LEFT_MARGIN}PhetButton{PHET_BUTTON_RIGHT_MARGIN}
// ]
const NAVIGATION_BAR_SIZE = new Dimension2( HomeScreenView.LAYOUT_BOUNDS.width, 40 );
const TITLE_LEFT_MARGIN = 10;
const TITLE_RIGHT_MARGIN = 25;
const PHET_BUTTON_LEFT_MARGIN = 6;
const PHET_BUTTON_RIGHT_MARGIN = 10;
const PHET_BUTTON_BOTTOM_MARGIN = 0;
const HOME_BUTTON_LEFT_MARGIN = 5;
const HOME_BUTTON_RIGHT_MARGIN = HOME_BUTTON_LEFT_MARGIN;
const SCREEN_BUTTON_SPACING = 0;
const MINIMUM_SCREEN_BUTTON_WIDTH = 60; // Make sure each button is at least a minimum width so they don't get too close together, see #279

class NavigationBar extends Node {

  /**
   * @param {Sim} sim
   * @param {Tandem} tandem
   */
  constructor( sim, tandem ) {

    super();

    // @private
    this.simScreens = sim.simScreens;

    // @private - The nav bar fill and determining fill for elements on the nav bar (if it's black, the elements are white)
    this.navigationBarFillProperty = new DerivedProperty( [
      sim.screenProperty,
      sim.lookAndFeel.navigationBarFillProperty
    ], ( screen, simNavigationBarFill ) => {

      const showHomeScreen = screen === sim.homeScreen;

      // If the homescreen is showing, the navigation bar should blend into it.  This is done by making it the same color.
      // It cannot be made transparent here, because other code relies on the value of navigationBarFillProperty being
      // 'black' to make the icons show up as white, even when the navigation bar is hidden on the home screen.
      return showHomeScreen ? HomeScreen.BACKGROUND_COLOR : simNavigationBarFill;
    } );

    // @private - The bar's background (resized in layout)
    this.background = new Rectangle( 0, 0, NAVIGATION_BAR_SIZE.width, NAVIGATION_BAR_SIZE.height, {
      pickable: true,
      fill: this.navigationBarFillProperty
    } );
    this.addChild( this.background );

    // @private - Everything else besides the background in the navigation bar (used for scaling)
    this.barContents = new Node();
    this.addChild( this.barContents );

    this.titleText = new Text( sim.displayedSimNameProperty.value, {
      font: new PhetFont( 16 ),
      fill: sim.lookAndFeel.navigationBarTextFillProperty,
      tandem: tandem.createTandem( 'titleText' ),
      phetioDocumentation: 'Displays the title of the simulation in the navigation bar (bottom left)',
      visiblePropertyOptions: { phetioFeatured: true },
      textPropertyOptions: { phetioReadOnly: true }
    } );

    // Container node so that the visibility of the Navigation Bar title text can be controlled
    // independently by PhET-iO and whether the user is on the homescreen.
    const titleContainerNode = new Node( {
      visible: false,
      children: [ this.titleText ]
    } );
    this.barContents.addChild( titleContainerNode );

    sim.displayedSimNameProperty.link( title => {
      this.titleText.setText( title );
    } );

    // @private - PhET button, fill determined by state of navigationBarFillProperty
    this.phetButton = new PhetButton(
      sim,
      this.navigationBarFillProperty,
      tandem.createTandem( 'phetButton' )
    );
    this.barContents.addChild( this.phetButton );

    // @private - a11y HBox, button fills determined by state of navigationBarFillProperty
    this.a11yButtonsHBox = new A11yButtonsHBox(
      sim,
      this.navigationBarFillProperty,
      tandem // no need for a container here. If there is a conflict, then it will error loudly.
    );
    this.barContents.addChild( this.a11yButtonsHBox );

    // pdom - tell this node that it is aria-labelled by its own labelContent.
    this.addAriaLabelledbyAssociation( {
      thisElementName: PDOMPeer.PRIMARY_SIBLING,
      otherNode: this,
      otherElementName: PDOMPeer.LABEL_SIBLING
    } );

    if ( this.simScreens.length === 1 ) {

      /* single-screen sim */

      // title can occupy all space to the left of the PhET button
      this.titleText.maxWidth = HomeScreenView.LAYOUT_BOUNDS.width - TITLE_LEFT_MARGIN - TITLE_RIGHT_MARGIN -
                                PHET_BUTTON_LEFT_MARGIN - this.a11yButtonsHBox.width - PHET_BUTTON_LEFT_MARGIN -
                                this.phetButton.width - PHET_BUTTON_RIGHT_MARGIN;
    }
    else {

      /* multi-screen sim */

      // Start with the assumption that the title can occupy (at most) this percentage of the bar.
      const maxTitleWidth = Math.min( this.titleText.width, 0.20 * HomeScreenView.LAYOUT_BOUNDS.width );

      // pdom - container for the homeButton and all the screen buttons.
      var buttons = new Node( { // eslint-disable-line no-var
        tagName: 'ol',
        containerTagName: 'nav',
        labelTagName: 'h2',
        labelContent: joistStrings.a11y.simScreens
      } );

      buttons.ariaLabelledbyAssociations = [ {
        thisElementName: PDOMPeer.CONTAINER_PARENT,
        otherElementName: PDOMPeer.LABEL_SIBLING,
        otherNode: buttons
      } ];
      buttons.setVisible( false );
      this.barContents.addChild( buttons );

      // @private - Create the home button
      this.homeButton = new HomeButton(
        NAVIGATION_BAR_SIZE.height,
        sim.lookAndFeel.navigationBarFillProperty,
        sim.homeScreen ? sim.homeScreen.pdomDisplayNameProperty : new StringProperty( 'NO HOME SCREEN' ),
        tandem.createTandem( 'homeButton' ), {
          listener: () => {
            sim.screenProperty.value = sim.homeScreen;

            // only if fired from a11y
            if ( this.homeButton.isPDOMClicking() ) {
              sim.homeScreen.view.focusHighlightedScreenButton();
            }
          }
        } );

      // Add the home button, but only if the homeScreen exists
      sim.homeScreen && buttons.addChild( this.homeButton );

      /*
       * Allocate remaining horizontal space equally for screen buttons, assuming they will be centered in the navbar.
       * Computations here reflect the left-to-right layout of the navbar.
       */
      // available width left of center
      const availableLeft = ( HomeScreenView.LAYOUT_BOUNDS.width / 2 ) - TITLE_LEFT_MARGIN - maxTitleWidth - TITLE_RIGHT_MARGIN -
                            HOME_BUTTON_LEFT_MARGIN - this.homeButton.width - HOME_BUTTON_RIGHT_MARGIN;

      // available width right of center
      const availableRight = ( HomeScreenView.LAYOUT_BOUNDS.width / 2 ) - PHET_BUTTON_LEFT_MARGIN -
                             this.a11yButtonsHBox.width - PHET_BUTTON_LEFT_MARGIN - this.phetButton.width -
                             PHET_BUTTON_RIGHT_MARGIN;

      // total available width for the screen buttons when they are centered
      const availableTotal = 2 * Math.min( availableLeft, availableRight );

      // width per screen button
      const screenButtonWidth = ( availableTotal - ( this.simScreens.length - 1 ) * SCREEN_BUTTON_SPACING ) / this.simScreens.length;

      // Create the screen buttons
      const screenButtons = this.simScreens.map( screen => {
        return new NavigationBarScreenButton(
          sim.lookAndFeel.navigationBarFillProperty,
          sim.screenProperty,
          screen,
          this.simScreens.indexOf( screen ),
          NAVIGATION_BAR_SIZE.height, {
            maxButtonWidth: screenButtonWidth,
            tandem: tandem.createTandem( screen.tandem.name + 'Button' )
          } );
      } );

      // Layout out screen buttons horizontally, with equal distance between their centers
      // Make sure each button is at least a minimum size, so they don't get too close together, see #279
      const maxScreenButtonWidth = Math.max( MINIMUM_SCREEN_BUTTON_WIDTH, _.maxBy( screenButtons, button => {
        return button.width;
      } ).width );

      // Compute the distance between *centers* of each button
      const spaceBetweenButtons = maxScreenButtonWidth + SCREEN_BUTTON_SPACING;
      for ( let i = 0; i < screenButtons.length; i++ ) {

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
      buttons.addChild( this.screenButtonsContainer );

      // Now determine the actual width constraint for the sim title.
      this.titleText.maxWidth = this.screenButtonsContainer.left - TITLE_LEFT_MARGIN - TITLE_RIGHT_MARGIN -
                                HOME_BUTTON_RIGHT_MARGIN - this.homeButton.width - HOME_BUTTON_LEFT_MARGIN;
    }

    // initial layout (that doesn't need to change when we are re-laid out)
    this.titleText.left = TITLE_LEFT_MARGIN;
    this.titleText.centerY = NAVIGATION_BAR_SIZE.height / 2;
    this.phetButton.bottom = NAVIGATION_BAR_SIZE.height - PHET_BUTTON_BOTTOM_MARGIN;

    // only if some a11y buttons exist
    if ( this.a11yButtonsHBox.getChildrenCount() > 0 ) {

      // The icon is vertically adjusted in KeyboardHelpButton, so that the centers can be aligned here
      this.a11yButtonsHBox.centerY = this.phetButton.centerY;
    }
    if ( this.simScreens.length !== 1 ) {
      this.screenButtonsContainer.centerY = NAVIGATION_BAR_SIZE.height / 2;
      this.homeButton.centerY = NAVIGATION_BAR_SIZE.height / 2;
    }

    this.layout( 1, NAVIGATION_BAR_SIZE.width, NAVIGATION_BAR_SIZE.height );

    const simResourcesContainer = new Node( {

      // pdom
      tagName: 'div',
      containerTagName: 'section',
      labelTagName: 'h2',
      labelContent: joistStrings.a11y.simResources,
      pdomOrder: [
        this.a11yButtonsHBox,
        this.phetButton
      ].filter( node => node !== undefined )
    } );

    simResourcesContainer.ariaLabelledbyAssociations = [ {
      thisElementName: PDOMPeer.CONTAINER_PARENT,
      otherElementName: PDOMPeer.LABEL_SIBLING,
      otherNode: simResourcesContainer
    } ];
    this.addChild( simResourcesContainer );

    // only show the home button and screen buttons on the nav bar when a screen is showing, not the home screen
    sim.screenProperty.link( screen => {
      const showHomeScreen = screen === sim.homeScreen;
      titleContainerNode.visible = !showHomeScreen;
      if ( buttons ) {
        buttons.setVisible( !showHomeScreen );
      }
    } );
  }

  /**
   * Called when the navigation bar layout needs to be updated, typically when the browser window is resized.
   * @param {number} scale
   * @param {number} width
   * @param {number} height
   * @public
   */
  layout( scale, width, height ) {

    // resize the background
    this.background.rectWidth = width;
    this.background.rectHeight = height;

    // scale the entire bar contents
    this.barContents.setScaleMagnitude( scale );

    // determine our local-coordinate 'right' side of the screen, so we can expand if necessary
    let right;
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

    if ( this.a11yButtonsHBox.getChildrenCount() > 0 ) {
      this.a11yButtonsHBox.right = this.phetButton.left - PHET_BUTTON_LEFT_MARGIN;
    }

    // For multi-screen sims ...
    if ( this.simScreens.length !== 1 ) {

      // Screen buttons centered.  These buttons are centered around the origin in the screenButtonsContainer, so the
      // screenButtonsContainer can be put at the center of the navbar.
      this.screenButtonsContainer.x = right / 2;

      // home button to the left of screen buttons
      this.homeButton.right = this.screenButtonsContainer.left - HOME_BUTTON_RIGHT_MARGIN;

      // max width relative to position of home button
      this.titleText.maxWidth = this.homeButton.left - TITLE_LEFT_MARGIN - TITLE_RIGHT_MARGIN;
    }
  }
}

// @public
NavigationBar.NAVIGATION_BAR_SIZE = NAVIGATION_BAR_SIZE;

joist.register( 'NavigationBar', NavigationBar );
export default NavigationBar;