// Copyright 2013-2020, University of Colorado Boulder

/**
 * The button that pops up the PhET menu, which appears in the bottom right of the home screen and on the right side
 * of the navbar.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import Property from '../../axon/js/Property.js';
import inherit from '../../phet-core/js/inherit.js';
import Image from '../../scenery/js/nodes/Image.js';
import Node from '../../scenery/js/nodes/Node.js';
import NodeProperty from '../../scenery/js/util/NodeProperty.js';
import pushButtonSoundPlayer from '../../tambo/js/shared-sound-players/pushButtonSoundPlayer.js';
import Tandem from '../../tandem/js/Tandem.js';
import BooleanIO from '../../tandem/js/types/BooleanIO.js';
import IOType from '../../tandem/js/types/IOType.js';
import NullableIO from '../../tandem/js/types/NullableIO.js';
import JoistButton from './JoistButton.js';
import KebabMenuIcon from './KebabMenuIcon.js';
import PhetMenu from './PhetMenu.js';
import UpdateState from './UpdateState.js';
import joist from './joist.js';
import joistStrings from './joistStrings.js';
import updateCheck from './updateCheck.js';

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

  // Dynamic modules are loaded in simLauncher and accessed through their namespace
  const Brand = phet.brand.Brand;
  assert && assert( Brand, 'Brand should exist by now' );

  // The logo images are loaded from the brand which is selected via query parameter (during unbuilt mode)
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
        phetMenu.setScaleMagnitude( scale );
        phetMenu.right = bounds.right - 2;
        const navBarHeight = bounds.height - screenBounds.height;
        phetMenu.bottom = screenBounds.bottom + navBarHeight / 2;
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
      pushButtonSoundPlayer.play();
    },
    phetioType: PhetButton.PhetButtonIO,
    phetioDocumentation: 'The button that appears at the right side of the navigation bar, which shows a menu when pressed',

    // This is the primary way to disable learners from accessing the phet menu in PhET-iO, so feature it.
    enabledPropertyOptions: {
      phetioFeatured: true
    },

    visiblePropertyOptions: {
      // TODO: Shouldn't it be read-only instead of uninstrumented? See https://github.com/phetsims/scenery/issues/1046
      tandem: Tandem.OPT_OUT,
      phetioReadOnly: true
    },

    // pdom
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

  // pdom - add a listener that opens the menu on 'click' and 'reset', and closes it on escape and if the
  // button receives focus again
  this.addInputListener( {
    click: function() {

      // open and set focus on the first item
      phetMenu.show();
      phetMenu.items[ 0 ].focus();

      // sound generation
      pushButtonSoundPlayer.play();
    }
  } );

  // pdom - add an attribute that lets the user know the button opens a menu
  this.setAccessibleAttribute( 'aria-haspopup', true );
}


inherit( JoistButton, PhetButton );

/**
 * IO Type for PhetButton, to interface with phet-io api.  The PhetButtonIO acts as the main phet-io branding/logo in
 * the sim. It doesn't inherit from NodeIO because we neither need all of NodeIO's API methods, nor do we want to
 * support maintaining overriding no-ops in this file see https://github.com/phetsims/scenery/issues/711 for more info.
 */
PhetButton.PhetButtonIO = new IOType( 'PhetButtonIO', {
  valueType: PhetButton,
  documentation: 'The PhET Button in the bottom right of the screen',
  wrapInstance( phetButton, phetioID ) {

    // This code is similar to code in NodeIO, but it is not customizable through phetioComponentOptions because all
    // instances have the same level of instrumentation.
    const pickableProperty = new NodeProperty( phetButton, phetButton.pickableProperty, 'pickable', {

      // pick the following values from the parent Node
      phetioReadOnly: phetButton.phetioReadOnly,
      tandem: phetButton.tandem.createTandem( 'pickableProperty' ),
      phetioType: Property.PropertyIO( NullableIO( BooleanIO ) ),
      phetioDocumentation: 'Set whether the phetButton will be pickable (and hence interactive), see the NodeIO documentation for more details'
    } );

    // @private
    this.disposePhetButtonIO = function() {
      pickableProperty.dispose();
    };
  },
  toStateObject() {
    return undefined;
  },
  fromStateObject( stateObject ) {
    return stateObject; // Pass through values defined by subclasses
  }
} );

joist.register( 'PhetButton', PhetButton );

export default PhetButton;