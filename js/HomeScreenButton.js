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
import merge from '../../phet-core/js/merge.js';
import PhetColorScheme from '../../scenery-phet/js/PhetColorScheme.js';
import PhetFont from '../../scenery-phet/js/PhetFont.js';
import Touch from '../../scenery/js/input/Touch.js';
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

      // a11y
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

    // container for the icon and frame, children updated when isSelectedProperty changes
    const iconWithFrame = new Node();

    // text for the button
    const text = new Text( screen.name, {
      tandem: options.tandem.createTandem( 'text' )
    } );

    // The children are needed in the VBox constructor, but the rest of the options should be mutated later.
    super( { children: [ iconWithFrame, text ] } );

    // sets the opacity of the icon and fill of the text
    const setOpacityAndFill = () => {
      const opacity = ( isSelectedProperty.value || isHighlightedProperty.value ) ? 1 : 0.5;
      largeIcon.opacity = opacity;
      smallIcon.opacity = opacity;
      text.fill = ( isSelectedProperty.value || isHighlightedProperty.value ) ? 'white' : 'gray';
    };

    // update pieces that change when the button is selected or unselected
    isSelectedProperty.link( isSelected => {
      iconWithFrame.children = isSelected ? [ largeFrame, largeIcon ] : [ smallFrame, smallIcon ];
      text.font = new PhetFont( isSelected ? 42 : 18 );
      text.maxWidth = iconWithFrame.width;
      setOpacityAndFill();
      isSelected ? this.setSpacing( 0 ) : this.setSpacing( 3 ); // empirically determined to match

      // update the VBox layout after changing the size of its children
      this.updateLayout();
    } );

    // update the appearance when the button is highlighted
    isHighlightedProperty.link( isHighlighted => {
      largeFrame.setHighlighted( isHighlighted );
      setOpacityAndFill();
    } );

    // if the button is already selected, then set the sim's screen to be its corresponding screen. otherwise,
    // make the button selected
    const buttonDown = () => {
      if ( isSelectedProperty.value ) {
        homeScreenModel.screenProperty.value = screen;
      }
      else {
        homeScreenModel.selectedScreenProperty.value = screen;
      }
    };

    const fireListener = new FireListener( {
      fireOnDown: true, // to match prior behavior
      fire: buttonDown,
      tandem: options.tandem.createTandem( 'inputListener' )
    } );
    this.addInputListener( fireListener );
    this.addInputListener( { click: () => { fireListener.fire( null ); } } );
    this.addInputListener( { focus: () => { !isSelectedProperty.value && fireListener.fire( null ); } } );
    this.addInputListener( {
      focus: () => isHighlightedProperty.set( true ),
      blur: () => isHighlightedProperty.set( false ),
      over: () => isHighlightedProperty.set( true ),
      out: () => isHighlightedProperty.set( false )
    } );

    // If you touch an unselected button, it become selected. If then without lifting your finger you swipe over to the
    // next button, that one becomes selected instead.
    this.addInputListener( {
      over: event => {
        if ( event.pointer instanceof Touch ) {
          homeScreenModel.selectedScreenProperty.value = screen;
        }
      }
    } );

    this.on( 'bounds', () => {
      this.mouseArea = this.touchArea = this.localBounds; // cover the gap in the VBox between the frame and text
    } );

    this.mutate( options );
  }
}

joist.register( 'ScreenButton', HomeScreenButton );
export default HomeScreenButton;