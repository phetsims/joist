// Copyright 2021-2022, University of Colorado Boulder

/**
 * The section of PreferencesDialog content in the "Audio" panel related to voicing.
 *
 * @author Jesse Greenberg
 */

import BooleanProperty from '../../../axon/js/BooleanProperty.js';
import Dimension2 from '../../../dot/js/Dimension2.js';
import Range from '../../../dot/js/Range.js';
import Utils from '../../../dot/js/Utils.js';
import merge from '../../../phet-core/js/merge.js';
import StringUtils from '../../../phetcommon/js/util/StringUtils.js';
import NumberControl from '../../../scenery-phet/js/NumberControl.js';
import PhetFont from '../../../scenery-phet/js/PhetFont.js';
import { FocusHighlightFromNode, Node, PressListener, Text, VBox, Voicing, voicingManager, VoicingText } from '../../../scenery/js/imports.js';
import Checkbox from '../../../sun/js/Checkbox.js';
import ComboBox from '../../../sun/js/ComboBox.js';
import ComboBoxItem from '../../../sun/js/ComboBoxItem.js';
import ExpandCollapseButton from '../../../sun/js/ExpandCollapseButton.js';
import HSlider from '../../../sun/js/HSlider.js';
import Tandem from '../../../tandem/js/Tandem.js';
import Utterance from '../../../utterance-queue/js/Utterance.js';
import joist from '../joist.js';
import joistStrings from '../joistStrings.js';
import PreferencesDialog from './PreferencesDialog.js';
import PreferencesPanelSection from './PreferencesPanelSection.js';
import PreferencesToggleSwitch from './PreferencesToggleSwitch.js';

// constants
// none of the Voicing strings or feature is translatable yet, all strings in this file
// are nested under the 'a11y' section to make sure that they are not translatable
const voicingLabelString = joistStrings.a11y.preferences.tabs.audio.voicing.title;
const voicingDescriptionString = joistStrings.a11y.preferences.tabs.audio.voicing.description;
const toolbarLabelString = joistStrings.a11y.preferences.tabs.audio.voicing.toolbar.title;
const rateString = joistStrings.a11y.preferences.tabs.audio.voicing.customizeVoice.rate.title;
const rateLabelString = joistStrings.a11y.preferences.tabs.audio.voicing.customizeVoice.rate.labelString;
const pitchString = joistStrings.a11y.preferences.tabs.audio.voicing.customizeVoice.pitch.title;
const voicingEnabledString = joistStrings.a11y.preferences.tabs.audio.voicing.voicingOn;
const voicingDisabledString = joistStrings.a11y.preferences.tabs.audio.voicing.voicingOff;
const voiceVariablesPatternString = joistStrings.a11y.preferences.tabs.audio.voicing.customizeVoice.variablesPattern;
const customizeVoiceString = joistStrings.a11y.preferences.tabs.audio.voicing.customizeVoice.title;

const toolbarRemovedString = joistStrings.a11y.preferences.tabs.audio.voicing.toolbar.toolbarRemoved;
const toolbarAddedString = joistStrings.a11y.preferences.tabs.audio.voicing.toolbar.toolbarAdded;

const simVoicingOptionsString = joistStrings.a11y.preferences.tabs.audio.voicing.simVoicingOptions.title;
const simVoicingDescriptionString = joistStrings.a11y.preferences.tabs.audio.voicing.simVoicingOptions.description;

const objectDetailsLabelString = joistStrings.a11y.preferences.tabs.audio.voicing.simVoicingOptions.objectDetails.label;
const contextChangesLabelString = joistStrings.a11y.preferences.tabs.audio.voicing.simVoicingOptions.contextChanges.label;
const helpfulHintsLabelString = joistStrings.a11y.preferences.tabs.audio.voicing.simVoicingOptions.helpfulHints.label;

