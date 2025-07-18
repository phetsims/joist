// Copyright 2021-2025, University of Colorado Boulder

/**
 * An item for the Toolbar that includes components related to the voicing feature. Includes a switch to
 * enable/disable all speech, and buttons to hear overview information about the active sim Screen.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../axon/js/BooleanProperty.js';
import type TReadOnlyProperty from '../../../axon/js/TReadOnlyProperty.js';
import optionize, { combineOptions, type EmptySelfOptions } from '../../../phet-core/js/optionize.js';
import type PickRequired from '../../../phet-core/js/types/PickRequired.js';
import type StrictOmit from '../../../phet-core/js/types/StrictOmit.js';
import PlayStopButton from '../../../scenery-phet/js/buttons/PlayStopButton.js';
import PhetFont from '../../../scenery-phet/js/PhetFont.js';
import VoicingText from '../../../scenery/js/accessibility/voicing/nodes/VoicingText.js';
import ReadingBlockHighlight from '../../../scenery/js/accessibility/voicing/ReadingBlockHighlight.js';
import voicingManager from '../../../scenery/js/accessibility/voicing/voicingManager.js';
import voicingUtteranceQueue from '../../../scenery/js/accessibility/voicing/voicingUtteranceQueue.js';
import Display from '../../../scenery/js/display/Display.js';
import type SceneryEvent from '../../../scenery/js/input/SceneryEvent.js';
import AlignGroup from '../../../scenery/js/layout/constraints/AlignGroup.js';
import HBox from '../../../scenery/js/layout/nodes/HBox.js';
import Node, { type NodeOptions } from '../../../scenery/js/nodes/Node.js';
import Text from '../../../scenery/js/nodes/Text.js';
import ToggleSwitch, { type ToggleSwitchOptions } from '../../../sun/js/ToggleSwitch.js';
import Tandem from '../../../tandem/js/Tandem.js';
import { type SpeakableResolvedResponse } from '../../../utterance-queue/js/ResponsePacket.js';
import Utterance from '../../../utterance-queue/js/Utterance.js';
import joist from '../joist.js';
import JoistStrings from '../JoistStrings.js';
import type LookAndFeel from '../LookAndFeel.js';
import PreferencesControl from '../preferences/PreferencesControl.js';
import PreferencesDialogConstants from '../preferences/PreferencesDialogConstants.js';
import type VoicingToolbarAlertManager from './VoicingToolbarAlertManager.js';

// constants
const CONTENT_VERTICAL_SPACING = 10;
const QUICK_INFO = 20;

// strings - Many of these strings are displayed visually but only when the sim is running in the english locale.
// Voicing is only available in English so these contents are hidden because translators will not be able to test
// them in a translated context. These strings are nested under the a11y key so that they are not available for
// translation.
const titleStringProperty = JoistStrings.a11y.voicingToolbar.voicing.titleStringProperty;
const quickInfoStringProperty = JoistStrings.a11y.voicingToolbar.voicing.quickInfoStringProperty;
const simVoicingOnStringProperty = JoistStrings.a11y.voicingToolbar.voicing.simVoicingOnAlertStringProperty;
const simVoicingOffStringProperty = JoistStrings.a11y.voicingToolbar.voicing.simVoicingOffAlertStringProperty;
const toolbarStringProperty = JoistStrings.a11y.voicingToolbar.titleStringProperty;
const playOverviewStringProperty = JoistStrings.a11y.voicingToolbar.voicing.playOverviewLabelStringProperty;
const playDetailsStringProperty = JoistStrings.a11y.voicingToolbar.voicing.playDetailsLabelStringProperty;
const playHintStringProperty = JoistStrings.a11y.voicingToolbar.voicing.playHintLabelStringProperty;
const overviewStringProperty = JoistStrings.a11y.voicingToolbar.voicing.overviewLabelStringProperty;
const detailsStringProperty = JoistStrings.a11y.voicingToolbar.voicing.detailsLabelStringProperty;
const hintStringProperty = JoistStrings.a11y.voicingToolbar.voicing.hintLabelStringProperty;

type SelfOptions = EmptySelfOptions;
export type VoicingToolbarItemOptions = SelfOptions & StrictOmit<NodeOptions, 'isDisposable'> & PickRequired<NodeOptions, 'tandem'>;

class VoicingToolbarItem extends Node {

  public constructor( alertManager: VoicingToolbarAlertManager, lookAndFeel: LookAndFeel, providedOptions?: VoicingToolbarItemOptions ) {
    const options = optionize<VoicingToolbarItemOptions, SelfOptions, NodeOptions>()( {

      // This is intended to exist forever. It is not disposable.
      isDisposable: false,

      // pdom
      tagName: 'section',
      accessibleHeading: toolbarStringProperty,
      accessibleHeadingIncrement: 2, // Should be an 'h2', even though it is not a child of the ScreenView h1.

      // phet-io
      visiblePropertyOptions: {
        phetioReadOnly: true
      }
    }, providedOptions );

    super( options );

    const titleTextOptions = {
      font: new PhetFont( 14 ),
      fill: lookAndFeel.navigationBarTextFillProperty,
      maxWidth: 90 // i18n, by inspection
    };

    const titleText = new Text( titleStringProperty, titleTextOptions );
    const quickInfoText = new VoicingText( quickInfoStringProperty, titleTextOptions );
    quickInfoText.focusHighlight = new ReadingBlockHighlight( quickInfoText, {

      // the inner stroke is white since the toolbar is on a black background
      innerStroke: 'white'
    } );

    const muteSpeechSwitch = new ToggleSwitch( voicingManager.mainWindowVoicingEnabledProperty, false, true, combineOptions<ToggleSwitchOptions>( {
      accessibleName: titleStringProperty,
      rightValueContextResponse: simVoicingOnStringProperty,
      leftValueContextResponse: simVoicingOffStringProperty,
      tandem: options.tandem?.createTandem( 'muteSpeechSwitch' )
    }, PreferencesDialogConstants.TOGGLE_SWITCH_OPTIONS ) );
    const muteSpeechControl = new PreferencesControl( {
      labelNode: titleText,
      controlNode: muteSpeechSwitch,
      tandem: options.tandem?.createTandem( 'muteSpeechControl' )
    } );

    // layout
    const labelAlignGroup = new AlignGroup();
    const inputAlignGroup = new AlignGroup();

    const overviewRow = new LabelButtonRow( overviewStringProperty, playOverviewStringProperty, labelAlignGroup, inputAlignGroup,
      lookAndFeel, alertManager.createOverviewContent.bind( alertManager ) );
    const detailsRow = new LabelButtonRow( detailsStringProperty, playDetailsStringProperty, labelAlignGroup, inputAlignGroup,
      lookAndFeel, alertManager.createDetailsContent.bind( alertManager ) );
    const hintRow = new LabelButtonRow( hintStringProperty, playHintStringProperty, labelAlignGroup, inputAlignGroup,
      lookAndFeel, alertManager.createHintContent.bind( alertManager ) );

    this.children = [ muteSpeechControl, quickInfoText, overviewRow.content, detailsRow.content, hintRow.content ];

    // layout
    quickInfoText.leftTop = muteSpeechControl.leftBottom.plusXY( 0, CONTENT_VERTICAL_SPACING );
    overviewRow.content.leftTop = quickInfoText.leftBottom.plusXY( QUICK_INFO, CONTENT_VERTICAL_SPACING );
    detailsRow.content.leftTop = overviewRow.content.leftBottom.plusXY( 0, CONTENT_VERTICAL_SPACING );
    hintRow.content.leftTop = detailsRow.content.leftBottom.plusXY( 0, CONTENT_VERTICAL_SPACING );

    const rows = [ overviewRow, detailsRow, hintRow ];
    const playingProperties = [ overviewRow.playingProperty, detailsRow.playingProperty, hintRow.playingProperty ];

    rows.forEach( row => {
      row.playingProperty.link( playing => {
        row.playContent( playingProperties );
      } );
    } );
  }
}

/**
 * An inner class that manages a labelled PlayStopButton in the VoicingToolbarItem. Creates the label, button,
 * and adds listeners that generate the alert to be Voiced and toggle the button's playing state when
 * the voicingManager stops speaking.
 */
