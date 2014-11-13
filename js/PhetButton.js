// Copyright 2002-2013, University of Colorado Boulder

/**
 * The button that pops up the PhET menu, which appears in the bottom right of the home screen and on the right side
 * of the navbar.
 *
 * @author Sam Reid
 */
define( function( require ) {
  'use strict';

  // modules
  var Node = require( 'SCENERY/nodes/Node' );
  var Image = require( 'SCENERY/nodes/Image' );
  var FontAwesomeNode = require( 'SUN/FontAwesomeNode' );
  var inherit = require( 'PHET_CORE/inherit' );
  var PhetMenu = require( 'JOIST/PhetMenu' );
  var Shape = require( 'KITE/Shape' );
  var HighlightNode = require( 'JOIST/HighlightNode' );
  var ButtonListener = require( 'SUN/buttons/ButtonListener' );
  var PushButtonInteractionStateProperty = require( 'SUN/buttons/PushButtonInteractionStateProperty' );
  var PushButtonModel = require( 'SUN/buttons/PushButtonModel' );
  var Property = require( 'AXON/Property' );

  // images
  var phetLogo = require( 'image!BRAND/logo.png' );
  //Makes the 'h' a bit darker so it will show up better against a white background
  var phetLogoDarker = require( 'image!BRAND/logo-on-white.png' );

  /**
   * @param {Sim} sim
   * @param {Object} [options] Unused in client code.
   * @constructor
   */
  function PhetButton( sim, options ) {

    options = _.extend( {
      cursor: 'pointer', // {string}
      listener: null, // {function}
      phetLogoScale: 0.28, // {number}
      optionsButtonVerticalMargin: 1.5 // {number}
    }, options );

    // Button model
    this.buttonModel = new PushButtonModel( options ); // @private

    // The PhET Label, which is the PhET logo
    var phetLabel = new Image( phetLogo, {
      scale: options.phetLogoScale,
      pickable: false
    } );

    var optionsButton = new FontAwesomeNode( 'reorder', {
      scale: 0.6,
      left: phetLabel.width + 10,
      bottom: phetLabel.bottom - options.optionsButtonVerticalMargin,
      pickable: false
    } );

    // The icon combines the PhET label and the thre horizontal bars in the right relative positions
    var icon = new Node( {children: [phetLabel, optionsButton]} );

    // Create both highlights and only make the one visible that corresponds to the color scheme
    var createHighlight = function( whiteHighlight ) {
      return new HighlightNode( icon.width + 6, icon.height + 5, {
        centerX: icon.centerX,
        centerY: icon.centerY + 4,
        whiteHighlight: whiteHighlight,
        pickable: false
      } );
    };

    // Highlight against the black background
    var normalHighlight = createHighlight( true );

    // Highlight against the white background
    var invertedHighlight = createHighlight( false );

    Node.call( this, {children: [icon, normalHighlight, invertedHighlight]} );

    // Button interactions
    var interactionStateProperty = new PushButtonInteractionStateProperty( this.buttonModel );

    // Update the content of the button based on mouseover/press and whether the colors have been inverted
    Property.multilink( [interactionStateProperty, sim.useInvertedColorsProperty], function( interactionState, useInvertedColors ) {
      optionsButton.fill = useInvertedColors ? '#222' : 'white';
      phetLabel.image = useInvertedColors ? phetLogoDarker : phetLogo;
      normalHighlight.visible = !useInvertedColors && (interactionState === 'over' || interactionState === 'pressed');
      invertedHighlight.visible = useInvertedColors && (interactionState === 'over' || interactionState === 'pressed');
    } );

    this.addInputListener( new ButtonListener( this.buttonModel ) );

    //When the phet button is pressed, show the phet menu
    var phetButtonPressed = function() {

      var phetMenu = new PhetMenu( sim, {
        showSaveAndLoad: sim.options.showSaveAndLoad,
        closeCallback: function() {
          // hides the popup and barrier background
          sim.hidePopup( phetMenu, true );
        }
      } );

      function onResize( bounds, screenBounds, scale ) {
        // because it starts at null
        if ( bounds ) {
          phetMenu.setScaleMagnitude( Math.max( 1, scale * 0.7 ) ); // minimum size for small devices
          phetMenu.right = bounds.right - 10 * scale;
          phetMenu.bottom = ( bounds.bottom + screenBounds.bottom ) / 2;
        }
      }

      sim.on( 'resized', onResize );
      onResize( sim.bounds, sim.screenBounds, sim.scale );

      sim.showPopup( phetMenu, true );
    };
    this.buttonModel.addListener( phetButtonPressed );

    this.addPeer( '<input type="button" aria-label="PhET Menu">', {click: phetButtonPressed, tabIndex: 101} );

    // eliminate interactivity gap between label and button
    this.mouseArea = this.touchArea = Shape.bounds( this.bounds );

    this.mutate( options );
  }

  return inherit( Node, PhetButton, {},

    //statics
    {

      //How much space between the PhetButton and the right side of the screen.
      HORIZONTAL_INSET: 5,

      //How much space between the PhetButton and the bottom of the screen
      VERTICAL_INSET: 0
    } );
} );