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
import PreferencesToggleSwitch, { PreferencesToggleSwitchOptions } from './PreferencesToggleSwitch.js';
import joistStrings from '../joistStrings.js';
import optionize, { EmptySelfOptions } from '../../../phet-core/js/optionize.js';
import StrictOmit from '../../../phet-core/js/types/StrictOmit.js';
import StringUtils from '../../../phetcommon/js/util/StringUtils.js';
import Multilink from '../../../axon/js/Multilink.js';
import Property from '../../../axon/js/Property.js';

type SelfOptions = EmptySelfOptions;
type ParentOptions = PreferencesToggleSwitchOptions;
export type ProjectorModeToggleSwitchOptions = SelfOptions & StrictOmit<ParentOptions, 'labelNode' | 'descriptionNode'>;

class ProjectorModeToggleSwitch extends PreferencesToggleSwitch<string> {
  public constructor( colorProfileProperty: Property<string>, providedOptions?: ProjectorModeToggleSwitchOptions ) {
    assert && assert(
    phet.chipper.colorProfiles[ 0 ] !== SceneryConstants.PROJECTOR_COLOR_PROFILE &&
    phet.chipper.colorProfiles.includes( SceneryConstants.PROJECTOR_COLOR_PROFILE ) &&
    phet.chipper.colorProfiles.length === 2 &&
    phet.chipper.colorProfiles[ 0 ] !== phet.chipper.colorProfiles[ 1 ],
      'ProjectorModeToggleSwitch requires sims that support the projector color profile and one other color profile' );

    const projectorModeLabel = new VoicingText( joistStrings.projectorModeProperty, PreferencesDialog.PANEL_SECTION_LABEL_OPTIONS );
    const projectorModeDescription = new VoicingText( joistStrings.preferences.tabs.visual.projectorModeDescriptionProperty, PreferencesDialog.PANEL_SECTION_CONTENT_OPTIONS );
    Multilink.multilink( [
      joistStrings.a11y.preferences.tabs.labelledDescriptionPatternProperty,
      joistStrings.projectorModeProperty,
      joistStrings.preferences.tabs.visual.projectorModeDescriptionProperty
    ], ( labelledDescriptionPatternString, projectorModeString, projectorModeDescriptionString ) => {
      projectorModeDescription.readingBlockNameResponse = StringUtils.fillIn( labelledDescriptionPatternString, {
        label: projectorModeString,
        description: projectorModeDescriptionString
      } );
    } );

    const options = optionize<ProjectorModeToggleSwitchOptions, SelfOptions, ParentOptions>()( {
      labelNode: projectorModeLabel,
      descriptionNode: projectorModeDescription
    }, providedOptions );

    // Identify the non-projector color profile that this checkbox sets.
    const otherColorProfile = phet.chipper.colorProfiles.find( ( colorProfile: string ) => colorProfile !== SceneryConstants.PROJECTOR_COLOR_PROFILE );

    super( colorProfileProperty, otherColorProfile, SceneryConstants.PROJECTOR_COLOR_PROFILE, options );
  }
}

joist.register( 'ProjectorModeToggleSwitch', ProjectorModeToggleSwitch );
export default ProjectorModeToggleSwitch;