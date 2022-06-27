// Copyright 2022, University of Colorado Boulder

/**
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import ComboBox, { ComboBoxOptions } from '../../../sun/js/ComboBox.js';
import joist from '../joist.js';
import { HBox, Node, Text } from '../../../scenery/js/imports.js';
import PreferencesDialog from './PreferencesDialog.js';
import Property from '../../../axon/js/Property.js';
import EmptyObjectType from '../../../phet-core/js/types/EmptyObjectType.js';
import optionize from '../../../phet-core/js/optionize.js';
import StrictOmit from '../../../phet-core/js/types/StrictOmit.js';
import Tandem from '../../../tandem/js/Tandem.js';

// constants
// Not translatable until design is complete, see https://github.com/phetsims/joist/issues/814
const cultureAndRegionString = 'Culture and Region';

export type CharacterSetDescriptor = {
  setIcon: Node;
  label: string;
  value: unknown;
}

type SelfOptions = EmptyObjectType;

// CharacterSetComboBoxOptions sets the labelNode
type CharacterSetComboBoxOptions = SelfOptions & StrictOmit<ComboBoxOptions, 'labelNode'>;

// TODO: Create a consistent type for this Property/ComboBox, see https://github.com/phetsims/joist/issues/814
class CharacterSetComboBox extends ComboBox<unknown> {

  /**
   * @param characterSetProperty - Selected character set.
   * @param characterSets - Collection of data used to create ComboBoxItems for each supported character set.
   * @param parentNode - Required by ComboBox to place the list box.
   * @param [providedOptions?]
   */
  public constructor( characterSetProperty: Property<unknown>, characterSets: CharacterSetDescriptor[],
                      parentNode: Node, providedOptions?: CharacterSetComboBoxOptions ) {

    const options = optionize<CharacterSetComboBoxOptions, SelfOptions, ComboBoxOptions>()( {

      // default yMargin is a bit smaller so that there is less white space around the character set icon
      yMargin: 3,

      // phet-io
      tandem: Tandem.REQUIRED
    }, providedOptions );

    options.labelNode = new Text( cultureAndRegionString, PreferencesDialog.PANEL_SECTION_CONTENT_OPTIONS );

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
