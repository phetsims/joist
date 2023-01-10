// Copyright 2021-2023, University of Colorado Boulder

/**
 * The content for the "Simulation" tab in the PreferencesDialog. Contains controls for any simulation-specific
 * preferences.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import { Node, VBox, VBoxOptions } from '../../../scenery/js/imports.js';
import joist from '../joist.js';
import PreferencesDialog from './PreferencesDialog.js';
import { SimulationModel } from './PreferencesModel.js';
import optionize, { EmptySelfOptions } from '../../../phet-core/js/optionize.js';
import PickRequired from '../../../phet-core/js/types/PickRequired.js';
import PreferencesPanelSection from './PreferencesPanelSection.js';
import PreferencesType from './PreferencesType.js';
import TReadOnlyProperty from '../../../axon/js/TReadOnlyProperty.js';
import PreferencesPanel, { PreferencesPanelOptions } from './PreferencesPanel.js';

type SelfOptions = EmptySelfOptions;
type SimulationPreferencesPanelOptions = SelfOptions &
  PreferencesPanelOptions &

  // Still required, even though it is preferences because the Simulation tab houses sim-specific elements that
  // should support customization. https://github.com/phetsims/joist/issues/744#issuecomment-1196028362
  PickRequired<PreferencesPanelOptions, 'tandem'>;

class SimulationPreferencesPanel extends PreferencesPanel {
  private readonly disposeSimulationPreferencesPanel: () => void;

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
      spacing: PreferencesDialog.CONTENT_SPACING
    } );
    this.addChild( panelContent );

    // Just the provided panel content with its own spacing
    const providedChildren: Node[] = [];

    simulationModel.customPreferences.forEach( customPreference => {
      const contentNode = customPreference.createContent( options.tandem );
      const preferencesPanelSection = new PreferencesPanelSection( { contentNode: contentNode } );
      this.disposeEmitter.addListener( () => {
        preferencesPanelSection.dispose();
        contentNode.dispose();
      } );
      providedChildren.push( preferencesPanelSection );
    } );

    panelContent.children = providedChildren;

    this.disposeSimulationPreferencesPanel = () => {
      panelContent.dispose();
    };
  }

  public override dispose(): void {
    this.disposeSimulationPreferencesPanel();
    super.dispose();
  }
}

joist.register( 'SimulationPreferencesPanel', SimulationPreferencesPanel );
export default SimulationPreferencesPanel;