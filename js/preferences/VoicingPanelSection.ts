// Copyright 2021-2022, University of Colorado Boulder

/**
 * The section of PreferencesDialog content in the "Audio" panel related to voicing.
 *
 * @author Jesse Greenberg
 */

import BooleanProperty from '../../../axon/js/BooleanProperty.js';
import NumberProperty from '../../../axon/js/NumberProperty.js';
import Property from '../../../axon/js/Property.js';
import TReadOnlyProperty from '../../../axon/js/TReadOnlyProperty.js';
import Dimension2 from '../../../dot/js/Dimension2.js';
import Range from '../../../dot/js/Range.js';
import Utils from '../../../dot/js/Utils.js';
import merge from '../../../phet-core/js/merge.js';
import optionize, { EmptySelfOptions } from '../../../phet-core/js/optionize.js';
import StringUtils from '../../../phetcommon/js/util/StringUtils.js';
import NumberControl from '../../../scenery-phet/js/NumberControl.js';
import PhetFont from '../../../scenery-phet/js/PhetFont.js';
import { FocusHighlightFromNode, Node, PressListener, Text, VBox, voicingManager, VoicingText } from '../../../scenery/js/imports.js';
import Checkbox from '../../../sun/js/Checkbox.js';
import ComboBox, { ComboBoxOptions } from '../../../sun/js/ComboBox.js';
import ExpandCollapseButton from '../../../sun/js/ExpandCollapseButton.js';
import HSlider from '../../../sun/js/HSlider.js';
import Tandem from '../../../tandem/js/Tandem.js';
import Utterance from '../../../utterance-queue/js/Utterance.js';
import joist from '../joist.js';
import JoistStrings from '../JoistStrings.js';
import PreferencesDialog from './PreferencesDialog.js';
import { AudioModel } from './PreferencesModel.js';
import PreferencesPanelSection, { PreferencesPanelSectionOptions } from './PreferencesPanelSection.js';
import PreferencesToggleSwitch from './PreferencesToggleSwitch.js';
import localeProperty from '../i18n/localeProperty.js';

// constants
// none of the Voicing strings or feature is translatable yet, all strings in this file
// are nested under the 'a11y' section to make sure that they are not translatable
const voicingLabelString = JoistStrings.a11y.preferences.tabs.audio.voicing.titleStringProperty;
const toolbarLabelString = JoistStrings.a11y.preferences.tabs.audio.voicing.toolbar.titleStringProperty;
const rateString = JoistStrings.a11y.preferences.tabs.audio.voicing.customizeVoice.rate.titleStringProperty;
const rateLabelString = JoistStrings.a11y.preferences.tabs.audio.voicing.customizeVoice.rate.labelStringStringProperty;
const pitchString = JoistStrings.a11y.preferences.tabs.audio.voicing.customizeVoice.pitch.titleStringProperty;
const voicingEnabledString = JoistStrings.a11y.preferences.tabs.audio.voicing.voicingOnStringProperty;
const voicingDisabledString = JoistStrings.a11y.preferences.tabs.audio.voicing.voicingOffStringProperty;
const voicingOffOnlyAvailableInEnglishString = JoistStrings.a11y.preferences.tabs.audio.voicing.voicingOffOnlyAvailableInEnglishStringProperty;
const voiceVariablesPatternString = JoistStrings.a11y.preferences.tabs.audio.voicing.customizeVoice.variablesPatternStringProperty;
const customizeVoiceString = JoistStrings.a11y.preferences.tabs.audio.voicing.customizeVoice.titleStringProperty;

const toolbarRemovedString = JoistStrings.a11y.preferences.tabs.audio.voicing.toolbar.toolbarRemovedStringProperty;
const toolbarAddedString = JoistStrings.a11y.preferences.tabs.audio.voicing.toolbar.toolbarAddedStringProperty;

const simVoicingOptionsString = JoistStrings.a11y.preferences.tabs.audio.voicing.simVoicingOptions.titleStringProperty;
const simVoicingDescriptionString = JoistStrings.a11y.preferences.tabs.audio.voicing.simVoicingOptions.descriptionStringProperty;

const objectDetailsLabelString = JoistStrings.a11y.preferences.tabs.audio.voicing.simVoicingOptions.objectDetails.labelStringProperty;
const contextChangesLabelString = JoistStrings.a11y.preferences.tabs.audio.voicing.simVoicingOptions.contextChanges.labelStringProperty;
const helpfulHintsLabelString = JoistStrings.a11y.preferences.tabs.audio.voicing.simVoicingOptions.helpfulHints.labelStringProperty;

