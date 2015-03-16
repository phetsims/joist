// Copyright 2002-2013, University of Colorado Boulder

/**
 * Button for a single screen in the navigation bar, shows the text and the navigation bar icon.
 *
 * @author Sam Reid
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( function( require ) {
  'use strict';

  var Node = require( 'SCENERY/nodes/Node' );
  var VBox = require( 'SCENERY/nodes/VBox' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var Text = require( 'SCENERY/nodes/Text' );
  var inherit = require( 'PHET_CORE/inherit' );
  var HighlightNode = require( 'JOIST/HighlightNode' );
  var PushButtonModel = require( 'SUN/buttons/PushButtonModel' );
  var ButtonListener = require( 'SUN/buttons/ButtonListener' );
  var Multilink = require( 'AXON/Multilink' );
  var DerivedProperty = require( 'AXON/DerivedProperty' );

  /**
   * Create a nav bar.  Layout assumes all of the screen widths are the same.
   * @param {Property.<string>} navigationBarFillProperty - the color of the navbar, as a string.
   * @param {Property.<number>} screenIndexProperty
   * @param {Sim} sim
   * @param {Array.<Screen>} screens - all of the available sim content screens (excluding the home screen)
   * @param {Screen} screen
   * @param {number} navBarHeight
   * @param {number} minWidth
   * @constructor
   */
  function NavigationBarScreenButton( navigationBarFillProperty, screenIndexProperty, screens, screen, navBarHeight, minWidth ) {
    Node.call( this, {
      cursor: 'pointer',
      focusable: true,
      textDescription: screen.name + ' Screen: Button'
    } );

    var icon = new Node( {
      children: [ screen.navigationBarIcon ],
      scale: ( 0.625 * navBarHeight ) / screen.navigationBarIcon.height
    } );

    var selected = new DerivedProperty( [ screenIndexProperty ], function( screenIndex ) {
      return screenIndex === screens.indexOf( screen );
    } );
    var buttonModel = new PushButtonModel( {
      listener: function() {
        screenIndexProperty.value = screens.indexOf( screen );
      },
      componentID: screen.navigationBarScreenButtonComponentID
    } );
    this.addInputListener( new ButtonListener( buttonModel ) );

    var text = new Text( screen.name );

    var box = new VBox( {
      children: [ icon, text ],
      pickable: false,
      usesOpacity: true // hint, since we change its opacity
    } );

    //add an overlay so that the icons can be placed next to each other with an HBox, also sets the toucharea/mousearea
    var overlay = new Rectangle( 0, 0, minWidth, box.height );
    overlay.centerX = box.centerX;
    overlay.y = box.y;

    // Make things brighter when against a dark background
    var brightenHighlight = new HighlightNode( overlay.width + 4, overlay.height, {
      centerX: box.centerX,
      whiteHighlight: true,
      pickable: false
    } );

    // Make things darker when against a light background
    var darkenHighlight = new HighlightNode( overlay.width + 4, overlay.height, {
      centerX: box.centerX,
      whiteHighlight: false,
      pickable: false
    } );

    this.addChild( box );
    this.addChild( brightenHighlight );
    this.addChild( darkenHighlight );
    this.addChild( overlay );

    this.multilink = new Multilink( [ selected, buttonModel.downProperty, buttonModel.overProperty, navigationBarFillProperty ], function update() {

      var useDarkenHighlights = navigationBarFillProperty.value !== 'black';

      // Color match yellow with the PhET Logo
      var selectedTextColor = useDarkenHighlights ? 'black' : '#f2e916';
      var unselectedTextColor = useDarkenHighlights ? 'gray' : 'white';

      text.fill = selected.get() ? selectedTextColor : unselectedTextColor;
      box.opacity = selected.get() ? 1.0 : buttonModel.down ? 0.65 : 0.5;
      brightenHighlight.visible = !useDarkenHighlights && ( buttonModel.over || buttonModel.down );
      darkenHighlight.visible = useDarkenHighlights && ( buttonModel.over || buttonModel.down );
    } );
  }

  return inherit( Node, NavigationBarScreenButton );
} );
