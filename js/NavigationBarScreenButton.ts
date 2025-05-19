// Copyright 2013-2025, University of Colorado Boulder

/**
 * Button for a single screen in the navigation bar, shows the text and the navigation bar icon.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 * @author Chris Malley (PixelZoom, Inc.)
 */

import DerivedProperty from '../../axon/js/DerivedProperty.js';
import Multilink from '../../axon/js/Multilink.js';
import type Property from '../../axon/js/Property.js';
import type TReadOnlyProperty from '../../axon/js/TReadOnlyProperty.js';
import { clamp } from '../../dot/js/util/clamp.js';
import Shape from '../../kite/js/Shape.js';
import optionize from '../../phet-core/js/optionize.js';
import type PickRequired from '../../phet-core/js/types/PickRequired.js';
import PhetColorScheme from '../../scenery-phet/js/PhetColorScheme.js';
import PhetFont from '../../scenery-phet/js/PhetFont.js';
import Voicing, { type VoicingOptions } from '../../scenery/js/accessibility/voicing/Voicing.js';
import VBox from '../../scenery/js/layout/nodes/VBox.js';
import Node, { type NodeOptions } from '../../scenery/js/nodes/Node.js';
import Rectangle from '../../scenery/js/nodes/Rectangle.js';
import Text from '../../scenery/js/nodes/Text.js';
import Color from '../../scenery/js/util/Color.js';
import PushButtonModel from '../../sun/js/buttons/PushButtonModel.js';
import Tandem from '../../tandem/js/Tandem.js';
import HighlightNode from './HighlightNode.js';
import joist from './joist.js';
import { type AnyScreen } from './Screen.js';
import { toFixed } from '../../dot/js/util/toFixed.js';
import type StrictOmit from '../../phet-core/js/types/StrictOmit.js';

// constants
const HIGHLIGHT_SPACING = 4;
const getHighlightWidth = ( overlay: Node ) => overlay.width + ( 2 * HIGHLIGHT_SPACING );

type SelfOptions = {
  maxButtonWidth?: number | null;
};
type ParentOptions = VoicingOptions & StrictOmit<NodeOptions, 'accessibleName'>;
type NavigationBarScreenButtonOptions = SelfOptions & ParentOptions & PickRequired<ParentOptions, 'tandem'>;

class NavigationBarScreenButton extends Voicing( Node ) {
  private readonly buttonModel: PushButtonModel;

  public readonly screen: AnyScreen;

