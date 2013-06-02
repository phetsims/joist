// Copyright 2013, University of Colorado

/**
 * Popup menu that is displayed when the user clicks on the bars in the bottom right in the navigation bar.
 * Would be nice to have a balloon triangle dropdown shape like in a comic book dialog.
 *
 * @author Sam Reid
 */
define( function( require ) {
  "use strict";

  var Node = require( 'SCENERY/nodes/Node' );
  var Shape = require( 'KITE/Shape' );
  var Path = require( 'SCENERY/nodes/Path' );
  var Text = require( 'SCENERY/nodes/Text' );
  var inherit = require( 'PHET_CORE/inherit' );
  var AboutDialog = require( 'JOIST/AboutDialog' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var wiretap = require( 'FORT/wiretap' );

  function SimPopupMenu( sim, options ) {
    var simPopupMenu = this;
    Node.call( this );

    //Create it statically (even though it may not be used) because creating it dynamically can cause flickering on iPad//TODO: Fix this
    var aboutDialog = new AboutDialog( sim );

    var fontSize = '36px';
    var homePageText = new Text( 'PhET Homepage', {fontSize: fontSize} ).addInputListener( {down: function() {
      window.location = "http://phet.colorado.edu";
    }} );
    var aboutText = new Text( 'About...', {fontSize: fontSize} );
    aboutText.addInputListener( {down: function() {
      var parent = simPopupMenu.parents[0];
      simPopupMenu.detach();
      var overlay = sim.createAndAddOverlay( aboutDialog );
      overlay.addInputListener( {down: function() {
        sim.removeOverlay( overlay );
      }} );
    }} );
    var items = [homePageText,
      new Text( 'Related Sims', {fontSize: fontSize} ),
      new Text( 'Output log', {fontSize: fontSize} ).addInputListener( {down: function() {
        console.log( JSON.stringify( wiretap.log ) );
      }} ),
      aboutText];

    //left align the items

    //Compute bounds
    var widestItem = _.max( items, function( item ) {return item.width;} );
    var tallestItem = _.max( items, function( item ) {return item.height;} );

    var itemHeight = tallestItem.height;

    var verticalSpacing = 10;
    var padding = 10;
    var bubbleWidth = widestItem.width + padding * 2;
    var bubbleHeight = itemHeight * items.length + padding * 2 + verticalSpacing * (items.length - 1);

    var bubble = new Rectangle( 0, 0, bubbleWidth, bubbleHeight, 8, 8, {fill: 'white', lineWidth: 1, stroke: 'black'} );

    var tail = new Shape();
    tail.moveTo( bubbleWidth - 20, bubbleHeight - 2 );
    tail.lineToRelative( 0, 20 );
    tail.lineToRelative( -20, -20 );
    tail.close();

    this.addChild( bubble );
    this.addChild( new Path( {shape: tail, fill: 'white'} ) );

    var tailOutline = new Shape();
    tailOutline.moveTo( bubbleWidth - 20, bubbleHeight );
    tailOutline.lineToRelative( 0, 20 - 2 );
    tailOutline.lineToRelative( -18, -18 );
    this.addChild( new Path( {shape: tailOutline, stroke: 'black', lineWidth: 1} ) );

    var y = padding;
    _.each( items, function( item ) {
      item.top = y;
      item.left = padding;
      var highlight = new Rectangle( 3, y - 5, bubbleWidth - 3, itemHeight + 10, 3, 3, {fill: '#a6d2f4', visible: false} );
      simPopupMenu.addChild( highlight );
      simPopupMenu.addChild( item );

      item.cursor = 'pointer';
      item.addInputListener( {enter: function() {
        highlight.visible = true;
      }, exit: function() {
        highlight.visible = false;
      }} );

      if ( item === items[items.length - 2] ) {
        simPopupMenu.addChild( new Path( {shape: Shape.lineSegment( 8, y + itemHeight + verticalSpacing / 2, bubbleWidth - 8, y + itemHeight + verticalSpacing / 2 ), stroke: 'gray', lineWidth: 1} ) );
      }
      y += itemHeight + verticalSpacing;
    } );

    this.addInputListener( { down: function() {
      simPopupMenu.detach();
    } } );
    if ( options ) {
      this.mutate( options );
    }
  }

  inherit( SimPopupMenu, Node );

  return SimPopupMenu;
} );