// Copyright 2022, University of Colorado Boulder

/**
 * A ComboBox that lets you change a character or character set in a simulation to match a particular culture or region.
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
import { RegionAndCultureDescriptor } from './localizationManager.js';

// constants
// Not translatable until design is complete, see https://github.com/phetsims/energy-skate-park/issues/345
const regionAndCultureString = 'Region and Culture';

type SelfOptions = EmptySelfOptions;
type RegionAndCultureComboBoxOptions = SelfOptions & StrictOmit<ComboBoxOptions, 'labelNode' | 'tandem'>;

class RegionAndCultureComboBox extends ComboBox<number> {

  /**
   * @param regionAndCultureProperty - Number indicating a selected region/culture. Map the value to particular set of
   *                                   representations (you may want to use a number of images per character).
   * @param regionAndCultureDescriptors - Collection of data used to create ComboBoxItems for each supported character set.
   * @param [providedOptions?]
   */
  public constructor( regionAndCultureProperty: Property<number>, regionAndCultureDescriptors: RegionAndCultureDescriptor[], providedOptions?: RegionAndCultureComboBoxOptions ) {

    const options = optionize<RegionAndCultureComboBoxOptions, SelfOptions, ComboBoxOptions>()( {

      // default yMargin is a bit smaller so that there is less white space around the character set icon
      yMargin: 3,

      // phet-io
      tandem: Tandem.OPT_OUT // We don't want to instrument components for preferences, https://github.com/phetsims/joist/issues/744#issuecomment-1196028362
    }, providedOptions );

    options.labelNode = new Text( regionAndCultureString, PreferencesDialog.PANEL_SECTION_CONTENT_OPTIONS );

    const comboBoxItems = regionAndCultureDescriptors.map( ( descriptor, index ) => {
      const itemContent = new HBox( {
        children: [ descriptor.icon, new Text( descriptor.label, PreferencesDialog.PANEL_SECTION_CONTENT_OPTIONS ) ],
        spacing: 10
      } );

      return {
        value: index,
        node: itemContent
      };
    } );

    // TODO: Need a different top layer node for ComboBox here. See https://github.com/phetsims/energy-skate-park/issues/345
    super( regionAndCultureProperty, comboBoxItems, phet.joist.sim.topLayer, options );
  }
}

joist.register( 'RegionAndCultureComboBox', RegionAndCultureComboBox );
export default RegionAndCultureComboBox;
