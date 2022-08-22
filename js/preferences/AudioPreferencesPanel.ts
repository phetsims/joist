// Copyright 2021-2022, University of Colorado Boulder

/**
 * The panel for the PreferencesDialog containing preferences related to audio.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import { HBox, Text, VBox, VBoxOptions } from '../../../scenery/js/imports.js';
import joist from '../joist.js';
import joistStrings from '../joistStrings.js';
import PreferencesDialog from './PreferencesDialog.js';
import { AudioModel } from './PreferencesModel.js';
import PreferencesToggleSwitch from './PreferencesToggleSwitch.js';
import SoundPanelSection from './SoundPanelSection.js';
import VoicingPanelSection from './VoicingPanelSection.js';
import PreferencesPanelSection from './PreferencesPanelSection.js';
import PickRequired from '../../../phet-core/js/types/PickRequired.js';
import Emitter from '../../../axon/js/Emitter.js';

// constants
const audioFeaturesString = joistStrings.preferences.tabs.audio.audioFeatures.title;

type AudioPreferencesPanelOptions = PickRequired<VBoxOptions, 'tandem'>;

class AudioPreferencesTabPanel extends VBox {
  private readonly disposeAudioPreferencesPanel: () => void;

  /**
   * @param audioModel - configuration for audio settings, see PreferencesModel
   * @param providedOptions
   */
  public constructor( audioModel: AudioModel, providedOptions: AudioPreferencesPanelOptions ) {

    const contentOptions: VBoxOptions = { align: 'left', spacing: PreferencesPanelSection.DEFAULT_ITEM_SPACING };
    const leftContent = new VBox( contentOptions );
    const rightContent = new VBox( contentOptions );

    const disposeEmitter = new Emitter();

    if ( audioModel.supportsVoicing ) {
      leftContent.addChild( new VoicingPanelSection( audioModel ) );
    }

    if ( audioModel.supportsSound ) {

      // If only one of the audio features are in use, do not include the toggle switch to
      // enable/disable that feature because the control is redundant. The audio output should go
      // through the "Audio Features" toggle only.
      const hideSoundToggle = audioModel.supportsVoicing !== audioModel.supportsSound;

      rightContent.addChild( new SoundPanelSection( audioModel, {
        includeTitleToggleSwitch: !hideSoundToggle
      } ) );
    }

    const sections = new HBox( {
      align: 'top',
      children: [ leftContent, rightContent ]
    } );

    audioModel.customPreferences.forEach( ( customPreference, i ) => {
      const container = i % 2 === 0 ? leftContent : rightContent;
      const customContent = customPreference.createContent( providedOptions.tandem );
      disposeEmitter.addListener( () => customContent.dispose() );
      container.addChild(
        new PreferencesPanelSection( {
          contentNode: customContent,
          contentLeftMargin: 0
        } )
      );
    } );

    const allAudioSwitch = new PreferencesToggleSwitch( audioModel.simSoundEnabledProperty, false, true, {
      labelNode: new Text( audioFeaturesString, PreferencesDialog.PANEL_SECTION_LABEL_OPTIONS ),
      a11yLabel: audioFeaturesString
    } );

    const soundEnabledListener = ( enabled: boolean ) => {
      sections.enabled = enabled;
    };

    audioModel.simSoundEnabledProperty.link( soundEnabledListener );

    super( {
      align: 'center',
      spacing: 25,
      children: [ allAudioSwitch, sections ],

      // pdom
      tagName: 'div',
      labelTagName: 'h2',
      labelContent: audioFeaturesString
    } );

    this.disposeAudioPreferencesPanel = () => {
      leftContent.children.forEach( child => child.dispose() );
      rightContent.children.forEach( child => child.dispose() );
      allAudioSwitch.dispose();
      disposeEmitter.emit();
      audioModel.simSoundEnabledProperty.unlink( soundEnabledListener );
    };
  }

  public override dispose(): void {
    this.disposeAudioPreferencesPanel();
    super.dispose();
  }
}

joist.register( 'AudioPreferencesTabPanel', AudioPreferencesTabPanel );
export default AudioPreferencesTabPanel;