const voicingObjectChangesString = joistStrings.a11y.preferences.tabs.audio.voicing.simVoicingOptions.objectDetails.enabledAlert;
const objectChangesMutedString = joistStrings.a11y.preferences.tabs.audio.voicing.simVoicingOptions.objectDetails.disabledAlert;
const voicingContextChangesString = joistStrings.a11y.preferences.tabs.audio.voicing.simVoicingOptions.contextChanges.enabledAlert;
const contextChangesMutedString = joistStrings.a11y.preferences.tabs.audio.voicing.simVoicingOptions.contextChanges.disabledAlert;
const voicingHintsString = joistStrings.a11y.preferences.tabs.audio.voicing.simVoicingOptions.helpfulHints.enabledAlert;
const hintsMutedString = joistStrings.a11y.preferences.tabs.audio.voicing.simVoicingOptions.helpfulHints.disabledAlert;

const voiceLabelString = joistStrings.a11y.preferences.tabs.audio.voicing.customizeVoice.voice.title;
const voiceTitlePatternLabelString = joistStrings.a11y.preferences.tabs.audio.voicing.customizeVoice.voice.titlePattern;
const noVoicesAvailableString = joistStrings.a11y.preferences.tabs.audio.voicing.customizeVoice.voice.noVoicesAvailable;

const customizeVoiceExpandedString = joistStrings.a11y.preferences.tabs.audio.voicing.customizeVoice.expandedAlert;
const customizeVoiceCollapsedString = joistStrings.a11y.preferences.tabs.audio.voicing.customizeVoice.collapsedAlert;

const voiceRateDescriptionPatternString = joistStrings.a11y.preferences.tabs.audio.voicing.customizeVoice.writtenVariablesPattern;
const labelledDescriptionPatternString = joistStrings.a11y.preferences.tabs.labelledDescriptionPattern;

const voiceRateNormalString = joistStrings.a11y.preferences.tabs.audio.voicing.customizeVoice.rate.rangeDescriptions.voiceRateNormal;
const inLowRangeString = joistStrings.a11y.preferences.tabs.audio.voicing.customizeVoice.rate.rangeDescriptions.low;
const inNormalRangeString = joistStrings.a11y.preferences.tabs.audio.voicing.customizeVoice.rate.rangeDescriptions.normal;
const aboveNormalRangeString = joistStrings.a11y.preferences.tabs.audio.voicing.customizeVoice.rate.rangeDescriptions.aboveNormal;
const inHighRangeString = joistStrings.a11y.preferences.tabs.audio.voicing.customizeVoice.rate.rangeDescriptions.high;

const VOICE_PITCH_DESCRIPTION_MAP = new Map();
VOICE_PITCH_DESCRIPTION_MAP.set( new Range( 0.5, 0.75 ), inLowRangeString );
VOICE_PITCH_DESCRIPTION_MAP.set( new Range( 0.75, 1.25 ), inNormalRangeString );
VOICE_PITCH_DESCRIPTION_MAP.set( new Range( 1.25, 1.5 ), aboveNormalRangeString );
VOICE_PITCH_DESCRIPTION_MAP.set( new Range( 1.5, 2 ), inHighRangeString );

const THUMB_SIZE = new Dimension2( 13, 26 );
const TRACK_SIZE = new Dimension2( 100, 5 );

class VoicingPanelSection extends PreferencesPanelSection {

