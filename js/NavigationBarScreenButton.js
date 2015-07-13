// Copyright 2002-2013, University of Colorado Boulder

/**
 * Button for a single screen in the navigation bar, shows the text and the navigation bar icon.
 *
 * @author Sam Reid
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 * @author Chris Malley (PixelZoom, Inc.)
 */
define( function( require ) {
  'use strict';

  // modules
  var Node = require( 'SCENERY/nodes/Node' );
  var VBox = require( 'SCENERY/nodes/VBox' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var Text = require( 'SCENERY/nodes/Text' );
  var inherit = require( 'PHET_CORE/inherit' );
  var HighlightNode = require( 'JOIST/HighlightNode' );
  var PushButtonModel = require( 'SUN/buttons/PushButtonModel' );
  var ButtonListener = require( 'SUN/buttons/ButtonListener' );
  var Property = require( 'AXON/Property' );
  var DerivedProperty = require( 'AXON/DerivedProperty' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );

  // constants
  var HIGHLIGHT_SPACING = 4;

  /**
   * Create a nav bar.  Layout assumes all of the screen widths are the same.
   * @param {Property.<string>} navigationBarFillProperty - the color of the navbar, as a string.
   * @param {Property.<number>} screenIndexProperty
   * @param {Array.<Screen>} screens - all of the available sim content screens (excluding the home screen)
   * @param {Screen} screen
   * @param {number} navBarHeight
   * @param {Object} [options]
   * @constructor
   */
  function NavigationBarScreenButton( navigationBarFillProperty, screenIndexProperty, screens, screen, navBarHeight, options ) {

    options = _.extend( {
      cursor: 'pointer',
      focusable: true,
      textDescription: screen.name + ' Screen: Button',
      tandem: null,
      maxButtonWidth: null // {number|null} the maximum width of the button, causes text to be scaled down if necessary
    }, options );

    Node.call( this );

    var icon = new Node( {
      children: [ screen.navigationBarIcon ],
      scale: ( 0.625 * navBarHeight ) / screen.navigationBarIcon.height
    } );

    // Is this button's screen selected?
    var selectedProperty = new DerivedProperty( [ screenIndexProperty ], function( screenIndex ) {
      return screenIndex === screens.indexOf( screen );
    } );

    // create the button model, needs to be public so that together wrappers can hook up to it if needed
    this.buttonModel = new PushButtonModel( {
      listener: function() {
        screenIndexProperty.value = screens.indexOf( screen );
      }
    } );
    this.addInputListener( new ButtonListener( this.buttonModel ) );

    options.tandem && options.tandem.addInstance( this );

    var text = new Text( screen.name, {
      font: new PhetFont( 10 )
    } );

    var box = new VBox( {
      children: [ icon, text ],
      pickable: false,
      spacing: Math.max( 0, 12 - text.height ), // see https://github.com/phetsims/joist/issues/143
      usesOpacity: true // hint, since we change its opacity
    } );

    // add a transparent overlay for input handling and to size touchArea/mouseArea
    var overlay = new Rectangle( 0, 0, box.width, box.height, { center: box.center } );

    // highlights
    var highlightWidth = overlay.width + ( 2 * HIGHLIGHT_SPACING );
    var brightenHighlight = new HighlightNode( highlightWidth, overlay.height, {
      center: box.center,
      fill: 'white'
    } );
    var darkenHighlight = new HighlightNode( highlightWidth, overlay.height, {
      center: box.center,
      fill: 'black'
    } );

    this.addChild( box );
    this.addChild( overlay );
    this.addChild( brightenHighlight );
    this.addChild( darkenHighlight );

    // manage interaction fedback
    Property.multilink(
      [ selectedProperty, this.buttonModel.downProperty, this.buttonModel.overProperty, navigationBarFillProperty ],
      function update( selected, down, over, navigationBarFill ) {

        var useDarkenHighlights = ( navigationBarFill !== 'black' );

        // Color match yellow with the PhET Logo
        var selectedTextColor = useDarkenHighlights ? 'black' : '#f2e916';
        var unselectedTextColor = useDarkenHighlights ? 'gray' : 'white';

        text.fill = selected ? selectedTextColor : unselectedTextColor;
        box.opacity = selected ? 1.0 : ( down ? 0.65 : 0.5 );
        brightenHighlight.visible = !useDarkenHighlights && ( over || down );
        darkenHighlight.visible = useDarkenHighlights && ( over || down );
      } );

    // Constrain text width, if necessary
    if ( options.maxButtonWidth && ( this.width > options.maxButtonWidth ) && ( text.width > icon.width ) ) {

      text.maxWidth = options.maxButtonWidth - ( this.width - text.width );

      // adjust the overlay
      overlay.setRect( 0, 0, box.width, overlay.height );
      overlay.center = box.center;

      // adjust the highlights
      brightenHighlight.spacing = darkenHighlight.spacing = overlay.width + ( 2 * HIGHLIGHT_SPACING );
      brightenHighlight.center = darkenHighlight.center = box.center;
    }

    this.mutate( _.omit( options, 'tandem' ) );
  }

  return inherit( Node, NavigationBarScreenButton );
} );
