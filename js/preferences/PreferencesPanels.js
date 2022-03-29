// Copyright 2021-2022, University of Colorado Boulder

/**
 * The panels that contain preferences controls. There is one panel for every tab, and it is shown when the
 * corresponding tab is selected.
 *
 * Once the dialog is created it is never destroyed so listeners do not need to be disposed.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import merge from '../../../phet-core/js/merge.js';
import { AlignGroup, Node } from '../../../scenery/js/imports.js';
import Tandem from '../../../tandem/js/Tandem.js';
import joist from '../joist.js';
import AudioPreferencesPanel from './AudioPreferencesPanel.js';
import GeneralPreferencesPanel from './GeneralPreferencesPanel.js';
import InputPreferencesPanel from './InputPreferencesPanel.js';
import PreferencesDialog from './PreferencesDialog.js';
import VisualPreferencesPanel from './VisualPreferencesPanel.js';

class PreferencesPanels extends Node {

  /**
   * @param {PreferencesManager} preferencesModel
   * @param {PreferencesTab[]} supportedTabs - list of Tabs supported by this Dialog
   * @param {EnumerationDeprecatedProperty.<PreferencesTab>} selectedTabProperty
   * @param {Object} [options]
   */
  constructor( preferencesModel, supportedTabs, selectedTabProperty, options ) {

    options = merge( {
      tandem: Tandem.REQUIRED
    }, options );
    super( options );

    const panelAlignGroup = new AlignGroup( {
      matchVertical: false
    } );

    // @private {PreferencesPanelContainer[]}
    this.content = [];

    let generalPreferencesPanel = null;
    if ( supportedTabs.includes( PreferencesDialog.PreferencesTab.GENERAL ) ) {
      generalPreferencesPanel = new GeneralPreferencesPanel( preferencesModel.generalModel, {
        tandem: options.tandem.createTandem( 'generalPreferencesPanel' )
      } );
      const generalBox = panelAlignGroup.createBox( generalPreferencesPanel );
      this.addChild( generalBox );
      this.content.push( new PreferencesPanelContainer( generalPreferencesPanel, PreferencesDialog.PreferencesTab.GENERAL ) );
    }

    let visualPreferencesPanel = null;
    if ( supportedTabs.includes( PreferencesDialog.PreferencesTab.VISUAL ) ) {
      visualPreferencesPanel = new VisualPreferencesPanel( preferencesModel.visualModel, {
        tandem: options.tandem.createTandem( 'visualPreferencesPanel' )
      } );
      const visualBox = panelAlignGroup.createBox( visualPreferencesPanel );
      this.addChild( visualBox );
      this.content.push( new PreferencesPanelContainer( visualPreferencesPanel, PreferencesDialog.PreferencesTab.VISUAL ) );
    }

    let audioPreferencesPanel = null;
    if ( supportedTabs.includes( PreferencesDialog.PreferencesTab.AUDIO ) ) {
      audioPreferencesPanel = new AudioPreferencesPanel( preferencesModel.audioModel, preferencesModel.toolbarEnabledProperty, {
        tandem: options.tandem.createTandem( 'audioPreferencesPanel' )
      } );
      const audioBox = panelAlignGroup.createBox( audioPreferencesPanel );
      this.addChild( audioBox );
      this.content.push( new PreferencesPanelContainer( audioPreferencesPanel, PreferencesDialog.PreferencesTab.AUDIO ) );
    }

    let inputPreferencesPanel = null;
    if ( supportedTabs.includes( PreferencesDialog.PreferencesTab.INPUT ) ) {
      inputPreferencesPanel = new InputPreferencesPanel( preferencesModel.inputModel, {
        tandem: options.tandem.createTandem( 'inputPreferencesPanel' )
      } );
      this.addChild( inputPreferencesPanel );
      this.content.push( new PreferencesPanelContainer( inputPreferencesPanel, PreferencesDialog.PreferencesTab.INPUT ) );
    }

    this.selectedTabProperty = selectedTabProperty;

    // display the selected panel
    selectedTabProperty.link( tab => {
      generalPreferencesPanel && ( generalPreferencesPanel.visible = tab === PreferencesDialog.PreferencesTab.GENERAL );
      visualPreferencesPanel && ( visualPreferencesPanel.visible = tab === PreferencesDialog.PreferencesTab.VISUAL );
      audioPreferencesPanel && ( audioPreferencesPanel.visible = tab === PreferencesDialog.PreferencesTab.AUDIO );
      inputPreferencesPanel && ( inputPreferencesPanel.visible = tab === PreferencesDialog.PreferencesTab.INPUT );
    } );

    // @private
    this.disposePreferencesPanel = () => {
      generalPreferencesPanel && generalPreferencesPanel.dispose();
      visualPreferencesPanel && visualPreferencesPanel.dispose();
      audioPreferencesPanel && audioPreferencesPanel.dispose();
      inputPreferencesPanel && inputPreferencesPanel.dispose();
    };
  }

  /**
   * @public
   */
  dispose() {
    this.disposePreferencesPanel();
    super.dispose();
  }

  /**
   * @private
   * @returns {PreferencesPanelContainer} - the currently selected preferences panel
   */
  getSelectedContent() {
    for ( let i = 0; i < this.content.length; i++ ) {
      const currentContent = this.content[ i ];
      if ( currentContent.selectedTabValue === this.selectedTabProperty.value ) {
        return currentContent;
      }
    }
    assert && assert( false, 'should never not have a selected panel content.' );
    return null;
  }

  /**
   * Focus the selected panel. The panel should not be focusable until this is requested, so it is set to be
   * focusable before the focus() call. When focus is removed from the panel, it should become non-focusable
   * again. That is handled in PreferencesPanelContainer class.
   * @public
   */
  focusSelectedPanel() {
    const selectedContent = this.getSelectedContent();
    selectedContent.panelContent.focusable = true;
    selectedContent.panelContent.focus();
  }

  /**
   * @param {Node} node - the potential content for the selected panel that is focusable
   * @returns {boolean} if the provided node is the currently selected panel
   * @public
   */
  isFocusableSelectedContent( node ) {
    const selectedContent = this.getSelectedContent();
    return node === selectedContent.panelContent; // the panelContent is what is focused in focusSelectedPanel()
  }
}

/**
 * An inner class that manages the panelContent and its value. A listener as added to the panel so that
 * whenever focus is lost from the panel, it is removed from the traversal order.
 */
class PreferencesPanelContainer extends Node {

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