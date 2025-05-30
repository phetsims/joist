// Copyright 2021-2025, University of Colorado Boulder

/**
 * The panel for the PreferencesDialog containing preferences related to audio.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import type TReadOnlyProperty from '../../../axon/js/TReadOnlyProperty.js';
import { combineOptions } from '../../../phet-core/js/optionize.js';
import type PickRequired from '../../../phet-core/js/types/PickRequired.js';
import HBox from '../../../scenery/js/layout/nodes/HBox.js';
import VBox, { type VBoxOptions } from '../../../scenery/js/layout/nodes/VBox.js';
import Text from '../../../scenery/js/nodes/Text.js';
import Node from '../../../scenery/js/nodes/Node.js';
import ToggleSwitch, { type ToggleSwitchOptions } from '../../../sun/js/ToggleSwitch.js';
import joist from '../joist.js';
import JoistStrings from '../JoistStrings.js';
import PreferencesControl from './PreferencesControl.js';
import PreferencesDialogConstants from './PreferencesDialogConstants.js';
import { type AudioModel } from './PreferencesModel.js';
import PreferencesPanel, { type PreferencesPanelOptions } from './PreferencesPanel.js';
import PreferencesPanelSection from './PreferencesPanelSection.js';
import PreferencesType from './PreferencesType.js';
import SoundPanelSection from './SoundPanelSection.js';
import VoicingPanelSection from './VoicingPanelSection.js';

// constants
const audioFeaturesStringProperty = JoistStrings.preferences.tabs.audio.audioFeatures.titleStringProperty;

type AudioPreferencesPanelOptions = PickRequired<PreferencesPanelOptions, 'tandem'>;

class AudioPreferencesTabPanel extends PreferencesPanel {

  /**
   * @param audioModel - configuration for audio settings, see PreferencesModel
   * @param selectedTabProperty
   * @param tabVisibleProperty
   * @param providedOptions
   */
  public constructor( audioModel: AudioModel, selectedTabProperty: TReadOnlyProperty<PreferencesType>, tabVisibleProperty: TReadOnlyProperty<boolean>, providedOptions: AudioPreferencesPanelOptions ) {
    super( PreferencesType.AUDIO, selectedTabProperty, tabVisibleProperty, {
      accessibleHeading: audioFeaturesStringProperty
    } );

    // Some contents of this Dialog will be dynamically removed. Dont resize when this happens because we don't want
    // to shift contents of the entire Preferences dialog.
    const contentOptions: VBoxOptions = {
      align: 'left',
      spacing: PreferencesDialogConstants.CONTENT_SPACING,
      excludeInvisibleChildrenFromBounds: false
    };
    const leftContent = new VBox( contentOptions );
    const rightContent = new VBox( contentOptions );

    if ( audioModel.supportsAnyVoicing ) {
      const voicingPanelSection = new VoicingPanelSection( audioModel );
      leftContent.addChild( voicingPanelSection );
    }

    if ( audioModel.supportsSound ) {

      // If only one of the audio features are in use, and there are no custom preferences
      // do not include the toggle switch to enable/disable that feature because the control
      // is redundant. The audio output should go through the "Audio Features" toggle only.
      const hideSoundToggle = audioModel.supportsAnyVoicing !== audioModel.supportsSound && audioModel.customPreferences.length === 0;

      const soundPanelSection = new SoundPanelSection( audioModel, {
        includeTitleToggleSwitch: !hideSoundToggle
      } );
      rightContent.addChild( soundPanelSection );
    }

    const sections = new HBox( {
      align: 'top',
      spacing: 10,
      children: [ leftContent, rightContent ],
      tagName: 'div' // Must have PDOM content to support toggling enabled in the PDOM. Could be removed after https://github.com/phetsims/scenery/issues/1514
    } );

    audioModel.customPreferences.forEach( ( customPreference, i ) => {
      let container: Node;
      if ( customPreference.column === 'left' ) {
        container = leftContent;
      }
      else if ( customPreference.column === 'right' ) {
        container = rightContent;
      }
      else {
        container = i % 2 === 0 ? leftContent : rightContent;
      }

      const customContent = customPreference.createContent( providedOptions.tandem );
      const preferencesPanelSection = new PreferencesPanelSection( {
        contentNode: customContent,
        contentNodeOptions: {
          excludeInvisibleChildrenFromBounds: true
        },
        contentLeftMargin: 0
      } );
      container.addChild( preferencesPanelSection );
    } );

    const audioFeaturesText = new Text( audioFeaturesStringProperty, PreferencesDialogConstants.PANEL_SECTION_LABEL_OPTIONS );
    const audioFeaturesSwitch = new ToggleSwitch( audioModel.audioEnabledProperty, false, true, combineOptions<ToggleSwitchOptions>( {
      accessibleName: audioFeaturesStringProperty
    }, PreferencesDialogConstants.TOGGLE_SWITCH_OPTIONS ) );
    const allAudioSwitch = new PreferencesControl( {
      labelNode: audioFeaturesText,
      controlNode: audioFeaturesSwitch,
      headingControl: true
    } );

    const audioEnabledListener = ( enabled: boolean ) => {
      sections.enabled = enabled;
    };

    audioModel.audioEnabledProperty.link( audioEnabledListener );

    const panelContent = new VBox( {
      align: 'center',
      spacing: 25,
      children: [ allAudioSwitch, sections ]
    } );
    this.addChild( panelContent );
  }
}

joist.register( 'AudioPreferencesTabPanel', AudioPreferencesTabPanel );
export default AudioPreferencesTabPanel;