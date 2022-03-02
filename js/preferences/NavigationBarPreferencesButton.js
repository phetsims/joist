// Copyright 2021-2022, University of Colorado Boulder

/**
 * Button in the NavigationBar that opens the PreferencesDialog.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import { Path } from '../../../scenery/js/imports.js';
import userCogSolidShape from '../../../sherpa/js/fontawesome-5/userCogSolidShape.js';
import Tandem from '../../../tandem/js/Tandem.js';
import merge from '../../../phet-core/js/merge.js';
import joist from '../joist.js';
import JoistButton from '../JoistButton.js';
import joistStrings from '../joistStrings.js';
import PreferencesDialog from './PreferencesDialog.js';

class NavigationBarPreferencesButton extends JoistButton {

  /**
   * @param {PreferencesManager} preferencesModel
   * @param {LookAndFeel} lookAndFeel
   * @param {Object} [options]
   */
  constructor( preferencesModel, lookAndFeel, options ) {

    options = merge( {
      tandem: Tandem.REQUIRED
    }, options );

    const icon = new Path( userCogSolidShape, {
      fill: lookAndFeel.navigationBarTextFillProperty,
      maxWidth: 25
    } );

    let preferencesDialog = null;
    super( icon, lookAndFeel.navigationBarFillProperty, Tandem.OPT_OUT, {
      listener: () => {
        if ( !preferencesDialog ) {
          preferencesDialog = new PreferencesDialog( preferencesModel, {
            tandem: Tandem.OPT_OUT
          } );
        }

        preferencesDialog.show();
        preferencesDialog.focusSelectedTab();
      },
      highlightExtensionWidth: 5,
      highlightExtensionHeight: 10,

      // pdom
      innerContent: joistStrings.preferences.title,
      positionInPDOM: true,

      // voicing
      voicingNameResponse: joistStrings.preferences.title
    } );

    // pdom - Signal to screen readers that the button will open a dialog. For some reason, this also seems to
    // prevent a bug in iOS Safari where two events are dispatched to the screen on activation instead of one.
    // The result was that one press would open the dialog and the second buggy press would immediately close it.
    // Make sure that the dialog can be opened on iOS Safari before removing this.
    this.setPDOMAttribute( 'aria-haspopup', true );
  }
}

joist.register( 'NavigationBarPreferencesButton', NavigationBarPreferencesButton );
export default NavigationBarPreferencesButton;