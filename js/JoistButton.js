// Copyright 2014-2019, University of Colorado Boulder

/**
 * Base class for Joist buttons such as the "home" button and "PhET" button that show custom highlighting on mouseover.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Property from '../../axon/js/Property.js';
import Shape from '../../kite/js/Shape.js';
import inherit from '../../phet-core/js/inherit.js';
import merge from '../../phet-core/js/merge.js';
import FocusHighlightPath from '../../scenery/js/accessibility/FocusHighlightPath.js';
import Node from '../../scenery/js/nodes/Node.js';
import ButtonInteractionState from '../../sun/js/buttons/ButtonInteractionState.js';
import PushButtonInteractionStateProperty from '../../sun/js/buttons/PushButtonInteractionStateProperty.js';
import PushButtonModel from '../../sun/js/buttons/PushButtonModel.js';
import HighlightNode from './HighlightNode.js';
import joist from './joist.js';

/**
 * @param {Node} content - the scenery node to render as the content of the button
 * @param {Property.<string>} navigationBarFillProperty - the color of the navbar, as a string.
 * @param {Tandem} tandem
 * @param {Object} [options] Unused in client code.
 * @constructor
 */
function JoistButton( content, navigationBarFillProperty, tandem, options ) {

  options = merge( {
    cursor: 'pointer', // {string}
    listener: null, // {function}
    //Customization for the highlight region, see overrides in HomeButton and PhetButton
    highlightExtensionWidth: 0,
    highlightExtensionHeight: 0,
    highlightCenterOffsetX: 0,
    highlightCenterOffsetY: 0,

    // JoistButtons by default do not have a featured enabledProperty
    enabledPropertyOptions: { phetioFeatured: false }
  }, options );

  options.tandem = tandem;

  // @public (phet-io|a11y) - Button model
  // Note it shares a tandem with "this", so the emitter will be instrumented as a child of the button
  this.buttonModel = new PushButtonModel( options );

  // Create both highlights and only make the one visible that corresponds to the color scheme
  const createHighlight = function( fill ) {

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

  Node.call( this, { children: [ content, brightenHighlight, darkenHighlight ] } );

  // Button interactions
  const interactionStateProperty = new PushButtonInteractionStateProperty( this.buttonModel );

  // @protected
  this.interactionStateProperty = interactionStateProperty;

  // Update the highlights based on whether the button is highlighted and whether it is against a light or dark background.
  Property.multilink( [ interactionStateProperty, navigationBarFillProperty ], function( interactionState, navigationBarFill ) {
    const useDarkenHighlight = navigationBarFill !== 'black';
    brightenHighlight.visible = !useDarkenHighlight &&
                                ( interactionState === ButtonInteractionState.OVER ||
                                  interactionState === ButtonInteractionState.PRESSED );
    darkenHighlight.visible = useDarkenHighlight &&
                              ( interactionState === ButtonInteractionState.OVER ||
                                interactionState === ButtonInteractionState.PRESSED );
  } );

  // Keep the cursor in sync with if the button is enabled.
  // JoistButtons exist for the lifetime of the sim, and don't need to be disposed
  this.buttonModel.enabledProperty.link( enabled => { this.cursor = enabled ? 'pointer' : null; } );

  // Hook up the input listener
  const pressListener = this.buttonModel.createListener( {
    tandem: tandem.createTandem( 'pressListener' )
  } );
  this.addInputListener( pressListener );

  // eliminate interactivity gap between label and button
  this.mouseArea = this.touchArea = Shape.bounds( this.bounds );

  this.mutate( options );

  // shift the focus highlight for the joist button so that the bottom is always on screen
  const highlightLineWidth = FocusHighlightPath.getOuterLineWidthFromNode( this );
  this.focusHighlight = Shape.bounds( this.bounds.shiftedY( -highlightLineWidth ) );
}

joist.register( 'JoistButton', JoistButton );

inherit( Node, JoistButton );
export default JoistButton;