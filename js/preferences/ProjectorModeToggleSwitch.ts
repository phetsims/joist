// Copyright 2022, University of Colorado Boulder

/**
 * A toggle switch for "Projector Mode". Changes the color scheme for better contrast on projectors. The sim must have
 * a projector mode color profile. This toggle switch appears in the PreferencesDialog in the Visual panel.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import { SceneryConstants, VoicingText } from '../../../scenery/js/imports.js';
import joist from '../joist.js';
import PreferencesDialog from './PreferencesDialog.js';
import PreferencesControl, { PreferencesControlOptions } from './PreferencesControl.js';
import JoistStrings from '../JoistStrings.js';
import optionize, { EmptySelfOptions } from '../../../phet-core/js/optionize.js';
import StrictOmit from '../../../phet-core/js/types/StrictOmit.js';
import Property from '../../../axon/js/Property.js';
import ToggleSwitch from '../../../sun/js/ToggleSwitch.js';
import PreferencesDialogConstants from './PreferencesDialogConstants.js';
import PatternStringProperty from '../../../axon/js/PatternStringProperty.js';

type SelfOptions = EmptySelfOptions;
type ParentOptions = PreferencesControlOptions;
export type ProjectorModeToggleSwitchOptions = SelfOptions & StrictOmit<ParentOptions, 'labelNode' | 'descriptionNode'>;

class ProjectorModeToggleSwitch extends PreferencesControl {

  private readonly disposeProjectorModeToggleSwitch: () => void;

  public constructor( colorProfileProperty: Property<string>, providedOptions?: ProjectorModeToggleSwitchOptions ) {
    assert && assert(
    phet.chipper.colorProfiles[ 0 ] !== SceneryConstants.PROJECTOR_COLOR_PROFILE &&
    phet.chipper.colorProfiles.includes( SceneryConstants.PROJECTOR_COLOR_PROFILE ) &&
    phet.chipper.colorProfiles.length === 2 &&
    phet.chipper.colorProfiles[ 0 ] !== phet.chipper.colorProfiles[ 1 ],
      'ProjectorModeToggleSwitch requires sims that support the projector color profile and one other color profile' );

    const projectorModeLabel = new VoicingText( JoistStrings.projectorModeStringProperty, PreferencesDialog.PANEL_SECTION_LABEL_OPTIONS );
    const projectorModeDescription = new VoicingText( JoistStrings.preferences.tabs.visual.projectorModeDescriptionStringProperty, PreferencesDialog.PANEL_SECTION_CONTENT_OPTIONS );

    // Identify the non-projector color profile that this checkbox sets.
    const otherColorProfile = phet.chipper.colorProfiles.find( ( colorProfile: string ) => colorProfile !== SceneryConstants.PROJECTOR_COLOR_PROFILE );
    const projectorModeSwitch = new ToggleSwitch( colorProfileProperty, otherColorProfile, SceneryConstants.PROJECTOR_COLOR_PROFILE, PreferencesDialogConstants.TOGGLE_SWITCH_OPTIONS );

    const projectorModePatternStringProperty = new PatternStringProperty( JoistStrings.a11y.preferences.tabs.labelledDescriptionPatternStringProperty, {
      label: JoistStrings.projectorModeStringProperty,
      description: JoistStrings.preferences.tabs.visual.projectorModeDescriptionStringProperty
    } );
    projectorModeDescription.readingBlockNameResponse = projectorModePatternStringProperty;

    const options = optionize<ProjectorModeToggleSwitchOptions, SelfOptions, ParentOptions>()( {
      labelNode: projectorModeLabel,
      descriptionNode: projectorModeDescription,
      controlNode: projectorModeSwitch
    }, providedOptions );

    super( options );

    this.disposeProjectorModeToggleSwitch = () => {
      projectorModeLabel.dispose();
      projectorModeDescription.dispose();
      projectorModeSwitch.dispose();
      projectorModePatternStringProperty.dispose();
    };
  }

  public override dispose(): void {
    this.disposeProjectorModeToggleSwitch();
    super.dispose();
  }
}

joist.register( 'ProjectorModeToggleSwitch', ProjectorModeToggleSwitch );
export default ProjectorModeToggleSwitch;