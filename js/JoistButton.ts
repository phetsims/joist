// Copyright 2014-2022, University of Colorado Boulder

/**
 * Base class for Joist buttons such as the "home" button and "PhET" button that show custom highlighting on mouseover.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import TReadOnlyProperty from '../../axon/js/TReadOnlyProperty.js';
import Multilink from '../../axon/js/Multilink.js';
import { Shape } from '../../kite/js/imports.js';
import optionize from '../../phet-core/js/optionize.js';
import PickRequired from '../../phet-core/js/types/PickRequired.js';
import StrictOmit from '../../phet-core/js/types/StrictOmit.js';
import { Color, FocusHighlightPath, Node, NodeOptions, PressListener, SceneryConstants, Voicing, VoicingOptions } from '../../scenery/js/imports.js';
import ButtonInteractionState from '../../sun/js/buttons/ButtonInteractionState.js';
import PushButtonInteractionStateProperty from '../../sun/js/buttons/PushButtonInteractionStateProperty.js';
import PushButtonModel from '../../sun/js/buttons/PushButtonModel.js';
import HighlightNode from './HighlightNode.js';
import joist from './joist.js';

type SelfOptions = {
  highlightExtensionWidth?: number;
  highlightExtensionHeight?: number;
  highlightCenterOffsetX?: number;
  highlightCenterOffsetY?: number;
  pointerAreaDilationX?: number;
  pointerAreaDilationY?: number;
  listener?: ( () => void ) | null;
};
type ParentOptions = VoicingOptions & NodeOptions;
export type JoistButtonOptions = SelfOptions & StrictOmit<ParentOptions, 'children'> & PickRequired<ParentOptions, 'tandem'>;

export default class JoistButton extends Voicing( Node ) {

  // (phet-io|a11y) - Button model
  // Note it shares a tandem with "this", so the emitter will be instrumented as a child of the button
  protected readonly buttonModel: PushButtonModel;
  protected readonly interactionStateProperty: PushButtonInteractionStateProperty;
  private readonly _pressListener: PressListener;

  /**
   * @param content - the scenery node to render as the content of the button
   * @param navigationBarFillProperty - the color of the navbar, as a string.
   * @param [providedOptions]
   */
  public constructor( content: Node, navigationBarFillProperty: TReadOnlyProperty<Color>, providedOptions: JoistButtonOptions ) {

    const options = optionize<JoistButtonOptions, SelfOptions, ParentOptions>()( {
      cursor: 'pointer', // {string}
      listener: null, // {function}

      // Customization for the highlight region, see overrides in HomeButton and PhetButton
      highlightExtensionWidth: 0,
      highlightExtensionHeight: 0,
      highlightCenterOffsetX: 0,
      highlightCenterOffsetY: 0,

      pointerAreaDilationX: 0,
      pointerAreaDilationY: 0,

      // JoistButtons by default do not have a featured enabledProperty
      enabledPropertyOptions: { phetioFeatured: false },
      disabledOpacity: SceneryConstants.DISABLED_OPACITY,

      // pdom
      tagName: 'button'
    }, providedOptions );

    // Creates the highlights for the button.
    const createHighlight = function( fill: Color | string ) {
      return new HighlightNode( content.width + options.highlightExtensionWidth, content.height + options.highlightExtensionHeight, {
        centerX: content.centerX + options.highlightCenterOffsetX,
        centerY: content.centerY + options.highlightCenterOffsetY,
        fill: fill,
        pickable: false
      } );
    };

    // Highlight against the black background
    const brightenHighlight = createHighlight( 'white' );

    // Highlight against the white background
    const darkenHighlight = createHighlight( 'black' );

    options.children = [ content, brightenHighlight, darkenHighlight ];

    super( options );

    this.buttonModel = new PushButtonModel( options );

    // Button interactions
    const interactionStateProperty = new PushButtonInteractionStateProperty( this.buttonModel );

    this.interactionStateProperty = interactionStateProperty;

    // Update the highlights based on whether the button is highlighted and whether it is against a light or dark background.
    Multilink.multilink( [ interactionStateProperty, navigationBarFillProperty, this.buttonModel.enabledProperty ],
      ( interactionState, navigationBarFill, enabled ) => {
        const useDarkenHighlight = !navigationBarFill.equals( Color.BLACK );

        brightenHighlight.visible = !useDarkenHighlight && enabled &&
                                    ( interactionState === ButtonInteractionState.OVER ||
                                      interactionState === ButtonInteractionState.PRESSED );
        darkenHighlight.visible = useDarkenHighlight && enabled &&
                                  ( interactionState === ButtonInteractionState.OVER ||
                                    interactionState === ButtonInteractionState.PRESSED );
      } );

    // Keep the cursor in sync with if the button is enabled.
    // JoistButtons exist for the lifetime of the sim, and don't need to be disposed
    this.buttonModel.enabledProperty.link( enabled => {
      this.cursor = enabled ? options.cursor : null;
    } );

    // Hook up the input listener
    this._pressListener = this.buttonModel.createPressListener( {
      tandem: options.tandem.createTandem( 'pressListener' )
    } );
    this.addInputListener( this._pressListener );

    // eliminate interactivity gap between label and button
    this.mouseArea = this.touchArea = Shape.bounds( this.bounds.dilatedXY( options.pointerAreaDilationX, options.pointerAreaDilationY ) );

    // shift the focus highlight for the joist button so that the bottom is always on screen
    const highlightLineWidth = FocusHighlightPath.getOuterLineWidthFromNode( this );
    this.focusHighlight = Shape.bounds( this.bounds.shiftedY( -highlightLineWidth ) );
  }

  /**
   * Is the button currently firing because of accessibility input coming from the PDOM?
   * (pdom)
   */
  public isPDOMClicking(): boolean {
    return this._pressListener.pdomClickingProperty.get();
  }
}

joist.register( 'JoistButton', JoistButton );