// Copyright 2022-2025, University of Colorado Boulder

/**
 * A toggle switch for "Projector Mode". Changes the color scheme for better contrast on projectors. The sim must have
 * a projector mode color profile. This toggle switch appears in the PreferencesDialog in the Visual panel.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import PatternStringProperty from '../../../axon/js/PatternStringProperty.js';
import Property from '../../../axon/js/Property.js';
import optionize, { combineOptions, EmptySelfOptions } from '../../../phet-core/js/optionize.js';
import StrictOmit from '../../../phet-core/js/types/StrictOmit.js';
import VoicingText from '../../../scenery/js/accessibility/voicing/nodes/VoicingText.js';
import Text from '../../../scenery/js/nodes/Text.js';
import SceneryConstants from '../../../scenery/js/SceneryConstants.js';
import ToggleSwitch, { ToggleSwitchOptions } from '../../../sun/js/ToggleSwitch.js';
import Tandem from '../../../tandem/js/Tandem.js';
import joist from '../joist.js';
import JoistStrings from '../JoistStrings.js';
import PreferencesControl, { PreferencesControlOptions } from './PreferencesControl.js';
import PreferencesDialog from './PreferencesDialog.js';
import PreferencesDialogConstants from './PreferencesDialogConstants.js';

type SelfOptions = EmptySelfOptions;
type ParentOptions = PreferencesControlOptions;
export type ProjectorModeToggleSwitchOptions = SelfOptions & StrictOmit<ParentOptions, 'labelNode' | 'descriptionNode'>;

class ProjectorModeToggleSwitch extends PreferencesControl {
  public constructor( colorProfileProperty: Property<string>, providedOptions?: ProjectorModeToggleSwitchOptions ) {
    assert && assert(
    phet.chipper.colorProfiles[ 0 ] !== SceneryConstants.PROJECTOR_COLOR_PROFILE &&
    phet.chipper.colorProfiles.includes( SceneryConstants.PROJECTOR_COLOR_PROFILE ) &&
    phet.chipper.colorProfiles.length === 2 &&
    phet.chipper.colorProfiles[ 0 ] !== phet.chipper.colorProfiles[ 1 ],
      'ProjectorModeToggleSwitch requires sims that support the projector color profile and one other color profile' );

    const projectorModeLabel = new Text( JoistStrings.projectorModeStringProperty, PreferencesDialog.PANEL_SECTION_LABEL_OPTIONS );
    const projectorModeDescription = new VoicingText( JoistStrings.preferences.tabs.visual.projectorModeDescriptionStringProperty, PreferencesDialog.PANEL_SECTION_CONTENT_OPTIONS );

    // Identify the non-projector color profile that this checkbox sets.
    const otherColorProfile = phet.chipper.colorProfiles.find( ( colorProfile: string ) => colorProfile !== SceneryConstants.PROJECTOR_COLOR_PROFILE );
    const projectorModeSwitch = new ToggleSwitch( colorProfileProperty, otherColorProfile, SceneryConstants.PROJECTOR_COLOR_PROFILE, combineOptions<ToggleSwitchOptions>( {
      accessibleName: JoistStrings.projectorModeStringProperty
    }, PreferencesDialogConstants.TOGGLE_SWITCH_OPTIONS ) );

    const projectorModePatternStringProperty = new PatternStringProperty( JoistStrings.a11y.preferences.tabs.labelledDescriptionPatternStringProperty, {
      label: JoistStrings.projectorModeStringProperty,
      description: JoistStrings.preferences.tabs.visual.projectorModeDescriptionStringProperty
    }, { tandem: Tandem.OPT_OUT } );
    projectorModeDescription.readingBlockNameResponse = projectorModePatternStringProperty;

    const options = optionize<ProjectorModeToggleSwitchOptions, SelfOptions, ParentOptions>()( {
      labelNode: projectorModeLabel,
      descriptionNode: projectorModeDescription,
      controlNode: projectorModeSwitch
    }, providedOptions );

    super( options );
  }
}

joist.register( 'ProjectorModeToggleSwitch', ProjectorModeToggleSwitch );
export default ProjectorModeToggleSwitch;