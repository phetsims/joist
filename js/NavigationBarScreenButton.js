// Copyright 2002-2013, University of Colorado Boulder

/**
 * Button for a single screen in the navigation bar, shows the text and the navigation bar icon.
 *
 * @author Sam Reid
 */
define( function( require ) {
  'use strict';

  var Node = require( 'SCENERY/nodes/Node' );
  var Path = require( 'SCENERY/nodes/Path' );
  var HBox = require( 'SCENERY/nodes/HBox' );
  var VBox = require( 'SCENERY/nodes/VBox' );
  var Text = require( 'SCENERY/nodes/Text' );
  var FontAwesomeNode = require( 'SUN/FontAwesomeNode' );
  var Panel = require( 'SUN/Panel' );
  var HomeButton = require( 'SCENERY_PHET/HomeButton' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var inherit = require( 'PHET_CORE/inherit' );
  var PhetMenu = require( 'JOIST/PhetMenu' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Shape = require( 'KITE/Shape' );
  var LinearGradient = require( 'SCENERY/util/LinearGradient' );
  var PhetButton = require( 'JOIST/PhetButton' );
  var ButtonListener = require( 'SCENERY/input/ButtonListener' );
  var Highlight = require( 'JOIST/Highlight' );
  var PushButton = require( 'SUN/PushButton' );
  var ToggleNode = require( 'SUN/ToggleNode' );
  var Property = require( 'AXON/Property' );

  /**
   * Create a nav bar.  Layout assumes all of the screen widths are the same.
   * @param {Sim} sim
   * @param {Array<Screen>} screens
   * @param {PropertySet} model see joist.Sim
   * @param {Boolean} whiteColorScheme true if the color scheme should be white, false if it should be black
   * @constructor
   */
  function NavigationBarScreenButton( sim, screen, navBarHeight, whiteColorScheme ) {
    var navigationBarScreenButton = this;

    var icon = new Node( {children: [screen.navigationBarIcon], scale: ( 0.625 * navBarHeight ) / screen.navigationBarIcon.height} );
    var text = new Text( screen.name, { fill: 'white', visible: true} );

//    if ( whiteColorScheme ) {
//      iconAndText.text.fill = selected ? 'black' : 'gray';
//    }
//    else {
//      iconAndText.text.fill = selected ? 'yellow' : 'white';
//    }
//    iconAndText.text.font = selected ? selectedFont : normalFont;
//    iconAndText.opacity = selected ? 1.0 : 0.5;

    var upNode = new VBox( {children: [icon, text]} );
    var overNode = new VBox( {children: [icon, text]} );
    var downNode = new VBox( {children: [icon, text]} );
    var disabledNode = new VBox( {children: [icon, text]} );

    var trueNode = new PushButton( upNode, overNode, downNode, disabledNode, {} );

    var falseNode = new PushButton( upNode, overNode, downNode, disabledNode, {} );

    var selected = new Property( true );
    ToggleNode.call( this, trueNode, falseNode, selected, {} );
  }

  return inherit( ToggleNode, NavigationBarScreenButton );
} );