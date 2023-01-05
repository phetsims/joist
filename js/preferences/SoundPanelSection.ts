// Copyright 2021-2023, University of Colorado Boulder

/**
 * Section of the "Audio" panel of the PreferencesDialog related to sound.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import PatternStringProperty from '../../../axon/js/PatternStringProperty.js';
import merge from '../../../phet-core/js/merge.js';
import optionize, { combineOptions } from '../../../phet-core/js/optionize.js';
import { Node, Text, VBox, VoicingRichText, VoicingText } from '../../../scenery/js/imports.js';
import Checkbox from '../../../sun/js/Checkbox.js';
import ToggleSwitch, { ToggleSwitchOptions } from '../../../sun/js/ToggleSwitch.js';
import Tandem from '../../../tandem/js/Tandem.js';
import joist from '../joist.js';
import JoistStrings from '../JoistStrings.js';
import PreferencesDialog from './PreferencesDialog.js';
import { AudioModel } from './PreferencesModel.js';
import PreferencesPanelSection, { PreferencesPanelSectionOptions } from './PreferencesPanelSection.js';
import PreferencesControl from './PreferencesControl.js';
import PreferencesDialogConstants from './PreferencesDialogConstants.js';

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

    const soundEnabledStringProperty = new PatternStringProperty( labelledDescriptionPatternStringProperty, {
      label: soundsLabelStringProperty,
      description: soundDescriptionStringProperty
    } );
    const soundEnabledVoicingText = new VoicingText( soundDescriptionStringProperty, merge( {}, PreferencesDialog.PANEL_SECTION_CONTENT_OPTIONS, {
      readingBlockNameResponse: soundEnabledStringProperty
    } ) );
    const soundEnabledSwitch = new ToggleSwitch( audioModel.soundEnabledProperty, false, true, combineOptions<ToggleSwitchOptions>( {
      visible: options.includeTitleToggleSwitch,
      a11yName: soundsLabelStringProperty,
      leftValueContextResponse: soundsOffStringProperty,
      rightValueContextResponse: soundsOnStringProperty
    }, PreferencesDialogConstants.TOGGLE_SWITCH_OPTIONS ) );
    const soundEnabledControl = new PreferencesControl( {
      labelNode: soundLabel,
      descriptionNode: soundEnabledVoicingText,
      controlNode: soundEnabledSwitch
    } );

    let extraSoundContent: Node | null = null;
    if ( audioModel.supportsExtraSound ) {
      const enhancedSoundLabel = new Text( extraSoundsLabelStringProperty, PreferencesDialog.PANEL_SECTION_CONTENT_OPTIONS );
      const extraSoundCheckbox = new Checkbox( audioModel.extraSoundEnabledProperty, enhancedSoundLabel, {

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

      const extraSoundReadingBlockNameResponsePatternStringProperty = new PatternStringProperty( labelledDescriptionPatternStringProperty, {
        label: extraSoundsLabelStringProperty,
        description: extraSoundsDescriptionStringProperty
      } );
      const extraSoundDescription = new VoicingRichText( extraSoundsDescriptionStringProperty, merge( {}, PreferencesDialog.PANEL_SECTION_CONTENT_OPTIONS, {
        lineWrap: 300,
        maxHeight: 100,
        readingBlockNameResponse: extraSoundReadingBlockNameResponsePatternStringProperty
      } ) );

      extraSoundContent = new VBox( {
        children: [ extraSoundCheckbox, extraSoundDescription ],
        align: 'left',
        spacing: 5,
        tagName: 'div' // Must have PDOM content to support toggling enabled in the PDOM. Could be removed after https://github.com/phetsims/scenery/issues/1514
      } );

      const extraSoundEnabledListener = ( enabled: boolean ) => {
        extraSoundContent!.enabled = enabled;

        // TODO: Workaround for now, see https://github.com/phetsims/joist/issues/895. PDOM does not
        //       correctly propagate enabled state to descendants when ancestor becomes disabled.
        extraSoundCheckbox.inputEnabled = enabled;
      };
      audioModel.soundEnabledProperty.link( extraSoundEnabledListener );
      extraSoundContent.disposeEmitter.addListener( () => {
        enhancedSoundLabel.dispose();
        extraSoundCheckbox.dispose();
        extraSoundDescription.dispose();
        extraSoundReadingBlockNameResponsePatternStringProperty.dispose();
        audioModel.soundEnabledProperty.unlink( extraSoundEnabledListener );
      } );
    }

    super( {
      titleNode: soundEnabledControl,
      contentNode: extraSoundContent
    } );

    this.disposeSoundPanelSection = () => {
      soundLabel.dispose();
      soundEnabledSwitch.dispose();
      soundEnabledVoicingText.dispose();
      soundEnabledStringProperty.dispose();
      extraSoundContent && extraSoundContent.dispose();
    };
  }

  public override dispose(): void {
    this.disposeSoundPanelSection();
    super.dispose();
  }
}

joist.register( 'SoundPanelSection', SoundPanelSection );
export default SoundPanelSection;