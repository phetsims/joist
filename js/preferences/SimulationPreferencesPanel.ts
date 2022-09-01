// Copyright 2021-2022, University of Colorado Boulder

/**
 * The content for the "Simulation" tab in the PreferencesDialog. Contains controls for any simulation-specific
 * preferences.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import { Node, VBox, VBoxOptions } from '../../../scenery/js/imports.js';
import Tandem from '../../../tandem/js/Tandem.js';
import joist from '../joist.js';
import PreferencesDialog from './PreferencesDialog.js';
import { SimulationModel } from './PreferencesModel.js';
import optionize, { EmptySelfOptions } from '../../../phet-core/js/optionize.js';
import PickRequired from '../../../phet-core/js/types/PickRequired.js';
import PreferencesPanelSection from './PreferencesPanelSection.js';
import Emitter from '../../../axon/js/Emitter.js';

type SelfOptions = EmptySelfOptions;
type SimulationPreferencesPanelOptions = SelfOptions & VBoxOptions & PickRequired<VBoxOptions, 'tandem'>;

class SimulationPreferencesPanel extends VBox {
  private readonly disposeSimulationPreferencesPanel: () => void;

  /**
   * @param simulationModel - configuration for the Tab, see PreferencesModel for entries
   * @param [providedOptions]
   */
  public constructor( simulationModel: SimulationModel, providedOptions?: SimulationPreferencesPanelOptions ) {
    const options = optionize<SimulationPreferencesPanelOptions, SelfOptions, VBoxOptions>()( {
      align: 'left',
      spacing: PreferencesDialog.CONTENT_SPACING,

      // pdom
      tagName: 'section',
      labelTagName: 'h2',
      labelContent: 'Simulation',

      // phet-io
      // Still required, even though it is preferences because the Simulation tab houses sim-specific elements that
      // should support customization. https://github.com/phetsims/joist/issues/744#issuecomment-1196028362
      tandem: Tandem.REQUIRED,
      phetioVisiblePropertyInstrumented: false
    }, providedOptions );

    super( options );

    // Just the provided panel content with its own spacing
    const providedChildren: Node[] = [];

    const disposeEmitter = new Emitter();
    simulationModel.customPreferences.forEach( customPreference => {
      const contentNode = customPreference.createContent( options.tandem );
      const preferencesPanelSection = new PreferencesPanelSection( { contentNode: contentNode } );
      disposeEmitter.addListener( () => {
        preferencesPanelSection.dispose();
        contentNode.dispose();
      } );
      providedChildren.push( preferencesPanelSection );
    } );

    this.children = providedChildren;

    this.disposeSimulationPreferencesPanel = () => {
      disposeEmitter.emit();
    };
  }

  public override dispose(): void {
    this.disposeSimulationPreferencesPanel();
    super.dispose();
  }
}

joist.register( 'SimulationPreferencesPanel', SimulationPreferencesPanel );
export default SimulationPreferencesPanel;