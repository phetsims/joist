// Copyright 2015-2022, University of Colorado Boulder

/**
 * Main file for the Joist demo.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Property from '../../axon/js/Property.js';
import Tandem from '../../tandem/js/Tandem.js';
import DialogsScreenView from './demo/DialogsScreenView.js';
import JoistStrings from './JoistStrings.js';
import Screen from './Screen.js';
import Sim, { SimOptions } from './Sim.js';
import simLauncher from './simLauncher.js';

const joistTitleStringProperty = JoistStrings.joist.titleStringProperty;

const simOptions: SimOptions = {
  credits: {
    leadDesign: 'PhET'
  }
};

class DemoModel {
  public reset(): void { /* nothing to do */ }
}

simLauncher.launch( () => {

  const dialogsScreenTandem = Tandem.ROOT.createTandem( 'dialogsScreen' );

  const screens = [
    new Screen(
      ( () => new DemoModel() ),
      ( () => new DialogsScreenView( { tandem: dialogsScreenTandem.createTandem( 'view' ) } ) ), {
        name: new Property( 'Dialogs' ),
        backgroundColorProperty: new Property( 'white' ),
        tandem: Tandem.OPT_OUT
      } )
  ];

  new Sim( joistTitleStringProperty, screens, simOptions ).start();
} );