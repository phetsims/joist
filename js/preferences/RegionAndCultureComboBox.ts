// Copyright 2022, University of Colorado Boulder

/**
 * A ComboBox that lets you change a character or character set in a simulation to match a particular culture or region.
 *
 * TODO: Rename this, it may be for more than "character sets". Maybe a single character or other artwork. See #814.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import ComboBox, { ComboBoxOptions } from '../../../sun/js/ComboBox.js';
import joist from '../joist.js';
import { HBox, Text } from '../../../scenery/js/imports.js';
import PreferencesDialog from './PreferencesDialog.js';
import Property from '../../../axon/js/Property.js';
import optionize, { EmptySelfOptions } from '../../../phet-core/js/optionize.js';
import StrictOmit from '../../../phet-core/js/types/StrictOmit.js';
import Tandem from '../../../tandem/js/Tandem.js';
import { CharacterDescriptor } from './localizationManager.js';

// constants
// Not translatable until design is complete, see https://github.com/phetsims/joist/issues/814
const regionAndCultureString = 'Region and Culture';

type SelfOptions = EmptySelfOptions;

// CharacterSetComboBoxOptions sets the labelNode
type CharacterSetComboBoxOptions = SelfOptions & StrictOmit<ComboBoxOptions, 'labelNode' | 'tandem'>;

// TODO: Create a consistent type for this Property/ComboBox, see https://github.com/phetsims/joist/issues/814
class RegionAndCultureComboBox extends ComboBox<number> {

  /**
   * @param characterSetProperty - Number indicating a selected Character set. Map the value to particular set of
   *                               images that you want to use (you may want to use a number of images per character).
   * @param characterSets - Collection of data used to create ComboBoxItems for each supported character set.
   * @param [providedOptions?]
   */
  public constructor( characterSetProperty: Property<number>, characterSets: CharacterDescriptor[], providedOptions?: CharacterSetComboBoxOptions ) {

    const options = optionize<CharacterSetComboBoxOptions, SelfOptions, ComboBoxOptions>()( {

      // default yMargin is a bit smaller so that there is less white space around the character set icon
      yMargin: 3,

      // phet-io
      tandem: Tandem.OPT_OUT // We don't want to instrument components for preferences, https://github.com/phetsims/joist/issues/744#issuecomment-1196028362
    }, providedOptions );

    options.labelNode = new Text( regionAndCultureString, PreferencesDialog.PANEL_SECTION_CONTENT_OPTIONS );

    const comboBoxItems = characterSets.map( ( characterSetDescriptor, index ) => {
      const itemContent = new HBox( {
        children: [ characterSetDescriptor.characterIcon, new Text( characterSetDescriptor.label, PreferencesDialog.PANEL_SECTION_CONTENT_OPTIONS ) ],
        spacing: 10
      } );

      return {
        value: index,
        node: itemContent
      };
    } );

    // TODO: Need a different top layer node for ComboBox here. See https://github.com/phetsims/joist/issues/814
    super( characterSetProperty, comboBoxItems, phet.joist.sim.topLayer, options );
  }
}

joist.register( 'RegionAndCultureComboBox', RegionAndCultureComboBox );
export default RegionAndCultureComboBox;
