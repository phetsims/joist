// Copyright 2021, University of Colorado Boulder

/**
 * Section of the "Audio" panel of the PreferencesDialog related to sound.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import merge from '../../../phet-core/js/merge.js';
import StringUtils from '../../../phetcommon/js/util/StringUtils.js';
import { VoicingRichText } from '../../../scenery/js/imports.js';
import { VoicingText } from '../../../scenery/js/imports.js';
import { voicingUtteranceQueue } from '../../../scenery/js/imports.js';
import { Text } from '../../../scenery/js/imports.js';
import { VBox } from '../../../scenery/js/imports.js';
import Checkbox from '../../../sun/js/Checkbox.js';
import soundManager from '../../../tambo/js/soundManager.js';
import Tandem from '../../../tandem/js/Tandem.js';
import joist from '../joist.js';
import joistStrings from '../joistStrings.js';
import PreferencesDialog from './PreferencesDialog.js';
import PreferencesPanelSection from './PreferencesPanelSection.js';
import PreferencesToggleSwitch from './PreferencesToggleSwitch.js';

// constants
const soundsLabelString = joistStrings.preferences.tabs.audio.sounds.title;
const extraSoundsLabelString = joistStrings.preferences.tabs.audio.sounds.extraSounds.title;
const soundDescriptionString = joistStrings.preferences.tabs.audio.sounds.description;
const extraSoundsDescriptionString = joistStrings.preferences.tabs.audio.sounds.extraSounds.description;
const soundsOnString = joistStrings.a11y.preferences.tabs.audio.sounds.soundsOn;
const soundsOffString = joistStrings.a11y.preferences.tabs.audio.sounds.soundsOff;
const extraSoundsOnString = joistStrings.a11y.preferences.tabs.audio.sounds.extraSounds.extraSoundsOn;
const extraSoundsOffString = joistStrings.a11y.preferences.tabs.audio.sounds.extraSounds.extraSoundsOff;
const labelledDescriptionPatternString = joistStrings.a11y.preferences.tabs.labelledDescriptionPattern;

class SoundPanelSection extends PreferencesPanelSection {

  /**
   * @param {Object} audioOptions - configuration for audio preferences, see PreferencesManager
   * @param {Object} [options]
   */
  constructor( audioOptions, options ) {

    options = merge( {

      // {boolean} - Whether or not to include the toggle switch in the title content for this
      // PreferencesPanelSection. It is possible that the toggle for Sound can be redundant when Sound
      // is the only Audio feature supported. In that case, control of Sound should go through the
      // "All Audio" toggle.
      includeTitleToggleSwitch: true
    }, options );

    const soundLabel = new Text( soundsLabelString, PreferencesDialog.PANEL_SECTION_LABEL_OPTIONS );

    const titleNode = new PreferencesToggleSwitch( soundManager.enabledProperty, false, true, {
      labelNode: soundLabel,
      descriptionNode: new VoicingText( soundDescriptionString, merge( {}, PreferencesDialog.PANEL_SECTION_CONTENT_OPTIONS, {
        readingBlockContent: StringUtils.fillIn( labelledDescriptionPatternString, {
          label: soundsLabelString,
          description: soundDescriptionString
        } )
      } ) ),
      toggleSwitchOptions: {
        visible: options.includeTitleToggleSwitch
      },
      a11yLabel: soundsLabelString
    } );

    let enhancedSoundContent = null;
    if ( audioOptions.supportsEnhancedSound ) {
      const enahncedSoundLabel = new Text( extraSoundsLabelString, PreferencesDialog.PANEL_SECTION_CONTENT_OPTIONS );
      const enhancedSoundCheckbox = new Checkbox( enahncedSoundLabel, soundManager.enhancedSoundEnabledProperty, {

        // pdom
        labelTagName: 'label',
        labelContent: extraSoundsLabelString,

        // voicing
        voicingNameResponse: extraSoundsLabelString,

        // phet-io
        tandem: Tandem.OPT_OUT
      } );

      const enhancedSoundDescription = new VoicingRichText( extraSoundsDescriptionString, merge( {}, PreferencesDialog.PANEL_SECTION_CONTENT_OPTIONS, {
        lineWrap: 300,
        readingBlockContent: StringUtils.fillIn( labelledDescriptionPatternString, {
          label: extraSoundsLabelString,
          description: extraSoundsDescriptionString
        } )
      } ) );

      enhancedSoundContent = new VBox( {
        children: [ enhancedSoundCheckbox, enhancedSoundDescription ],
        align: 'left',
        spacing: 5
      } );

      soundManager.enabledProperty.link( enabled => {
        enhancedSoundContent.enabled = enabled;
      } );
    }

    super( {
      titleNode: titleNode,
      contentNode: enhancedSoundContent
    } );

    // voicing
    soundManager.enabledProperty.lazyLink( enabled => {
      const alert = enabled ? soundsOnString : soundsOffString;
      voicingUtteranceQueue.addToBack( alert );
      this.alertDescriptionUtterance( alert );
    } );

    soundManager.enhancedSoundEnabledProperty.lazyLink( enabled => {
      const alert = enabled ? extraSoundsOnString : extraSoundsOffString;
      voicingUtteranceQueue.addToBack( alert );
      this.alertDescriptionUtterance( alert );
    } );
  }
}

joist.register( 'SoundPanelSection', SoundPanelSection );
export default SoundPanelSection;