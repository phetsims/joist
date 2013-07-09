// Copyright 2002-2013, University of Colorado Boulder

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
  var ButtonListener = require( 'SCENERY/input/ButtonListener' );
  var log = require( 'AXON/log' );

  var createMenuItem = function( text, width, callback ) {

    var menuItem = new Node( { cursor: 'pointer' } );

    var label = new Text( text, { fontSize: '18px' } );
    var xMargin = 5;
    var yMargin = 3;
    var cornerRadius = 5;
    var highlight = new Rectangle( 0, 0, width + xMargin + xMargin, label.height + yMargin + yMargin, cornerRadius, cornerRadius );

    menuItem.addChild( highlight );
    menuItem.addChild( label );

    label.left = highlight.left + xMargin;
    label.centerY = highlight.centerY;

    menuItem.addInputListener( {enter: function() {
      highlight.fill = '#a6d2f4';
    }, exit: function() {
      highlight.fill = null;
    }} );

    menuItem.addInputListener( new ButtonListener( {fire: callback } ) );
    return menuItem;
  };

  //TODO: The popup menu should scale with the size of the screen
  function PhetMenu( sim, options ) {

    options = _.extend( {renderer: 'svg'}, options ); //TODO add default options

    var simPopupMenu = this;
    Node.call( this );

    var maxItemWidth = 200;//TODO compute
    var homePageItem = createMenuItem( 'PhET Homepage', maxItemWidth, function() {
      window.open( "http://phet.colorado.edu" );
      window.focus();
    } );

    var outputLogItem = createMenuItem( 'Output log', maxItemWidth, function() {
      console.log( JSON.stringify( log.log ) );
    } );

    var aboutItem = createMenuItem( 'About...', maxItemWidth, function() {
      var aboutDialog = new AboutDialog( sim );
      sim.addChild( aboutDialog );
      var aboutDialogListener = {down: function() {
        aboutDialog.removeInputListener( aboutDialogListener );
        aboutDialog.detach();
      }};
      aboutDialog.addInputListener( aboutDialogListener );
    } );

    var items = [ homePageItem ];
    if ( log.enabled ) { items.push( outputLogItem ); }
    items.push( aboutItem );

    //left align the items

    //Compute bounds
    var widestItem = _.max( items, function( item ) {return item.width;} );
    var tallestItem = _.max( items, function( item ) {return item.height;} );

    var itemHeight = tallestItem.height;

    var verticalSpacing = 0;
    var padding = 5;
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
      simPopupMenu.addChild( item );

      // Put a separator before the last item.
      if ( item === items[items.length - 2] ) {
        simPopupMenu.addChild( new Path( {shape: Shape.lineSegment( 8, y + itemHeight + verticalSpacing / 2, bubbleWidth - 8, y + itemHeight + verticalSpacing / 2 ), stroke: 'gray', lineWidth: 1} ) );
      }
      y += itemHeight + verticalSpacing;
    } );

    this.mutate( options );
  }

  inherit( Node, PhetMenu );

  return PhetMenu;
} );