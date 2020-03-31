// Copyright 2013-2020, University of Colorado Boulder

/**
 * The button that pops up the PhET menu, which appears in the bottom right of the home screen and on the right side
 * of the navbar.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Property from '../../axon/js/Property.js';
import inherit from '../../phet-core/js/inherit.js';
import Image from '../../scenery/js/nodes/Image.js';
import Node from '../../scenery/js/nodes/Node.js';
import joist from './joist.js';
import joistStrings from './joistStrings.js';
import JoistButton from './JoistButton.js';
import KebabMenuIcon from './KebabMenuIcon.js';
import PhetButtonIO from './PhetButtonIO.js';
import PhetMenu from './PhetMenu.js';
import updateCheck from './updateCheck.js';
import UpdateState from './UpdateState.js';

// Accommodate logos of any height by scaling them down proportionately.
// The primary logo is 108px high and we have been scaling it at 0.28 to make it look good even on higher resolution
// displays.  The logo will be scaled up to 108px high so the rest of the layout code will work smoothly
// Scale to the same height as the PhET logo, so that layout code works correctly.
// height of the PhET logo, brand/phet/images/logo.png or brand/adapted-from-phet/images/logo.png
const PHET_LOGO_HEIGHT = 108;
const PHET_LOGO_SCALE = 0.28;  // scale applied to the PhET logo

/**
 * @param {Sim} sim
 * @param {Property.<Color|string>} backgroundFillProperty
 * @param {Tandem} tandem
 * @constructor
 */
function PhetButton( sim, backgroundFillProperty, tandem ) {

  // Dynamic modules are loaded in SimLauncher and accessed through their namespace
  const Brand = phet.brand.Brand;
  assert && assert( Brand, 'Brand should exist by now' );

  // The logo images are loaded from the brand which is selected via query parameter (during requirejs mode)
  // or a grunt option (during the build), please see initialize-globals.js window.phet.chipper.brand for more
  // details
  const logoOnBlackBackground = Brand.logoOnBlackBackground;
  const logoOnWhiteBackground = Brand.logoOnWhiteBackground;

  const phetMenu = new PhetMenu( sim, this, tandem.createTandem( 'phetMenu' ), {
    closeCallback: function() {
      phetMenu.hide();
    }
  } );

  // Sim.js handles scaling the popup menu.  This code sets the position of the popup menu.
  // sim.bounds are null on init, but we will get the callback when it is sized for the first time
  // Does not need to be unlinked or disposed because this persists for the lifetime of the sim
  Property.multilink( [ sim.boundsProperty, sim.screenBoundsProperty, sim.scaleProperty ],
    ( bounds, screenBounds, scale ) => {
      if ( bounds && screenBounds && scale ) {
        phetMenu.right = bounds.right / scale - 2 / scale;
        const navBarHeight = bounds.height - screenBounds.height;
        phetMenu.bottom = screenBounds.bottom / scale + navBarHeight / 2 / scale;
      }
    } );

  // PhET logo
  const logoImage = new Image( logoOnBlackBackground, {
    scale: PHET_LOGO_SCALE / logoOnBlackBackground.height * PHET_LOGO_HEIGHT,
    pickable: false
  } );

  // The menu icon, to the right of the logo
  const menuIcon = new KebabMenuIcon( {
    left: logoImage.width + 8,
    bottom: logoImage.bottom - 0.5,
    pickable: false
  } );

  // The icon combines the PhET logo and the menu icon
  const icon = new Node( { children: [ logoImage, menuIcon ] } );

  JoistButton.call( this, icon, backgroundFillProperty, tandem, {
    highlightExtensionWidth: 6,
    highlightExtensionHeight: 5,
    highlightCenterOffsetY: 4,
    listener: function() {
      phetMenu.show();
    },
    phetioType: PhetButtonIO,
    phetioDocumentation: 'The button that appears at the right side of the navigation bar, which shows a menu when pressed',

    // This is the primary way to disable learners from accessing the phet menu in PhET-iO, so feature it.
    enabledPropertyOptions: {
      phetioFeatured: true
    },

    // a11y
    tagName: 'button',
    innerContent: joistStrings.a11y.phetMenu
  } );

  // No need to unlink, as the PhetButton exists for the lifetime of the sim
  Property.multilink( [ backgroundFillProperty, sim.screenProperty, updateCheck.stateProperty ],
    function( backgroundFill, screen, updateState ) {
      const showHomeScreen = screen === sim.homeScreen;
      const backgroundIsWhite = backgroundFill !== 'black' && !showHomeScreen;
      const outOfDate = updateState === UpdateState.OUT_OF_DATE;
      menuIcon.fill = backgroundIsWhite ? ( outOfDate ? '#0a0' : '#222' ) : ( outOfDate ? '#3F3' : 'white' );
      logoImage.image = backgroundIsWhite ? logoOnWhiteBackground : logoOnBlackBackground;
    } );

  // Added for phet-io, when toggling enabled, hide the option dots to prevent the cueing.
  // No need to be removed because the PhetButton exists for the lifetime of the sim.
  this.buttonModel.enabledProperty.link( enabled => { menuIcon.visible = enabled; } );

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

inherit( JoistButton, PhetButton );
export default PhetButton;