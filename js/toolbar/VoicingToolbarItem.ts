// Copyright 2021-2022, University of Colorado Boulder

/**
 * An item for the Toolbar that includes components related to the voicing feature. Includes a switch to
 * enable/disable all speech, and buttons to hear overview information about the active sim Screen.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../axon/js/BooleanProperty.js';
import PlayStopButton from '../../../scenery-phet/js/buttons/PlayStopButton.js';
import PhetFont from '../../../scenery-phet/js/PhetFont.js';
import { AlignGroup, Display, HBox, Node, NodeOptions, ReadingBlockHighlight, SceneryEvent, Text, voicingManager, VoicingText, voicingUtteranceQueue } from '../../../scenery/js/imports.js';
import Tandem from '../../../tandem/js/Tandem.js';
import Utterance from '../../../utterance-queue/js/Utterance.js';
import joist from '../joist.js';
import joistStrings from '../joistStrings.js';
import PreferencesToggleSwitch from '../preferences/PreferencesToggleSwitch.js';
import VoicingToolbarAlertManager from './VoicingToolbarAlertManager.js';
import LookAndFeel from '../LookAndFeel.js';
import optionize, { EmptySelfOptions } from '../../../phet-core/js/optionize.js';
import PickRequired from '../../../phet-core/js/types/PickRequired.js';

// constants
const CONTENT_VERTICAL_SPACING = 10;
const QUICK_INFO = 20;

// strings
const titleString = joistStrings.a11y.toolbar.voicing.title;
const quickInfoString = joistStrings.a11y.toolbar.voicing.quickInfo;
const simVoicingOnString = joistStrings.a11y.toolbar.voicing.simVoicingOnAlert;
const simVoicingOffString = joistStrings.a11y.toolbar.voicing.simVoicingOffAlert;
const toolbarString = joistStrings.a11y.toolbar.title;
const playOverviewString = joistStrings.a11y.toolbar.voicing.playOverviewLabel;
const playDetailsString = joistStrings.a11y.toolbar.voicing.playDetailsLabel;
const playHintString = joistStrings.a11y.toolbar.voicing.playHintLabel;
const overviewString = joistStrings.a11y.toolbar.voicing.overviewLabel;
const detailsString = joistStrings.a11y.toolbar.voicing.detailsLabel;
const hintString = joistStrings.a11y.toolbar.voicing.hintLabel;

type SelfOptions = EmptySelfOptions;
export type VoicingToolbarItemOptions = SelfOptions & NodeOptions & PickRequired<NodeOptions, 'tandem'>;

class VoicingToolbarItem extends Node {

  public constructor( alertManager: VoicingToolbarAlertManager, lookAndFeel: LookAndFeel, providedOptions?: VoicingToolbarItemOptions ) {
    const options = optionize<VoicingToolbarItemOptions, SelfOptions, NodeOptions>()( {

      // pdom
      tagName: 'section',
      labelTagName: 'h2',
      labelContent: toolbarString,

      // phet-io
      tandem: Tandem.REQUIRED,
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

    const titleText = new Text( titleString, titleTextOptions );
    const quickInfoText = new VoicingText( quickInfoString, titleTextOptions );
    quickInfoText.focusHighlight = new ReadingBlockHighlight( quickInfoText, {

      // the inner stroke is white since the toolbar is on a black background
      innerStroke: 'white'
    } );

    const muteSpeechSwitch = new PreferencesToggleSwitch( voicingManager.mainWindowVoicingEnabledProperty, false, true, {
      labelNode: titleText,
      a11yLabel: titleString,
      rightValueContextResponse: simVoicingOnString,
      leftValueContextResponse: simVoicingOffString,
      tandem: options.tandem.createTandem( 'muteSpeechSwitch' )
    } );

    // layout
    const labelAlignGroup = new AlignGroup();
    const inputAlignGroup = new AlignGroup();

    const overviewRow = new LabelButtonRow( overviewString, playOverviewString, labelAlignGroup, inputAlignGroup, lookAndFeel, alertManager.createOverviewContent.bind( alertManager ) );
    const detailsRow = new LabelButtonRow( detailsString, playDetailsString, labelAlignGroup, inputAlignGroup, lookAndFeel, alertManager.createDetailsContent.bind( alertManager ) );
    const hintRow = new LabelButtonRow( hintString, playHintString, labelAlignGroup, inputAlignGroup, lookAndFeel, alertManager.createHintContent.bind( alertManager ) );

    this.children = [ muteSpeechSwitch, quickInfoText, overviewRow.content, detailsRow.content, hintRow.content ];

    // layout
    quickInfoText.leftTop = muteSpeechSwitch.leftBottom.plusXY( 0, CONTENT_VERTICAL_SPACING );
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

  /**
   */
  public override dispose(): void {
    super.dispose();
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
  private readonly createAlert: () => string;
  private readonly playStopButton: PlayStopButton;

  // Whether the PlayStopButton has been pressed and the voicingManager is actively speaking this content
  public readonly playingProperty: BooleanProperty;

  // The Node of content to be displayed in the view, managing layout of the label and button
  public readonly content: Node;

  /**
   * @param labelString - the visually rendered Text label for the button
   * @param a11yLabel - the string read in the PDOM and with the Voicing feature that labels this Button
   * @param labelAlignGroup - To align all labels in the VoicingToolbarItem
   * @param inputAlignGroup - To align all inputs in the VoicingToolbarItem
   * @param lookAndFeel
   * @param createAlert - function that creates the alert when the button is pressed
   */
  public constructor( labelString: string, a11yLabel: string, labelAlignGroup: AlignGroup, inputAlignGroup: AlignGroup, lookAndFeel: LookAndFeel, createAlert: () => string ) {

    this.lookAndFeel = lookAndFeel;
    this.objectResponseUtterance = new Utterance();
    this.createAlert = createAlert;

    this.playingProperty = new BooleanProperty( false, {

      // Speech is requested from a listener on the isPlayingProperty. But if the browser cannot speak it may
      // immediately cancel speech and set this Property to false again causing reentrancy.
      reentrant: true
    } );

    this.playStopButton = new PlayStopButton( this.playingProperty, {
      startPlayingLabel: a11yLabel,

      // voicing
      voicingNameResponse: a11yLabel,
      voicingIgnoreVoicingManagerProperties: true,

      radius: 12,

      // phet-io
      tandem: Tandem.OPT_OUT
    } );

    const textLabel = new Text( labelString, {
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
        if ( Display.inputListeners.includes( displayListener ) ) {
          Display.removeInputListener( displayListener );

          // Stale alerts may be in the queue waiting for the toolbar button content to finish. Only clear if we did not
          // receive an interruption event because we need to hear responses related to the users interaction
          // which is likely still in the queue. Note that means that the queue is not cleared if the user taps the
          // screen without interacting with something but I (@jessegreenberg) think that is acceptable.
          voicingUtteranceQueue.clear();
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