const voicingObjectChangesString = JoistStrings.a11y.preferences.tabs.audio.voicing.simVoicingOptions.objectDetails.enabledAlertStringProperty;
const objectChangesMutedString = JoistStrings.a11y.preferences.tabs.audio.voicing.simVoicingOptions.objectDetails.disabledAlertStringProperty;
const voicingContextChangesString = JoistStrings.a11y.preferences.tabs.audio.voicing.simVoicingOptions.contextChanges.enabledAlertStringProperty;
const contextChangesMutedString = JoistStrings.a11y.preferences.tabs.audio.voicing.simVoicingOptions.contextChanges.disabledAlertStringProperty;
const voicingHintsString = JoistStrings.a11y.preferences.tabs.audio.voicing.simVoicingOptions.helpfulHints.enabledAlertStringProperty;
const hintsMutedString = JoistStrings.a11y.preferences.tabs.audio.voicing.simVoicingOptions.helpfulHints.disabledAlertStringProperty;

const voiceLabelString = JoistStrings.a11y.preferences.tabs.audio.voicing.customizeVoice.voice.titleStringProperty;
const voiceTitlePatternLabelString = JoistStrings.a11y.preferences.tabs.audio.voicing.customizeVoice.voice.titlePatternStringProperty;
const noVoicesAvailableString = JoistStrings.a11y.preferences.tabs.audio.voicing.customizeVoice.voice.noVoicesAvailableStringProperty;

const customizeVoiceExpandedString = JoistStrings.a11y.preferences.tabs.audio.voicing.customizeVoice.expandedAlertStringProperty;
const customizeVoiceCollapsedString = JoistStrings.a11y.preferences.tabs.audio.voicing.customizeVoice.collapsedAlertStringProperty;

const voiceRateDescriptionPatternString = JoistStrings.a11y.preferences.tabs.audio.voicing.customizeVoice.writtenVariablesPatternStringProperty;
const labelledDescriptionPatternString = JoistStrings.a11y.preferences.tabs.labelledDescriptionPatternStringProperty;

const voiceRateNormalString = JoistStrings.a11y.preferences.tabs.audio.voicing.customizeVoice.rate.rangeDescriptions.voiceRateNormalStringProperty;
const inLowRangeString = JoistStrings.a11y.preferences.tabs.audio.voicing.customizeVoice.rate.rangeDescriptions.lowStringProperty;
const inNormalRangeString = JoistStrings.a11y.preferences.tabs.audio.voicing.customizeVoice.rate.rangeDescriptions.normalStringProperty;
const aboveNormalRangeString = JoistStrings.a11y.preferences.tabs.audio.voicing.customizeVoice.rate.rangeDescriptions.aboveNormalStringProperty;
const inHighRangeString = JoistStrings.a11y.preferences.tabs.audio.voicing.customizeVoice.rate.rangeDescriptions.highStringProperty;

