// Copyright 2021, University of Colorado Boulder

/**
 * Button in the NavigationBar that opens the PreferencesDialog.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import Path from '../../../scenery/js/nodes/Path.js';
import userCogSolidShape from '../../../sherpa/js/fontawesome-5/userCogSolidShape.js';
import Tandem from '../../../tandem/js/Tandem.js';
import joist from '../joist.js';
import JoistButton from '../JoistButton.js';
import joistStrings from '../joistStrings.js';
import PreferencesDialog from './PreferencesDialog.js';

class NavigationBarPreferencesButton extends JoistButton {

  /**
   * @param {PreferencesConfiguration} preferencesConfiguration
   * @param {PreferencesProperties} preferencesProperties
   * @param {LookAndFeel} lookAndFeel
   * @param {Property.<boolean>} simSoundProperty
   * @param {Tandem} tandem
   */
  constructor( preferencesConfiguration, preferencesProperties, lookAndFeel, simSoundProperty ) {

    const icon = new Path( userCogSolidShape, {
      fill: lookAndFeel.navigationBarTextFillProperty,
      maxWidth: 25
    } );

    let preferencesDialog = null;
    super( icon, lookAndFeel.navigationBarFillProperty, Tandem.OPT_OUT, {
      listener: () => {
        if ( !preferencesDialog ) {
          preferencesDialog = new PreferencesDialog( preferencesConfiguration, preferencesProperties, simSoundProperty, {
            tandem: Tandem.OPT_OUT
          } );
        }

        preferencesDialog.show();
        preferencesDialog.focusSelectedTab();
      },
      highlightExtensionWidth: 5,
      highlightExtensionHeight: 10,

      // pdom
      innerContent: joistStrings.preferences.title
    } );
  }
}

joist.register( 'NavigationBarPreferencesButton', NavigationBarPreferencesButton );
export default NavigationBarPreferencesButton;