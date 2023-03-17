// Copyright 2013-2023, University of Colorado Boulder

/**
 * The button that pops up the PhET menu, which appears in the bottom right of the home screen and on the right side
 * of the navbar.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import TReadOnlyProperty from '../../axon/js/TReadOnlyProperty.js';
import Multilink from '../../axon/js/Multilink.js';
import TBrand from '../../brand/js/TBrand.js';
import { AriaHasPopUpMutator, Color, Image, Line, Node } from '../../scenery/js/imports.js';
import pushButtonSoundPlayer from '../../tambo/js/shared-sound-players/pushButtonSoundPlayer.js';
import Tandem from '../../tandem/js/Tandem.js';
import IOType from '../../tandem/js/types/IOType.js';
import joist from './joist.js';
import JoistButton from './JoistButton.js';
import JoistStrings from './JoistStrings.js';
import KebabMenuIcon from './KebabMenuIcon.js';
import PhetMenu from './PhetMenu.js';
import Sim from './Sim.js';
import updateCheck from './updateCheck.js';
import UpdateState from './UpdateState.js';

// Accommodate logos of any height by scaling them down proportionately.
// The primary logo is 108px high and we have been scaling it at 0.28 to make it look good even on higher resolution
// displays.  The logo will be scaled up to 108px high so the rest of the layout code will work smoothly
// Scale to the same height as the PhET logo, so that layout code works correctly.
// height of the PhET logo, brand/phet/images/logo.png or brand/adapted-from-phet/images/logo.png
const PHET_LOGO_HEIGHT = 108;
const PHET_LOGO_SCALE = 0.28; // scale applied to the PhET logo

class PhetButton extends JoistButton {
  /**
   * IO Type for PhetButton, to interface with PhET-iO API.  The PhetButtonIO acts as the main phet-io branding/logo in
   * the sim. It doesn't inherit from NodeIO because we neither need all of NodeIO's API methods, nor do we want to
   * support maintaining overriding no-ops in this file see https://github.com/phetsims/scenery/issues/711 for more info.
   */
  public static readonly PhetButtonIO = new IOType( 'PhetButtonIO', {
    valueType: PhetButton,
    documentation: 'The PhET Button in the bottom right of the screen'
  } );

  public constructor( sim: Sim, backgroundFillProperty: TReadOnlyProperty<Color>, tandem: Tandem ) {

    // Dynamic modules are loaded in simLauncher and accessed through their namespace
    const Brand: TBrand = phet.brand.Brand;
    assert && assert( Brand, 'Brand should exist by now' );

    // The logo images are loaded from the brand which is selected via query parameter (during unbuilt mode)
    // or a grunt option (during the build), please see initialize-globals.js window.phet.chipper.brand for more
    // details
    const logoOnBlackBackground = Brand.logoOnBlackBackground;
    const logoOnWhiteBackground = Brand.logoOnWhiteBackground;

    // PhET logo
    const logoImage = new Image( logoOnBlackBackground, {
      scale: PHET_LOGO_SCALE / logoOnBlackBackground.height * PHET_LOGO_HEIGHT * 0.85,
      pickable: false
    } );

    // The menu icon, to the right of the logo
    const menuIcon = new KebabMenuIcon( {
      scale: 0.83,
      left: logoImage.width + 8,
      bottom: logoImage.bottom - 0.5,
      pickable: false
    } );

    // Assert here means that ?ea was provided (potentially from the wrapper) AND that there are actually assertions
    // available for debugging.
    const children = assert && Tandem.PHET_IO_ENABLED ?
      [

        // The underline in phet-io debug mode. "7" is the right distance to avoid hiding the trademark.
        new Line( 0, 0, logoImage.width - 7, 0, {
          stroke: 'red', lineWidth: 3,
          left: logoImage.left,
          bottom: logoImage.bottom
        } ), logoImage, menuIcon ] :
      [ logoImage, menuIcon ];

    // The icon combines the PhET logo and the menu icon
    const icon = new Node( { children: children } );

    super( icon, backgroundFillProperty, {
      highlightExtensionWidth: 6,
      highlightExtensionHeight: 5,
      highlightCenterOffsetY: 4,
      listener: () => {
        phetMenu.show();
        phetMenu.items[ 0 ].focus();
        pushButtonSoundPlayer.play();
      },

      tandem: tandem,
      phetioType: PhetButton.PhetButtonIO,
      phetioDocumentation: 'The button that appears at the right side of the navigation bar, which shows a menu when pressed',

      // This is the primary way to prevent learners from accessing the PhET menu in PhET-iO, so feature it.
      enabledPropertyOptions: {
        phetioFeatured: true,
        phetioDocumentation: 'When disabled, the (three dots) are hidden and the button cannot be pressed, hiding the PhET menu.'
      },

      phetioVisiblePropertyInstrumented: false, // This button is our branding, don't ever hide it.

      // pdom
      innerContent: JoistStrings.a11y.phetMenuStringProperty,

      // voicing
      voicingNameResponse: JoistStrings.a11y.phetMenuStringProperty
    } );

    const phetMenu = new PhetMenu( sim, {
      tandem: tandem.createTandem( 'phetMenu' ),
      focusOnHideNode: this
    } );

    // Sim.js handles scaling the popup menu.  This code sets the position of the popup menu.
    // sim.bounds are null on init, but we will get the callback when it is sized for the first time
    // Does not need to be unlinked or disposed because PhetButton persists for the lifetime of the sim
    Multilink.multilink( [ sim.boundsProperty, sim.screenBoundsProperty, sim.scaleProperty, phetMenu.localBoundsProperty ],
      ( bounds, screenBounds, scale ) => {
        if ( bounds && screenBounds && scale ) {
          phetMenu.setScaleMagnitude( scale );
          phetMenu.right = bounds.right - 2;
          const navBarHeight = bounds.height - screenBounds.height;
          phetMenu.bottom = screenBounds.bottom + navBarHeight / 2;
        }
      } );


    // No need to unlink, as the PhetButton exists for the lifetime of the sim
    Multilink.multilink( [ backgroundFillProperty, sim.selectedScreenProperty, updateCheck.stateProperty ],
      ( backgroundFill, screen, updateState ) => {
        const showHomeScreen = screen === sim.homeScreen;
        const backgroundIsWhite = !backgroundFill.equals( Color.BLACK ) && !showHomeScreen;

        const outOfDate = updateState === UpdateState.OUT_OF_DATE;
        menuIcon.fill = backgroundIsWhite ? ( outOfDate ? '#0a0' : '#222' ) : ( outOfDate ? '#3F3' : 'white' );
        logoImage.image = backgroundIsWhite ? logoOnWhiteBackground : logoOnBlackBackground;
      } );

    // Added for phet-io, when toggling enabled, hide the option dots to prevent the cueing.
    // No need to be removed because the PhetButton exists for the lifetime of the sim.
    this.buttonModel.enabledProperty.link( enabled => { menuIcon.visible = enabled; } );

    // pdom - add an attribute that lets the user know the button opens a menu
    AriaHasPopUpMutator.mutateNode( this, true );
  }
}

joist.register( 'PhetButton', PhetButton );
export default PhetButton;