// Voicing can appear but become disabled when running with multiple locales. This translatable label is present for
// translated sims in this case.
const voicingEnglishOnlyLabelString = JoistStrings.preferences.tabs.audio.voicing.titleEnglishOnlyStringProperty;
const voicingDescriptionString = JoistStrings.preferences.tabs.audio.voicing.descriptionStringProperty;

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
   * @param [providedOptions]
   */
  public constructor( audioModel: AudioModel, providedOptions?: VoicingPanelSectionOptions ) {

    // Voicing feature only works when running in English. If running in a version where you can change locale,
    // indicate through the title that the feature will only work in English.
    const titleString = ( localeProperty.validValues && localeProperty.validValues.length > 1 ) ?
                        voicingEnglishOnlyLabelString : voicingLabelString;

    // the checkbox is the title for the section and totally enables/disables the feature
    const voicingLabel = new Text( titleString, PreferencesDialog.PANEL_SECTION_LABEL_OPTIONS );
    const voicingEnabledSwitch = new PreferencesToggleSwitch<boolean>( audioModel.voicingEnabledProperty, false, true, {
      labelNode: voicingLabel,
      descriptionNode: new VoicingText( voicingDescriptionString, merge( {}, PreferencesDialog.PANEL_SECTION_CONTENT_OPTIONS, {
        readingBlockNameResponse: StringUtils.fillIn( labelledDescriptionPatternString, {
          label: titleString,
          description: voicingDescriptionString
        } )
      } ) ),
      a11yLabel: titleString
    } );

    // checkbox for the toolbar
    const quickAccessLabel = new Text( toolbarLabelString, PreferencesDialog.PANEL_SECTION_LABEL_OPTIONS );
    const toolbarEnabledSwitch = new PreferencesToggleSwitch<boolean>( audioModel.toolbarEnabledProperty, false, true, {
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

    // layout for section content, custom rather than using a FlowBox because the voice options label needs
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

    const contentVisibilityListener = ( enabled: boolean ) => {
      content.visible = enabled;
    };
    audioModel.voicingEnabledProperty.link( contentVisibilityListener );

    const localeListener = ( locale: string ) => {
      voicingEnabledSwitch.enabledProperty.value = locale.startsWith( 'en' );
    };
    localeProperty.link( localeListener );

    // Speak when voicing becomes initially enabled. First speech is done synchronously (not using utterance-queue)
    // in response to user input, otherwise all speech will be blocked on many platforms
    const voicingEnabledUtterance = new Utterance();
    const voicingEnabledPropertyListener = ( enabled: boolean ) => {

      // only speak if "Sim Voicing" is on, all voicing should be disabled except for the Toolbar
      // buttons in this case
      if ( audioModel.voicingMainWindowVoicingEnabledProperty.value ) {

        // If locale changes, make sure to describe that Voicing has become disabled because Voicing is only available
        // in the English locale.
        voicingEnabledUtterance.alert = enabled ? voicingEnabledString :
                                        ( localeProperty.value.startsWith( 'en' ) ? voicingDisabledString : voicingOffOnlyAvailableInEnglishString );
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
      audioModel.voicingEnabledProperty.unlink( contentVisibilityListener );
      voicingManager.voicesChangedEmitter.removeListener( voicesChangedListener );
      localeProperty.unlink( localeListener );
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
const createCheckbox = ( labelString: TReadOnlyProperty<string>, property: Property<boolean>,
                         checkedContextResponse: TReadOnlyProperty<string>, uncheckedContextResponse: TReadOnlyProperty<string> ): Checkbox => {
  const labelNode = new Text( labelString, PreferencesDialog.PANEL_SECTION_CONTENT_OPTIONS );
  return new Checkbox( property, labelNode, {

    // pdom
    labelTagName: 'label',
    labelContent: labelString,

    // voicing
    voicingNameResponse: labelString,
    voicingIgnoreVoicingManagerProperties: true,
    voiceNameResponseOnSelection: false,

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
class VoiceRateNumberControl extends NumberControl {
  private readonly disposeVoiceRateNumberControl: () => void;

  public constructor( labelString: TReadOnlyProperty<string>, a11yLabelString: TReadOnlyProperty<string>, voiceRateProperty: NumberProperty ) {

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
        labelContent: a11yLabelString,

        // voicing
        voicingOnEndResponseOptions: {
          withNameResponse: true
        }
      },

      // phet-io
      tandem: Tandem.OPT_OUT // We don't want to instrument components for preferences, https://github.com/phetsims/joist/issues/744#issuecomment-1196028362
    } );

    // Voicing goes through the NumberControl slider through AccessibleValueHandler
    this.slider.voicingNameResponse = a11yLabelString;

    // ignore the selections of Preferences menu, we always want to hear all responses
    // that happen when changing the voice attributes
    this.slider.voicingIgnoreVoicingManagerProperties = true;

    const voiceRateListener = ( voiceRate: number ) => {
      this.slider.voicingObjectResponse = this.getRateDescriptionString( voiceRate );
    };
    voiceRateProperty.link( voiceRateListener );

    this.disposeVoiceRateNumberControl = () => {
      voiceRateProperty.unlink( voiceRateListener );
    };
  }

  /**
   * Returns a description of the voice rate.
   */
  public getRateDescriptionString( rate: number ): string {
    return rate === 1 ? voiceRateNormalString.value : StringUtils.fillIn( voiceRateDescriptionPatternString, {
      value: rate
    } );
  }

  public override dispose(): void {
    this.disposeVoiceRateNumberControl();
    super.dispose();
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
      comboBoxVoicingNameResponsePattern: voiceTitlePatternLabelString.value,

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
class VoicingPitchSlider extends VBox {
  private readonly disposeVoicePitchSlider: () => void;

  public constructor( labelString: TReadOnlyProperty<string>, voicePitchProperty: NumberProperty ) {
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

      // Voicing controls should not respect voicing response controls so user always hears information about them
      voicingIgnoreVoicingManagerProperties: true,

      // phet-io
      tandem: Tandem.OPT_OUT // We don't want to instrument components for preferences, https://github.com/phetsims/joist/issues/744#issuecomment-1196028362
    } );

    const lowLabel = new Text( 'Low', { font: new PhetFont( 14 ) } );
    slider.addMajorTick( voicePitchRange.min, lowLabel );

    const highLabel = new Text( 'High', { font: new PhetFont( 14 ) } );
    slider.addMajorTick( voicePitchRange.max, highLabel );

    super();

    // voicing
    const voicePitchListener = ( pitch: number, previousValue: number | null ) => {
      slider.voicingObjectResponse = this.getPitchDescriptionString( pitch );
    };
    voicePitchProperty.link( voicePitchListener );

    this.mutate( {
      children: [ label, slider ],

      // @ts-ignore mutate doesn't work when the subclass changes mutator keys,
      // see https://github.com/phetsims/scenery/issues/1433
      spacing: 5
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