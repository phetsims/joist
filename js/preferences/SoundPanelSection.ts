// Copyright 2021-2022, University of Colorado Boulder

/**
 * Section of the "Audio" panel of the PreferencesDialog related to sound.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import merge from '../../../phet-core/js/merge.js';
import optionize from '../../../phet-core/js/optionize.js';
import StringUtils from '../../../phetcommon/js/util/StringUtils.js';
import { Node, Text, VBox, VoicingRichText, VoicingText } from '../../../scenery/js/imports.js';
import Checkbox from '../../../sun/js/Checkbox.js';
import Tandem from '../../../tandem/js/Tandem.js';
import joist from '../joist.js';
import JoistStrings from '../JoistStrings.js';
import PreferencesDialog from './PreferencesDialog.js';
import { AudioModel } from './PreferencesModel.js';
import PreferencesPanelSection, { PreferencesPanelSectionOptions } from './PreferencesPanelSection.js';
import PreferencesToggleSwitch from './PreferencesToggleSwitch.js';

// constants
const soundsLabelString = JoistStrings.preferences.tabs.audio.sounds.titleStringProperty;
const extraSoundsLabelString = JoistStrings.preferences.tabs.audio.sounds.extraSounds.titleStringProperty;
const soundDescriptionString = JoistStrings.preferences.tabs.audio.sounds.descriptionStringProperty;
const extraSoundsDescriptionString = JoistStrings.preferences.tabs.audio.sounds.extraSounds.descriptionStringProperty;
const soundsOnString = JoistStrings.a11y.preferences.tabs.audio.sounds.soundsOnStringProperty;
const soundsOffString = JoistStrings.a11y.preferences.tabs.audio.sounds.soundsOffStringProperty;
const extraSoundsOnString = JoistStrings.a11y.preferences.tabs.audio.sounds.extraSounds.extraSoundsOnStringProperty;
const extraSoundsOffString = JoistStrings.a11y.preferences.tabs.audio.sounds.extraSounds.extraSoundsOffStringProperty;
const labelledDescriptionPatternString = JoistStrings.a11y.preferences.tabs.labelledDescriptionPatternStringProperty;

type SelfOptions = {

  // Whether to include the toggle switch in the title content for this PreferencesPanelSection. It is possible that
  // the toggle for Sound can be redundant when Sound is the only Audio feature supported. In that case, control of
  // Sound should go through the "All Audio" toggle.
  includeTitleToggleSwitch?: boolean;
};

type SoundPanelSectionOptions = SelfOptions & PreferencesPanelSectionOptions;

class SoundPanelSection extends PreferencesPanelSection {
  private readonly disposeSoundPanelSection: () => void;

  /**
   * @param audioModel - configuration for audio preferences, see PreferencesModel
   * @param [providedOptions]
   */
  public constructor( audioModel: AudioModel, providedOptions?: SoundPanelSectionOptions ) {
    const options = optionize<SoundPanelSectionOptions, SelfOptions, PreferencesPanelSectionOptions>()( {
      includeTitleToggleSwitch: true
    }, providedOptions );

    const soundLabel = new Text( soundsLabelString, PreferencesDialog.PANEL_SECTION_LABEL_OPTIONS );

    const soundEnabledSwitch = new PreferencesToggleSwitch( audioModel.soundEnabledProperty, false, true, {
      labelNode: soundLabel,
      descriptionNode: new VoicingText( soundDescriptionString, merge( {}, PreferencesDialog.PANEL_SECTION_CONTENT_OPTIONS, {
        readingBlockNameResponse: StringUtils.fillIn( labelledDescriptionPatternString, {
          label: soundsLabelString,
          description: soundDescriptionString
        } )
      } ) ),
      toggleSwitchOptions: {
        visible: options.includeTitleToggleSwitch
      },
      a11yLabel: soundsLabelString,
      leftValueContextResponse: soundsOffString,
      rightValueContextResponse: soundsOnString
    } );

    let extraSoundContent: Node | null = null;
    let extraSoundCheckbox: Node | null = null;
    if ( audioModel.supportsExtraSound ) {
      const enahncedSoundLabel = new Text( extraSoundsLabelString, PreferencesDialog.PANEL_SECTION_CONTENT_OPTIONS );
      extraSoundCheckbox = new Checkbox( audioModel.extraSoundEnabledProperty, enahncedSoundLabel, {

        // pdom
        labelTagName: 'label',
        labelContent: extraSoundsLabelString,

        // voicing
        voicingNameResponse: extraSoundsLabelString,
        voicingIgnoreVoicingManagerProperties: true, // Always speak Preferences responses so control function is clear
        voiceNameResponseOnSelection: false,

        // both voicing and pdom
        checkedContextResponse: extraSoundsOnString,
        uncheckedContextResponse: extraSoundsOffString,

        // phet-io
        tandem: Tandem.OPT_OUT // We don't want to instrument components for preferences, https://github.com/phetsims/joist/issues/744#issuecomment-1196028362
      } );

      const extraSoundDescription = new VoicingRichText( extraSoundsDescriptionString, merge( {}, PreferencesDialog.PANEL_SECTION_CONTENT_OPTIONS, {
        lineWrap: 300,
        readingBlockNameResponse: StringUtils.fillIn( labelledDescriptionPatternString, {
          label: extraSoundsLabelString,
          description: extraSoundsDescriptionString
        } )
      } ) );

      extraSoundContent = new VBox( {
        children: [ extraSoundCheckbox, extraSoundDescription ],
        align: 'left',
        spacing: 5
      } );

      audioModel.soundEnabledProperty.link( enabled => {
        extraSoundContent!.enabled = enabled;
      } );
    }

    super( {
      titleNode: soundEnabledSwitch,
      contentNode: extraSoundContent
    } );

    this.disposeSoundPanelSection = () => {
      soundEnabledSwitch.dispose();
      extraSoundCheckbox && extraSoundCheckbox.dispose();
    };
  }

  public override dispose(): void {
    this.disposeSoundPanelSection();
    super.dispose();
  }
}

joist.register( 'SoundPanelSection', SoundPanelSection );
export default SoundPanelSection;