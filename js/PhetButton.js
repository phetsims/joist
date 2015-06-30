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
  var AdaptedFromText = require( 'JOIST/AdaptedFromText' );
  var Brand = require( 'BRAND/Brand' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Image = require( 'SCENERY/nodes/Image' );
  var FontAwesomeNode = require( 'SUN/FontAwesomeNode' );
  var inherit = require( 'PHET_CORE/inherit' );
  var PhetMenu = require( 'JOIST/PhetMenu' );
  var Property = require( 'AXON/Property' );
  var JoistButton = require( 'JOIST/JoistButton' );
  var UpdateCheck = require( 'JOIST/UpdateCheck' );

  // images
  var phetLogo = require( 'image!BRAND/logo.png' );
  //Makes the 'h' a bit darker so it will show up better against a white background
  var phetLogoDarker = require( 'image!BRAND/logo-on-white.png' );

  /**
   * @param {Sim} sim
   * @param {Property.<Color|string>} backgroundFillProperty
   * @param {Property.<Color|string>} textFillProperty
   * @param {Object} [options] Unused in client code.
   * @constructor
   */
  function PhetButton( sim, backgroundFillProperty, textFillProperty, options ) {

    options = _.extend( {
      textDescription: 'PhET Menu Button',
      phetLogoScale: 0.28, // {number}
      highlightExtensionWidth: 6,
      highlightExtensionHeight: 5,
      highlightCenterOffsetY: 4,
      tandem: null,
      listener: function() {

        var phetMenu = new PhetMenu( sim, {
          showSaveAndLoad: sim.options.showSaveAndLoad,
          closeCallback: function() {
            // hides the popup and barrier background
            sim.hidePopup( phetMenu, true );
            phetMenu.dispose();
          }
        } );

        /**
         * Sim.js handles scaling the popup menu.  This code sets the position of the popup menu.
         * @param {Bounds2} bounds - the size of the window.innerWidth and window.innerHeight, which depends on the scale
         * @param {Bounds2} screenBounds - subtracts off the size of the navbar from the height
         * @param {number} scale - the overall scaling factor for elements in the view
         */
        function onResize( bounds, screenBounds, scale ) {
          phetMenu.right = bounds.right / scale - 2 / scale;
          var navBarHeight = bounds.height - screenBounds.height;
          phetMenu.bottom = screenBounds.bottom / scale + navBarHeight / 2 / scale;
        }

        sim.on( 'resized', onResize );
        onResize( sim.bounds, sim.screenBounds, sim.scale );

        phetMenu.show();
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

    JoistButton.call( this, icon, backgroundFillProperty, options );

    // If this is an "adapted from PhET" brand, decorate the PhET button with "adapted from" text.
    if ( Brand.adaptedFromPhET ) {
      this.addChild( new AdaptedFromText( textFillProperty, {
        pickable: false,
        right: icon.left - 10,
        centerY: icon.centerY
      } ) );
    }

    Property.multilink( [ backgroundFillProperty, sim.showHomeScreenProperty, UpdateCheck.stateProperty ],
      function( backgroundFill, showHomeScreen, updateState ) {
        var backgroundIsWhite = backgroundFill !== 'black' && !showHomeScreen;
        var outOfDate = updateState === 'out-of-date';
        optionsButton.fill = backgroundIsWhite ? ( outOfDate ? '#0a0' : '#222' ) : ( outOfDate ? '#3F3' : 'white' );
        phetLabel.image = backgroundIsWhite ? phetLogoDarker : phetLogo;
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