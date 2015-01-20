// Copyright 2002-2013, University of Colorado Boulder

/**
 * Base class for Joist buttons such as the "home" button and "PhET" button that show custom highlighting on mouseover.
 *
 * @author Sam Reid
 */
define( function( require ) {
  'use strict';

  // modules
  var Node = require( 'SCENERY/nodes/Node' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Shape = require( 'KITE/Shape' );
  var HighlightNode = require( 'JOIST/HighlightNode' );
  var ButtonListener = require( 'SUN/buttons/ButtonListener' );
  var PushButtonInteractionStateProperty = require( 'SUN/buttons/PushButtonInteractionStateProperty' );
  var PushButtonModel = require( 'SUN/buttons/PushButtonModel' );
  var Property = require( 'AXON/Property' );

  /**
   * @param {Node} content - the scenery node to render as the content of the button
   * @param {Property.<boolean>} useInvertedColorsProperty
   * @param {Object} [options] Unused in client code.
   * @constructor
   */
  function JoistButton( content, useInvertedColorsProperty, options ) {

    options = _.extend( {
      cursor: 'pointer', // {string}
      listener: null, // {function}
      ariaLabel: '', // {string}

      //Customization for the highlight region, see overrides in HomeButton and PhetButton
      highlightExtensionWidth: 0,
      highlightExtensionHeight: 0,
      highlightCenterOffsetX: 0,
      highlightCenterOffsetY: 0
    }, options );

    // Button model
    this.buttonModel = new PushButtonModel( options ); // @private

    // Create both highlights and only make the one visible that corresponds to the color scheme
    var createHighlight = function( whiteHighlight ) {

      return new HighlightNode( content.width + options.highlightExtensionWidth, content.height + options.highlightExtensionHeight, {
        centerX: content.centerX + options.highlightCenterOffsetX,
        centerY: content.centerY + options.highlightCenterOffsetY,
        whiteHighlight: whiteHighlight,
        pickable: false
      } );
    };

    // Highlight against the black background
    var normalHighlight = createHighlight( true );

    // Highlight against the white background
    var invertedHighlight = createHighlight( false );

    Node.call( this, { children: [ content, normalHighlight, invertedHighlight ] } );

    // Button interactions
    var interactionStateProperty = new PushButtonInteractionStateProperty( this.buttonModel );

    this.interactionStateProperty = interactionStateProperty;//@protected

    // Update the highlights based on whether the button is highlighted and whether it is against a light or dark background.
    Property.multilink( [ interactionStateProperty, useInvertedColorsProperty ], function( interactionState, useInvertedColors ) {
      normalHighlight.visible = !useInvertedColors && (interactionState === 'over' || interactionState === 'pressed');
      invertedHighlight.visible = useInvertedColors && (interactionState === 'over' || interactionState === 'pressed');
    } );

    this.addInputListener( new ButtonListener( this.buttonModel ) );

    // eliminate interactivity gap between label and button
    this.mouseArea = this.touchArea = Shape.bounds( this.bounds );

    this.mutate( options );
  }

  return inherit( Node, JoistButton, {},

    //statics
    {

      //How much space between the JoistButton and the right side of the screen.
      HORIZONTAL_INSET: 5,

      //How much space between the JoistButton and the bottom of the screen
      VERTICAL_INSET: 0
    } );
} );