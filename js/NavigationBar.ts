// Copyright 2013-2023, University of Colorado Boulder

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
import { AlignBox, Color, HBox, ManualConstraint, Node, PDOMPeer, Rectangle, RelaxedManualConstraint, Text } from '../../scenery/js/imports.js';
import Tandem from '../../tandem/js/Tandem.js';
import A11yButtonsHBox from './A11yButtonsHBox.js';
import HomeButton from './HomeButton.js';
import HomeScreen from './HomeScreen.js';
import HomeScreenView from './HomeScreenView.js';
import joist from './joist.js';
import JoistStrings from './JoistStrings.js';
import NavigationBarScreenButton from './NavigationBarScreenButton.js';
import PhetButton from './PhetButton.js';
import Sim from './Sim.js';
import ReadOnlyProperty from '../../axon/js/ReadOnlyProperty.js';
import Bounds2 from '../../dot/js/Bounds2.js';
import { AnyScreen } from './Screen.js';
import BooleanProperty from '../../axon/js/BooleanProperty.js';

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
const HOME_BUTTON_LEFT_MARGIN = 5;
const HOME_BUTTON_RIGHT_MARGIN = HOME_BUTTON_LEFT_MARGIN;
const SCREEN_BUTTON_SPACING = 0;
const MINIMUM_SCREEN_BUTTON_WIDTH = 60; // Make sure each button is at least a minimum width so they don't get too close together, see #279

class NavigationBar extends Node {
  private readonly navigationBarFillProperty: ReadOnlyProperty<Color>;
  private readonly background: Rectangle;
  private readonly barContents: Node;
  private readonly a11yButtonsHBox: A11yButtonsHBox;
  private readonly localeNode!: Node;
  private readonly homeButton: HomeButton | null = null; // mutated if multiscreen sim

