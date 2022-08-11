// Copyright 2021-2022, University of Colorado Boulder

/**
 * The section of PreferencesDialog content in the "Audio" panel related to voicing.
 *
 * @author Jesse Greenberg
 */

import BooleanProperty from '../../../axon/js/BooleanProperty.js';
import NumberProperty from '../../../axon/js/NumberProperty.js';
import Property from '../../../axon/js/Property.js';
import Dimension2 from '../../../dot/js/Dimension2.js';
import Range from '../../../dot/js/Range.js';
import Utils from '../../../dot/js/Utils.js';
import merge from '../../../phet-core/js/merge.js';
import optionize, { EmptySelfOptions } from '../../../phet-core/js/optionize.js';
import StringUtils from '../../../phetcommon/js/util/StringUtils.js';
import NumberControl from '../../../scenery-phet/js/NumberControl.js';
import PhetFont from '../../../scenery-phet/js/PhetFont.js';
import { FocusHighlightFromNode, Node, PressListener, Text, VBox, Voicing, voicingManager, VoicingText } from '../../../scenery/js/imports.js';
import Checkbox from '../../../sun/js/Checkbox.js';
import ComboBox, { ComboBoxOptions } from '../../../sun/js/ComboBox.js';
import ExpandCollapseButton from '../../../sun/js/ExpandCollapseButton.js';
import HSlider from '../../../sun/js/HSlider.js';
import Tandem from '../../../tandem/js/Tandem.js';
import Utterance from '../../../utterance-queue/js/Utterance.js';
import joist from '../joist.js';
import joistStrings from '../joistStrings.js';
import PreferencesDialog from './PreferencesDialog.js';
import { AudioModel } from './PreferencesModel.js';
import PreferencesPanelSection, { PreferencesPanelSectionOptions } from './PreferencesPanelSection.js';
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

type SelfOptions = EmptySelfOptions;
type VoicingPanelSectionOptions = SelfOptions & PreferencesPanelSectionOptions;

class VoicingPanelSection extends PreferencesPanelSection {
  private readonly disposeVoicingPanelSection: () => void;

