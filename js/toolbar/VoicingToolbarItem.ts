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
import { AlignGroup, HBox, Node, NodeOptions, ReadingBlockHighlight, Text, voicingManager, VoicingText } from '../../../scenery/js/imports.js';
import Tandem from '../../../tandem/js/Tandem.js';
import Utterance from '../../../utterance-queue/js/Utterance.js';
import joist from '../joist.js';
import joistStrings from '../joistStrings.js';
import joistVoicingUtteranceQueue from '../joistVoicingUtteranceQueue.js';
import PreferencesToggleSwitch from '../preferences/PreferencesToggleSwitch.js';
import VoicingToolbarAlertManager from './VoicingToolbarAlertManager.js';
import LookAndFeel from '../LookAndFeel.js';
import optionize from '../../../phet-core/js/optionize.js';

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

class VoicingToolbarItem extends Node {

  // implements disposal for garbage collection
  private readonly disposeVoicingToolbarItem: () => void;

  constructor( alertManager: VoicingToolbarAlertManager, lookAndFeel: LookAndFeel, providedOptions?: NodeOptions ) {
    const options = optionize<NodeOptions, {}, NodeOptions>( {

      // pdom
      tagName: 'section',
      labelTagName: 'h2',
      labelContent: toolbarString,

      // phet-io
      tandem: Tandem.REQUIRED
    }, providedOptions );

    const tandem = options.tandem!;
    assert && assert( tandem, 'Tandem was required!' );

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
      toggleSwitchOptions: {
        voicingUtteranceQueue: joistVoicingUtteranceQueue
      },
      tandem: tandem.createTandem( 'muteSpeechSwitch' )
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

    const voicingEnabledListener = ( enabled: boolean ) => {
      const alert = enabled ? simVoicingOnString : simVoicingOffString;
      this.alertDescriptionUtterance( alert );
      joistVoicingUtteranceQueue.addToBack( alert );
    };
    voicingManager.mainWindowVoicingEnabledProperty.lazyLink( voicingEnabledListener );

    // @private
    this.disposeVoicingToolbarItem = () => {
      voicingManager.mainWindowVoicingEnabledProperty.unlink( voicingEnabledListener );
    };
  }

  /**
   * @public
   */
  public override dispose(): void {
    this.disposeVoicingToolbarItem();
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
  private readonly utterance: Utterance;
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
  constructor( labelString: string, a11yLabel: string, labelAlignGroup: AlignGroup, inputAlignGroup: AlignGroup, lookAndFeel: LookAndFeel, createAlert: () => string ) {

    this.lookAndFeel = lookAndFeel;
    this.utterance = new Utterance();
    this.createAlert = createAlert;

    this.playingProperty = new BooleanProperty( false, {

      // Speech is requested from a listener on the isPlayingProperty. But if the browser cannot speak it may
      // immediately cancel speech and set this Property to false again causing reentrancy.
      reentrant: true
    } );

    this.playStopButton = new PlayStopButton( this.playingProperty, {
      startPlayingLabel: a11yLabel,
      voicingNameResponse: a11yLabel,

      // voicing responses should be spoken for these buttons regardless of "Sim Voicing"
      // selection, they shoudl always be heard as long as voicing is enabled
      voicingUtteranceQueue: joistVoicingUtteranceQueue,
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
      if ( endedUtterance === this.utterance ) {
        this.playingProperty.set( false );
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

      this.utterance.alert = this.createAlert();
      joistVoicingUtteranceQueue.addToBack( this.utterance );
    }
    else {
      joistVoicingUtteranceQueue.cancelUtterance( this.utterance );
    }
  }
}

joist.register( 'VoicingToolbarItem', VoicingToolbarItem );
export default VoicingToolbarItem;