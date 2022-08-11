// Copyright 2021-2022, University of Colorado Boulder

/**
 * The sim-specific controls in the "General" panel of the PreferencesDialog.
 *
 * @author Jesse Greenberg
 */

import joist from '../joist.js';
import PreferencesPanelSection from './PreferencesPanelSection.js';
import { Node } from '../../../scenery/js/imports.js';

class SimControlsPanelSection extends PreferencesPanelSection {
  public constructor( simControls: Node ) {
    super( {
      contentNode: simControls
    } );
  }
}

joist.register( 'SimControlsPanelSection', SimControlsPanelSection );
export default SimControlsPanelSection;