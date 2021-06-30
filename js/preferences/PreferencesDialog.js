// Copyright 2021, University of Colorado Boulder

/**
 * Dialog with preferences to enable or disable various features for the simulation. Groups of preferences are
 * organized and displayed in a tab panel.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import EnumerationProperty from '../../../axon/js/EnumerationProperty.js';
import Enumeration from '../../../phet-core/js/Enumeration.js';
import merge from '../../../phet-core/js/merge.js';
import PhetFont from '../../../scenery-phet/js/PhetFont.js';
import Node from '../../../scenery/js/nodes/Node.js';
import Text from '../../../scenery/js/nodes/Text.js';
import Dialog from '../../../sun/js/Dialog.js';
import HSeparator from '../../../sun/js/HSeparator.js';
import joist from '../joist.js';
import joistStrings from '../joistStrings.js';
import PreferencesPanels from './PreferencesPanels.js';
import PreferencesTabs from './PreferencesTabs.js';

// constants
const preferencesTitleString = joistStrings.preferences.title;

const TAB_FONT = new PhetFont( 20 );
const TITLE_FONT = new PhetFont( { size: 24, weight: 'bold' } );
const CONTENT_FONT = new PhetFont( 16 );
const PANEL_SECTION_LABEL_FONT = new PhetFont( { weight: 'bold', size: 16 } );

// tabs available in this Dialog
const PreferencesTab = Enumeration.byKeys( [ 'GENERAL', 'VISUAL', 'AUDIO', 'INPUT' ] );

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
      title: titleText
    }, options );

    // determine which tabs will be supported in this Dialog, true if any entry in a configuration has content
    const supportedTabs = [];
    supportedTabs.push( PreferencesTab.GENERAL ); // There is always a "General" tab
    _.some( preferencesConfiguration.visualOptions, entry => !!entry ) && supportedTabs.push( PreferencesTab.VISUAL );
    _.some( preferencesConfiguration.audioOptions, entry => !!entry ) && supportedTabs.push( PreferencesTab.AUDIO );
    _.some( preferencesConfiguration.inputOptions, entry => !!entry ) && supportedTabs.push( PreferencesTab.INPUT );
    assert && assert( supportedTabs.length > 0, 'Trying to create a PreferencesDialog with no tabs, check PreferencesConfiguration' );

    // the selected PreferencesTab, indicating which tab is visible in the Dialog
    const selectedTabProperty = new EnumerationProperty( PreferencesTab, PreferencesTab.GENERAL );

    // the set of tabs you can can click to activate a tab panel
    const preferencesTabs = new PreferencesTabs( preferencesConfiguration, supportedTabs, selectedTabProperty );

    // the panels of content with UI components to select preferences, only one is displayed at a time
    const preferencesPanels = new PreferencesPanels( preferencesConfiguration, supportedTabs, selectedTabProperty, simSoundProperty, preferencesProperties );

    // visual separator between tabs and panels
    const tabPanelSeparator = new HSeparator( preferencesPanels.width, { lineWidth: 1 } );

    const content = new Node( {
      children: [ preferencesTabs, tabPanelSeparator, preferencesPanels ]
    } );

    // layout
    tabPanelSeparator.centerTop = preferencesTabs.centerBottom;
    preferencesPanels.centerTop = tabPanelSeparator.centerBottom.plusXY( 0, 20 );

    super( content, options );

    // @private {PreferencesTabs}
    this.preferencesTabs = preferencesTabs;
  }

  /**
   * Move focus to the selected tab. Generally to be used when opening the dialog.
   * @private
   */
  focusSelectedTab() {
    this.preferencesTabs.focusSelectedTab();
  }
}

// @public
// @static
PreferencesDialog.PreferencesTab = PreferencesTab;
PreferencesDialog.CONTENT_FONT = CONTENT_FONT;
PreferencesDialog.TAB_FONT = TAB_FONT;
PreferencesDialog.PANEL_SECTION_LABEL_FONT = PANEL_SECTION_LABEL_FONT;

joist.register( 'PreferencesDialog', PreferencesDialog );
export default PreferencesDialog;