class LabelButtonRow {

  private readonly lookAndFeel: LookAndFeel;

  // A unique Utterance for the object response so that it can be independently cancelled and have a dynamic Priority
  // depending on interaction with the screen.
  private readonly objectResponseUtterance: Utterance;
  private readonly createAlert: () => SpeakableResolvedResponse;
  private readonly playStopButton: PlayStopButton;

  // Whether the PlayStopButton has been pressed and the voicingManager is actively speaking this content
  public readonly playingProperty: BooleanProperty;

  // The Node of content to be displayed in the view, managing layout of the label and button
  public readonly content: Node;

  /**
   * @param labelStringProperty - the visually rendered Text label for the button
   * @param a11yNameStringProperty - the string read in the PDOM and with the Voicing feature that labels this Button
   * @param labelAlignGroup - To align all labels in the VoicingToolbarItem
   * @param inputAlignGroup - To align all inputs in the VoicingToolbarItem
   * @param lookAndFeel
   * @param createAlert - function that creates the alert when the button is pressed
   */
  public constructor(
    labelStringProperty: TReadOnlyProperty<string>,
    a11yNameStringProperty: TReadOnlyProperty<string>,
    labelAlignGroup: AlignGroup,
    inputAlignGroup: AlignGroup,
    lookAndFeel: LookAndFeel,
    createAlert: () => SpeakableResolvedResponse
  ) {

    this.lookAndFeel = lookAndFeel;
    this.objectResponseUtterance = new Utterance();
    this.createAlert = createAlert;

    this.playingProperty = new BooleanProperty( false, {

      // Speech is requested from a listener on the isPlayingProperty. But if the browser cannot speak it may
      // immediately cancel speech and set this Property to false again causing reentrancy.
      reentrant: true
    } );

    this.playStopButton = new PlayStopButton( this.playingProperty, {
      startPlayingAccessibleName: a11yNameStringProperty,

      // voicing - this content should be spoken always regardless of Preferences.
      voicingIgnoreVoicingManagerProperties: true,

      // For these buttons, we don't want to hear the name response when the button is activated
      // because it is going to change to a different state when the speaking is finished.
      speakVoicingNameResponseOnFire: false,

      radius: 12,

      // phet-io
      tandem: Tandem.OPT_OUT
    } );

    // This is a custom implementation of the name response because of unique behavior. The voicingNameResponse should not be spoken
    // on activation, but it should still be spoken when it receives focus.
    this.playStopButton.focusedProperty.lazyLink( focused => {
      if ( focused ) {
        this.playStopButton.voicingSpeakNameResponse( { nameResponse: a11yNameStringProperty } );
      }
    } );

    const textLabel = new Text( labelStringProperty, {
      font: new PhetFont( 12 ),
      fill: this.lookAndFeel.navigationBarTextFillProperty,
      maxWidth: 100 // i18n, by inspection
    } );

    const labelBox = labelAlignGroup.createBox( textLabel, { xAlign: 'left' } );
    const inputBox = inputAlignGroup.createBox( this.playStopButton, { xAlign: 'right' } );

    this.content = new HBox( { children: [ labelBox, inputBox ], spacing: CONTENT_VERTICAL_SPACING } );

    voicingManager.endSpeakingEmitter.addListener( ( text, endedUtterance ) => {
      if ( endedUtterance === this.objectResponseUtterance ) {
        this.playingProperty.set( false );

        // Remove if listener wasn't interrupted by Display input.
        if ( Display.hasInputListener( displayListener ) ) {
          Display.removeInputListener( displayListener );
        }
      }
    } );

    // Reduces the priority of this.utterance as soon as there is an interaction with the screen so that it may
    // be interrupted by simulation responses. See https://github.com/phetsims/joist/issues/752.
    const reducePriorityListener = ( event: SceneryEvent ) => {

      // After a down event it will be possible for this.utterance to be interrupted. That will turn the "Stop" button
      // into a "Play" button. If the mouse is still down in this case the next up event on the "Play" button will
      // immediately play its content which is unexpected. We get around this by not reducing priority if the event
      // is going to this button.
      if ( !event.trail.nodes.includes( this.playStopButton ) ) {
        Display.removeInputListener( displayListener );

        // Wait until the listener is removed before reducing this, this may immediately end the Utterance and remove
        // the listener again in the endSpeakingListener above.
        this.objectResponseUtterance.priorityProperty.value = Utterance.LOW_PRIORITY;
      }
    };

    const displayListener = {

      // The events that indicate some kind of input so we should allow this.utterance to be interrupted.
      down: reducePriorityListener,
      focus: reducePriorityListener
    };

    voicingManager.startSpeakingEmitter.addListener( ( response, utterance ) => {
      if ( utterance === this.objectResponseUtterance ) {
        Display.addInputListener( displayListener );
      }
    } );
  }

  /**
   * Play the Voicing content for this Row.
   */
  public playContent( playingProperties: BooleanProperty[] ): void {

    if ( this.playingProperty.value ) {

      // when one button is pressed, immediately stop any other buttons, only one should be playing at a time
      const otherProperties = _.without( playingProperties, this.playingProperty );
      otherProperties.forEach( property => {
        property.value = false;
      } );

      // This utterance is top priority so that it does not get interrupted during responses that happen as
      // the simulation changes. It stays top priority until there is some interaction with the display.
      this.objectResponseUtterance.priorityProperty.value = Utterance.TOP_PRIORITY;
      this.playStopButton.voicingSpeakResponse( {
        objectResponse: this.createAlert(),

        // A sepparate Utterance from the default voicingUtterance so that if default responses are cancelled we
        // don't also cancel this content in the listeners related to priorityProperty above.
        utterance: this.objectResponseUtterance
      } );
    }
    else {
      voicingUtteranceQueue.cancelUtterance( this.objectResponseUtterance );
    }
  }
}

joist.register( 'VoicingToolbarItem', VoicingToolbarItem );
export default VoicingToolbarItem;