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
  var Plane = require( 'SCENERY/nodes/Plane' );
  var inherit = require( 'PHET_CORE/inherit' );
  var PhetMenu = require( 'JOIST/PhetMenu' );
  var Shape = require( 'KITE/Shape' );
  var ButtonListener = require( 'SCENERY/input/ButtonListener' );
  var Vector2 = require( 'DOT/Vector2' );
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
  function PhetButton( sim, whiteColorScheme, homeScreen, options ) {

    var phetButton = this;
    options = _.extend( {
      phetLogo: whiteColorScheme ? phetLogoDarker : phetLogo,
      phetLogoScale: 0.28,
      optionsButtonVerticalMargin: 1.5
    }, options );

    var phetLabel = new Image( options.phetLogo, {scale: options.phetLogoScale, pickable: false} );

    var optionsButton = new FontAwesomeNode( 'reorder', {
      fill: whiteColorScheme ? '#222' : 'white',
      scale: 0.6,
      left: phetLabel.width + 10,
      bottom: phetLabel.bottom - options.optionsButtonVerticalMargin,
      pickable: false
    } );

    var createNode = function( highlighted ) {
      var node = new Node( {children: [phetLabel, optionsButton]} );

      if ( highlighted ) {
        node.addChild( new HighlightNode( node.width + 6, node.height + 5, {
          centerX: node.centerX,
          centerY: node.centerY + 4,
          whiteHighlight: !whiteColorScheme
        } ) );
      }
      return node;
    };

    //PushButtonDeprecated( upNode, overNode, downNode, disabledNode, options )
    PushButtonDeprecated.call( this, createNode( false ), createNode( true ), createNode( true ), new Node() );

    //When the phet button is pressed, show the phet menu
    var phetButtonPressed = function() {

      //The PhetMenu can be embedded in different contexts, but the scale should be consistent.  So look up the embedding scale here and factor it out.  See #39
      var ancestor = homeScreen ? phetButton.parents[0] : phetButton.parents[0].parents[0];
      var scale = ancestor.getGlobalToLocalMatrix().getScaleVector().x;

      var global = phetButton.parentToGlobalPoint( phetButton.center );
      var local = ancestor.globalToLocalPoint( global );
      var phetMenu = new PhetMenu( sim, {
        showSaveAndLoad: sim.options.showSaveAndLoad,
        showScreenshotOption: sim.options.showScreenshotOption,
        showFullscreenOption: sim.options.showFullscreenOption,
        scale: scale,
        right: phetButton.globalToParentPoint( new Vector2( phetButton.globalBounds.maxX, 0 ) ).x,
        bottom: local.y} );

      var rectangle = new Plane( {fill: 'black', opacity: 0.3, renderer: 'svg'} );
      var detach = function() {
        rectangle.detach();
        phetMenu.detach();
        phetMenu.removeInputListener( popupMenuListener );
        phetMenu.dispose();
        rectangle.removeInputListener( rectangleListener );
      };
      var popupMenuListener = new ButtonListener( {fire: detach} );
      var rectangleListener = {down: detach};

      phetMenu.addInputListener( popupMenuListener );
      rectangle.addInputListener( rectangleListener );

      ancestor.addChild( rectangle );
      ancestor.addChild( phetMenu );
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
