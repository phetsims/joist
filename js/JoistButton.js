// Copyright 2014-2015, University of Colorado Boulder

/**
 * Base class for Joist buttons such as the "home" button and "PhET" button that show custom highlighting on mouseover.
 *
 * @author Sam Reid (PhET Interactive Simulations)
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
  var joist = require( 'JOIST/joist' );
  var Tandem = require( 'TANDEM/Tandem' );

  // phet-io modules
  var TPhetButton = require('ifphetio!PHET_IO/types/joist/TPhetButton');

  /**
   * @param {Node} content - the scenery node to render as the content of the button
   * @param {Property.<string>} navigationBarFillProperty - the color of the navbar, as a string.
   * @param {Object} [options] Unused in client code.
   * @constructor
   */
  function JoistButton( content, navigationBarFillProperty, options ) {

    options = _.extend( {
      cursor: 'pointer', // {string}
      listener: null, // {function}

      //Customization for the highlight region, see overrides in HomeButton and PhetButton
      highlightExtensionWidth: 0,
      highlightExtensionHeight: 0,
      highlightCenterOffsetX: 0,
      highlightCenterOffsetY: 0,
      focusable: true,
      tandem: null
    }, options );

    Tandem.validateOptions( options ); // The tandem is required when brand==='phet-io'

    // @private - Button model
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

    Node.call( this, { children: [ content, brightenHighlight, darkenHighlight ] } );

    // Button interactions
    var interactionStateProperty = new PushButtonInteractionStateProperty( this.buttonModel );

    // @protected
    this.interactionStateProperty = interactionStateProperty;

    // Update the highlights based on whether the button is highlighted and whether it is against a light or dark background.
    Property.multilink( [ interactionStateProperty, navigationBarFillProperty ], function( interactionState, navigationBarFill ) {
      var useDarkenHighlight = navigationBarFill !== 'black';
      brightenHighlight.visible = !useDarkenHighlight && (interactionState === 'over' || interactionState === 'pressed');
      darkenHighlight.visible = useDarkenHighlight && (interactionState === 'over' || interactionState === 'pressed');
    } );

    this.addInputListener( new ButtonListener( this.buttonModel ) );

    // eliminate interactivity gap between label and button
    this.mouseArea = this.touchArea = Shape.bounds( this.bounds );

    this.mutate( _.omit( options, 'tandem' ) );

    TPhetButton && options.tandem && options.tandem.addInstance( this, TPhetButton );
  }

  joist.register( 'JoistButton', JoistButton );

  return inherit( Node, JoistButton );
} );