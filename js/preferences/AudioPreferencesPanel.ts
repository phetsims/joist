// Copyright 2021-2022, University of Colorado Boulder

/**
 * The panel for the PreferencesDialog containing preferences related to audio.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import Property from '../../../axon/js/Property.js';
import optionize from '../../../phet-core/js/optionize.js';
import { EmptySelfOptions } from '../../../phet-core/js/optionize.js';
import { HBox, Node, Text, VBox, VBoxOptions } from '../../../scenery/js/imports.js';
import Tandem from '../../../tandem/js/Tandem.js';
import joist from '../joist.js';
import joistStrings from '../joistStrings.js';
import PreferencesDialog from './PreferencesDialog.js';
import { AudioModel } from './PreferencesManager.js';
import PreferencesToggleSwitch from './PreferencesToggleSwitch.js';
import SoundPanelSection from './SoundPanelSection.js';
import VoicingPanelSection from './VoicingPanelSection.js';

// constants
const audioFeaturesString = joistStrings.preferences.tabs.audio.audioFeatures.title;

class AudioPreferencesTabPanel extends VBox {
  private readonly disposeAudioPreferencesPanel: () => void;

  /**
   * @param audioModel - configuration for audio settings, see PreferencesManager
   * @param enableToolbarProperty - whether the Toolbar is enabled
   * @param [providedOptions]
   */
  public constructor( audioModel: AudioModel, enableToolbarProperty: Property<boolean>, providedOptions?: VBoxOptions ) {

    const options = optionize<VBoxOptions, EmptySelfOptions, VBoxOptions>()( {
      tandem: Tandem.REQUIRED
    }, providedOptions );

    const panelChildren: Node[] = [];

    if ( audioModel.supportsVoicing ) {
      panelChildren.push( new VoicingPanelSection( audioModel, enableToolbarProperty, {
        tandem: options.tandem.createTandem( 'voicingControls' )
      } ) );
    }

    if ( audioModel.supportsSound ) {

      // If only one of the audio features are in use, do not include the toggle switch to
      // enable/disable that feature because the control is redundant. The audio output should go
      // through the "Audio Features" toggle only.
      const hideSoundToggle = audioModel.supportsVoicing !== audioModel.supportsSound;

      panelChildren.push( new SoundPanelSection( audioModel, {
        includeTitleToggleSwitch: !hideSoundToggle,
        tandem: options.tandem.createTandem( 'soundControls' )
      } ) );
    }

    const sections = new HBox( {
      align: 'top',
      children: panelChildren
    } );

    const allAudioSwitch = new PreferencesToggleSwitch( audioModel.simSoundEnabledProperty, false, true, {
      labelNode: new Text( audioFeaturesString, PreferencesDialog.PANEL_SECTION_LABEL_OPTIONS ),
      a11yLabel: audioFeaturesString,
      tandem: options.tandem.createTandem( 'allAudioSwitch' )
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
      panelChildren.forEach( child => child.dispose() );
      allAudioSwitch.dispose();
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