  /**
   * @param {Object} audioModel - configuration for audio settings, see PreferencesManager
   * @param {BooleanProperty} toolbarEnabledProperty - whether or not the Toolbar is enabled for use
   * @param {Object} [options]
   */
  constructor( audioModel, toolbarEnabledProperty, options ) {

    options = merge( {
      tandem: Tandem.REQUIRED
    }, options );

    // the checkbox is the title for the section and totally enables/disables the feature
    const voicingLabel = new Text( voicingLabelString, PreferencesDialog.PANEL_SECTION_LABEL_OPTIONS );
    const voicingEnabledSwitch = new PreferencesToggleSwitch( audioModel.voicingEnabledProperty, false, true, {
      labelNode: voicingLabel,
      descriptionNode: new VoicingText( voicingDescriptionString, merge( {}, PreferencesDialog.PANEL_SECTION_CONTENT_OPTIONS, {
        readingBlockNameResponse: StringUtils.fillIn( labelledDescriptionPatternString, {
          label: voicingLabelString,
          description: voicingDescriptionString
        } )
      } ) ),
      a11yLabel: voicingLabelString,
      tandem: options.tandem.createTandem( 'voicingEnabledSwitch' )
    } );

    // checkbox for the toolbar
    const quickAccessLabel = new Text( toolbarLabelString, PreferencesDialog.PANEL_SECTION_LABEL_OPTIONS );
    const toolbarEnabledSwitch = new PreferencesToggleSwitch( toolbarEnabledProperty, false, true, {
      labelNode: quickAccessLabel,
      a11yLabel: toolbarLabelString,
      leftValueContextResponse: toolbarRemovedString,
      rightValueContextResponse: toolbarAddedString,
      tandem: options.tandem.createTandem( 'toolbarEnabledSwitch' )
    } );

    // Speech output levels
    const speechOutputLabel = new Text( simVoicingOptionsString, merge( {}, PreferencesDialog.PANEL_SECTION_LABEL_OPTIONS, {

      // pdom
      tagName: 'h3',
      innerContent: simVoicingOptionsString
    } ) );
    const speechOutputDescription = new VoicingText( simVoicingDescriptionString, merge( {}, PreferencesDialog.PANEL_SECTION_CONTENT_OPTIONS, {
      readingBlockNameResponse: StringUtils.fillIn( labelledDescriptionPatternString, {
        label: simVoicingOptionsString,
        description: simVoicingDescriptionString
      } )
    } ) );
    const speechOutputCheckboxes = new VBox( {
      align: 'left',
      spacing: 5,
      children: [
        createCheckbox( objectDetailsLabelString, audioModel.voicingObjectResponsesEnabledProperty,
          voicingObjectChangesString, objectChangesMutedString,
          options.tandem.createTandem( 'voicingObjectResponsesEnabledCheckbox' )
        ),
        createCheckbox( contextChangesLabelString, audioModel.voicingContextResponsesEnabledProperty,
          voicingContextChangesString, contextChangesMutedString,
          options.tandem.createTandem( 'voicingContextResponsesEnabledCheckbox' )
        ),
        createCheckbox( helpfulHintsLabelString, audioModel.voicingHintResponsesEnabledProperty,
          voicingHintsString, hintsMutedString,
          options.tandem.createTandem( 'voicingHintResponsesEnabledCheckbox' )
        )
      ]
    } );

    const speechOutputContent = new Node( {
      children: [ speechOutputLabel, speechOutputDescription, speechOutputCheckboxes ]
    } );
    speechOutputDescription.leftTop = speechOutputLabel.leftBottom.plusXY( 0, 5 );
    speechOutputCheckboxes.leftTop = speechOutputDescription.leftBottom.plusXY( 15, 5 );

    const rateSlider = new VoiceRateNumberControl( rateString, rateLabelString, audioModel.voiceRateProperty );
    const pitchSlider = new VoicingPitchSlider( pitchString, audioModel.voicePitchProperty );
    const voiceOptionsContent = new VBox( {
      spacing: 5,
      align: 'left',
      children: [
        rateSlider,
        pitchSlider
      ]
    } );

    // voice options
    const voiceOptionsLabel = new Text( customizeVoiceString, merge( {}, PreferencesDialog.PANEL_SECTION_LABEL_OPTIONS, {
      cursor: 'pointer'
    } ) );
    const voiceOptionsOpenProperty = new BooleanProperty( false );
    const expandCollapseButton = new ExpandCollapseButton( voiceOptionsOpenProperty, {
      sideLength: 16,

      // pdom
      innerContent: customizeVoiceString,

      // voicing
      voicingNameResponse: customizeVoiceString,
      voicingIgnoreVoicingManagerProperties: true, // Controls need to always speak responses so UI functions are clear

      // phet-io
      tandem: options.tandem.createTandem( 'expandCollapseButton' )
    } );

    const voiceOptionsContainer = new Node( {
      children: [ voiceOptionsLabel, expandCollapseButton ]
    } );

    // the visual title of the ExpandCollapseButton needs to be clickable
    const voiceOptionsPressListener = new PressListener( {
      press: () => {
        voiceOptionsOpenProperty.toggle();
      },

      // phet-io TODO: https://github.com/phetsims/joist/issues/744
      tandem: Tandem.OPT_OUT
    } );
    voiceOptionsLabel.addInputListener( voiceOptionsPressListener );

    const content = new Node( {
      children: [ speechOutputContent, toolbarEnabledSwitch, voiceOptionsContainer, voiceOptionsContent ]
    } );

    // layout for section content, custom rather than using a LayoutBox because the voice options label needs
    // to be left aligned with other labels, while the ExpandCollapseButton extends to the left
    toolbarEnabledSwitch.leftTop = speechOutputContent.leftBottom.plusXY( 0, 20 );
    voiceOptionsLabel.leftTop = toolbarEnabledSwitch.leftBottom.plusXY( 0, 20 );
    expandCollapseButton.leftCenter = voiceOptionsLabel.rightCenter.plusXY( 10, 0 );
    voiceOptionsContent.leftTop = voiceOptionsLabel.leftBottom.plusXY( 0, 10 );
    voiceOptionsOpenProperty.link( open => { voiceOptionsContent.visible = open; } );

    // the focus highlight for the voice options expand collapse button should surround the label
    expandCollapseButton.focusHighlight = new FocusHighlightFromNode( voiceOptionsContainer );

    super( {
      titleNode: voicingEnabledSwitch,
      contentNode: content
    } );

    audioModel.voicingEnabledProperty.link( enabled => {
      content.visible = enabled;
    } );

    // Speak when voicing becomes initially enabled. First speech is done synchronously (not using utterance-queue)
    // in response to user input, otherwise all speech will be blocked on many platforms
    const voicingEnabledUtterance = new Utterance();
    audioModel.voicingEnabledProperty.lazyLink( enabled => {

      // only speak if "Sim Voicing" is on, all voicing should be disabled except for the Toolbar
      // buttons in this case
      if ( audioModel.voicingMainWindowVoicingEnabledProperty.value ) {
        voicingEnabledUtterance.alert = enabled ? voicingEnabledString : voicingDisabledString;
        voicingManager.speakIgnoringEnabled( voicingEnabledUtterance );
        this.alertDescriptionUtterance( voicingEnabledUtterance );
      }
    } );

    // when the list of voices for the ComboBox changes, create a new ComboBox that includes the supported
    // voices
    let voiceComboBox = null;
    const voicesChangedListener = () => {
      if ( voiceComboBox ) {
        voiceOptionsContent.removeChild( voiceComboBox );
        voiceComboBox.dispose();
      }

      let voiceList = [];

      // Only get the prioritized and pruned list of voices if the VoicingManager has voices
      // available, otherwise wait until the next voicesChangedEmitter message. If there are no voices
      // available VoiceComboBox will handle that gracefully.
      if ( voicingManager.voices.length > 0 ) {
        const prioritizedVoices = voicingManager.getPrioritizedVoices();

        // for now, only english voices are available because the Voicing feature is not translatable
        const englishVoices = _.filter( prioritizedVoices, voice => {

          // most browsers use dashes to separate the local, Android uses underscore
          return voice.lang === 'en-US' || voice.lang === 'en_US';
        } );

        // limit the voices for now to keep the size of the ComboBox manageable
        voiceList = englishVoices.slice( 0, 12 );
      }

      // phet-io - for when creating the Archetype for the Capsule housing the preferencesDialog, we don't have a sim global.
      const parent = phet.joist.sim.topLayer || new Node();

      voiceComboBox = new VoiceComboBox( voiceList, audioModel.voiceProperty, parent );
      voiceOptionsContent.addChild( voiceComboBox );
    };
    voicingManager.voicesChangedEmitter.addListener( voicesChangedListener );

    // eagerly create the first ComboBox, even if no voices are available
    voicesChangedListener();

    voiceOptionsOpenProperty.lazyLink( open => {
      const alert = open ? customizeVoiceExpandedString : customizeVoiceCollapsedString;
      expandCollapseButton.voicingSpeakContextResponse( {
        contextResponse: alert
      } );
      this.alertDescriptionUtterance( alert );
    } );

    // @private
    this.disposeVoicingPanelSection = () => {
      voicingEnabledSwitch.dispose();
      expandCollapseButton.dispose();
      toolbarEnabledSwitch.dispose();
      speechOutputCheckboxes.children.forEach( child => child.dispose() );

    };
  }

