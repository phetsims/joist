// Copyright 2021, University of Colorado Boulder

/**
 * Section of the "Audio" panel of the PreferencesDialog related to sound.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import StringUtils from '../../../phetcommon/js/util/StringUtils.js';
import VoicingRichText from '../../../scenery/js/accessibility/voicing/nodes/VoicingRichText.js';
import VoicingText from '../../../scenery/js/accessibility/voicing/nodes/VoicingText.js';
import voicingUtteranceQueue from '../../../scenery/js/accessibility/voicing/voicingUtteranceQueue.js';
import Node from '../../../scenery/js/nodes/Node.js';
import Text from '../../../scenery/js/nodes/Text.js';
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
   * @param {Object} audioOptions - configuration for audio preferences, see PreferencesConfiguration
   */
  constructor( audioOptions ) {

    const soundLabel = new Text( soundsLabelString, { font: PreferencesDialog.PANEL_SECTION_LABEL_FONT } );
    const titleNode = new PreferencesToggleSwitch( soundManager.enabledProperty, false, true, {
      labelNode: soundLabel,
      descriptionNode: new VoicingText( soundDescriptionString, {
        font: PreferencesDialog.CONTENT_FONT,
        readingBlockContent: StringUtils.fillIn( labelledDescriptionPatternString, {
          label: soundsLabelString,
          description: soundDescriptionString
        } )
      } ),
      a11yLabel: soundsLabelString
    } );

    let enhancedSoundContent = null;
    if ( audioOptions.supportsEnhancedSound ) {
      const enahncedSoundLabel = new Text( extraSoundsLabelString, { font: PreferencesDialog.CONTENT_FONT } );
      const enhancedSoundCheckbox = new Checkbox( enahncedSoundLabel, soundManager.enhancedSoundEnabledProperty, {

        // pdom
        labelTagName: 'label',
        labelContent: extraSoundsLabelString,

        // voicing
        voicingNameResponse: extraSoundsLabelString,

        // phet-io
        tandem: Tandem.OPT_OUT
      } );
      soundManager.enabledProperty.link( enabled => {
        enhancedSoundCheckbox.enabled = enabled;
      } );
      const enhancedSoundDescription = new VoicingRichText( extraSoundsDescriptionString, {
        font: PreferencesDialog.CONTENT_FONT,
        lineWrap: 300,
        readingBlockContent: StringUtils.fillIn( labelledDescriptionPatternString, {
          label: extraSoundsLabelString,
          description: extraSoundsDescriptionString
        } )
      } );

      enhancedSoundContent = new Node( {
        children: [ enhancedSoundCheckbox, enhancedSoundDescription ]
      } );

      enhancedSoundDescription.leftTop = enhancedSoundCheckbox.leftBottom.plusXY( 0, 5 );
    }

    super( {
      titleNode: titleNode,
      contentNode: enhancedSoundContent
    } );

    // voicing
    soundManager.enabledProperty.lazyLink( enabled => {
      const alert = enabled ? soundsOnString : soundsOffString;
      voicingUtteranceQueue.addToBack( alert );
      phet.joist.sim.utteranceQueue.addToBack( alert );
    } );

    soundManager.enhancedSoundEnabledProperty.lazyLink( enabled => {
      const alert = enabled ? extraSoundsOnString : extraSoundsOffString;
      voicingUtteranceQueue.addToBack( alert );
      phet.joist.sim.utteranceQueue.addToBack( alert );
    } );
  }
}

joist.register( 'SoundPanelSection', SoundPanelSection );
export default SoundPanelSection;