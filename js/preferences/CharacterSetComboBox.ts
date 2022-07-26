// Copyright 2022, University of Colorado Boulder

/**
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import ComboBox, { ComboBoxOptions } from '../../../sun/js/ComboBox.js';
import joist from '../joist.js';
import { HBox, Node, Text } from '../../../scenery/js/imports.js';
import PreferencesDialog from './PreferencesDialog.js';
import Property from '../../../axon/js/Property.js';
import optionize, { EmptySelfOptions } from '../../../phet-core/js/optionize.js';
import StrictOmit from '../../../phet-core/js/types/StrictOmit.js';
import Tandem from '../../../tandem/js/Tandem.js';

// constants
// Not translatable until design is complete, see https://github.com/phetsims/joist/issues/814
const regionAndCultureString = 'Region and Culture';

export type CharacterSetDescriptor = {
  setIcon: Node;
  label: string;
  value: number;
};

type SelfOptions = EmptySelfOptions;

// CharacterSetComboBoxOptions sets the labelNode
type CharacterSetComboBoxOptions = SelfOptions & StrictOmit<ComboBoxOptions, 'labelNode' | 'tandem'>;

// TODO: Create a consistent type for this Property/ComboBox, see https://github.com/phetsims/joist/issues/814
class CharacterSetComboBox extends ComboBox<number> {

  /**
   * @param characterSetProperty - Number indicating a selected Character set. Map the value to particular set of
   *                               images that you want to use (you may want to use a number of images per character).
   * @param characterSets - Collection of data used to create ComboBoxItems for each supported character set.
   * @param parentNode - Required by ComboBox to place the list box.
   * @param [providedOptions?]
   */
  public constructor( characterSetProperty: Property<number>, characterSets: CharacterSetDescriptor[],
                      parentNode: Node, providedOptions?: CharacterSetComboBoxOptions ) {

    const options = optionize<CharacterSetComboBoxOptions, SelfOptions, ComboBoxOptions>()( {

      // default yMargin is a bit smaller so that there is less white space around the character set icon
      yMargin: 3,

      // phet-io
      tandem: Tandem.OPT_OUT // We don't want to instrument components for preferences, https://github.com/phetsims/joist/issues/744#issuecomment-1196028362
    }, providedOptions );

    options.labelNode = new Text( regionAndCultureString, PreferencesDialog.PANEL_SECTION_CONTENT_OPTIONS );

    const comboBoxItems = characterSets.map( characterSetDescriptor => {
      const itemContent = new HBox( {
        children: [ characterSetDescriptor.setIcon, new Text( characterSetDescriptor.label, PreferencesDialog.PANEL_SECTION_CONTENT_OPTIONS ) ],
        spacing: 10
      } );

      return {
        value: characterSetDescriptor.value,
        node: itemContent
      };
    } );

    super( characterSetProperty, comboBoxItems, parentNode, options );
  }
}

joist.register( 'CharacterSetComboBox', CharacterSetComboBox );
export default CharacterSetComboBox;
