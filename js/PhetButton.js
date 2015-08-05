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
  // The logo images are loaded from the brand which is selected via query parameter (during requirejs mode)
  // or a grunt option (during the build), please see initialize-globals.js window.phet.chipper.brand for more 
  // details
  var brightLogoMipmap = require( 'mipmap!BRAND/logo.png' ); // on a black navbar
  var darkLogoMipmap = require( 'mipmap!BRAND/logo-on-white.png' ); // on a white navbar

  // Accommodate logos of any height by scaling them down proportionately.
  // The primary logo is 108px high and we have been scaling it at 0.28 to make it look good even on higher resolution
  // displays.  The following math scales up the logo to 108px high so the rest of the layout code will work smoothly
  // Scale to the same height as the PhET logo, so that layout code works correctly.
  var PHET_LOGO_HEIGHT = 108;  // height of the PhET logo, brand/phet/images/logo.png
  var PHET_LOGO_SCALE = 0.28;  // scale applied to the PhET logo
  assert && assert( brightLogoMipmap instanceof Array, 'logo must be a mipmap' );
  var LOGO_SCALE = PHET_LOGO_SCALE / brightLogoMipmap[ 0 ].height * PHET_LOGO_HEIGHT;

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
      highlightExtensionWidth: 6,
      highlightExtensionHeight: 5,
      highlightCenterOffsetY: 4,
      tandem: null,
      listener: function() {

        var phetMenu = new PhetMenu( sim, {
          showSaveAndLoad: sim.options.showSaveAndLoad,
          tandem: options.tandem && options.tandem.createTandem( 'phetMenu' ),
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
    var logoImage = new Image( brightLogoMipmap, {
      scale: LOGO_SCALE,
      pickable: false
    } );

    var optionsButton = new FontAwesomeNode( 'reorder', {
      scale: 0.6,
      left: logoImage.width + 10,
      bottom: logoImage.bottom - 1.5,
      pickable: false
    } );

    // The icon combines the PhET label and the thre horizontal bars in the right relative positions
    var icon = new Node( { children: [ logoImage, optionsButton ] } );

    JoistButton.call( this, icon, backgroundFillProperty, options );

    // If this is an "adapted from PhET" brand, decorate the PhET button with "adapted from" text.
    if ( Brand.id === 'adapted-from-phet' ) {
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
        logoImage.image = backgroundIsWhite ? darkLogoMipmap : brightLogoMipmap;
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