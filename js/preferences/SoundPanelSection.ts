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
  private readonly disposeSoundPanelSection: () => void;

  /**
   * @param audioModel - configuration for audio preferences, see PreferencesModel
   * @param [providedOptions]
   */
  public constructor( audioModel: AudioModel, providedOptions?: SoundPanelSectionOptions ) {
    const options = optionize<SoundPanelSectionOptions, SelfOptions, PreferencesPanelSectionOptions>()( {
      includeTitleToggleSwitch: true
    }, providedOptions );

    const soundLabel = new Text( soundsLabelStringProperty, PreferencesDialog.PANEL_SECTION_LABEL_OPTIONS );

    const soundEnabledSwitch = new PreferencesToggleSwitch( audioModel.soundEnabledProperty, false, true, {
      labelNode: soundLabel,
      descriptionNode: new VoicingText( soundDescriptionStringProperty, merge( {}, PreferencesDialog.PANEL_SECTION_CONTENT_OPTIONS, {
        readingBlockNameResponse: StringUtils.fillIn( labelledDescriptionPatternStringProperty, {
          label: soundsLabelStringProperty,
          description: soundDescriptionStringProperty
        } )
      } ) ),
      toggleSwitchOptions: {
        visible: options.includeTitleToggleSwitch
      },
      a11yLabel: soundsLabelStringProperty,
      leftValueContextResponse: soundsOffStringProperty,
      rightValueContextResponse: soundsOnStringProperty
    } );

    let extraSoundContent: Node | null = null;
    let extraSoundCheckbox: Node | null = null;
    let extraSoundEnabledListener: ( ( enabled: boolean ) => void ) | null = null;
    if ( audioModel.supportsExtraSound ) {
      const enahncedSoundLabel = new Text( extraSoundsLabelStringProperty, PreferencesDialog.PANEL_SECTION_CONTENT_OPTIONS );
      extraSoundCheckbox = new Checkbox( audioModel.extraSoundEnabledProperty, enahncedSoundLabel, {

        // pdom
        labelTagName: 'label',
        labelContent: extraSoundsLabelStringProperty,

        // voicing
        voicingNameResponse: extraSoundsLabelStringProperty,
        voicingIgnoreVoicingManagerProperties: true, // Always speak Preferences responses so control function is clear
        voiceNameResponseOnSelection: false,

        // both voicing and pdom
        checkedContextResponse: extraSoundsOnStringProperty,
        uncheckedContextResponse: extraSoundsOffStringProperty,

        // phet-io
        tandem: Tandem.OPT_OUT // We don't want to instrument components for preferences, https://github.com/phetsims/joist/issues/744#issuecomment-1196028362
      } );

      const extraSoundDescription = new VoicingRichText( extraSoundsDescriptionStringProperty, merge( {}, PreferencesDialog.PANEL_SECTION_CONTENT_OPTIONS, {
        lineWrap: 300,
        readingBlockNameResponse: StringUtils.fillIn( labelledDescriptionPatternStringProperty, {
          label: extraSoundsLabelStringProperty,
          description: extraSoundsDescriptionStringProperty
        } )
      } ) );

      extraSoundContent = new VBox( {
        children: [ extraSoundCheckbox, extraSoundDescription ],
        align: 'left',
        spacing: 5
      } );

      extraSoundEnabledListener = ( enabled: boolean ) => {
        extraSoundContent!.enabled = enabled;
      };
      audioModel.soundEnabledProperty.link( extraSoundEnabledListener );
    }

    super( {
      titleNode: soundEnabledSwitch,
      contentNode: extraSoundContent
    } );

    this.disposeSoundPanelSection = () => {
      extraSoundEnabledListener && audioModel.soundEnabledProperty.unlink( extraSoundEnabledListener );
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