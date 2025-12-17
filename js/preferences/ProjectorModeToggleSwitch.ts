// Copyright 2022-2025, University of Colorado Boulder

/**
 * A toggle switch for "Projector Mode". Changes the color scheme for better contrast on projectors. The sim must have
 * a projector mode color profile. This toggle switch appears in the PreferencesDialog in the Visual panel.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import PatternStringProperty from '../../../axon/js/PatternStringProperty.js';
import type Property from '../../../axon/js/Property.js';
import optionize, { combineOptions, type EmptySelfOptions } from '../../../phet-core/js/optionize.js';
import type StrictOmit from '../../../phet-core/js/types/StrictOmit.js';
import VoicingText, { VoicingTextOptions } from '../../../scenery/js/accessibility/voicing/nodes/VoicingText.js';
import Text from '../../../scenery/js/nodes/Text.js';
import SceneryConstants from '../../../scenery/js/SceneryConstants.js';
import ToggleSwitch, { type ToggleSwitchOptions } from '../../../sun/js/ToggleSwitch.js';
import Tandem from '../../../tandem/js/Tandem.js';
import joist from '../joist.js';
import JoistFluent from '../JoistFluent.js';
import PreferencesControl, { type PreferencesControlOptions } from './PreferencesControl.js';
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

    const projectorModeLabel = new Text( JoistFluent.projectorModeStringProperty, PreferencesDialogConstants.PANEL_SECTION_LABEL_OPTIONS );
    const projectorModeDescription = new VoicingText( JoistFluent.preferences.tabs.visual.projectorModeDescriptionStringProperty, combineOptions<VoicingTextOptions>(
      {},
      PreferencesDialogConstants.PANEL_SECTION_CONTENT_OPTIONS,
      {
        accessibleParagraph: null
      }
    ) );

    // Identify the non-projector color profile that this checkbox sets.
    const otherColorProfile = phet.chipper.colorProfiles.find( ( colorProfile: string ) => colorProfile !== SceneryConstants.PROJECTOR_COLOR_PROFILE );
    const projectorModeSwitch = new ToggleSwitch( colorProfileProperty, otherColorProfile, SceneryConstants.PROJECTOR_COLOR_PROFILE, combineOptions<ToggleSwitchOptions>( {
      accessibleName: JoistFluent.projectorModeStringProperty
    }, PreferencesDialogConstants.TOGGLE_SWITCH_OPTIONS ) );

    const projectorModePatternStringProperty = new PatternStringProperty( JoistFluent.a11y.preferences.tabs.labelledDescriptionPatternStringProperty, {
      label: JoistFluent.projectorModeStringProperty,
      description: JoistFluent.preferences.tabs.visual.projectorModeDescriptionStringProperty
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