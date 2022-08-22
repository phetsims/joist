// Copyright 2021-2022, University of Colorado Boulder

/**
 * A panel for the PreferencesDialog with controls for visual preferences. Includes freatures such as
 * "Interactive Highlights" and perhaps others in the future.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import merge from '../../../phet-core/js/merge.js';
import StringUtils from '../../../phetcommon/js/util/StringUtils.js';
import { Node, NodeOptions, Text, VBox, VoicingText } from '../../../scenery/js/imports.js';
import joist from '../joist.js';
import joistStrings from '../joistStrings.js';
import PreferencesDialog from './PreferencesDialog.js';
import PreferencesPanelSection from './PreferencesPanelSection.js';
import PreferencesToggleSwitch from './PreferencesToggleSwitch.js';
import { VisualModel } from './PreferencesModel.js';
import optionize, { EmptySelfOptions } from '../../../phet-core/js/optionize.js';
import ProjectorModeToggleSwitch from './ProjectorModeToggleSwitch.js';
import Tandem from '../../../tandem/js/Tandem.js';
import Emitter from '../../../axon/js/Emitter.js';

// constants
const interactiveHighlightsString = joistStrings.preferences.tabs.visual.interactiveHighlights;
const interactiveHighlightsDescriptionString = joistStrings.preferences.tabs.visual.interactiveHighlightsDescription;
const interactiveHighlightsEnabledAlertString = joistStrings.a11y.preferences.tabs.visual.interactiveHighlights.enabledAlert;
const interactiveHighlightsDisabledAlertString = joistStrings.a11y.preferences.tabs.visual.interactiveHighlights.disabledAlert;
const labelledDescriptionPatternString = joistStrings.a11y.preferences.tabs.labelledDescriptionPattern;

class VisualPreferencesPanel extends Node {
  private readonly disposeVisualPreferencesPanel: () => void;

  public constructor( visualModel: VisualModel, providedOptions?: NodeOptions ) {

    const options = optionize<NodeOptions, EmptySelfOptions, NodeOptions>()( {
      tandem: Tandem.OPTIONAL,

      // pdom
      tagName: 'div',
      labelTagName: 'h2',
      labelContent: 'Visual'
    }, providedOptions );

    const tandem = options.tandem;
    options.tandem = Tandem.OPTIONAL;
    super( options );

    const disposeEmitter = new Emitter();

    const contentNode = new VBox( {
      spacing: PreferencesPanelSection.DEFAULT_ITEM_SPACING,
      align: 'left'
    } );

    if ( visualModel.supportsProjectorMode ) {
      const projectorModeSwitch = new ProjectorModeToggleSwitch();
      contentNode.addChild( projectorModeSwitch );
    }

    if ( visualModel.supportsInteractiveHighlights ) {

      const label = new Text( interactiveHighlightsString, PreferencesDialog.PANEL_SECTION_LABEL_OPTIONS );
      const interactiveHighlightsEnabledSwitch = new PreferencesToggleSwitch( visualModel.interactiveHighlightsEnabledProperty, false, true, {
        labelNode: label,
        descriptionNode: new VoicingText( interactiveHighlightsDescriptionString, merge( {}, PreferencesDialog.PANEL_SECTION_CONTENT_OPTIONS, {
          readingBlockNameResponse: StringUtils.fillIn( labelledDescriptionPatternString, {
            label: interactiveHighlightsString,
            description: interactiveHighlightsDescriptionString
          } )
        } ) ),
        a11yLabel: interactiveHighlightsString,
        leftValueContextResponse: interactiveHighlightsDisabledAlertString,
        rightValueContextResponse: interactiveHighlightsEnabledAlertString
      } );

      contentNode.addChild( interactiveHighlightsEnabledSwitch );
    }

    visualModel.customPreferences.forEach( customPreference => {
      const customContent = customPreference.createContent( tandem );
      disposeEmitter.addListener( () => customContent.dispose() );
      contentNode.addChild( new Node( {
        children: [ customContent ]
      } ) );
    } );

    const panelSection = new PreferencesPanelSection( {
      contentNode: contentNode,

      // no title for this section so no indendation necessary
      contentLeftMargin: 0
    } );
    this.addChild( panelSection );

    this.disposeVisualPreferencesPanel = () => {
      panelSection.dispose();
      disposeEmitter.emit();

      // Dispose each PreferencesToggleSwitch
      contentNode.children.forEach( child => child.dispose() );
      contentNode.dispose();
    };
  }

  public override dispose(): void {
    this.disposeVisualPreferencesPanel();
    super.dispose();
  }
}

joist.register( 'VisualPreferencesPanel', VisualPreferencesPanel );
export default VisualPreferencesPanel;
