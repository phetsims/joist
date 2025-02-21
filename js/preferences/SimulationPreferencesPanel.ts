// Copyright 2021-2025, University of Colorado Boulder

/**
 * The content for the "Simulation" tab in the PreferencesDialog. Contains controls for any simulation-specific
 * preferences.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import type TReadOnlyProperty from '../../../axon/js/TReadOnlyProperty.js';
import optionize, { type EmptySelfOptions } from '../../../phet-core/js/optionize.js';
import type PickRequired from '../../../phet-core/js/types/PickRequired.js';
import VBox, { type VBoxOptions } from '../../../scenery/js/layout/nodes/VBox.js';
import type Node from '../../../scenery/js/nodes/Node.js';
import joist from '../joist.js';
import PreferencesDialogConstants from './PreferencesDialogConstants.js';
import { type SimulationModel } from './PreferencesModel.js';
import PreferencesPanel, { type PreferencesPanelOptions } from './PreferencesPanel.js';
import PreferencesPanelSection from './PreferencesPanelSection.js';
import PreferencesType from './PreferencesType.js';

type SelfOptions = EmptySelfOptions;
type SimulationPreferencesPanelOptions = SelfOptions &
  PreferencesPanelOptions &

  // Still required, even though it is preferences because the Simulation tab houses sim-specific elements that
  // should support customization. https://github.com/phetsims/joist/issues/744#issuecomment-1196028362
  PickRequired<PreferencesPanelOptions, 'tandem'>;

class SimulationPreferencesPanel extends PreferencesPanel {

  /**
   * @param simulationModel - configuration for the Tab, see PreferencesModel for entries
   * @param selectedTabProperty
   * @param tabVisibleProperty
   * @param [providedOptions]
   */
  public constructor( simulationModel: SimulationModel, selectedTabProperty: TReadOnlyProperty<PreferencesType>, tabVisibleProperty: TReadOnlyProperty<boolean>, providedOptions?: SimulationPreferencesPanelOptions ) {
    const options = optionize<SimulationPreferencesPanelOptions, SelfOptions, VBoxOptions>()( {
      labelContent: 'Simulation',

      // phet-io
      phetioVisiblePropertyInstrumented: false
    }, providedOptions );

    super( PreferencesType.SIMULATION, selectedTabProperty, tabVisibleProperty, options );

    const panelContent = new VBox( {
      align: 'left',
      spacing: PreferencesDialogConstants.CONTENT_SPACING
    } );
    this.addChild( panelContent );

    // Just the provided panel content with its own spacing
    const providedChildren: Node[] = [];

    simulationModel.customPreferences.forEach( customPreference => {
      const contentNode = customPreference.createContent( options.tandem );
      const preferencesPanelSection = new PreferencesPanelSection( { contentNode: contentNode } );
      providedChildren.push( preferencesPanelSection );
    } );

    panelContent.children = providedChildren;
  }
}

joist.register( 'SimulationPreferencesPanel', SimulationPreferencesPanel );
export default SimulationPreferencesPanel;