// Copyright 2020, University of Colorado Boulder

/**
 * A HomeScreenButton is displayed on the HomeScreen for choosing a screen. The button can be in a selected or
 * unselected state - it's large with a yellow frame in its selected state, and small in its unselected state.
 * Selecting the button when in its "selected" state will result in that screen being chosen.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */

import BooleanProperty from '../../axon/js/BooleanProperty.js';
import DerivedProperty from '../../axon/js/DerivedProperty.js';
import Utils from '../../dot/js/Utils.js';
import Shape from '../../kite/js/Shape.js';
import merge from '../../phet-core/js/merge.js';
import PhetColorScheme from '../../scenery-phet/js/PhetColorScheme.js';
import PhetFont from '../../scenery-phet/js/PhetFont.js';
import PDOMPeer from '../../scenery/js/accessibility/pdom/PDOMPeer.js';
import FireListener from '../../scenery/js/listeners/FireListener.js';
import Node from '../../scenery/js/nodes/Node.js';
import Rectangle from '../../scenery/js/nodes/Rectangle.js';
import Text from '../../scenery/js/nodes/Text.js';
import VBox from '../../scenery/js/nodes/VBox.js';
import EventType from '../../tandem/js/EventType.js';
import Tandem from '../../tandem/js/Tandem.js';
import Frame from './Frame.js';
import joist from './joist.js';

// constants
const LARGE_ICON_HEIGHT = 140;

class HomeScreenButton extends VBox {

