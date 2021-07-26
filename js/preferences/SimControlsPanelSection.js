// Copyright 2021, University of Colorado Boulder

/**
 * The sim-specific controls in the "General" panel of the PreferencesDialog.
 *
 * @author Jesse Greenberg
 */

import joist from '../joist.js';
import joistStrings from '../joistStrings.js';
import PreferencesDialog from './PreferencesDialog.js';
import PreferencesPanelSection from './PreferencesPanelSection.js';
import Text from '../../../scenery/js/nodes/Text.js';

// constants
const simulationSpecificSettingsString = joistStrings.preferences.tabs.general.simulationSpecificSettings;

class SimControlsPanelSection extends PreferencesPanelSection {

  /**
   * @param {Node} simControls - Node with sim specific controls
   */
  constructor( simControls ) {
    super( {
      titleNode: new Text( simulationSpecificSettingsString, PreferencesDialog.PANEL_SECTION_LABEL_OPTIONS ),
      contentNode: simControls
    } );
  }
}

joist.register( 'SimControlsPanelSection', SimControlsPanelSection );
export default SimControlsPanelSection;