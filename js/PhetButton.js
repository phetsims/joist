// Copyright 2002-2013, University of Colorado Boulder

/**
 * The button that pops up the PhET menu.
 */
define( function( require ) {
  'use strict';

  //imports
  var Node = require( 'SCENERY/nodes/Node' );
  var Path = require( 'SCENERY/nodes/Path' );
  var Text = require( 'SCENERY/nodes/Text' );
  var Image = require( 'SCENERY/nodes/Image' );
  var FontAwesomeNode = require( 'SUN/FontAwesomeNode' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var Plane = require( 'SCENERY/nodes/Plane' );
  var inherit = require( 'PHET_CORE/inherit' );
  var platform = require( 'PHET_CORE/platform' );
  var PhetMenu = require( 'JOIST/PhetMenu' );
  var Font = require( 'SCENERY/util/Font' );
  var Shape = require( 'KITE/Shape' );
  var LinearGradient = require( 'SCENERY/util/LinearGradient' );
  var ButtonListener = require( 'SCENERY/input/ButtonListener' );
  var Vector2 = require( 'DOT/Vector2' );
  var phetLogo = require( 'image!JOIST/phet-logo-short.svg' );

  //Makes the 'h' a bit darker so it will show up better against a white background
  var phetLogoDarker = require( 'image!JOIST/phet-logo-short-darker.svg' );

  //TODO this is copied from NavigationBar
  var createHighlight = function( width, height ) {
    var leftBar = new Path( Shape.lineSegment( 0, 0, 0, height ), {lineWidth: 1, stroke: new LinearGradient( 0, 0, 0, height ).addColorStop( 0, 'black' ).addColorStop( 0.5, 'white' ).addColorStop( 1, 'black' ) } );
    var rightBar = new Path( Shape.lineSegment( width, 0, width, height ), {lineWidth: 1, stroke: new LinearGradient( 0, 0, 0, height ).addColorStop( 0, 'black' ).addColorStop( 0.5, 'white' ).addColorStop( 1, 'black' ) } );
    return new Node( {children: [leftBar, rightBar], visible: false} );
  };

  //TODO this is copied from NavigationBar
  var createHighlightListener = function( node ) {
    return {//Highlight a button when mousing over it
      over: function( event ) { if ( event.pointer.isMouse ) {node.visible = true;} },
      out: function( event ) { if ( event.pointer.isMouse ) {node.visible = false;} }
    };
  };

  //TODO don't pass in navigationBar, position based on this button
  function PhetButton( sim, whiteColorScheme, options ) {

    var phetButton = this;
    Node.call( this, {cursor: 'pointer'} );

    options = _.extend( {phetLogo: whiteColorScheme ? phetLogoDarker : phetLogo, phetLogoScale: 0.28, optionsButtonVerticalMargin: 1.5}, options );

    var phetLabel = new Image( options.phetLogo, {scale: options.phetLogoScale} );

    //Workaround for the SVG not showing up properly in firefox.  SVG Renderer still giving odd bounds on FireFox, so use canvas there
    if ( platform.firefox ) {phetLabel.renderer = 'canvas';}

    var optionsButton = new FontAwesomeNode( 'reorder', {fill: whiteColorScheme ? '#222' : 'white', scale: 0.6, left: phetLabel.width + 10, bottom: phetLabel.bottom - options.optionsButtonVerticalMargin} );

    this.addChild( phetLabel );
    this.addChild( optionsButton );

    var optionsHighlight = createHighlight( this.width + 6, this.height - 2 );
    optionsHighlight.bottom = this.bottom + 3;
    optionsHighlight.x = -3;
    this.addChild( optionsHighlight );

    //When the phet button is pressed, show the phet menu
    var phetButtonPressed = function() {
      var phetMenu = new PhetMenu( sim );
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

    this.addPeer( '<input type="button" aria-label="PhET Menu">', {click: phetButtonPressed, tabIndex: 101} );
    this.addInputListener( new ButtonListener( {fire: phetButtonPressed} ) );
    this.addInputListener( createHighlightListener( optionsHighlight ) );

    // eliminate interactivity gap between label and button
    this.mouseArea = this.touchArea = Shape.bounds( this.bounds );

    this.mutate( options );
  }

  return inherit( Node, PhetButton );
} );