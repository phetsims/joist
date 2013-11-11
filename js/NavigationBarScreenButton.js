// Copyright 2002-2013, University of Colorado Boulder

/**
 * Button for a single screen in the navigation bar, shows the text and the navigation bar icon.
 *
 * @author Sam Reid
 */
define( function( require ) {
  'use strict';

  var Node = require( 'SCENERY/nodes/Node' );
  var HBox = require( 'SCENERY/nodes/HBox' );
  var VBox = require( 'SCENERY/nodes/VBox' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var Text = require( 'SCENERY/nodes/Text' );
  var inherit = require( 'PHET_CORE/inherit' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var HighlightNode = require( 'JOIST/HighlightNode' );
  var PushButton = require( 'SUN/PushButton' );
  var ToggleNode = require( 'SUN/ToggleNode' );
  var Property = require( 'AXON/Property' );

  /**
   * Create a nav bar.  Layout assumes all of the screen widths are the same.
   * @param {Sim} sim
   * @param {Screen} screen
   * @param {Number} navBarHeight
   * @param {Boolean} whiteColorScheme true if the color scheme should be white, false if it should be black
   * @constructor
   */
  function NavigationBarScreenButton( sim, screen, navBarHeight, whiteColorScheme, minWidth ) {
    var icon = new Node( {children: [screen.navigationBarIcon], scale: ( 0.625 * navBarHeight ) / screen.navigationBarIcon.height} );

    var createNode = function( selected, highlighted, down ) {
      var text = new Text( screen.name, { fill: whiteColorScheme ?
                                                (selected ? 'black' : 'gray') :
                                                (selected ? 'yellow' : 'white'), visible: true} );

      var box = new VBox( {children: [icon, text], opacity: selected ? 1.0 : down ? 0.65 : 0.5} );

      //add an overlay so that the icons can be placed next to each other with an HBox, also sets the toucharea/mousearea
      var overlay = new Rectangle( 0, 0, minWidth, box.height );
      overlay.centerX = box.centerX;
      overlay.y = box.y;
      if ( highlighted ) {
        var highlight = new HighlightNode( overlay.width + 4, overlay.height, {centerX: box.centerX, whiteHighlight: !whiteColorScheme} );
        return new Node( {children: [box, highlight, overlay]} );
      }
      else {
        return new Node( {children: [box, overlay]} );
      }
    };

    var selectedNode = new PushButton( createNode( true, false, false ), createNode( true, true, false ), createNode( true, true, true ), createNode( true, false, false ), {} );
    var unselectedNode = new PushButton( createNode( false, false, false ), createNode( false, true, false ), createNode( false, true, true ), createNode( false, false, false ), {} );
    unselectedNode.addListener( function() { sim.simModel.screenIndex = sim.screens.indexOf( screen ); } );

    var selected = sim.simModel.screenIndexProperty.valueEquals( sim.screens.indexOf( screen ) );

    //We can skip wrapping the children here to improve performance slightly since we are certain they aren't used elsewhere in the scenery DAG
    ToggleNode.call( this, selectedNode, unselectedNode, selected, {pickable: true, wrapChildren: false} );
  }

  return inherit( ToggleNode, NavigationBarScreenButton );
} );