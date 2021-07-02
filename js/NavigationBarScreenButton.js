// Copyright 2013-2021, University of Colorado Boulder

/**
 * Button for a single screen in the navigation bar, shows the text and the navigation bar icon.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 * @author Chris Malley (PixelZoom, Inc.)
 */

import DerivedProperty from '../../axon/js/DerivedProperty.js';
import Property from '../../axon/js/Property.js';
import Utils from '../../dot/js/Utils.js';
import Shape from '../../kite/js/Shape.js';
import merge from '../../phet-core/js/merge.js';
import PhetColorScheme from '../../scenery-phet/js/PhetColorScheme.js';
import PhetFont from '../../scenery-phet/js/PhetFont.js';
import FocusHighlightPath from '../../scenery/js/accessibility/FocusHighlightPath.js';
import Node from '../../scenery/js/nodes/Node.js';
import Rectangle from '../../scenery/js/nodes/Rectangle.js';
import Text from '../../scenery/js/nodes/Text.js';
import VBox from '../../scenery/js/nodes/VBox.js';
import PushButtonModel from '../../sun/js/buttons/PushButtonModel.js';
import Tandem from '../../tandem/js/Tandem.js';
import HighlightNode from './HighlightNode.js';
import joist from './joist.js';

// constants
const HIGHLIGHT_SPACING = 4;
const getHighlightWidth = overlay => overlay.width + ( 2 * HIGHLIGHT_SPACING );

class NavigationBarScreenButton extends Node {

