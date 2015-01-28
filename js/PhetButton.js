// Copyright 2002-2013, University of Colorado Boulder

/**
 * The button that pops up the PhET menu, which appears in the bottom right of the home screen and on the right side
 * of the navbar.
 *
 * @author Sam Reid
 */
define( function( require ) {
  'use strict';

  // modules
  var Node = require( 'SCENERY/nodes/Node' );
  var Image = require( 'SCENERY/nodes/Image' );
  var FontAwesomeNode = require( 'SUN/FontAwesomeNode' );
  var inherit = require( 'PHET_CORE/inherit' );
  var PhetMenu = require( 'JOIST/PhetMenu' );
  var Property = require( 'AXON/Property' );
  var JoistButton = require( 'JOIST/JoistButton' );

  // images
  var phetLogo = require( 'image!BRAND/logo.png' );
  //Makes the 'h' a bit darker so it will show up better against a white background
  var phetLogoDarker = require( 'image!BRAND/logo-on-white.png' );

  /**
   * @param {Sim} sim
   * @param {Object} [options] Unused in client code.
   * @constructor
   */
  function PhetButton( sim, options ) {

    options = _.extend( {
      focusable: true,
      textDescription: 'PhET Menu Button',
      phetLogoScale: 0.28, // {number}
      highlightExtensionWidth: 6,
      highlightExtensionHeight: 5,
      highlightCenterOffsetY: 4,
      listener: function() {

        var phetMenu = new PhetMenu( sim, {
          showSaveAndLoad: sim.options.showSaveAndLoad,
          showScreenshotOption: sim.options.showScreenshotOption,
          showFullscreenOption: sim.options.showFullscreenOption,
          closeCallback: function() {
            // hides the popup and barrier background
            sim.hidePopup( phetMenu, true );
          }
        } );

        function onResize( bounds, screenBounds, scale ) {
          // because it starts at null
          if ( bounds ) {
            phetMenu.setScaleMagnitude( Math.max( 1, scale * 0.7 ) ); // minimum size for small devices
            phetMenu.right = bounds.right - 10 * scale;
            phetMenu.bottom = ( bounds.bottom + screenBounds.bottom ) / 2;
          }
        }

        sim.on( 'resized', onResize );
        onResize( sim.bounds, sim.screenBounds, sim.scale );

        sim.showPopup( phetMenu, true );
      }
    }, options );

    // The PhET Label, which is the PhET logo
    var phetLabel = new Image( phetLogo, {
      scale: options.phetLogoScale,
      pickable: false
    } );

    var optionsButton = new FontAwesomeNode( 'reorder', {
      scale: 0.6,
      left:   phetLabel.width + 10,
      bottom: phetLabel.bottom - 1.5,
      pickable: false
    } );

    // The icon combines the PhET label and the thre horizontal bars in the right relative positions
    var icon = new Node( { children: [ phetLabel, optionsButton ] } );

    JoistButton.call( this, icon, sim.useInvertedColorsProperty, options );

    Property.multilink( [ this.interactionStateProperty, sim.useInvertedColorsProperty ], function( interactionState, useInvertedColors ) {
      optionsButton.fill = useInvertedColors ? '#222' : 'white';
      phetLabel.image = useInvertedColors ? phetLogoDarker : phetLogo;
    } );
  }

  return inherit( JoistButton, PhetButton, {},

    //statics
    {

      //How much space between the PhetButton and the right side of the screen.
      HORIZONTAL_INSET: 5,

      //How much space between the PhetButton and the bottom of the screen
      VERTICAL_INSET: 0
    } );
} );