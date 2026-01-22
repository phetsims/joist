// Copyright 2013-2019, University of Colorado Boulder

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
  var TransformTracker = require( 'SCENERY/util/TransformTracker' );
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
   * @param {Property.<Color|string>} textFillProperty
   * @param {Tandem} tandem
   * @constructor
   */
  function PhetButton( sim, backgroundFillProperty, textFillProperty, tandem ) {

    var phetMenu = new PhetMenu( sim, tandem.createTandem( 'phetMenu' ), {
      showSaveAndLoad: sim.options.showSaveAndLoad,
      closeCallback: function() {
        phetMenu.hide();
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
      phetioState: false,
      phetioInstanceDocumentation: 'The button that appears in the bottom of the right of the screen, which shows a menu when pressed.',

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
      var circleOffset = i * 3.543 * optionsCircleRadius;
      optionsShape.arc( 0, circleOffset, optionsCircleRadius, 0, 2 * Math.PI, false );
    }

    var optionsButton = new Path( optionsShape, {
      left: logoImage.width + 8,
      bottom: logoImage.bottom - 0.5,
      pickable: false
    } );

    // The icon combines the PhET label and the thre horizontal bars in the right relative positions
    var icon = new Node( { children: [ logoImage, optionsButton ] } );

    JoistButton.call( this, icon, backgroundFillProperty, tandem, options );

    Property.multilink( [ backgroundFillProperty, sim.showHomeScreenProperty, UpdateCheck.stateProperty ],
      function( backgroundFill, showHomeScreen, updateState ) {
        var backgroundIsWhite = backgroundFill !== 'black' && !showHomeScreen;
        var outOfDate = updateState === 'out-of-date';
        optionsButton.fill = backgroundIsWhite ? ( outOfDate ? '#0a0' : '#222' ) : ( outOfDate ? '#3F3' : 'white' );
        logoImage.image = backgroundIsWhite ? darkLogoMipmap : brightLogoMipmap;
      } );

    // a11y - add a listener that opens the menu on 'click' and 'reset', and closes it on escape and if the
    // button receives focus again
    this.addAccessibleInputListener( {
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

  return inherit( JoistButton, PhetButton, {}, {
      // @public - How much space between the PhetButton and the right side of the screen.
      HORIZONTAL_INSET: 10,

      // @ public - How much space between the PhetButton and the bottom of the screen
      VERTICAL_INSET: 0,

      /**
       * Ensures that the home-screen's phet button will have the same global transform as the navbar's phet button.
       * Listens to both sides (the navbar button, and the home-screen's button's parent) so that when either changes,
       * the transforms are synchronized by changing the home-screen's button position.
       * See https://github.com/phetsims/joist/issues/304.
       * @public (joist-internal)
       *
       * @param {HomeScreenView} homeScreen - The home screen view, where we will position the phet button.
       * @param {NavigationBar} navigationBar - The main navigation bar
       * @param {Node} rootNode - The root of the Display's node tree
       */
      linkPhetButtonTransform: function( homeScreen, navigationBar, rootNode ) {
        var homeScreenButton = homeScreen.view.phetButton;

        var navBarButtonTracker = new TransformTracker( navigationBar.phetButton.getUniqueTrailTo( rootNode ), {
          isStatic: true // our listener won't change any listeners - TODO: replace with emitter? see https://github.com/phetsims/scenery/issues/594
        } );
        var homeScreenTracker = new TransformTracker( homeScreenButton.getParent().getUniqueTrailTo( rootNode ), {
          isStatic: true // our listener won't change any listeners - TODO: replace with emitter? see https://github.com/phetsims/scenery/issues/594
        } );

        function transformPhetButton() {
          // Ensure transform equality: navBarButton(global) = homeScreen(global) * homeScreenButton(self)
          homeScreenButton.matrix = homeScreenTracker.matrix.inverted().timesMatrix( navBarButtonTracker.matrix );
        }

        // hook up listeners
        navBarButtonTracker.addListener( transformPhetButton );
        homeScreenTracker.addListener( transformPhetButton );

        // synchronize immediately, in case there are no more transform changes before display
        transformPhetButton();
      }
    }
  );
} );