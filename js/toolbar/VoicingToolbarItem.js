// Copyright 2021, University of Colorado Boulder

/**
 * An item for the Toolbar that includes components related to the voicing feature. Includes a switch to
 * enable/disable all speech, and buttons to hear overview information about the active sim Screen.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../axon/js/BooleanProperty.js';
import merge from '../../../phet-core/js/merge.js';
import PlayStopButton from '../../../scenery-phet/js/buttons/PlayStopButton.js';
import PhetFont from '../../../scenery-phet/js/PhetFont.js';
import VoicingText from '../../../scenery/js/accessibility/voicing/nodes/VoicingText.js';
import ReadingBlockHighlight from '../../../scenery/js/accessibility/voicing/ReadingBlockHighlight.js';
import voicingManager from '../../../scenery/js/accessibility/voicing/voicingManager.js';
import webSpeaker from '../../../scenery/js/accessibility/voicing/webSpeaker.js';
import AlignGroup from '../../../scenery/js/nodes/AlignGroup.js';
import HBox from '../../../scenery/js/nodes/HBox.js';
import Node from '../../../scenery/js/nodes/Node.js';
import Text from '../../../scenery/js/nodes/Text.js';
import Tandem from '../../../tandem/js/Tandem.js';
import Utterance from '../../../utterance-queue/js/Utterance.js';
import joist from '../joist.js';
import joistStrings from '../joistStrings.js';
import joistVoicingUtteranceQueue from '../joistVoicingUtteranceQueue.js';
import PreferencesToggleSwitch from '../preferences/PreferencesToggleSwitch.js';

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

  /**
   * @param {VoicingToolbarAlertManager} alertManager - generates the alert content when buttons are pressed
   * @param {LookAndFeel} lookAndFeel
   */
  constructor( alertManager, lookAndFeel ) {

    super( {

      // pdom
      tagName: 'section',
      labelTagName: 'h2',
      labelContent: toolbarString
    } );

    const titleTextOptions = {
      font: new PhetFont( 14 ),
      fill: lookAndFeel.navigationBarTextFillProperty
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
        voicingUtteranceQueue: phet.joist.sim.joistVoicingUtteranceQueue
      }
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

    const voicingEnabledListener = enabled => {
      const alert = enabled ? simVoicingOnString : simVoicingOffString;
      phet.joist.sim.utteranceQueue.addToBack( alert );
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
  dispose() {
    this.disposeVoicingToolbarItem();
    super.dispose();
  }
}

/**
 * An inner class that manages a labelled PlayStopButton in the VoicingToolbarItem. Creates the label, button,
 * and adds listeners that generate the alert to be Voiced and toggle the button's playing state when
 * the webSpeaker stops speaking.
 */
class LabelButtonRow {

  /**
   * @param {string} labelString - the visually rendered Text label for the button
   * @param {string} a11yLabel - the string read in the PDOM and with the Voicing feature that labels this Button
   * @param {AlignGroup} labelAlignGroup - To align all labels in the VoicingToolbarItem
   * @param {AlignGroup} inputAlignGroup - To align all inputs in the VoicingToolbarItem
   * @param {LookAndFeel} lookAndFeel
   * @param {function} createAlert - function that creates the alert when the button is pressed
   */
  constructor( labelString, a11yLabel, labelAlignGroup, inputAlignGroup, lookAndFeel, createAlert ) {

    // @private
    this.lookAndFeel = lookAndFeel;

    // @private
    this.utterance = new Utterance();

    this.createAlert = createAlert;

    // @public {BooleanProperty - Whether the PlayStopButton has been pressed and the webSpeaker is actively speaking
    // this content
    this.playingProperty = new BooleanProperty( false );

    // @private {PlayStopButton}
    this.playStopButton = new PlayStopButton( this.playingProperty, merge( {
      startPlayingLabel: a11yLabel,
      voicingNameResponse: a11yLabel,
      tandem: Tandem.OPT_OUT
    }, {
      radius: 12
    } ) );

    const textLabel = new Text( labelString, {
      font: new PhetFont( 12 ),
      fill: this.lookAndFeel.navigationBarTextFillProperty
    } );

    const labelBox = labelAlignGroup.createBox( textLabel, { xAlign: 'left' } );
    const inputBox = inputAlignGroup.createBox( this.playStopButton, { align: 'right' } );

    this.content = new HBox( { children: [ labelBox, inputBox ], spacing: CONTENT_VERTICAL_SPACING } );

    webSpeaker.endSpeakingEmitter.addListener( endedUtterance => {
      if ( endedUtterance === this.utterance ) {
        this.playingProperty.set( false );
      }
    } );
  }

  /**
   * Play the Voicing content for this Row.
   * @public
   *
   * @param {BooleanProperty[]} playingProperties
   * @param {string} alertContent
   */
  playContent( playingProperties ) {

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
      webSpeaker.cancel();
    }
  }
}

joist.register( 'VoicingToolbarItem', VoicingToolbarItem );
export default VoicingToolbarItem;