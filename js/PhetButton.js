// Copyright 2002-2013, University of Colorado Boulder

/**
 * The button that pops up the PhET menu.
 */
define( function( require ) {
  'use strict';

  //imports
  var Node = require( 'SCENERY/nodes/Node' );
  var Image = require( 'SCENERY/nodes/Image' );
  var FontAwesomeNode = require( 'SUN/FontAwesomeNode' );
  var Plane = require( 'SCENERY/nodes/Plane' );
  var inherit = require( 'PHET_CORE/inherit' );
  var platform = require( 'PHET_CORE/platform' );
  var PhetMenu = require( 'JOIST/PhetMenu' );
  var Shape = require( 'KITE/Shape' );
  var ButtonListener = require( 'SCENERY/input/ButtonListener' );
  var Vector2 = require( 'DOT/Vector2' );
  var phetLogo = require( 'image!JOIST/phet-logo-short.svg' );
  var PushButton = require( 'SUN/PushButton' );
  var HighlightNode = require( 'JOIST/HighlightNode' );

  //Makes the 'h' a bit darker so it will show up better against a white background
  var phetLogoDarker = require( 'image!JOIST/phet-logo-short-darker.svg' );

  //TODO don't pass in navigationBar, position based on this button
  function PhetButton( sim, whiteColorScheme, options ) {

    var phetButton = this;
    options = _.extend( {
      phetLogo: whiteColorScheme ? phetLogoDarker : phetLogo,
      phetLogoScale: 0.28,
      optionsButtonVerticalMargin: 1.5
    }, options );

    var phetLabel = new Image( options.phetLogo, {scale: options.phetLogoScale, pickable: false} );

    //Workaround for the SVG not showing up properly in firefox.  SVG Renderer still giving odd bounds on FireFox, so use canvas there
    if ( platform.firefox ) {phetLabel.renderer = 'canvas';}

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

    //function PushButton( upNode, overNode, downNode, disabledNode, options ) {
    PushButton.call( this, createNode( false ), createNode( true ), createNode( true ), new Node() );

    //When the phet button is pressed, show the phet menu
    var phetButtonPressed = function() {
      var phetMenu = new PhetMenu( sim, {showSaveAndLoad: sim.options.showSaveAndLoad} );
      phetMenu.right = phetButton.globalToParentPoint( new Vector2( phetButton.globalBounds.maxX, 0 ) ).x;
      phetMenu.bottom = phetButton.centerY;
      var rectangle = new Plane( {fill: 'black', opacity: 0.3} );
      var detach = function() {
        rectangle.detach();
        phetMenu.detach();
        phetMenu.removeInputListener( popupMenuListener );
        rectangle.removeInputListener( rectangleListener );
      };
      var popupMenuListener = new ButtonListener( {fire: detach} );
      var rectangleListener = {down: detach};

      phetMenu.addInputListener( popupMenuListener );
      rectangle.addInputListener( rectangleListener );

      phetButton.parents[0].addChild( rectangle );
      phetButton.parents[0].addChild( phetMenu );
    };
    this.addListener( phetButtonPressed );

    this.addPeer( '<input type="button" aria-label="PhET Menu">', {click: phetButtonPressed, tabIndex: 101} );

    // eliminate interactivity gap between label and button
    this.mouseArea = this.touchArea = Shape.bounds( this.bounds );

    if ( options ) {
      this.mutate( options );
    }
  }

  return inherit( PushButton, PhetButton );
} );