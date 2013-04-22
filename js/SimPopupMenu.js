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
  var HBox = require( 'SCENERY/nodes/HBox' );
  var VBox = require( 'SCENERY/nodes/VBox' );
  var Text = require( 'SCENERY/nodes/Text' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Layout = require( 'JOIST/Layout' );
  var AboutDialog = require( 'JOIST/AboutDialog' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var Button = require( 'SUN/Button' );
  var PanelNode = require( 'SUN/PanelNode' );

  function SimPopupMenu( options ) {
    var simPopupMenu = this;
    Node.call( this );

    //Create it statically (even though it may not be used) because creating it dynamically can cause flickering on iPad//TODO: Fix this
    var aboutDialog = new AboutDialog();

    var fontSize = '36px';
    var homePageText = new Text( 'PhET Homepage', {fontSize: fontSize} );
    homePageText.addInputListener( {down: function() {
      window.location = "http://phet.colorado.edu";
    }} );
    var aboutText = new Text( 'About...', {fontSize: fontSize} );
    aboutText.addInputListener( {down: function() {
      var parent = simPopupMenu.parents[0];
      simPopupMenu.detach();
      parent.parents[0].parents[0].addChild( aboutDialog );
    }} );
    var items = [homePageText,
      new Text( 'Related Sims', {fontSize: fontSize} ),
      aboutText];

    //left align the items

    //Compute bounds
    var widestItem = _.max( items, function( item ) {return item.width;} );
    var tallestItem = _.max( items, function( item ) {return item.height;} );
    console.log( "SimPopupMenu widestItem.width=" + widestItem.width );//TODO delete me

    var itemHeight = tallestItem.height;

    var verticalSpacing = 10;
    var padding = 10;
    var bubbleWidth = widestItem.width + padding * 2;
    var bubbleHeight = itemHeight * items.length + padding * 2 + verticalSpacing * (items.length - 1);

    console.log( "SimPopupMenu bubbleHeight=", bubbleHeight );//TODO delete me

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