  /**
   * @public
   */
  dispose() {
    this.disposeVoicingPanelSection();
    super.dispose();
  }
}

/**
 * Create a checkbox for the features of voicing content with a label.
 * @param {string} labelString
 * @param {BooleanProperty} property
 * @param {string} checkedContextResponse
 * @param {string} uncheckedContextResponse
 * @param {Tandem} tandem
 * @returns {Checkbox}
 */
const createCheckbox = ( labelString, property, checkedContextResponse, uncheckedContextResponse, tandem ) => {
  const labelNode = new Text( labelString, PreferencesDialog.PANEL_SECTION_CONTENT_OPTIONS );
  return new Checkbox( labelNode, property, {

    // pdom
    labelTagName: 'label',
    labelContent: labelString,

    // voicing
    voicingNameResponse: labelString,
    voicingIgnoreVoicingManagerProperties: true,

    // both pdom and voicing
    checkedContextResponse: checkedContextResponse,
    uncheckedContextResponse: uncheckedContextResponse,

    // phet-io
    tandem: tandem
  } );
};

/**
 * Create a NumberControl for one of the voice parameters of voicing (pitch/rate).
 *
 * @param {string} labelString - label for the NumberControl
 * @param {NumberProperty} voiceRateProperty
 * @returns {NumberControl}
 */
