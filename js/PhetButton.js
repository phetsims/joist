// Copyright 2013-2018, University of Colorado Boulder

/**
 * The button that pops up the PhET menu, which appears in the bottom right of the home screen and on the right side
 * of the navbar.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var Image = require( 'SCENERY/nodes/Image' );
  var inherit = require( 'PHET_CORE/inherit' );
  var joist = require( 'JOIST/joist' );
  var JoistA11yStrings = require( 'JOIST/JoistA11yStrings' );
  var JoistButton = require( 'JOIST/JoistButton' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Path = require( 'SCENERY/nodes/Path' );
  var PhetButtonIO = require( 'JOIST/PhetButtonIO' );
  var PhetMenu = require( 'JOIST/PhetMenu' );
  var Property = require( 'AXON/Property' );
  var Shape = require( 'KITE/Shape' );
  var UpdateCheck = require( 'JOIST/UpdateCheck' );

  // a11y strings
  var phetString = JoistA11yStrings.phet.value;

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
  // height of the PhET logo, brand/phet/images/logo.png or brand/adapted-from-phet/images/logo.png
  var PHET_LOGO_HEIGHT = 108;
  var PHET_LOGO_SCALE = 0.28;  // scale applied to the PhET logo
  assert && assert( Array.isArray( brightLogoMipmap ), 'logo must be a mipmap' );
  var LOGO_SCALE = PHET_LOGO_SCALE / brightLogoMipmap[ 0 ].height * PHET_LOGO_HEIGHT;

  /**
   * @param {Sim} sim
   * @param {Property.<Color|string>} backgroundFillProperty
   * @param {Tandem} tandem
   * @constructor
   */
  function PhetButton( sim, backgroundFillProperty, tandem ) {
    var self = this;

    var phetMenu = new PhetMenu( sim, tandem.createTandem( 'phetMenu' ), {
      showSaveAndLoad: sim.options.showSaveAndLoad,
      closeCallback: function() {
        phetMenu.hide();
      }
    } );

    /**
     * Sim.js handles scaling the popup menu.  This code sets the position of the popup menu.
     * @param {number} width
     * @param {number} height
     */
    function onResize( width, height ) {
      var bounds = sim.boundsProperty.value;
      var screenBounds = sim.screenBoundsProperty.value;
      var scale = sim.scaleProperty.value;
      phetMenu.right = bounds.right / scale - 2 / scale;
      var navBarHeight = bounds.height - screenBounds.height;
      phetMenu.bottom = screenBounds.bottom / scale + navBarHeight / 2 / scale;
    }

    // sim.bounds are null on init, but we will get the callback when it is sized for the first time
    sim.resizedEmitter.addListener( onResize );

    var options = {
      highlightExtensionWidth: 6,
      highlightExtensionHeight: 5,
      highlightCenterOffsetY: 4,
      listener: function() {
        phetMenu.show();
      },
      phetioType: PhetButtonIO,
      phetioDocumentation: 'The button that appears at the right side of the navigation bar, which shows a menu when pressed',

      // a11y
      tagName: 'button',
      innerContent: phetString
    };

    // The PhET Label, which is the PhET logo
    var logoImage = new Image( brightLogoMipmap, {
      scale: LOGO_SCALE,
      pickable: false
    } );

    var optionsShape = new Shape();
    var optionsCircleRadius = 2.5;
    for ( var i = 0; i < 3; i++ ) {
      var circleOffset = i * 3.5 * optionsCircleRadius;
      optionsShape.arc( 0, circleOffset, optionsCircleRadius, 0, 2 * Math.PI, false );
    }

    var optionsButton = new Path( optionsShape, {
      left: logoImage.width + 8,
      bottom: logoImage.bottom,
      pickable: false
    } );

    // The icon combines the PhET label and the thre horizontal bars in the right relative positions
    var icon = new Node( { children: [ logoImage, optionsButton ] } );

    JoistButton.call( this, icon, backgroundFillProperty, tandem, options );

    // No need to unlink, as the PhetButton exists for the lifetime of the sim
    Property.multilink( [ backgroundFillProperty, sim.showHomeScreenProperty, UpdateCheck.stateProperty ],
      function( backgroundFill, showHomeScreen, updateState ) {
        var backgroundIsWhite = backgroundFill !== 'black' && !showHomeScreen;
        var outOfDate = updateState === 'out-of-date';
        optionsButton.fill = backgroundIsWhite ? ( outOfDate ? '#0a0' : '#222' ) : ( outOfDate ? '#3F3' : 'white' );
        logoImage.image = backgroundIsWhite ? darkLogoMipmap : brightLogoMipmap;
      } );

    // added for phet-io, when toggling pickability, hide the option dots to prevent the queueing
    // no need to be removed because the PhetButton exists for the lifetime of the sim.
    this.on( 'pickability', function() {
      optionsButton.visible = self.pickable !== false; // null should still have visible kabab dots
    } );

    // a11y - add a listener that opens the menu on 'click' and 'reset', and closes it on escape and if the
    // button receives focus again
    this.addInputListener( {
      click: function() {

        // open and set focus on the first item
        phetMenu.show();
        phetMenu.items[ 0 ].focus();
      }
    } );

    // a11y - add an attribute that lets the user know the button opens a menu
    this.setAccessibleAttribute( 'aria-haspopup', true );
  }

  joist.register( 'PhetButton', PhetButton );

  return inherit( JoistButton, PhetButton );
} );