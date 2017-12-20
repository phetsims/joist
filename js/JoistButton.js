// Copyright 2014-2017, University of Colorado Boulder

/**
 * Base class for Joist buttons such as the "home" button and "PhET" button that show custom highlighting on mouseover.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var ButtonListener = require( 'SUN/buttons/ButtonListener' );
  var HighlightNode = require( 'JOIST/HighlightNode' );
  var inherit = require( 'PHET_CORE/inherit' );
  var joist = require( 'JOIST/joist' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Property = require( 'AXON/Property' );
  var PushButtonInteractionStateProperty = require( 'SUN/buttons/PushButtonInteractionStateProperty' );
  var PushButtonModel = require( 'SUN/buttons/PushButtonModel' );
  var Shape = require( 'KITE/Shape' );
  var FocusHighlightPath = require( 'SCENERY/accessibility/FocusHighlightPath' );
  var JoistButtonIO = require( 'JOIST/JoistButtonIO' );

  /**
   * @param {Node} content - the scenery node to render as the content of the button
   * @param {Property.<string>} navigationBarFillProperty - the color of the navbar, as a string.
   * @param {Tandem} tandem
   * @param {Object} [options] Unused in client code.
   * @constructor
   */
  function JoistButton( content, navigationBarFillProperty, tandem, options ) {
    var self = this;

    options = _.extend( {
      cursor: 'pointer', // {string}
      listener: null, // {function}

      //Customization for the highlight region, see overrides in HomeButton and PhetButton
      highlightExtensionWidth: 0,
      highlightExtensionHeight: 0,
      highlightCenterOffsetX: 0,
      highlightCenterOffsetY: 0,
      eventSource: this,
      phetioType: JoistButtonIO,
      phetioState: false
    }, options );

    options.tandem = tandem;

    // @public (phet-io) - Button model
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
      brightenHighlight.visible = !useDarkenHighlight && ( interactionState === 'over' || interactionState === 'pressed' );
      darkenHighlight.visible = useDarkenHighlight && ( interactionState === 'over' || interactionState === 'pressed' );
    } );

    this.addInputListener( new ButtonListener( this.buttonModel ) );

    // a11y - when the button is clicked with assistive technology, fire
    this.addAccessibleInputListener( {
      click: function() {
        self.buttonModel.fire();
      }
    } );

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