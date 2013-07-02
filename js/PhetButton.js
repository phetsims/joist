// Copyright 2002-2013, University of Colorado Boulder

/**
 * The button that pops up the PhET menu.
 */
define( function( require ) {

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
  function PhetButton( sim, navigationBar ) {

    var thisButton = this;
    Node.call( this, { cursor: 'pointer' } );

    var fontSize = 36;

    var phetLabel = new Text( "PhET", {fontSize: fontSize, fill: 'yellow'} );
    var optionsButton = new FontAwesomeNode( 'reorder', {fill: '#fff'} );

    this.hbox = new HBox( {spacing: 10, children: [phetLabel, optionsButton] } );
    this.addChild( this.hbox );

    var optionsHighlight = createHighlight( this.hbox.width + 6, this.hbox.height - 2 );
    optionsHighlight.bottom = optionsButton.bottom + 3;
    optionsHighlight.x = -3;
    this.addChild( optionsHighlight );

    //Creating the popup menu dynamically (when needed) causes a temporary black screen on the iPad (perhaps because of canvas accurate text bounds)
    var simPopupMenu = new PhetMenu( sim );
    var optionButtonPressed = function() {
      simPopupMenu.x = navigationBar.navBarWidth - simPopupMenu.width - 2;
      simPopupMenu.y = window.innerHeight - simPopupMenu.height - navigationBar.height / 2 + 4;
      //TODO popup should just be another node, not an entirely new scene
      var overlayScene = sim.createAndAddOverlay( simPopupMenu );
      overlayScene.addInputListener( {down: function() {
        sim.removeOverlay( overlayScene );
      }} );
    };

    // mousedown or touchstart (pointer pressed down over the node)
    this.addPeer( '<input type="button" aria-label="Options Menu">', {click: optionButtonPressed, tabIndex: 101} );
    this.addInputListener( { down: optionButtonPressed} );
    this.addInputListener( createHighlightListener( optionsHighlight ) );

    // eliminate interactivity gap between label and button
    this.mouseArea = this.hbox.touchArea = Shape.bounds( this.bounds );
  }

  inherit( Node, PhetButton );

  return PhetButton;

} );