  /**
   * @param {Property.<string>} navigationBarFillProperty - the color of the navbar, as a string.
   * @param {Property.<Screen>} screenProperty
   * @param {Screen} screen
   * @param {number} simScreenIndex - the index (within sim screens only) of the screen corresponding to this button
   * @param {number} navBarHeight
   * @param {Object} [options]
   */
  constructor( navigationBarFillProperty, screenProperty, screen, simScreenIndex, navBarHeight, options ) {

    assert && assert( screen.nameProperty.value, `name is required for screen ${simScreenIndex}` );
    assert && assert( screen.navigationBarIcon, `navigationBarIcon is required for screen ${screen.nameProperty.value}` );

    options = merge( {
      cursor: 'pointer',
      tandem: Tandem.REQUIRED,
      phetioDocumentation: `Button in the navigation bar that selects the '${screen.tandem.name}' screen`,
      maxButtonWidth: null, // {number|null} the maximum width of the button, causes text and/or icon to be scaled down if necessary

      // pdom
      tagName: 'button',
      containerTagName: 'li',
      descriptionContent: screen.descriptionContent,
      appendDescription: true
    }, options );

    assert && assert( !options.innerContent, 'NavigationBarScreenButton sets its own innerContent' );

    super();

    screen.pdomDisplayNameProperty.link( name => {
      this.innerContent = name;
    } );

    // icon
    const icon = new Node( {
      children: [ screen.navigationBarIcon ], // wrap in case this icon is used in multiple place (eg, home screen and navbar)
      maxHeight: 0.625 * navBarHeight,
      tandem: options.tandem.createTandem( 'icon' ),

      // pdom - the icon may have focusable components in its graphic, but they should be invisible for Interactive
      // Description, all accessibility should go through this button
      pdomVisible: false
    } );

    // frame around the icon
    const iconFrame = new Rectangle( 0, 0, icon.width, icon.height );

    const iconAndFrame = new Node( {
      children: [ icon, iconFrame ]
    } );

    const text = new Text( screen.nameProperty.value, {
      font: new PhetFont( 10 ),
      tandem: options.tandem.createTandem( 'text' ),
      textPropertyOptions: { phetioReadOnly: true } // text is updated via screen.nameProperty
    } );

    // spacing set by Property link below
    const iconAndText = new VBox( {
      children: [ iconAndFrame, new Node( { children: [ text ] } ) ],
      pickable: false,
      usesOpacity: true, // hint, since we change its opacity
      maxHeight: navBarHeight
    } );

    // add a transparent overlay for input handling and to size touchArea/mouseArea
    const overlay = new Rectangle( 0, 0, iconAndText.width, iconAndText.height, { center: iconAndText.center } );

    // highlights
    const highlightWidth = getHighlightWidth( overlay );
    const brightenHighlight = new HighlightNode( highlightWidth, overlay.height, {
      center: iconAndText.center,
      fill: 'white'
    } );
    const darkenHighlight = new HighlightNode( highlightWidth, overlay.height, {
      center: iconAndText.center,
      fill: 'black'
    } );

    this.addChild( iconAndText );
    this.addChild( overlay );
    this.addChild( brightenHighlight );
    this.addChild( darkenHighlight );

    // Is this button's screen selected?
    const selectedProperty = new DerivedProperty( [ screenProperty ], currentScreen => ( currentScreen === screen ) );

    // @public (phet-io) Create the button model, needs to be public so that PhET-iO wrappers can hook up to it if
    // needed. Note it shares a tandem with this, so the emitter will be instrumented as a child of the button.
    // Note that this buttonModel will always be phetioReadOnly false despite the parent value.
    this.buttonModel = new PushButtonModel( {
      listener: () => {
        screenProperty.value = screen;
      },
      tandem: options.tandem,

      // Navigation bar screen buttons by default do not have a featured enabledProperty.
      enabledPropertyOptions: { phetioFeatured: false }
    } );

    // Hook up the input listener
    const pressListener = this.buttonModel.createPressListener( {
      tandem: options.tandem.createTandem( 'pressListener' ),
      phetioDocumentation: 'Indicates when the screen button has been pressed or released'
    } );
    this.addInputListener( pressListener );

    // manage interaction feedback
    Property.multilink(
      [ selectedProperty, this.buttonModel.looksPressedProperty, this.buttonModel.looksOverProperty, navigationBarFillProperty, this.buttonModel.enabledProperty ],
      ( selected, looksPressed, looksOver, navigationBarFill, enabled ) => {

        const useDarkenHighlights = ( navigationBarFill !== 'black' );

        // Color match yellow with the PhET Logo
        const selectedTextColor = useDarkenHighlights ? 'black' : PhetColorScheme.BUTTON_YELLOW;
        const unselectedTextColor = useDarkenHighlights ? 'gray' : 'white';

        text.fill = selected ? selectedTextColor : unselectedTextColor;
        iconAndText.opacity = selected ? 1.0 : ( looksPressed ? 0.65 : 0.5 );
        brightenHighlight.visible = !useDarkenHighlights && enabled && ( looksOver || looksPressed );
        darkenHighlight.visible = useDarkenHighlights && enabled && ( looksOver || looksPressed );

        // Put a frame around the screen icon, depending on the navigation bar background color.
        let iconFrameStroke = null;
        if ( screen.showScreenIconFrameForNavigationBarFill === 'black' && navigationBarFill === 'black' ) {
          iconFrameStroke = PhetColorScheme.SCREEN_ICON_FRAME;
        }
        else if ( screen.showScreenIconFrameForNavigationBarFill === 'white' && navigationBarFill === 'white' ) {
          iconFrameStroke = 'black'; // black frame on a white navbar
        }
        iconFrame.stroke = iconFrameStroke;
      } );

    // Keep the cursor in sync with if the button is enabled. This doesn't need to be disposed.
    this.buttonModel.enabledProperty.link( enabled => { this.cursor = enabled ? options.cursor : null; } );

    // Update the button's layout
    const updateLayout = () => {

      // adjust the vertical space between icon and text, see https://github.com/phetsims/joist/issues/143
      iconAndText.spacing = Math.max( 0, 12 - text.height );

      // adjust the overlay
      overlay.setRect( 0, 0, iconAndText.width, overlay.height );
      overlay.center = iconAndText.center;

      // adjust the highlights
      brightenHighlight.spacing = darkenHighlight.spacing = getHighlightWidth( overlay );
      brightenHighlight.center = darkenHighlight.center = iconAndText.center;
    };

    // Constrain text and icon width, if necessary
    if ( options.maxButtonWidth && ( this.width > options.maxButtonWidth ) ) {
      text.maxWidth = icon.maxWidth = options.maxButtonWidth - ( this.width - iconAndText.width );
      updateLayout();
      assert && assert( Utils.toFixed( this.width, 0 ) === Utils.toFixed( options.maxButtonWidth, 0 ),
        `this.width ${this.width} !== options.maxButtonWidth ${options.maxButtonWidth}` );
    }
    else {

      // Don't allow the text to grow larger than the icon if changed later on using PhET-iO, see #438
      // Text is allowed to go beyond the bounds of the icon, hence we use `this.width` instead of `icon.width`
      text.maxWidth = this.width;
    }

    // Update the button's text and layout when the screen name changes
    screen.nameProperty.link( name => {
      text.text = name;
      updateLayout();
    } );

    // pdom - Pass a shape to the focusHighlight to prevent dilation, then tweak the top up just a hair.
    const highlightLineWidth = FocusHighlightPath.getOuterLineWidthFromNode( this );
    this.focusHighlight = Shape.bounds( this.bounds.withMinY( this.bounds.minY - highlightLineWidth / 2 ) );

    this.mutate( options );
  }
}

joist.register( 'NavigationBarScreenButton', NavigationBarScreenButton );
export default NavigationBarScreenButton;