// Copyright 2021-2025, University of Colorado Boulder

/**
 * Section of the "Audio" panel of the PreferencesDialog related to sound.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import PatternStringProperty from '../../../axon/js/PatternStringProperty.js';
import merge from '../../../phet-core/js/merge.js';
import optionize, { combineOptions } from '../../../phet-core/js/optionize.js';
import VoicingRichText from '../../../scenery/js/accessibility/voicing/nodes/VoicingRichText.js';
import VoicingText from '../../../scenery/js/accessibility/voicing/nodes/VoicingText.js';
import VBox from '../../../scenery/js/layout/nodes/VBox.js';
import type Node from '../../../scenery/js/nodes/Node.js';
import Text from '../../../scenery/js/nodes/Text.js';
import SceneryConstants from '../../../scenery/js/SceneryConstants.js';
import Checkbox from '../../../sun/js/Checkbox.js';
import ToggleSwitch, { type ToggleSwitchOptions } from '../../../sun/js/ToggleSwitch.js';
import Tandem from '../../../tandem/js/Tandem.js';
import joist from '../joist.js';
import JoistStrings from '../JoistStrings.js';
import PreferencesControl from './PreferencesControl.js';
import PreferencesDialogConstants from './PreferencesDialogConstants.js';
import { type AudioModel } from './PreferencesModel.js';
import PreferencesPanelSection, { type PreferencesPanelSectionOptions } from './PreferencesPanelSection.js';

// constants
const soundsLabelStringProperty = JoistStrings.preferences.tabs.audio.sounds.titleStringProperty;
const extraSoundsLabelStringProperty = JoistStrings.preferences.tabs.audio.sounds.extraSounds.titleStringProperty;
const soundDescriptionStringProperty = JoistStrings.preferences.tabs.audio.sounds.descriptionStringProperty;
const extraSoundsDescriptionStringProperty = JoistStrings.preferences.tabs.audio.sounds.extraSounds.descriptionStringProperty;
const soundsOnStringProperty = JoistStrings.a11y.preferences.tabs.audio.sounds.soundsOnStringProperty;
const soundsOffStringProperty = JoistStrings.a11y.preferences.tabs.audio.sounds.soundsOffStringProperty;
const extraSoundsOnStringProperty = JoistStrings.a11y.preferences.tabs.audio.sounds.extraSounds.extraSoundsOnStringProperty;
const extraSoundsOffStringProperty = JoistStrings.a11y.preferences.tabs.audio.sounds.extraSounds.extraSoundsOffStringProperty;
const labelledDescriptionPatternStringProperty = JoistStrings.a11y.preferences.tabs.labelledDescriptionPatternStringProperty;

type SelfOptions = {

  // Whether to include the toggle switch in the title content for this PreferencesPanelSection. It is possible that
  // the toggle for Sound can be redundant when Sound is the only Audio feature supported. In that case, control of
  // Sound should go through the "All Audio" toggle.
  includeTitleToggleSwitch?: boolean;
};

type SoundPanelSectionOptions = SelfOptions & PreferencesPanelSectionOptions;

class SoundPanelSection extends PreferencesPanelSection {

  /**
   * @param audioModel - configuration for audio preferences, see PreferencesModel
   * @param [providedOptions]
   */
  public constructor( audioModel: AudioModel, providedOptions?: SoundPanelSectionOptions ) {
    const options = optionize<SoundPanelSectionOptions, SelfOptions, PreferencesPanelSectionOptions>()( {
      includeTitleToggleSwitch: true
    }, providedOptions );

    const soundLabel = new Text( soundsLabelStringProperty, PreferencesDialogConstants.PANEL_SECTION_LABEL_OPTIONS );

    const soundEnabledStringProperty = new PatternStringProperty( labelledDescriptionPatternStringProperty, {
      label: soundsLabelStringProperty,
      description: soundDescriptionStringProperty
    }, { tandem: Tandem.OPT_OUT } );
    const soundEnabledVoicingText = new VoicingText( soundDescriptionStringProperty, merge( {}, PreferencesDialogConstants.PANEL_SECTION_CONTENT_OPTIONS, {
      readingBlockNameResponse: soundEnabledStringProperty
    } ) );
    const soundEnabledSwitch = new ToggleSwitch( audioModel.soundEnabledProperty, false, true, combineOptions<ToggleSwitchOptions>( {
      visible: options.includeTitleToggleSwitch,
      accessibleName: soundsLabelStringProperty,
      leftValueContextResponse: soundsOffStringProperty,
      rightValueContextResponse: soundsOnStringProperty
    }, PreferencesDialogConstants.TOGGLE_SWITCH_OPTIONS ) );
    const soundEnabledControl = new PreferencesControl( {
      labelNode: soundLabel,
      descriptionNode: soundEnabledVoicingText,
      allowDescriptionStretch: false,
      controlNode: soundEnabledSwitch
    } );

    let extraSoundContent: Node | null = null;
    if ( audioModel.supportsExtraSound ) {
      const enhancedSoundLabel = new Text( extraSoundsLabelStringProperty, PreferencesDialogConstants.PANEL_SECTION_CONTENT_OPTIONS );
      const extraSoundCheckbox = new Checkbox( audioModel.extraSoundEnabledProperty, enhancedSoundLabel, {

        // pdom
        labelTagName: 'label',
        labelContent: extraSoundsLabelStringProperty,

        // voicing
        voicingNameResponse: extraSoundsLabelStringProperty,
        voicingIgnoreVoicingManagerProperties: true, // Always speak Preferences responses so control function is clear
        voiceNameResponseOnSelection: false,

        // both voicing and pdom
        accessibleContextResponseChecked: extraSoundsOnStringProperty,
        accessibleContextResponseUnchecked: extraSoundsOffStringProperty,

        // phet-io
        tandem: Tandem.OPT_OUT // We don't want to instrument components for preferences, https://github.com/phetsims/joist/issues/744#issuecomment-1196028362
      } );

      const extraSoundReadingBlockNameResponsePatternStringProperty = new PatternStringProperty( labelledDescriptionPatternStringProperty, {
        label: extraSoundsLabelStringProperty,
        description: extraSoundsDescriptionStringProperty
      }, { tandem: Tandem.OPT_OUT } );
      const extraSoundDescription = new VoicingRichText( extraSoundsDescriptionStringProperty, merge( {}, PreferencesDialogConstants.PANEL_SECTION_CONTENT_OPTIONS, {
        lineWrap: 300,
        maxHeight: 100,
        readingBlockNameResponse: extraSoundReadingBlockNameResponsePatternStringProperty,
        disabledOpacity: SceneryConstants.DISABLED_OPACITY // TODO: Workaround for setting enabled on this RichText instead of to the parent VBox, https://github.com/phetsims/scenery/issues/1514
      } ) );

      extraSoundContent = new VBox( {
        children: [ extraSoundCheckbox, extraSoundDescription ],
        align: 'left',
        spacing: 5,
        tagName: 'div' // Must have PDOM content to support toggling enabled in the PDOM. Could be removed after https://github.com/phetsims/scenery/issues/1514
      } );

      const extraSoundEnabledListener = ( enabled: boolean ) => {

        // TODO: Workaround for now, see https://github.com/phetsims/scenery/issues/1514. PDOM does not
        //       correctly propagate enabled state to descendants when ancestor (extraSoundContent) becomes disabled.
        extraSoundContent!.children.forEach( child => child.setEnabled( enabled ) );
      };
      audioModel.soundEnabledProperty.link( extraSoundEnabledListener );
    }

    super( {
      titleNode: soundEnabledControl,
      contentNode: extraSoundContent
    } );
  }
}

joist.register( 'SoundPanelSection', SoundPanelSection );
export default SoundPanelSection;