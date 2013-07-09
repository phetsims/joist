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
  var Property = require( 'AXON/Property' );

  var createMenuItem = function( text, callback ) {
     return new Text( text, { fontSize: '18px' } ).addInputListener( new ButtonListener( {fire: callback } ) );
  };

  //TODO: The popup menu should scale with the size of the screen
  function PhetMenu( sim, options ) {

    options = _.extend( {renderer: 'svg'}, options ); //TODO add default options

    var simPopupMenu = this;
    Node.call( this );

    this.visibleProperty = new Property( false );

    //Create it statically (even though it may not be used) because creating it dynamically can cause flickering on iPad//TODO: Fix this
    var aboutDialog = new AboutDialog( sim );

    var homePageItem = createMenuItem( 'PhET Homepage', function() {
      window.open( "http://phet.colorado.edu" );
      window.focus();
    } );

    var outputLogItem = createMenuItem( 'Output log', function() {
      console.log( JSON.stringify( log.log ) );
    } );

    var aboutItem = createMenuItem( 'About...', function() {
      sim.addChild( aboutDialog );
      aboutDialog.addInputListener( {down: function() {
        aboutDialog.detach();
      }} );
    } );

    var items = [ homePageItem ];
    if ( log.enabled ) { items.push( outputLogItem ); }
    items.push( aboutItem );

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

    this.mutate( options );
  }

  inherit( Node, PhetMenu );

  return PhetMenu;
} );