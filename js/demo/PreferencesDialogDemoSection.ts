// Copyright 2022, University of Colorado Boulder

/**
 * A demo for the different features and components for a preferences dialog.
 *
 * @author Marla Schulz (PhET Interactive Simulations)
 *
 */

import BooleanProperty from '../../../axon/js/BooleanProperty.js';
import { RichText, Text } from '../../../scenery/js/imports.js';
import joist from '../joist.js';
import PreferencesControl from '../preferences/PreferencesControl.js';
import ToggleSwitch from '../../../sun/js/ToggleSwitch.js';
import PreferencesDialogConstants from '../preferences/PreferencesDialogConstants.js';
import PreferencesPanelContentNode from '../preferences/PreferencesPanelContentNode.js';

export default class PreferencesDialogDemoSection extends PreferencesPanelContentNode {

  public constructor() {

    const sampleTitle = new PreferencesControl( {
      labelNode: new Text( 'A Great Title',
        PreferencesDialogConstants.CONTROL_LABEL_OPTIONS )
    } );
    const sampleDescription = new PreferencesControl( {
      descriptionNode: new RichText( 'A description can be written here that gives the user useful information',
        PreferencesDialogConstants.CONTROL_DESCRIPTION_OPTIONS )
    } );
    const sampleToggleControl = new PreferencesControl( {
      labelNode: new Text( 'Toggle', PreferencesDialogConstants.CONTROL_LABEL_OPTIONS ),
      descriptionNode: new RichText( 'This toggle can be clicked to turn on or off', PreferencesDialogConstants.CONTROL_DESCRIPTION_OPTIONS ),
      controlNode: new ToggleSwitch( new BooleanProperty( true ), false, true, PreferencesDialogConstants.TOGGLE_SWITCH_OPTIONS )
    } );

    super( { content: [ sampleTitle, sampleDescription, sampleToggleControl ] } );
  }
}

joist.register( 'PreferencesDialogDemoSection', PreferencesDialogDemoSection );