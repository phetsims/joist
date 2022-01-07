// Copyright 2021, University of Colorado Boulder

/**
 * Dialog with preferences to enable or disable various features for the simulation. Groups of preferences are
 * organized and displayed in a tab panel.
 *
 * Once the dialog is created it is never destroyed so listeners and components do not need to be disposed.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import EnumerationProperty from '../../../axon/js/EnumerationProperty.js';
import EnumerationDeprecated from '../../../phet-core/js/EnumerationDeprecated.js';
import merge from '../../../phet-core/js/merge.js';
import PhetFont from '../../../scenery-phet/js/PhetFont.js';
import { KeyboardUtils } from '../../../scenery/js/imports.js';
import { Node } from '../../../scenery/js/imports.js';
import { Text } from '../../../scenery/js/imports.js';
import Dialog from '../../../sun/js/Dialog.js';
import HSeparator from '../../../sun/js/HSeparator.js';
import audioManager from '../audioManager.js';
import joist from '../joist.js';
import joistStrings from '../joistStrings.js';
import PreferencesPanels from './PreferencesPanels.js';
import PreferencesTabs from './PreferencesTabs.js';

// constants
const preferencesTitleString = joistStrings.preferences.title;

const TITLE_FONT = new PhetFont( { size: 24, weight: 'bold' } );

const TAB_FONT = new PhetFont( 20 );
const TAB_MAX_WIDTH = 120;
const TAB_OPTIONS = {
  font: TAB_FONT,
  maxWidth: TAB_MAX_WIDTH
};

const CONTENT_FONT = new PhetFont( 16 );
const CONTENT_MAX_WIDTH = 500;
const PANEL_SECTION_CONTENT_OPTIONS = {
  font: CONTENT_FONT,
  maxWidth: CONTENT_MAX_WIDTH
};

const PANEL_SECTION_LABEL_FONT = new PhetFont( { weight: 'bold', size: 16 } );
const PANEL_SECTION_LABEL_MAX_WIDTH = 360;
const PANEL_SECTION_LABEL_OPTIONS = {
  font: PANEL_SECTION_LABEL_FONT,
  maxWidth: PANEL_SECTION_LABEL_MAX_WIDTH
};

// tabs available in this Dialog
const PreferencesTab = EnumerationDeprecated.byKeys( [ 'GENERAL', 'VISUAL', 'AUDIO', 'INPUT' ] );

class PreferencesDialog extends Dialog {

  /**
   * @param {PreferencesConfiguration} preferencesConfiguration
   * @param {PreferencesProperties} preferencesProperties
   * @param {BooleanProperty}simSoundProperty
   * @param {Object} [options]
   */
  constructor( preferencesConfiguration, preferencesProperties, simSoundProperty, options ) {

    const titleText = new Text( preferencesTitleString, {
      font: TITLE_FONT,

      // pdom
      tagName: 'h1',
      innerContent: preferencesTitleString
    } );

    options = merge( {
      titleAlign: 'center',
      title: titleText,

      // phet-io
      phetioDynamicElement: true,

      // pdom
      positionInPDOM: true
    }, options );

    // determine which tabs will be supported in this Dialog, true if any entry in a configuration has content
    const supportedTabs = [];
    supportedTabs.push( PreferencesTab.GENERAL ); // There is always a "General" tab
    _.some( preferencesConfiguration.visualOptions, entry => !!entry ) && supportedTabs.push( PreferencesTab.VISUAL );
    ( _.some( preferencesConfiguration.audioOptions, entry => !!entry ) && audioManager.supportsAudio ) && supportedTabs.push( PreferencesTab.AUDIO );
    _.some( preferencesConfiguration.inputOptions, entry => !!entry ) && supportedTabs.push( PreferencesTab.INPUT );
    assert && assert( supportedTabs.length > 0, 'Trying to create a PreferencesDialog with no tabs, check PreferencesConfiguration' );

    // the selected PreferencesTab, indicating which tab is visible in the Dialog
    const selectedTabProperty = new EnumerationProperty( PreferencesTab, PreferencesTab.GENERAL );

    // the set of tabs you can can click to activate a tab panel
    const preferencesTabs = new PreferencesTabs( preferencesConfiguration, supportedTabs, selectedTabProperty );

    // the panels of content with UI components to select preferences, only one is displayed at a time
    const preferencesPanels = new PreferencesPanels( preferencesConfiguration, supportedTabs, selectedTabProperty, simSoundProperty, preferencesProperties );

    // visual separator between tabs and panels - as long as the widest separated content, which may change with i18n
    const tabPanelSeparator = new HSeparator( Math.max( preferencesPanels.width, preferencesTabs.width ), { lineWidth: 1 } );

    const content = new Node( {
      children: [ preferencesTabs, tabPanelSeparator, preferencesPanels ]
    } );

    // layout
    tabPanelSeparator.centerTop = preferencesTabs.centerBottom;
    preferencesPanels.centerTop = tabPanelSeparator.centerBottom.plusXY( 0, 20 );

    super( content, options );

    // @private {PreferencesTabs}
    this.preferencesTabs = preferencesTabs;
    this.preferencesPanels = preferencesPanels;

    // pdom - When the "down" arrow is pressed on the group of tabs, move focus to the selected panel
    preferencesTabs.addInputListener( {
      keydown: event => {
        if ( KeyboardUtils.isKeyEvent( event.domEvent, KeyboardUtils.KEY_DOWN_ARROW ) ) {
          this.focusSelectedPanel();
        }
      }
    } );
  }

  /**
   * Move focus to the selected tab. Generally to be used when opening the dialog.
   * @public
   */
  focusSelectedTab() {
    this.preferencesTabs.focusSelectedTab();
  }

  /**
   * Move focus to the selected panel.
   * @private
   */
  focusSelectedPanel() {
    this.preferencesPanels.focusSelectedPanel();
  }
}

// @public
// @static
PreferencesDialog.PreferencesTab = PreferencesTab;

PreferencesDialog.TAB_FONT = TAB_FONT;
PreferencesDialog.TAB_OPTIONS = TAB_OPTIONS;

PreferencesDialog.CONTENT_FONT = CONTENT_FONT;
PreferencesDialog.CONTENT_MAX_WIDTH = CONTENT_MAX_WIDTH;
PreferencesDialog.PANEL_SECTION_CONTENT_OPTIONS = PANEL_SECTION_CONTENT_OPTIONS;

PreferencesDialog.PANEL_SECTION_LABEL_FONT = PANEL_SECTION_LABEL_FONT;
PreferencesDialog.PANEL_SECTION_LABEL_MAX_WIDTH = PANEL_SECTION_LABEL_MAX_WIDTH;
PreferencesDialog.PANEL_SECTION_LABEL_OPTIONS = PANEL_SECTION_LABEL_OPTIONS;

joist.register( 'PreferencesDialog', PreferencesDialog );
export default PreferencesDialog;