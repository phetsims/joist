// Copyright 2015-2020, University of Colorado Boulder

/**
 * Main file for the Joist demo.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Property from '../../axon/js/Property.js';
import DialogsScreenView from './demo/DialogsScreenView.js';
import joistStrings from './joistStrings.js';
import Screen from './Screen.js';
import Sim from './Sim.js';
import simLauncher from './simLauncher.js';

const joistTitleString = joistStrings.joist.title;

const simOptions = {
  credits: {
    leadDesign: 'PhET'
  }
};

simLauncher.launch( () => {

  const screens = [
    new Screen(
      ( () => {
        return {};
      } ),
      ( model => new DialogsScreenView() ),
      {
        name: 'Dialogs',
        backgroundColorProperty: new Property( 'white' )
      }
    )
  ];

  new Sim( joistTitleString, screens, simOptions ).start();
} );