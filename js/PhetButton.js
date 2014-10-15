// Copyright 2002-2013, University of Colorado Boulder

/**
 * The button that pops up the PhET menu.
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
  var PushButtonDeprecated = require( 'SUN/PushButtonDeprecated' );
  var HighlightNode = require( 'JOIST/HighlightNode' );

  // images
  var phetLogo = require( 'image!BRAND/logo.png' );
  //Makes the 'h' a bit darker so it will show up better against a white background
  var phetLogoDarker = require( 'image!BRAND/logo-on-white.png' );

  //TODO don't pass in navigationBar, position based on this button
  /**
   *
   * @param sim
   * @param whiteColorScheme
   * @param homeScreen flag that indicates whether this button appears in the home screen or navbar, to get the positioning right.  TODO: Get rid of the need for this flag.  See #114
   * @param {Object} [options] Unused in client code.  TODO: Remove
   * @constructor
   */
  function PhetButton( sim, homeScreen, options ) {

    options = _.extend( {
      phetLogoScale: 0.28,
      optionsButtonVerticalMargin: 1.5
    }, options );

    var phetLabel = new Image( options.phetLogo, {scale: options.phetLogoScale, pickable: false} );
    sim.link( 'useInvertedColors', function( whiteColorScheme ) {
      phetLabel.image = whiteColorScheme ? phetLogoDarker : phetLogo;
    } );

    var optionsButton = new FontAwesomeNode( 'reorder', {
      scale: 0.6,
      left: phetLabel.width + 10,
      bottom: phetLabel.bottom - options.optionsButtonVerticalMargin,
      pickable: false
    } );
    sim.link( 'useInvertedColors', function( whiteColorScheme ) {
      optionsButton.fill = whiteColorScheme ? '#222' : 'white';
    } );

    var createNode = function( highlighted ) {
      var node = new Node( {children: [phetLabel, optionsButton]} );

      if ( highlighted ) {
        var normalHighlight = new HighlightNode( node.width + 6, node.height + 5, {
          centerX: node.centerX,
          centerY: node.centerY + 4,
          whiteHighlight: true
        } );
        var invertedHighlight = new HighlightNode( node.width + 6, node.height + 5, {
          centerX: node.centerX,
          centerY: node.centerY + 4,
          whiteHighlight: false
        } );
        node.addChild( normalHighlight );
        node.addChild( invertedHighlight );
        sim.link( 'useInvertedColors', function( whiteColorScheme ) {
          normalHighlight.visible = !whiteColorScheme;
          invertedHighlight.visible = whiteColorScheme;
        } );
      }
      return node;
    };

    //PushButtonDeprecated( upNode, overNode, downNode, disabledNode, options )
    PushButtonDeprecated.call( this, createNode( false ), createNode( true ), createNode( true ), new Node() );

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
    this.addListener( phetButtonPressed );

    this.addPeer( '<input type="button" aria-label="PhET Menu">', {click: phetButtonPressed, tabIndex: 101} );

    // eliminate interactivity gap between label and button
    this.mouseArea = this.touchArea = Shape.bounds( this.bounds );

    if ( options ) {
      this.mutate( options );
    }
  }

  return inherit( PushButtonDeprecated, PhetButton, {},

    //statics
    {

      //How much space between the PhetButton and the right side of the screen.
      HORIZONTAL_INSET: 5,

      //How much space between the PhetButton and the bottom of the screen
      VERTICAL_INSET: 0
    } );
} );