class VoiceRateNumberControl extends Voicing( NumberControl, 3 ) {
  constructor( labelString, a11yLabelString, voiceRateProperty ) {
    super( labelString, voiceRateProperty, voiceRateProperty.range, {
      includeArrowButtons: false,
      layoutFunction: NumberControl.createLayoutFunction4(),
      delta: 0.25,
      titleNodeOptions: merge( {}, PreferencesDialog.PANEL_SECTION_CONTENT_OPTIONS, {
        maxWidth: 45
      } ),
      numberDisplayOptions: {
        decimalPlaces: 2,
        valuePattern: voiceVariablesPatternString,
        textOptions: merge( {}, PreferencesDialog.PANEL_SECTION_CONTENT_OPTIONS, {
          maxWidth: 45
        } )
      },
      sliderOptions: {
        thumbSize: THUMB_SIZE,
        trackSize: TRACK_SIZE,
        keyboardStep: 0.25,
        minorTickSpacing: 0.25,

        // pdom
        labelTagName: 'label',
        labelContent: a11yLabelString
      },

      // phet-io
      tandem: Tandem.OPT_OUT
    } );

    this.slider.addInputListener( {
      focus: event => {
        this.voicingSpeakFullResponse();
      }
    } );

    voiceRateProperty.link( ( rate, previousValue ) => {
      this.voicingObjectResponse = this.getRateDescriptionString( rate );
      if ( previousValue !== null ) {

        // every change read the name and object response for the slider
        this.voicingSpeakFullResponse();
      }
    } );

    this.mutate( {
      voicingNameResponse: a11yLabelString,

      // ignore the selections of Preferences menu, we always want to hear all responses
      // that happen when changing the voice attributes
      voicingIgnoreVoicingManagerProperties: true
    } );
  }

  /**
   * Returns a description of the voice rate.
   * @public
   *
   * @param {number} rate
   */
  getRateDescriptionString( rate ) {
    return rate === 1 ? voiceRateNormalString : StringUtils.fillIn( voiceRateDescriptionPatternString, {
      value: rate
    } );
  }
}

/**
 * Inner class for the ComboBox that selects the voice for the voicingManager. This ComboBox can be created and destroyed
 * a few times as the browser list of supported voices may change while the SpeechSynthesis is first getting put to
 * use.
 */
class VoiceComboBox extends ComboBox {

