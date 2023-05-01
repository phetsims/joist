// Copyright 2020-2023, University of Colorado Boulder

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
import { Shape } from '../../kite/js/imports.js';
import merge from '../../phet-core/js/merge.js';
import optionize from '../../phet-core/js/optionize.js';
import IntentionalAny from '../../phet-core/js/types/IntentionalAny.js';
import PhetColorScheme from '../../scenery-phet/js/PhetColorScheme.js';
import PhetFont from '../../scenery-phet/js/PhetFont.js';
import { FireListener, Node, PDOMPeer, Rectangle, Text, VBox, VBoxOptions, Voicing, VoicingOptions } from '../../scenery/js/imports.js';
import EventType from '../../tandem/js/EventType.js';
import Frame from './Frame.js';
import HomeScreenModel from './HomeScreenModel.js';
import joist from './joist.js';
import Screen from './Screen.js';
import Utterance from '../../utterance-queue/js/Utterance.js';
import PickRequired from '../../phet-core/js/types/PickRequired.js';

// constants
const LARGE_ICON_HEIGHT = 140;

type SelfOptions = {
  showUnselectedHomeScreenIconFrame?: boolean;
};
type ParentOptions = VoicingOptions & VBoxOptions;
export type HomeScreenButtonOptions = SelfOptions & ParentOptions & PickRequired<ParentOptions, 'tandem'>;

class HomeScreenButton extends Voicing( VBox ) {
  public readonly screen: Screen<IntentionalAny, IntentionalAny>;

  public constructor( screen: Screen<IntentionalAny, IntentionalAny>, homeScreenModel: HomeScreenModel, providedOptions?: HomeScreenButtonOptions ) {

    const options = optionize<HomeScreenButtonOptions, SelfOptions, ParentOptions>()( {
      cursor: 'pointer',
      showUnselectedHomeScreenIconFrame: false, // put a frame around unselected home screen icons

      // pdom
      tagName: 'button',
      appendDescription: true,
      containerTagName: 'li',

      // phet-io
      phetioEventType: EventType.USER,
      phetioDocumentation: 'A button on the home screen for choosing a simulation screen'
    }, providedOptions );

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

    assert && assert( screen.homeScreenIcon, `homeScreenIcon is required for screen ${screen.nameProperty.value}` );
    const homeScreenIcon = screen.homeScreenIcon!;

    // create an icon for each size
    const smallIcon = new Node( {
      children: [ homeScreenIcon ],
      scale: smallIconHeight / homeScreenIcon.height
    } );
    const largeIcon = new Node( {
      children: [ homeScreenIcon ],
      scale: LARGE_ICON_HEIGHT / homeScreenIcon.height
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
    const nodeContainer = new Node( {

      // pdom - the icon may have focusable components in its graphic but they should be invisible for Interactive
      // Description, the button is all we need for accessibility
      pdomVisible: false
    } );

    // text for the button
    const text = new Text( screen.nameProperty, {
      tandem: options.tandem.createTandem( 'text' ),
      stringPropertyOptions: { phetioReadOnly: true } // text is updated via screen.nameProperty
    } );

    super( merge( { children: [ nodeContainer, text ] }, options ) );

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
    } );

    // update the appearance when the button is highlighted
    isHighlightedProperty.link( isHighlighted => {
      largeFrame.setHighlighted( isHighlighted );
      setOpacityAndFill();
    } );

    // Create a new Utterance that isn't registered through Voicing so that it isn't silenced when the
    // home screen is hidden upon selection. (invisible nodes have their voicing silenced).
    const buttonSelectionUtterance = new Utterance();

    let buttonWasAlreadySelected = false;

    // If the button is already selected, then set the sim's screen to be its corresponding screen. Otherwise, make the
    // button selected. The one exception to the former sentence is due to the desired behavior of selecting on
    // touchover, in which case we need to guard on touchdown since we don't want to double fire for touchover and
    // touchdown, see https://github.com/phetsims/joist/issues/624
    const buttonFired = () => {

      const pointerIsTouchLike = fireListener.pointer && fireListener.pointer.isTouchLike();

      if ( isSelectedProperty.value && ( !pointerIsTouchLike || buttonWasAlreadySelected ) ) {

        // Select the screen that corresponds to this button.  This will make that screen appear to the user and the
        // home screen disappear.
        homeScreenModel.screenProperty.value = screen;

        this.voicingSpeakFullResponse( {
          objectResponse: null,
          hintResponse: null,
          utterance: buttonSelectionUtterance
        } );
      }
      else {

        // Select the screen button.  This causes the button to enlarge, but doesn't go to the screen.
        homeScreenModel.selectedScreenProperty.value = screen;

        this.voicingSpeakFullResponse( {
          objectResponse: null,
          contextResponse: null
        } );
      }
    };

    const fireListener = new FireListener( {
      fire: buttonFired,
      tandem: options.tandem.createTandem( 'fireListener' )
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

    // If you touch an unselected button, it becomes selected. If then without lifting your finger you swipe over to the
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
    this.boundsProperty.link( () => {
      this.mouseArea = this.touchArea = Shape.bounds( this.localBounds );
    } );
  }
}

joist.register( 'HomeScreenButton', HomeScreenButton );
export default HomeScreenButton;