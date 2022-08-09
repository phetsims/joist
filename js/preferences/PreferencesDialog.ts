// Copyright 2021-2022, University of Colorado Boulder

/**
 * Dialog with preferences to enable or disable various features for the simulation. Groups of preferences are
 * organized and displayed in a tab panel.
 *
 * Once the dialog is created it is never destroyed so listeners and components do not need to be disposed.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import EnumerationProperty from '../../../axon/js/EnumerationProperty.js';
import Enumeration from '../../../phet-core/js/Enumeration.js';
import EnumerationValue from '../../../phet-core/js/EnumerationValue.js';
import optionize, { EmptySelfOptions } from '../../../phet-core/js/optionize.js';
import PhetFont from '../../../scenery-phet/js/PhetFont.js';
import { KeyboardUtils, Node, Text } from '../../../scenery/js/imports.js';
import Dialog, { DialogOptions } from '../../../sun/js/Dialog.js';
import HSeparator from '../../../sun/js/HSeparator.js';
import soundManager from '../../../tambo/js/soundManager.js';
import Tandem from '../../../tandem/js/Tandem.js';
import audioManager from '../audioManager.js';
import joist from '../joist.js';
import joistStrings from '../joistStrings.js';
import PreferencesModel from './PreferencesModel.js';
import PreferencesPanels from './PreferencesPanels.js';
import PreferencesTabs from './PreferencesTabs.js';
import PreferencesTabSwitchSoundGenerator from './PreferencesTabSwitchSoundGenerator.js';

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
export class PreferencesTab extends EnumerationValue {
  public static GENERAL = new PreferencesTab();
  public static VISUAL = new PreferencesTab();
  public static AUDIO = new PreferencesTab();
  public static INPUT = new PreferencesTab();

  public static enumeration = new Enumeration( PreferencesTab );
}

type PreferencesDialogOptions = DialogOptions;

class PreferencesDialog extends Dialog {
  private readonly preferencesTabs: PreferencesTabs;
  private readonly preferencesPanels: PreferencesPanels;
  private readonly disposePreferencesDialog: () => void;

  public constructor( preferencesModel: PreferencesModel, providedOptions?: PreferencesDialogOptions ) {

    const titleText = new Text( preferencesTitleString, {
      font: TITLE_FONT,

      // pdom
      tagName: 'h1',
      innerContent: preferencesTitleString
    } );

    const options = optionize<PreferencesDialogOptions, EmptySelfOptions, DialogOptions>()( {
      titleAlign: 'center',
      title: titleText,

      // phet-io
      phetioDynamicElement: true,
      tandem: Tandem.REQUIRED,

      closeButtonVoicingDialogTitle: preferencesTitleString,

      // pdom
      positionInPDOM: true
    }, providedOptions );

    // determine which tabs will be supported in this Dialog, true if any entry in a configuration has content
    const supportedTabs = [];
    supportedTabs.push( PreferencesTab.GENERAL ); // There is always a "General" tab
    preferencesModel.supportsVisualPreferences() && supportedTabs.push( PreferencesTab.VISUAL );
    preferencesModel.supportsAudioPreferences() && audioManager.supportsAudio && supportedTabs.push( PreferencesTab.AUDIO );
    preferencesModel.supportsInputPreferences() && supportedTabs.push( PreferencesTab.INPUT );
    assert && assert( supportedTabs.length > 0, 'Trying to create a PreferencesDialog with no tabs, check PreferencesConfiguration' );

    // the selected PreferencesTab, indicating which tab is visible in the Dialog
    const selectedTabProperty = new EnumerationProperty( PreferencesTab.GENERAL, {
      validValues: supportedTabs,
      tandem: options.tandem.createTandem( 'selectedTabProperty' )
    } );

    // the set of tabs you can click to activate a tab panel
    const preferencesTabs = new PreferencesTabs( supportedTabs, selectedTabProperty );

    // the panels of content with UI components to select preferences, only one is displayed at a time
    const preferencesPanels = new PreferencesPanels( preferencesModel, supportedTabs, selectedTabProperty, {
      tandem: options.tandem.createTandem( 'preferencesPanels' )
    } );

    // visual separator between tabs and panels - as long as the widest separated content, which may change with i18n
    const tabPanelSeparator = new HSeparator( Math.max( preferencesPanels.width, preferencesTabs.width ), { lineWidth: 1 } );

    const content = new Node( {
      children: [ preferencesTabs, tabPanelSeparator, preferencesPanels ]
    } );

    // layout
    tabPanelSeparator.centerTop = preferencesTabs.centerBottom;
    preferencesPanels.centerTop = tabPanelSeparator.centerBottom.plusXY( 0, 20 );

    // sound generation for tab switching
    const tabSwitchSoundGenerator = new PreferencesTabSwitchSoundGenerator( selectedTabProperty, {
      initialOutputLevel: 0.2
    } );
    soundManager.addSoundGenerator( tabSwitchSoundGenerator );

    super( content, options );

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
    content.addInputListener( {
      keydown: event => {

        // components within the content may need to respond to input themselves, only focus tabs if container has focus
        if ( KeyboardUtils.isKeyEvent( event.domEvent, KeyboardUtils.KEY_UP_ARROW ) &&
             this.preferencesPanels.isFocusableSelectedContent( event.target ) ) {
          this.focusSelectedTab();
        }
      }
    } );

    this.disposePreferencesDialog = () => {
      preferencesTabs.dispose();
      selectedTabProperty.dispose();
      preferencesPanels.dispose();
    };
  }

  /**
   * Move focus to the selected tab. Generally to be used when opening the dialog.
   */
  public focusSelectedTab(): void {
    this.preferencesTabs.focusSelectedTab();
  }

  /**
   * Move focus to the selected panel.
   */
  private focusSelectedPanel(): void {
    this.preferencesPanels.focusSelectedPanel();
  }

  public override dispose(): void {
    this.disposePreferencesDialog();
    super.dispose();
  }

  public static PreferencesTab = PreferencesTab;

  public static TAB_FONT = TAB_FONT;
  public static TAB_OPTIONS = TAB_OPTIONS;

  public static CONTENT_FONT = CONTENT_FONT;
  public static CONTENT_MAX_WIDTH = CONTENT_MAX_WIDTH;
  public static PANEL_SECTION_CONTENT_OPTIONS = PANEL_SECTION_CONTENT_OPTIONS;

  public static PANEL_SECTION_LABEL_FONT = PANEL_SECTION_LABEL_FONT;
  public static PANEL_SECTION_LABEL_MAX_WIDTH = PANEL_SECTION_LABEL_MAX_WIDTH;
  public static PANEL_SECTION_LABEL_OPTIONS = PANEL_SECTION_LABEL_OPTIONS;
}

joist.register( 'PreferencesDialog', PreferencesDialog );
export default PreferencesDialog;