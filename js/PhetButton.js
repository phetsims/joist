// Copyright 2002-2013, University of Colorado Boulder

/**
 * The button that pops up the PhET menu.
 */
define( function( require ) {
  "use strict";

  //imports
  var Node = require( 'SCENERY/nodes/Node' );
  var Path = require( 'SCENERY/nodes/Path' );
  var HBox = require( 'SCENERY/nodes/HBox' );
  var Text = require( 'SCENERY/nodes/Text' );
  var FontAwesomeNode = require( 'SUN/FontAwesomeNode' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var inherit = require( 'PHET_CORE/inherit' );
  var PhetMenu = require( 'JOIST/PhetMenu' );
  var Font = require( 'SCENERY/util/Font' );
  var Shape = require( 'KITE/Shape' );
  var LinearGradient = require( 'SCENERY/util/LinearGradient' );
  var ButtonListener = require( 'SCENERY/input/ButtonListener' );
  var Vector2 = require( 'DOT/Vector2' );

  //TODO this is copied from NavigationBar
  var createHighlight = function( width, height ) {
    var leftBar = new Path( {shape: Shape.lineSegment( 0, 0, 0, height ), lineWidth: 1, stroke: new LinearGradient( 0, 0, 0, height ).addColorStop( 0, 'black' ).addColorStop( 0.5, 'white' ).addColorStop( 1, 'black' ) } );
    var rightBar = new Path( {shape: Shape.lineSegment( width, 0, width, height ), lineWidth: 1, stroke: new LinearGradient( 0, 0, 0, height ).addColorStop( 0, 'black' ).addColorStop( 0.5, 'white' ).addColorStop( 1, 'black' ) } );
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
  function PhetButton( sim, options ) {

    var phetButton = this;
    Node.call( this, {renderer: 'svg'} );

    var fontSize = 36;

    var phetLabel = new Text( "PhET", {fontSize: fontSize, fill: 'yellow'} );
    var optionsButton = new FontAwesomeNode( 'reorder', {fill: '#fff'} );

    this.hbox = new HBox( {spacing: 10, children: [phetLabel, optionsButton] } );
    this.addChild( this.hbox );

    var optionsHighlight = createHighlight( this.hbox.width + 6, this.hbox.height - 2 );
    optionsHighlight.bottom = optionsButton.bottom + 3;
    optionsHighlight.x = -3;
    this.addChild( optionsHighlight );

    //When the phet button is pressed, show the phet menu
    var phetButtonPressed = function() {
      var phetMenu = new PhetMenu( sim );
      phetMenu.right = phetButton.globalToParentPoint( new Vector2( phetButton.globalBounds.maxX, 0 ) ).x;
      phetMenu.bottom = phetButton.centerY;
      console.log( phetMenu.right );
      var rectangle = new Rectangle( -1000, -1000, 3000, 3000, {fill: 'black', opacity: 0.3} );
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
    this.mouseArea = this.hbox.touchArea = Shape.bounds( this.bounds );

    this.mutate( options || {} );
  }

  inherit( Node, PhetButton );

  return PhetButton;

} );