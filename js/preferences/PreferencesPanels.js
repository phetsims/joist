// Copyright 2021, University of Colorado Boulder

/**
 * The panels that contain preferences controls. There is one panel for every tab, and it is shown when the
 * corresponding tab is selected.
 *
 * Once the dialog is created it is never destroyed so listeners do not need to be disposed.
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

    // @private {PreferencesPanel[]}
    this.content = [];

    let generalPreferencesPanel = null;
    if ( supportedTabs.includes( PreferencesDialog.PreferencesTab.GENERAL ) ) {
      generalPreferencesPanel = new GeneralPreferencesPanel( preferencesConfiguration.generalOptions );
      const generalBox = panelAlignGroup.createBox( generalPreferencesPanel );
      this.addChild( generalBox );
      this.content.push( new PreferencesPanel( generalPreferencesPanel, PreferencesDialog.PreferencesTab.GENERAL ) );
    }

    let visualPreferencesPanel = null;
    if ( supportedTabs.includes( PreferencesDialog.PreferencesTab.VISUAL ) ) {
      visualPreferencesPanel = new VisualPreferencesPanel( preferencesProperties.interactiveHighlightsEnabledProperty );
      const visualBox = panelAlignGroup.createBox( visualPreferencesPanel );
      this.addChild( visualBox );
      this.content.push( new PreferencesPanel( visualPreferencesPanel, PreferencesDialog.PreferencesTab.VISUAL ) );
    }

    let audioPreferencesPanel = null;
    if ( supportedTabs.includes( PreferencesDialog.PreferencesTab.AUDIO ) ) {
      audioPreferencesPanel = new AudioPreferencesPanel( preferencesConfiguration.audioOptions, simAudioProperty, preferencesProperties.toolbarEnabledProperty );
      const audioBox = panelAlignGroup.createBox( audioPreferencesPanel );
      this.addChild( audioBox );
      this.content.push( new PreferencesPanel( audioPreferencesPanel, PreferencesDialog.PreferencesTab.AUDIO ) );
    }

    let inputPreferencesPanel = null;
    if ( supportedTabs.includes( PreferencesDialog.PreferencesTab.INPUT ) ) {
      inputPreferencesPanel = new InputPreferencesPanel( preferencesProperties.gestureControlsEnabledProperty );
      this.addChild( inputPreferencesPanel );
      this.content.push( new PreferencesPanel( inputPreferencesPanel, PreferencesDialog.PreferencesTab.INPUT ) );
    }

    this.selectedTabProperty = selectedTabProperty;

    // display the selected panel
    selectedTabProperty.link( tab => {
      generalPreferencesPanel && ( generalPreferencesPanel.visible = tab === PreferencesDialog.PreferencesTab.GENERAL );
      visualPreferencesPanel && ( visualPreferencesPanel.visible = tab === PreferencesDialog.PreferencesTab.VISUAL );
      audioPreferencesPanel && ( audioPreferencesPanel.visible = tab === PreferencesDialog.PreferencesTab.AUDIO );
      inputPreferencesPanel && ( inputPreferencesPanel.visible = tab === PreferencesDialog.PreferencesTab.INPUT );
    } );
  }

  /**
   * Focus the selected panel. The panel should not be focusable until this is requested, so it is set to be
   * focusable before the focus() call. When focus is removed from the panel, it should become non-focusable
   * again. That is handled in PreferencesPanel class.
   * @public
   */
  focusSelectedPanel() {
    this.content.forEach( content => {
      if ( content.selectedTabValue === this.selectedTabProperty.value ) {
        content.panelContent.focusable = true;
        content.panelContent.focus();
      }
    } );
  }
}

/**
 * An inner class that manages the panelContent and its value. A listener as added to the panel so that
 * whenever focus is lost from the panel, it is removed from the traversal order.
 */
class PreferencesPanel extends Node {

  /**
   * @param {Node} panelContent
   * @param {PreferencesTab} selectedTabValue - Enumeration value for the selected tab
   */
  constructor( panelContent, selectedTabValue ) {
    super();

    // @public
    this.panelContent = panelContent;
    this.selectedTabValue = selectedTabValue;

    panelContent.addInputListener( {
      focusout: event => {
        panelContent.focusable = false;
      }
    } );
  }
}

joist.register( 'PreferencesPanels', PreferencesPanels );
export default PreferencesPanels;