  /**
   * @param {Screen} screen
   * @param {HomeScreenModel} homeScreenModel
   * @param {Object} [options]
   * @constructor
   */
  constructor( screen, homeScreenModel, options ) {

    options = merge( {
      cursor: 'pointer',
      resize: false, // don't resize the VBox or it will shift down when the border becomes thicker
      showUnselectedHomeScreenIconFrame: false, // put a frame around unselected home screen icons

      // pdom
      tagName: 'button',
      appendDescription: true,
      containerTagName: 'li',

      // phet-io
      tandem: Tandem.REQUIRED,
      phetioEventType: EventType.USER,
      phetioDocumentation: 'A button on the home screen for choosing a simulation screen'
    }, options );

    // derives a boolean value from homeScreenModel.selectedScreenProperty that says if this button is selected on the
    // home screen.
    const isSelectedProperty = new DerivedProperty( [ homeScreenModel.selectedScreenProperty ], selectedScreen => {
      return selectedScreen === screen;
    } );

    // true if this button has focus or mouseover
    const isHighlightedProperty = new BooleanProperty( false );

    // maps the number of screens to a scale for the small icons. The scale is percentage of LARGE_ICON_HEIGHT.
    let smallIconScale = Utils.linear( 2, 4, 0.875, 0.50, homeScreenModel.simScreens.length );
    if ( homeScreenModel.simScreens.length >= 5 ) {
      smallIconScale = 0.4;
    }
    const smallIconHeight = smallIconScale * LARGE_ICON_HEIGHT;

    // create an icon for each size
    const smallIcon = new Node( {
      children: [ screen.homeScreenIcon ],
      scale: smallIconHeight / screen.homeScreenIcon.height
    } );
    const largeIcon = new Node( {
      children: [ screen.homeScreenIcon ],
      scale: LARGE_ICON_HEIGHT / screen.homeScreenIcon.height
    } );

    // create a frame for each size
    const smallFrame = new Rectangle( 0, 0, smallIcon.width, smallIcon.height, {
      stroke: options.showUnselectedHomeScreenIconFrame ? PhetColorScheme.SCREEN_ICON_FRAME : null,
      lineWidth: 0.7
    } );
    const largeFrame = new Frame( largeIcon );

    // create one node for the each of large and small frame + icon pairs
    const smallNode = new Node( { children: [ smallFrame, smallIcon ] } );
    const largeNode = new Node( { children: [ largeFrame, largeIcon ] } );

    // container for the icon and frame, children updated when isSelectedProperty changes
    const nodeContainer = new Node();

    // text for the button
    const text = new Text( screen.nameProperty.value, {
      tandem: options.tandem.createTandem( 'text' ),
      textPropertyOptions: { phetioReadOnly: true } // text is updated via screen.nameProperty
    } );

    super( merge( { children: [ nodeContainer, text ] }, options ) );

    // @public (read-only)
    this.screen = screen;

    this.addAriaDescribedbyAssociation( {
      otherNode: this,
      otherElementName: PDOMPeer.DESCRIPTION_SIBLING,
      thisElementName: PDOMPeer.PRIMARY_SIBLING
    } );

    // create large and small settings
    const settings = {
      small: {
        node: [ smallNode ],
        font: new PhetFont( 18 ),
        spacing: 3
      },
      large: {
        node: [ largeNode ],
        font: new PhetFont( 42 ),
        spacing: 0
      }
    };

    // sets the opacity of the icon and fill of the text
    const setOpacityAndFill = () => {
      const opacity = ( isSelectedProperty.value || isHighlightedProperty.value ) ? 1 : 0.5;
      largeIcon.opacity = opacity;
      smallIcon.opacity = opacity;
      text.fill = ( isSelectedProperty.value || isHighlightedProperty.value ) ? 'white' : 'gray';
    };

    // update pieces that change when the button is selected or unselected
    isSelectedProperty.link( isSelected => {
      const data = isSelected ? settings.large : settings.small;

      // apply settings for the current size
      nodeContainer.children = data.node;
      text.font = data.font;
      text.maxWidth = nodeContainer.width;
      setOpacityAndFill();
      this.setSpacing( data.spacing );

      // update the VBox layout after changing the size of its children
      this.updateLayout();
    } );

    // update the appearance when the button is highlighted
    isHighlightedProperty.link( isHighlighted => {
      largeFrame.setHighlighted( isHighlighted );
      setOpacityAndFill();
    } );

    // update the text when the screen name changes
    screen.nameProperty.link( name => {
      text.text = name;
      this.updateLayout();
    } );

    let buttonWasAlreadySelected = false;

    // If the button is already selected, then set the sim's screen to be its corresponding screen. Otherwise, make the
    // button selected. The one exception to the former sentence is due to the desired behavior of selecting on
    // touchover, in which case we need to guard on touchdown since we don't want to double fire for touchover and
    // touchdown, see https://github.com/phetsims/joist/issues/624
    const buttonFired = () => {

      // TODO: Why doesn't the following work?  Seems like it should.  See https://github.com/phetsims/joist/issues/689.
      // const pointerIsTouchLike = fireListener.pointer && fireListener.pointer.isTouchLike();
      const pointerIsTouchLike = fireListener.overPointers.length === 1 && fireListener.overPointers[ 0 ].isTouchLike();

      if ( isSelectedProperty.value && ( !pointerIsTouchLike || buttonWasAlreadySelected ) ) {

        // Select the screen that corresponds to this button.  This will make that screen appear to the user and the
        // home screen disappear.
        homeScreenModel.screenProperty.value = screen;
      }
      else {

        // Select the screen button.  This causes the button to enlarge, but doesn't go to the screen.
        homeScreenModel.selectedScreenProperty.value = screen;
      }
    };

    const fireListener = new FireListener( {
      fire: buttonFired,
      tandem: options.tandem.createTandem( 'inputListener' )
    } );
    this.addInputListener( fireListener );
    this.addInputListener( { focus: event => { !isSelectedProperty.value && fireListener.fire( event ); } } );

    // when a screen reader is in use, the button may be selected with the virtual cursor
    // without focus landing on the button - toggle focus (and therefore size) in this case
    this.addInputListener( { click: () => this.focus() } );

    this.addInputListener( {
      focus: () => isHighlightedProperty.set( true ),
      blur: () => isHighlightedProperty.set( false ),
      over: () => isHighlightedProperty.set( true ),
      out: () => isHighlightedProperty.set( false )
    } );

    // If you touch an unselected button, it become selected. If then without lifting your finger you swipe over to the
    // next button, that one becomes selected instead.
    const onTouchLikeOver = () => {
      buttonWasAlreadySelected = homeScreenModel.selectedScreenProperty.value === screen;
      homeScreenModel.selectedScreenProperty.value = screen;
    };
    this.addInputListener( {
      touchover: onTouchLikeOver,
      penover: onTouchLikeOver
    } );

    // set the mouseArea and touchArea to be the whole local bounds of this node, because if it just relies on the
    // bounds of the icon and text, then there is a gap in between them. Since the button can change size, this
    // assignment needs to happen anytime the bounds change.
    this.boundsProperty.lazyLink( () => {
      this.mouseArea = this.touchArea = Shape.bounds( this.localBounds );
    } );
  }
}

joist.register( 'HomeScreenButton', HomeScreenButton );
export default HomeScreenButton;