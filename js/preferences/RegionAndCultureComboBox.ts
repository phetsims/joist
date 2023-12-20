// Copyright 2022-2023, University of Colorado Boulder

/**
 * A ComboBox that lets you change a character or portrayal in a simulation to match a particular culture or region.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import ComboBox, { ComboBoxOptions } from '../../../sun/js/ComboBox.js';
import joist from '../joist.js';
import { Text } from '../../../scenery/js/imports.js';
import PreferencesDialog from './PreferencesDialog.js';
import Property from '../../../axon/js/Property.js';
import optionize, { EmptySelfOptions } from '../../../phet-core/js/optionize.js';
import StrictOmit from '../../../phet-core/js/types/StrictOmit.js';
import Tandem from '../../../tandem/js/Tandem.js';
import RegionAndCulturePortrayal from './RegionAndCulturePortrayal.js';

type SelfOptions = EmptySelfOptions;
type RegionAndCultureComboBoxOptions = SelfOptions & StrictOmit<ComboBoxOptions, 'tandem'>;

class RegionAndCultureComboBox extends ComboBox<RegionAndCulturePortrayal | null> {

  /**
   * @param regionAndCultureProperty - RegionAndCulturePortrayal indicating a selected region/culture that is connected to a particular set of representations
   * @param portrayals - The RegionAndCulturePortrayal list, one for each region/culture.
   * @param [providedOptions]
   */
  public constructor( regionAndCultureProperty: Property<RegionAndCulturePortrayal>, portrayals: RegionAndCulturePortrayal[], providedOptions?: RegionAndCultureComboBoxOptions ) {

    const options = optionize<RegionAndCultureComboBoxOptions, SelfOptions, ComboBoxOptions>()( {

      // default yMargin is a bit smaller so that there is less white space around the portrayal icon
      yMargin: 3,

      // phet-io
      tandem: Tandem.OPT_OUT // We don't want to instrument components for preferences, https://github.com/phetsims/joist/issues/744#issuecomment-1196028362
    }, providedOptions );

    const comboBoxItems = portrayals.map( portrayal => {

      return {
        value: portrayal,
        createNode: () => new Text( portrayal.labelProperty, PreferencesDialog.PANEL_SECTION_CONTENT_OPTIONS )
      };
    } );

    // TODO: Need a different top layer node for ComboBox here. See https://github.com/phetsims/joist/issues/841
    super( regionAndCultureProperty, comboBoxItems, phet.joist.sim.topLayer, options );
  }
}

joist.register( 'RegionAndCultureComboBox', RegionAndCultureComboBox );
export default RegionAndCultureComboBox;