  public constructor( sim: Sim, tandem: Tandem ) {

    super();

    // The nav bar fill and determining fill for elements on the nav bar (if it's black, the elements are white)
    this.navigationBarFillProperty = new DerivedProperty( [
      sim.selectedScreenProperty,
      sim.lookAndFeel.navigationBarFillProperty
    ], ( screen, simNavigationBarFill ) => {

      const showHomeScreen = screen === sim.homeScreen;

      // If the homescreen is showing, the navigation bar should blend into it.  This is done by making it the same color.
      // It cannot be made transparent here, because other code relies on the value of navigationBarFillProperty being
      // 'black' to make the icons show up as white, even when the navigation bar is hidden on the home screen.
      return showHomeScreen ? HomeScreen.BACKGROUND_COLOR : simNavigationBarFill;
    } );

    // The bar's background (resized in layout)
    this.background = new Rectangle( 0, 0, NAVIGATION_BAR_SIZE.width, NAVIGATION_BAR_SIZE.height, {
      pickable: true,
      fill: this.navigationBarFillProperty
    } );
    this.addChild( this.background );

    // Everything else besides the background in the navigation bar (used for scaling)
    this.barContents = new Node();
    this.addChild( this.barContents );

    const titleText = new Text( sim.displayedSimNameProperty, {
      font: new PhetFont( 16 ),
      fill: sim.lookAndFeel.navigationBarTextFillProperty,
      tandem: tandem.createTandem( 'titleText' ),
      phetioFeatured: true,
      phetioDocumentation: 'Displays the title of the simulation in the navigation bar (bottom left)',
      visiblePropertyOptions: { phetioFeatured: true },
      stringPropertyOptions: { phetioReadOnly: true }
    } );

    // Container node so that the visibility of the Navigation Bar title text can be controlled
    // independently by PhET-iO and whether the user is on the homescreen.
    const titleContainerNode = new Node( {
      children: [ titleText ],
      visibleProperty: new DerivedProperty( [ sim.selectedScreenProperty ], screen => screen !== sim.homeScreen )
    } );
    this.barContents.addChild( titleContainerNode );

    // PhET button, fill determined by state of navigationBarFillProperty
    const phetButton = new PhetButton(
      sim,
      this.navigationBarFillProperty,
      tandem.createTandem( 'phetButton' )
    );
    this.barContents.addChild( phetButton );

    // a11y HBox, button fills determined by state of navigationBarFillProperty
    this.a11yButtonsHBox = new A11yButtonsHBox(
      sim,
      this.navigationBarFillProperty, {
        tandem: tandem // no need for a container here. If there is a conflict, then it will error loudly.
      }
    );
    this.barContents.addChild( this.a11yButtonsHBox );
    this.localeNode && this.barContents.addChild( this.localeNode );

    // pdom - tell this node that it is aria-labelled by its own labelContent.
    this.addAriaLabelledbyAssociation( {
      thisElementName: PDOMPeer.PRIMARY_SIBLING,
      otherNode: this,
      otherElementName: PDOMPeer.LABEL_SIBLING
    } );

    let buttons: Node;

    const a11yButtonsWidth = ( this.a11yButtonsHBox.bounds.isValid() ? this.a11yButtonsHBox.width : 0 );

    // No potential for multiple screens if this is true
    if ( sim.simScreens.length === 1 ) {

      /* single-screen sim */

      // title can occupy all space to the left of the PhET button
      titleText.maxWidth = HomeScreenView.LAYOUT_BOUNDS.width - TITLE_LEFT_MARGIN - TITLE_RIGHT_MARGIN -
                           PHET_BUTTON_LEFT_MARGIN - a11yButtonsWidth - ( this.localeNode ? this.localeNode.width : 0 ) - PHET_BUTTON_LEFT_MARGIN -
                           phetButton.width - PHET_BUTTON_RIGHT_MARGIN;
    }
    else {

      /* multi-screen sim */

      // Start with the assumption that the title can occupy (at most) this percentage of the bar.
      const maxTitleWidth = Math.min( titleText.width, 0.20 * HomeScreenView.LAYOUT_BOUNDS.width );

      const isUserNavigableProperty = new BooleanProperty( true, {
        tandem: Tandem.GENERAL_MODEL.createTandem( 'screens' ).createTandem( 'isUserNavigableProperty' ),
        phetioFeatured: true,
        phetioDocumentation: 'If the screens are user navigable, icons are displayed in the navigation bar and the user can switch between screens.'
      } );

      // pdom - container for the homeButton and all the screen buttons.
      buttons = new Node( {
        tagName: 'ol',
        containerTagName: 'nav',
        labelTagName: 'h2',
        labelContent: JoistStrings.a11y.simScreensStringProperty,
        visibleProperty: new DerivedProperty( [ sim.activeSimScreensProperty, sim.selectedScreenProperty, isUserNavigableProperty ], ( screens, screen, isUserNavigable ) => {
          return screen !== sim.homeScreen && screens.length > 1 && isUserNavigable;
        } )
      } );

      buttons.ariaLabelledbyAssociations = [ {
        thisElementName: PDOMPeer.CONTAINER_PARENT,
        otherElementName: PDOMPeer.LABEL_SIBLING,
        otherNode: buttons
      } ];
      this.barContents.addChild( buttons );

      // Create the home button
      this.homeButton = new HomeButton(
        NAVIGATION_BAR_SIZE.height,
        sim.lookAndFeel.navigationBarFillProperty,
        sim.homeScreen ? sim.homeScreen.pdomDisplayNameProperty : new StringProperty( 'NO HOME SCREEN' ), {
          listener: () => {
            sim.selectedScreenProperty.value = sim.homeScreen!;

            // only if fired from a11y
            if ( this.homeButton!.isPDOMClicking() ) {
              sim.homeScreen!.view.focusHighlightedScreenButton();
            }
          },
          tandem: tandem.createTandem( 'homeButton' ),
          centerY: NAVIGATION_BAR_SIZE.height / 2
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
                             a11yButtonsWidth - ( this.localeNode ? this.localeNode.width : 0 ) - PHET_BUTTON_LEFT_MARGIN - phetButton.width -
                             PHET_BUTTON_RIGHT_MARGIN;

      // total available width for the screen buttons when they are centered
      const availableTotal = 2 * Math.min( availableLeft, availableRight );

      // width per screen button
      const screenButtonWidth = ( availableTotal - ( sim.simScreens.length - 1 ) * SCREEN_BUTTON_SPACING ) / sim.simScreens.length;

      // Create the screen buttons
      const screenButtons = sim.simScreens.map( screen => {
        return new NavigationBarScreenButton(
          sim.lookAndFeel.navigationBarFillProperty,
          sim.selectedScreenProperty,
          screen,
          sim.simScreens.indexOf( screen ),
          NAVIGATION_BAR_SIZE.height, {
            maxButtonWidth: screenButtonWidth,
            tandem: tandem.createTandem( `${screen.tandem.name}Button` )
          } );
      } );
      const allNavBarScreenButtons = [ this.homeButton, ...screenButtons ];

      // Layout out screen buttons horizontally, with equal distance between their centers
      // Make sure each button is at least a minimum size, so they don't get too close together, see #279
      const maxScreenButtonWidth = Math.max( MINIMUM_SCREEN_BUTTON_WIDTH, _.maxBy( screenButtons, button => {
        return button.width;
      } )!.width );
      const maxScreenButtonHeight = _.maxBy( screenButtons, button => button.height )!.height;

      const screenButtonMap = new Map<AnyScreen, Node>();
      screenButtons.forEach( screenButton => {
        screenButtonMap.set( screenButton.screen, new AlignBox( screenButton, {
          excludeInvisibleChildrenFromBounds: true,
          alignBounds: new Bounds2( 0, 0, maxScreenButtonWidth, maxScreenButtonHeight ),
          visibleProperty: screenButton.visibleProperty
        } ) );
      } );

      // Put all screen buttons under a parent, to simplify layout
      const screenButtonsContainer = new HBox( {
        spacing: SCREEN_BUTTON_SPACING,
        maxWidth: availableTotal // in case we have so many screens that the screen buttons need to be scaled down
      } );
      buttons.addChild( screenButtonsContainer );
      sim.activeSimScreensProperty.link( simScreens => {
        screenButtonsContainer.children = simScreens.map( screen => screenButtonMap.get( screen )! );
      } );

      // Screen buttons centered.  These buttons are centered around the origin in the screenButtonsContainer, so the
      // screenButtonsContainer can be put at the center of the navbar.
      ManualConstraint.create( this, [ this.background, screenButtonsContainer ], ( backgroundProxy, screenButtonsContainerProxy ) => {
        screenButtonsContainerProxy.center = backgroundProxy.center;
      } );

      // home button to the left of screen buttons
      RelaxedManualConstraint.create( this.barContents, [ this.homeButton, ...screenButtons ], ( homeButtonProxy, ...screenButtonProxies ) => {

        const visibleScreenButtonProxies = screenButtonProxies.filter( proxy => proxy && proxy.visible );

        // Find the left-most visible button. We don't want the extra padding of the alignbox to be included in this calculation,
        // for backwards compatibility, so it's a lot more complicated.
        if ( homeButtonProxy && visibleScreenButtonProxies.length > 0 ) {
          homeButtonProxy.right = Math.min( ...visibleScreenButtonProxies.map( proxy => proxy!.left ) ) - HOME_BUTTON_RIGHT_MARGIN;
        }
      } );

      // max width relative to position of home button
      ManualConstraint.create( this.barContents, [ this.homeButton, titleText ], ( homeButtonProxy, titleTextProxy ) => {
        titleTextProxy.maxWidth = homeButtonProxy.left - TITLE_LEFT_MARGIN - TITLE_RIGHT_MARGIN;
      } );

      sim.simNameProperty.link( simName => {
        allNavBarScreenButtons.forEach( screenButton => {
          screenButton.voicingContextResponse = simName;
        } );
      } );
    }

    // initial layout (that doesn't need to change when we are re-laid out)
    titleText.left = TITLE_LEFT_MARGIN;
    titleText.centerY = NAVIGATION_BAR_SIZE.height / 2;
    phetButton.centerY = NAVIGATION_BAR_SIZE.height / 2;

    ManualConstraint.create( this, [ this.background, phetButton ], ( backgroundProxy, phetButtonProxy ) => {
      phetButtonProxy.right = backgroundProxy.right - PHET_BUTTON_RIGHT_MARGIN;
    } );

    ManualConstraint.create( this.barContents, [ phetButton, this.a11yButtonsHBox ], ( phetButtonProxy, a11yButtonsHBoxProxy ) => {
      a11yButtonsHBoxProxy.right = phetButtonProxy.left - PHET_BUTTON_LEFT_MARGIN;

      // The icon is vertically adjusted in KeyboardHelpButton, so that the centers can be aligned here
      a11yButtonsHBoxProxy.centerY = phetButtonProxy.centerY;
    } );

    if ( this.localeNode ) {
      ManualConstraint.create( this.barContents, [ phetButton, this.a11yButtonsHBox, this.localeNode ], ( phetButtonProxy, a11yButtonsHBoxProxy, localeNodeProxy ) => {
        a11yButtonsHBoxProxy.right = phetButtonProxy.left - PHET_BUTTON_LEFT_MARGIN;

        // The icon is vertically adjusted in KeyboardHelpButton, so that the centers can be aligned here
        a11yButtonsHBoxProxy.centerY = phetButtonProxy.centerY;

        localeNodeProxy.centerY = phetButtonProxy.centerY;
        localeNodeProxy.right = Math.min( a11yButtonsHBoxProxy.left, phetButtonProxy.left ) - PHET_BUTTON_LEFT_MARGIN;
      } );
    }

    this.layout( 1, NAVIGATION_BAR_SIZE.width, NAVIGATION_BAR_SIZE.height );

    const simResourcesContainer = new Node( {

      // pdom
      tagName: 'div',
      containerTagName: 'section',
      labelTagName: 'h2',
      labelContent: JoistStrings.a11y.simResourcesStringProperty,
      pdomOrder: [
        this.a11yButtonsHBox,
        phetButton
      ].filter( node => node !== undefined )
    } );

    simResourcesContainer.ariaLabelledbyAssociations = [ {
      thisElementName: PDOMPeer.CONTAINER_PARENT,
      otherElementName: PDOMPeer.LABEL_SIBLING,
      otherNode: simResourcesContainer
    } ];
    this.addChild( simResourcesContainer );
  }

  /**
   * Called when the navigation bar layout needs to be updated, typically when the browser window is resized.
   */
  public layout( scale: number, width: number, height: number ): void {
    // resize the background
    this.background.rectWidth = width;
    this.background.rectHeight = height;

    // scale the entire bar contents
    this.barContents.setScaleMagnitude( scale );
  }

  public static readonly NAVIGATION_BAR_SIZE = NAVIGATION_BAR_SIZE;
}

joist.register( 'NavigationBar', NavigationBar );
export default NavigationBar;