// Copyright 2022, University of Colorado Boulder

/**
 * A ComboBox to control the locale used for a sim.
 *
 * This is experimental still. I don't know how this will actually work. For now this combo box is a placeholder
 * just so see how it will look in the Preferences dialog layout. At the moment it is not used in any sim.
 *
 * See https://github.com/phetsims/joist/issues/814
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import ComboBox, { ComboBoxOptions } from '../../../sun/js/ComboBox.js';
import joist from '../joist.js';
import { Text } from '../../../scenery/js/imports.js';
import PreferencesDialog from './PreferencesDialog.js';
import optionize, { EmptySelfOptions } from '../../../phet-core/js/optionize.js';
import Tandem from '../../../tandem/js/Tandem.js';
import Property from '../../../axon/js/Property.js';
import StrictOmit from '../../../phet-core/js/types/StrictOmit.js';

// constants
const languageString = 'Language';

// A description of a supported locale for this ComboBox.
type localeDescriptor = {

  // The locale to use.
  locale: string;

  // Written string label for this locale.
  localeLabel: string;
};

type SelfOptions = EmptySelfOptions;
type LanguageComboBoxOptions = SelfOptions & StrictOmit<ComboBoxOptions, 'labelNode' | 'tandem'>;

class LanguageComboBox extends ComboBox<string> {

  /**
   * @param localeProperty - Selected locale for the sim (this may come from Sim.ts someday?)
   * @param localeDescriptors
   * @param [providedOptions?]
   */
  public constructor( localeProperty: Property<string>, localeDescriptors: localeDescriptor[],
                      providedOptions?: LanguageComboBoxOptions ) {

    const options = optionize<LanguageComboBoxOptions, SelfOptions, ComboBoxOptions>()( {

      // A bit smaller than default to match the CharacterSetComboBox, which is often used with localization controls
      yMargin: 6,

      // phet-io
      tandem: Tandem.OPT_OUT // We don't want to instrument components for preferences, https://github.com/phetsims/joist/issues/744#issuecomment-1196028362
    }, providedOptions );

    options.labelNode = new Text( languageString, PreferencesDialog.PANEL_SECTION_CONTENT_OPTIONS );

    const comboBoxItems = localeDescriptors.map( localeDescriptor => {
      return {
        value: localeDescriptor.locale,
        node: new Text( localeDescriptor.localeLabel, PreferencesDialog.PANEL_SECTION_CONTENT_OPTIONS )
      };
    } );

    super( localeProperty, comboBoxItems, phet.joist.sim.topLayer, options );
  }
}

joist.register( 'LanguageComboBox', LanguageComboBox );
export default LanguageComboBox;