  /**
   * @param navigationBarFillProperty - the color of the navbar, as a string.
   * @param screenProperty
   * @param screen
   * @param simScreenIndex - the index (within sim screens only) of the screen corresponding to this button
   * @param navBarHeight
   * @param [providedOptions]
   */
  public constructor( navigationBarFillProperty: TReadOnlyProperty<Color>, screenProperty: Property<AnyScreen>,
                      screen: AnyScreen, simScreenIndex: number, navBarHeight: number,
                      providedOptions: NavigationBarScreenButtonOptions ) {

    assert && assert( screen.nameProperty.value, `name is required for screen ${simScreenIndex}` );
    assert && assert( screen.navigationBarIcon, `navigationBarIcon is required for screen ${screen.nameProperty.value}` );

    const options = optionize<NavigationBarScreenButtonOptions, SelfOptions, ParentOptions>()( {
      cursor: 'pointer',
      phetioDocumentation: `Button in the navigation bar that selects the '${screen.tandem.name}' screen`,
      maxButtonWidth: null, // {number|null} the maximum width of the button, causes text and/or icon to be scaled down if necessary

      // pdom
      tagName: 'button',
      containerTagName: 'li',
      accessibleHelpText: screen.screenButtonsHelpText,
      appendDescription: true,

      // voicing
      voicingHintResponse: screen.screenButtonsHelpText
    }, providedOptions );

    super();

    this.screen = screen;

    screen.pdomDisplayNameProperty.link( name => {
      this.accessibleName = name;
      this.voicingNameResponse = name;
    } );

    assert && assert( screen.navigationBarIcon, 'navigationBarIcon should exist' );
    // icon
    const icon = new Node( {
      children: [ screen.navigationBarIcon! ], // wrap in case this icon is used in multiple place (eg, home screen and navbar)
      maxHeight: 0.625 * navBarHeight,

      // pdom - the icon may have focusable components in its graphic, but they should be invisible for Interactive
      // Description, all accessibility should go through this button
      pdomVisible: false
    } );

    // frame around the icon
    const iconFrame = new Rectangle( 0, 0, icon.width, icon.height );

    const iconAndFrame = new Node( {
      children: [ icon, iconFrame ]
    } );

    const text = new Text( screen.nameProperty, {
      font: new PhetFont( 10 )
    } );

    // spacing set by Property link below
    const iconAndText = new VBox( {
      children: [ iconAndFrame, text ],
      pickable: false,
      usesOpacity: true, // hint, since we change its opacity
      maxHeight: navBarHeight
    } );

    // add a transparent overlay for input handling and to size touchArea/mouseArea
    const overlay = new Rectangle( { rectBounds: iconAndText.bounds } );

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

    // Is this button's screen selected?
    const selectedProperty = new DerivedProperty( [ screenProperty ], currentScreen => ( currentScreen === screen ) );

    // (phet-io) Create the button model, needs to be public so that PhET-iO wrappers can hook up to it if
    // needed. Note it shares a tandem with this, so the emitter will be instrumented as a child of the button.
    // Note that this buttonModel will always be phetioReadOnly false despite the parent value.
    this.buttonModel = new PushButtonModel( {
      listener: () => {

        screenProperty.value !== screen && this.voicingSpeakFullResponse( {
          objectResponse: null,
          hintResponse: null
        } );
        screenProperty.value = screen;
      },
      tandem: options.tandem,
      phetioEnabledPropertyInstrumented: false
    } );

    // Hook up the input listener
    const pressListener = this.buttonModel.createPressListener( {
      tandem: Tandem.OPT_OUT // PushButtonModel provides a firedEmitter which is sufficient
    } );
    this.addInputListener( pressListener );

    this.addInputListener( {
      focus: () => {
        this.voicingSpeakFullResponse( {
          objectResponse: null,
          contextResponse: null
        } );
      }
    } );

    // manage interaction feedback
    Multilink.multilink(
      [ selectedProperty, this.buttonModel.looksPressedProperty, this.buttonModel.isOverOrFocusedProperty, navigationBarFillProperty, this.buttonModel.enabledProperty ],
      ( selected, looksPressed, overOrFocused, navigationBarFill, enabled ) => {

        const useDarkenHighlights = !navigationBarFill.equals( Color.BLACK );

        // Color match yellow with the PhET Logo
        const selectedTextColor = useDarkenHighlights ? 'black' : PhetColorScheme.BUTTON_YELLOW;
        const unselectedTextColor = useDarkenHighlights ? 'gray' : 'white';

        text.fill = selected ? selectedTextColor : unselectedTextColor;
        iconAndText.opacity = selected ? 1.0 : ( looksPressed ? 0.65 : 0.5 );

        brightenHighlight.visible = !useDarkenHighlights && enabled && ( overOrFocused || looksPressed );
        darkenHighlight.visible = useDarkenHighlights && enabled && ( overOrFocused || looksPressed );

        // Put a frame around the screen icon, depending on the navigation bar background color.
        if ( screen.showScreenIconFrameForNavigationBarFill === 'black' && navigationBarFill.equals( Color.BLACK ) ) {
          iconFrame.stroke = PhetColorScheme.SCREEN_ICON_FRAME;
        }

        else if ( screen.showScreenIconFrameForNavigationBarFill === 'white' && navigationBarFill.equals( Color.WHITE ) ) {
          iconFrame.stroke = 'black'; // black frame on a white navbar
        }
        else {
          iconFrame.stroke = 'transparent'; // keep the same bounds for simplicity
        }
      } );

    // Keep the cursor in sync with if the button is enabled. This doesn't need to be disposed.
    this.buttonModel.enabledProperty.link( enabled => {
      this.cursor = enabled ? options.cursor : null;
    } );

    // Update the button's layout
    const updateLayout = () => {

      // adjust the vertical space between icon and text, see https://github.com/phetsims/joist/issues/143
      iconAndText.spacing = clamp( 12 - text.height, 0, 3 );

      // adjust the overlay
      overlay.setRectBounds( iconAndText.bounds );

      // adjust the highlights
      brightenHighlight.spacing = darkenHighlight.spacing = getHighlightWidth( overlay );
      brightenHighlight.center = darkenHighlight.center = iconAndText.center;
    };

    // Update the button's layout when the screen name changes
    iconAndText.boundsProperty.lazyLink( updateLayout );
    text.boundsProperty.link( updateLayout );

    this.children = [
      iconAndText,
      overlay,
      brightenHighlight,
      darkenHighlight
    ];

    const needsIconMaxWidth = options.maxButtonWidth && ( this.width > options.maxButtonWidth );

    // Constrain text and icon width, if necessary
    if ( needsIconMaxWidth ) {
      text.maxWidth = icon.maxWidth = options.maxButtonWidth! - ( this.width - iconAndText.width );
    }
    else {
      // Don't allow the text to grow larger than the icon if changed later on using PhET-iO, see #438
      // Text is allowed to go beyond the bounds of the icon, hence we use `this.width` instead of `icon.width`
      text.maxWidth = this.width;
    }

    assert && needsIconMaxWidth && assert( toFixed( this.width, 0 ) === toFixed( options.maxButtonWidth!, 0 ),
      `this.width ${this.width} !== options.maxButtonWidth ${options.maxButtonWidth}` );

    // A custom focus highlight so that the bottom of the highlight does not get cut-off below the navigation bar.
    // Setting to the localBounds directly prevents the default dilation of the highlight. Shape updates with changing
    // bounds to support dynamic layout.
    this.localBoundsProperty.link( localBounds => {
      this.focusHighlight = Shape.bounds( localBounds.dilatedX( HIGHLIGHT_SPACING ) );
    } );

    this.mutate( options );
  }
}

joist.register( 'NavigationBarScreenButton', NavigationBarScreenButton );
export default NavigationBarScreenButton;