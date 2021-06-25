// Copyright 2021, University of Colorado Boulder

/**
 * The panels that contain preferences controls. There is one panel for every tab, and it is shown when the
 * corresponding tab is selected.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import AlignGroup from '../../../scenery/js/nodes/AlignGroup.js';
import Node from '../../../scenery/js/nodes/Node.js';
import joist from '../joist.js';
import AudioPreferencesPanel from './AudioPreferencesPanel.js';
import GeneralPreferencesPanel from './GeneralPreferencesPanel.js';
import InputPreferencesPanel from './InputPreferencesPanel.js';
import PreferencesDialog from './PreferencesDialog.js';
import VisualPreferencesPanel from './VisualPreferencesPanel.js';

class PreferencesPanels extends Node {

  /**
   * @param {PreferencesConfiguration} preferencesConfiguration
   * @param {PreferencesTab[]} supportedTabs - list of Tabs supported by this Dialog
   * @param {EnumerationProperty.<PreferencesTab>} selectedTabProperty
   * @param {BooleanProperty} simAudioProperty - Property controlling all sim audio
   * @param {PreferencesProperties} preferencesProperties
   */
  constructor( preferencesConfiguration, supportedTabs, selectedTabProperty, simAudioProperty, preferencesProperties ) {
    super();

    const panelAlignGroup = new AlignGroup( {
      matchVertical: false
    } );

    let generalPreferencesPanel = null;
    if ( supportedTabs.includes( PreferencesDialog.PreferencesTab.GENERAL ) ) {
      generalPreferencesPanel = new GeneralPreferencesPanel( preferencesConfiguration.generalOptions );
      const generalBox = panelAlignGroup.createBox( generalPreferencesPanel );
      this.addChild( generalBox );
    }

    let visualPreferencesPanel = null;
    if ( supportedTabs.includes( PreferencesDialog.PreferencesTab.VISUAL ) ) {
      visualPreferencesPanel = new VisualPreferencesPanel( preferencesProperties.interactiveHighlightsEnabledProperty );
      const visualBox = panelAlignGroup.createBox( visualPreferencesPanel );
      this.addChild( visualBox );
    }

    let audioPreferencesPanel = null;
    if ( supportedTabs.includes( PreferencesDialog.PreferencesTab.AUDIO ) ) {
      audioPreferencesPanel = new AudioPreferencesPanel( preferencesConfiguration.audioOptions, simAudioProperty, preferencesProperties.toolbarEnabledProperty );
      const audioBox = panelAlignGroup.createBox( audioPreferencesPanel );
      this.addChild( audioBox );
    }

    let inputPreferencesPanel = null;
    if ( supportedTabs.includes( PreferencesDialog.PreferencesTab.INPUT ) ) {
      inputPreferencesPanel = new InputPreferencesPanel( preferencesProperties.gestureControlsEnabledProperty );
      this.addChild( inputPreferencesPanel );
    }

    // display the selected panel
    selectedTabProperty.link( tab => {
      generalPreferencesPanel && ( generalPreferencesPanel.visible = tab === PreferencesDialog.PreferencesTab.GENERAL );
      visualPreferencesPanel && ( visualPreferencesPanel.visible = tab === PreferencesDialog.PreferencesTab.VISUAL );
      audioPreferencesPanel && ( audioPreferencesPanel.visible = tab === PreferencesDialog.PreferencesTab.AUDIO );
      inputPreferencesPanel && ( inputPreferencesPanel.visible = tab === PreferencesDialog.PreferencesTab.INPUT );
    } );
  }
}

joist.register( 'PreferencesPanels', PreferencesPanels );
export default PreferencesPanels;