  /**
   * @param {SpeechSynthesisVoice[]} voices - list of voices to include from the voicingManager
   * @param {Property.<SpeechSynthesisVoice|null>} voiceProperty
   * @param {Node} parentNode - node that acts as a parent for the ComboBox list
   * @param {Object} [options]
   */
  constructor( voices, voiceProperty, parentNode, options ) {

    options = merge( {
      listPosition: 'above',
      accessibleName: voiceLabelString,

      comboBoxVoicingNameResponsePattern: voiceTitlePatternLabelString,

      // phet-io, opt out because we would need to instrument voices, but those could change between runtimes.
      tandem: Tandem.OPT_OUT
    }, options );

    const items = [];

    if ( voices.length === 0 ) {
      const textNode = new Text( noVoicesAvailableString, PreferencesDialog.PANEL_SECTION_CONTENT_OPTIONS );
      items.push( new ComboBoxItem( textNode, null, {
        a11yLabel: noVoicesAvailableString
      } ) );
    }

    voices.forEach( voice => {
      const textNode = new Text( voice.name, PreferencesDialog.PANEL_SECTION_CONTENT_OPTIONS );
      items.push( new ComboBoxItem( textNode, voice, {
        a11yLabel: voice.name
      } ) );
    } );

    // since we are updating the list, set the VoiceProperty to the first available value, or null if there are
    // voices
    voiceProperty.set( items[ 0 ].value );

    super( items, voiceProperty, parentNode, options );

    // voicing -  responses for the button should always come through, regardless of user selection of
    // responses. As of 10/29/21, ComboBox will only read the name response (which are always read regardless)
    // so this isn't really necessary but it is prudent to include it anyway.
    this.button.voicingIgnoreVoicingManagerProperties = true;
  }
}

/**
 * A slider with labels and tick marks used to control voice rate of web speech synthesis.
 *
 * @param {string} labelString
 * @param {NumberProperty} voicePitchProperty
 * @returns {VBox}
 */
class VoicingPitchSlider extends Voicing( VBox, 0 ) {

  /**
   * @param labelString
   * @param voicePitchProperty
   * @returns {VBox}
   */
  constructor( labelString, voicePitchProperty ) {
    const label = new Text( labelString, PreferencesDialog.PANEL_SECTION_CONTENT_OPTIONS );
    const slider = new HSlider( voicePitchProperty, voicePitchProperty.range, {
      majorTickLength: 10,
      thumbSize: THUMB_SIZE,
      trackSize: TRACK_SIZE,
      keyboardStep: 0.25,
      shiftKeyboardStep: 0.1,

      // constrain the value to the nearest hundredths place so there is no overlap in described ranges in
      // VOICE_PITCH_DESCRIPTION_MAP
      constrainValue: value => Utils.roundToInterval( value, 0.01 ),

      // pdom
      labelTagName: 'label',
      labelContent: labelString,

      // voicing
      voicingNameResponse: labelString,

      // phet-io TODO: https://github.com/phetsims/joist/issues/744
      tandem: Tandem.OPT_OUT
    } );

    const lowLabel = new Text( 'Low', { font: new PhetFont( 14 ) } );
    slider.addMajorTick( voicePitchProperty.range.min, lowLabel );

    const highLabel = new Text( 'High', { font: new PhetFont( 14 ) } );
    slider.addMajorTick( voicePitchProperty.range.max, highLabel );

    super();

    slider.addInputListener( {
      focus: event => {
        this.voicingSpeakFullResponse();
      }
    } );

    // voicing
    voicePitchProperty.link( ( pitch, previousValue ) => {
      this.voicingObjectResponse = this.getPitchDescriptionString( pitch );

      // alert made lazily so it is not heard on construction, speak the name and object response every change
      if ( previousValue !== null ) {
        this.voicingSpeakFullResponse();
      }
    } );

    this.mutate( {
      children: [ label, slider ],
      align: 'left',
      spacing: 5,

      // voicing
      voicingNameResponse: labelString,

      // ignore the selections of Preferences menu, we always want to hear all responses
      // that happen when changing the voice attributes
      voicingIgnoreVoicingManagerProperties: true
    } );
  }

  /**
   * Gets a description of the pitch at the provided value from VOICE_PITCH_DESCRIPTION_MAP.
   * @private
   *
   * @param {number} pitchValue
   * @returns {string}
   */
  getPitchDescriptionString( pitchValue ) {
    let pitchDescription;
    VOICE_PITCH_DESCRIPTION_MAP.forEach( ( description, range ) => {
      if ( range.contains( pitchValue ) ) {
        pitchDescription = description;
      }
    } );
    assert && assert( pitchDescription, `no description found for pitch at value: ${pitchValue}` );

    return pitchDescription;
  }
}

joist.register( 'VoicingPanelSection', VoicingPanelSection );
export default VoicingPanelSection;