  /**
   * @param audioModel - configuration for audio settings, see PreferencesModel
   * @param toolbarEnabledProperty - whether the Toolbar is enabled for use
   * @param [providedOptions]
   */
  public constructor( audioModel: AudioModel, toolbarEnabledProperty: Property<boolean>, providedOptions?: VoicingPanelSectionOptions ) {

    // the checkbox is the title for the section and totally enables/disables the feature
    const voicingLabel = new Text( voicingLabelString, PreferencesDialog.PANEL_SECTION_LABEL_OPTIONS );
    const voicingEnabledSwitch = new PreferencesToggleSwitch<boolean>( audioModel.voicingEnabledProperty, false, true, {
      labelNode: voicingLabel,
      descriptionNode: new VoicingText( voicingDescriptionString, merge( {}, PreferencesDialog.PANEL_SECTION_CONTENT_OPTIONS, {
        readingBlockNameResponse: StringUtils.fillIn( labelledDescriptionPatternString, {
          label: voicingLabelString,
          description: voicingDescriptionString
        } )
      } ) ),
      a11yLabel: voicingLabelString
    } );

    // checkbox for the toolbar
    const quickAccessLabel = new Text( toolbarLabelString, PreferencesDialog.PANEL_SECTION_LABEL_OPTIONS );
    const toolbarEnabledSwitch = new PreferencesToggleSwitch<boolean>( toolbarEnabledProperty, false, true, {
      labelNode: quickAccessLabel,
      a11yLabel: toolbarLabelString,
      leftValueContextResponse: toolbarRemovedString,
      rightValueContextResponse: toolbarAddedString
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
          voicingObjectChangesString, objectChangesMutedString
        ),
        createCheckbox( contextChangesLabelString, audioModel.voicingContextResponsesEnabledProperty,
          voicingContextChangesString, contextChangesMutedString
        ),
        createCheckbox( helpfulHintsLabelString, audioModel.voicingHintResponsesEnabledProperty,
          voicingHintsString, hintsMutedString
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
      tandem: Tandem.OPT_OUT // We don't want to instrument components for preferences, https://github.com/phetsims/joist/issues/744#issuecomment-1196028362
    } );

    const voiceOptionsContainer = new Node( {
      children: [ voiceOptionsLabel, expandCollapseButton ]
    } );

    // the visual title of the ExpandCollapseButton needs to be clickable
    const voiceOptionsPressListener = new PressListener( {
      press: () => {
        voiceOptionsOpenProperty.toggle();
      },

      // phet-io
      tandem: Tandem.OPT_OUT // We don't want to instrument components for preferences, https://github.com/phetsims/joist/issues/744#issuecomment-1196028362
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
    const voicingEnabledPropertyListener = ( enabled: boolean ) => {

      // only speak if "Sim Voicing" is on, all voicing should be disabled except for the Toolbar
      // buttons in this case
      if ( audioModel.voicingMainWindowVoicingEnabledProperty.value ) {
        voicingEnabledUtterance.alert = enabled ? voicingEnabledString : voicingDisabledString;
        voicingManager.speakIgnoringEnabled( voicingEnabledUtterance );
        this.alertDescriptionUtterance( voicingEnabledUtterance );
      }
    };
    audioModel.voicingEnabledProperty.lazyLink( voicingEnabledPropertyListener );

    // when the list of voices for the ComboBox changes, create a new ComboBox that includes the supported
    // voices
    let voiceComboBox: VoiceComboBox | null = null;
    const voicesChangedListener = () => {
      if ( voiceComboBox ) {
        voiceOptionsContent.removeChild( voiceComboBox );
        voiceComboBox.dispose();
      }

      let voiceList: SpeechSynthesisVoice[] = [];

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

      voiceComboBox = new VoiceComboBox( audioModel.voiceProperty, voiceList, parent );
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

    this.disposeVoicingPanelSection = () => {
      pitchSlider.dispose();
      rateSlider.dispose();
      audioModel.voicingEnabledProperty.unlink( voicingEnabledPropertyListener );
      voicingEnabledSwitch.dispose();
      expandCollapseButton.dispose();
      toolbarEnabledSwitch.dispose();
      speechOutputCheckboxes.children.forEach( child => child.dispose() );
    };
  }

  public override dispose(): void {
    this.disposeVoicingPanelSection();
    super.dispose();
  }
}

/**
 * Create a checkbox for the features of voicing content with a label.
 */
const createCheckbox = ( labelString: string, property: Property<boolean>, checkedContextResponse: string, uncheckedContextResponse: string ): Checkbox => {
  const labelNode = new Text( labelString, PreferencesDialog.PANEL_SECTION_CONTENT_OPTIONS );
  return new Checkbox( property, labelNode, {

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
    tandem: Tandem.OPT_OUT // We don't want to instrument components for preferences, https://github.com/phetsims/joist/issues/744#issuecomment-1196028362
  } );
};

/**
 * Create a NumberControl for one of the voice parameters of voicing (pitch/rate).
 *
 * @param labelString - label for the NumberControl
 * @param a11yLabelString - label for both PDOM and Voicing content
 * @param voiceRateProperty
 */
class VoiceRateNumberControl extends Voicing( NumberControl ) {
  private readonly disposeVoiceRateSlider: () => void;

  public constructor( labelString: string, a11yLabelString: string, voiceRateProperty: NumberProperty ) {

    assert && assert( voiceRateProperty.range, 'Range is required on the property for the control.' );
    super( labelString, voiceRateProperty, voiceRateProperty.range!, {
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
      tandem: Tandem.OPT_OUT // We don't want to instrument components for preferences, https://github.com/phetsims/joist/issues/744#issuecomment-1196028362
    } );

    this.slider.addInputListener( {
      focus: event => {
        this.voicingSpeakFullResponse();
      }
    } );

    const voiceRateListener = ( rate: number, previousValue: number | null ) => {
      this.voicingObjectResponse = this.getRateDescriptionString( rate );
      if ( previousValue !== null ) {

        // every change read the name and object response for the slider
        this.voicingSpeakFullResponse();
      }
    };
    voiceRateProperty.link( voiceRateListener );

    this.mutate( {

      // @ts-ignore - mutate only supports NodeOptions currently, but this key is Voicing mutator keys,
      // see https://github.com/phetsims/scenery/issues/1433
      voicingNameResponse: a11yLabelString,

      // ignore the selections of Preferences menu, we always want to hear all responses
      // that happen when changing the voice attributes
      voicingIgnoreVoicingManagerProperties: true
    } );

    this.disposeVoiceRateSlider = () => {
      voiceRateProperty.unlink( voiceRateListener );
    };
  }

  public override dispose(): void {
    this.disposeVoiceRateSlider();
    super.dispose();
  }

  /**
   * Returns a description of the voice rate.
   */
  public getRateDescriptionString( rate: number ): string {
    return rate === 1 ? voiceRateNormalString : StringUtils.fillIn( voiceRateDescriptionPatternString, {
      value: rate
    } );
  }
}

type VoiceComboBoxSelfOptions = EmptySelfOptions;
type VoiceComboBoxOptions = VoiceComboBoxSelfOptions & ComboBoxOptions;

/**
 * Inner class for the ComboBox that selects the voice for the voicingManager. This ComboBox can be created and destroyed
 * a few times as the browser list of supported voices may change while the SpeechSynthesis is first getting put to
 * use.
 */
class VoiceComboBox extends ComboBox<SpeechSynthesisVoice | null> {

  /**
   * @param  voiceProperty
   * @param voices - list of voices to include from the voicingManager
   * @param parentNode - node that acts as a parent for the ComboBox list
   * @param [providedOptions]
   */
  public constructor( voiceProperty: Property<SpeechSynthesisVoice | null>, voices: SpeechSynthesisVoice[], parentNode: Node, providedOptions?: ComboBoxOptions ) {
    const options = optionize<VoiceComboBoxOptions, VoiceComboBoxSelfOptions, ComboBoxOptions>()( {
      listPosition: 'above',
      accessibleName: voiceLabelString,
      comboBoxVoicingNameResponsePattern: voiceTitlePatternLabelString,

      // phet-io
      // We don't want to instrument components for preferences, https://github.com/phetsims/joist/issues/744#issuecomment-1196028362
      // Furthermore, opt out because we would need to instrument voices, but those could change between runtimes.
      tandem: Tandem.OPT_OUT
    }, providedOptions );

    const items = [];

    if ( voices.length === 0 ) {
      items.push( {
        value: null,
        node: new Text( noVoicesAvailableString, PreferencesDialog.PANEL_SECTION_CONTENT_OPTIONS ),
        a11yLabel: noVoicesAvailableString
      } );
    }

    voices.forEach( voice => {
      items.push( {
        value: voice,
        node: new Text( voice.name, PreferencesDialog.PANEL_SECTION_CONTENT_OPTIONS ),
        a11yLabel: voice.name
      } );
    } );

    // since we are updating the list, set the VoiceProperty to the first available value, or null if there are
    // voices
    voiceProperty.set( items[ 0 ].value );

    super( voiceProperty, items, parentNode, options );

    // voicing -  responses for the button should always come through, regardless of user selection of
    // responses. As of 10/29/21, ComboBox will only read the name response (which are always read regardless)
    // so this isn't really necessary but it is prudent to include it anyway.
    this.button.voicingIgnoreVoicingManagerProperties = true;
  }
}

/**
 * A slider with labels and tick marks used to control voice rate of web speech synthesis.
 */
class VoicingPitchSlider extends Voicing( VBox ) {
  private readonly disposeVoicePitchSlider: () => void;

  public constructor( labelString: string, voicePitchProperty: NumberProperty ) {
    const label = new Text( labelString, PreferencesDialog.PANEL_SECTION_CONTENT_OPTIONS );

    assert && assert( voicePitchProperty.range, 'Range is required for the voice pitch slider.' );
    const voicePitchRange = voicePitchProperty.range!;

    const slider = new HSlider( voicePitchProperty, voicePitchRange, {
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

      // phet-io
      tandem: Tandem.OPT_OUT // We don't want to instrument components for preferences, https://github.com/phetsims/joist/issues/744#issuecomment-1196028362
    } );

    const lowLabel = new Text( 'Low', { font: new PhetFont( 14 ) } );
    slider.addMajorTick( voicePitchRange.min, lowLabel );

    const highLabel = new Text( 'High', { font: new PhetFont( 14 ) } );
    slider.addMajorTick( voicePitchRange.max, highLabel );

    super();

    slider.addInputListener( {
      focus: event => {
        this.voicingSpeakFullResponse();
      }
    } );

    // voicing
    const voicePitchListener = ( pitch: number, previousValue: number | null ) => {
      this.voicingObjectResponse = this.getPitchDescriptionString( pitch );

      // alert made lazily so it is not heard on construction, speak the name and object response every change
      if ( previousValue !== null ) {
        this.voicingSpeakFullResponse();
      }
    };
    voicePitchProperty.link( voicePitchListener );

    this.mutate( {
      children: [ label, slider ],

      // @ts-ignore mutate doesn't work when the subclass changes mutator keys,
      // see https://github.com/phetsims/scenery/issues/1433
      spacing: 5,

      // voicing
      voicingNameResponse: labelString,

      // ignore the selections of Preferences menu, we always want to hear all responses
      // that happen when changing the voice attributes
      voicingIgnoreVoicingManagerProperties: true
    } );

    this.disposeVoicePitchSlider = () => {
      voicePitchProperty.unlink( voicePitchListener );
    };
  }

  public override dispose(): void {
    this.disposeVoicePitchSlider();
    super.dispose();
  }

  /**
   * Gets a description of the pitch at the provided value from VOICE_PITCH_DESCRIPTION_MAP.
   */
  private getPitchDescriptionString( pitchValue: number ): string {
    let pitchDescription = '';
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