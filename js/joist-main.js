// Copyright 2015-2020, University of Colorado Boulder

/**
 * Main file for the Joist demo.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Property from '../../axon/js/Property.js';
import DialogsScreenView from './demo/DialogsScreenView.js';
import joistStrings from './joist-strings.js';
import Screen from './Screen.js';
import Sim from './Sim.js';
import SimLauncher from './SimLauncher.js';

const joistTitleString = joistStrings.joist.title;

const simOptions = {
  credits: {
    leadDesign: 'PhET'
  }
};

SimLauncher.launch( function() {

  const screens = [
    new Screen(
      function() { return {}; },
      function( model ) { return new DialogsScreenView(); },
      {
        name: 'Dialogs',
        backgroundColorProperty: new Property( 'white' )
      }
    )
  ];

  new Sim( joistTitleString, screens, simOptions ).start();
} );