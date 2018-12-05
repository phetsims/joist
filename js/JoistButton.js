// Copyright 2014-2018, University of Colorado Boulder

/**
 * Base class for Joist buttons such as the "home" button and "PhET" button that show custom highlighting on mouseover.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var ButtonInteractionState = require( 'SUN/buttons/ButtonInteractionState' );
  var FocusHighlightPath = require( 'SCENERY/accessibility/FocusHighlightPath' );
  var HighlightNode = require( 'JOIST/HighlightNode' );
  var inherit = require( 'PHET_CORE/inherit' );
  var joist = require( 'JOIST/joist' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Property = require( 'AXON/Property' );
  var PushButtonInteractionStateProperty = require( 'SUN/buttons/PushButtonInteractionStateProperty' );
  var PushButtonModel = require( 'SUN/buttons/PushButtonModel' );
  var Shape = require( 'KITE/Shape' );

  /**
   * @param {Node} content - the scenery node to render as the content of the button
   * @param {Property.<string>} navigationBarFillProperty - the color of the navbar, as a string.
   * @param {Tandem} tandem
   * @param {Object} [options] Unused in client code.
   * @constructor
   */
  function JoistButton( content, navigationBarFillProperty, tandem, options ) {

    options = _.extend( {
      cursor: 'pointer', // {string}
      listener: null, // {function}
      //Customization for the highlight region, see overrides in HomeButton and PhetButton
      highlightExtensionWidth: 0,
      highlightExtensionHeight: 0,
      highlightCenterOffsetX: 0,
      highlightCenterOffsetY: 0
    }, options );

    options.tandem = tandem;

    // @public (phet-io|a11y) - Button model
    // Note it shares a tandem with "this", so the emitter will be instrumented as a child of the button
    this.buttonModel = new PushButtonModel( options );

    // Create both highlights and only make the one visible that corresponds to the color scheme
    var createHighlight = function( fill ) {

      return new HighlightNode( content.width + options.highlightExtensionWidth, content.height + options.highlightExtensionHeight, {
        centerX: content.centerX + options.highlightCenterOffsetX,
        centerY: content.centerY + options.highlightCenterOffsetY,
        fill: fill,
        pickable: false
      } );
    };

    // Highlight against the black background
    var brightenHighlight = createHighlight( 'white' );

    // Highlight against the white background
    var darkenHighlight = createHighlight( 'black' );

    Node.call( this, _.extend( { children: [ content, brightenHighlight, darkenHighlight ] } ) );

    // Button interactions
    var interactionStateProperty = new PushButtonInteractionStateProperty( this.buttonModel );

    // @protected
    this.interactionStateProperty = interactionStateProperty;

    // Update the highlights based on whether the button is highlighted and whether it is against a light or dark background.
    Property.multilink( [ interactionStateProperty, navigationBarFillProperty ], function( interactionState, navigationBarFill ) {
      var useDarkenHighlight = navigationBarFill !== 'black';
      brightenHighlight.visible = !useDarkenHighlight &&
                                  ( interactionState === ButtonInteractionState.OVER ||
                                    interactionState === ButtonInteractionState.PRESSED );
      darkenHighlight.visible = useDarkenHighlight &&
                                ( interactionState === ButtonInteractionState.OVER ||
                                  interactionState === ButtonInteractionState.PRESSED );
    } );

    // Hook up the input listener
    var pressListener = this.buttonModel.createListener( {
      tandem: tandem.createTandem( 'pressListener' )
    } );
    this.addInputListener( pressListener );

    // eliminate interactivity gap between label and button
    this.mouseArea = this.touchArea = Shape.bounds( this.bounds );

    this.mutate( options );

    // shift the focus highlight for the joist button so that the bottom is always on screen
    var highlightLineWidth = FocusHighlightPath.getOuterLineWidthFromNode( this );
    this.focusHighlight = Shape.bounds( this.bounds.shiftedY( -highlightLineWidth ) );
  }

  joist.register( 'JoistButton', JoistButton );

  return inherit( Node, JoistButton );
} );