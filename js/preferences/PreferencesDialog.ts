// Copyright 2021-2023, University of Colorado Boulder

/**
 * Dialog with preferences to enable or disable various features for the simulation. Groups of preferences are
 * organized and displayed in a tab panel.
 *
 * Once the dialog is created it is never destroyed so listeners and components do not need to be disposed.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import EnumerationProperty from '../../../axon/js/EnumerationProperty.js';
import optionize, { EmptySelfOptions } from '../../../phet-core/js/optionize.js';
import PickRequired from '../../../phet-core/js/types/PickRequired.js';
import PhetFont from '../../../scenery-phet/js/PhetFont.js';
import { HSeparator, KeyboardUtils, Text, VBox } from '../../../scenery/js/imports.js';
import Dialog, { DialogOptions } from '../../../sun/js/Dialog.js';
import soundManager from '../../../tambo/js/soundManager.js';
import joist from '../joist.js';
import JoistStrings from '../JoistStrings.js';
import PreferencesModel from './PreferencesModel.js';
import PreferencesPanels from './PreferencesPanels.js';
import PreferencesTabs from './PreferencesTabs.js';
import PreferencesTabSwitchSoundGenerator from './PreferencesTabSwitchSoundGenerator.js';
import PreferencesType from './PreferencesType.js';

// constants
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

type PreferencesDialogOptions = DialogOptions & PickRequired<DialogOptions, 'tandem'>;

class PreferencesDialog extends Dialog {
  private readonly preferencesTabs: PreferencesTabs;
  private readonly preferencesPanels: PreferencesPanels;
  private readonly disposePreferencesDialog: () => void;

  public constructor( preferencesModel: PreferencesModel, providedOptions?: PreferencesDialogOptions ) {

    const titleText = new Text( JoistStrings.preferences.titleStringProperty, {
      font: TITLE_FONT,
      maxWidth: CONTENT_MAX_WIDTH, // The width of the title should be the same max as for a panel section

      // pdom
      tagName: 'h1',
      innerContent: JoistStrings.preferences.titleStringProperty
    } );

    const options = optionize<PreferencesDialogOptions, EmptySelfOptions, DialogOptions>()( {
      titleAlign: 'center',
      title: titleText,

      // phet-io
      phetioDynamicElement: true,

      closeButtonVoicingDialogTitle: JoistStrings.preferences.titleStringProperty,

      // pdom
      positionInPDOM: true
    }, providedOptions );

    // determine which tabs will be supported in this Dialog, true if any entry in a configuration has content
    const supportedTabs = [ PreferencesType.OVERVIEW ]; // There is always an "Overview" tab
    preferencesModel.supportsSimulationPreferences() && supportedTabs.push( PreferencesType.SIMULATION );
    preferencesModel.supportsVisualPreferences() && supportedTabs.push( PreferencesType.VISUAL );
    preferencesModel.supportsAudioPreferences() && supportedTabs.push( PreferencesType.AUDIO );
    preferencesModel.supportsInputPreferences() && supportedTabs.push( PreferencesType.INPUT );
    preferencesModel.supportsLocalizationPreferences() && supportedTabs.push( PreferencesType.LOCALIZATION );
    assert && assert( supportedTabs.length > 0, 'Trying to create a PreferencesDialog with no tabs, check PreferencesModel' );

    // the selected PreferencesType, indicating which tab is visible in the Dialog
    const selectedTabProperty = new EnumerationProperty( PreferencesType.OVERVIEW, {
      validValues: supportedTabs,
      tandem: options.tandem.createTandem( 'selectedTabProperty' )
    } );

    // the set of tabs you can click to activate a tab panel
    const preferencesTabs = new PreferencesTabs( supportedTabs, selectedTabProperty, {
      tandem: options.tandem.createTandem( 'preferencesTabs' )
    } );

    // the panels of content with UI components to select preferences, only one is displayed at a time
    const preferencesPanels = new PreferencesPanels( preferencesModel, supportedTabs, selectedTabProperty, preferencesTabs, {
      tandem: options.tandem.createTandem( 'preferencesPanels' )
    } );

    // visual separator between tabs and panels - as long as the widest separated content, which may change with i18n

    const content = new VBox( {
      children: [
        preferencesTabs,
        new HSeparator( {
          layoutOptions: {
            bottomMargin: 20,
            stretch: true
          }
        } ),
        preferencesPanels
      ]
    } );

    // sound generation for tab switching
    const tabSwitchSoundGenerator = new PreferencesTabSwitchSoundGenerator( selectedTabProperty, {
      initialOutputLevel: 0.2
    } );
    soundManager.addSoundGenerator( tabSwitchSoundGenerator, {
      categoryName: 'user-interface'
    } );

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
      content.dispose();

      soundManager.removeSoundGenerator( tabSwitchSoundGenerator );
      tabSwitchSoundGenerator.dispose();
      preferencesTabs.dispose();
      selectedTabProperty.dispose();
      preferencesPanels.dispose();
      titleText.dispose();
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

  // Font and options for the text that labels a tab in the dialog.
  public static readonly TAB_FONT = TAB_FONT;
  public static readonly TAB_OPTIONS = TAB_OPTIONS;

  // The font for a title of a panel in the dialog.
  public static readonly TITLE_FONT = TITLE_FONT;

  // The font, max width, and options for most text content in the dialog.
  public static readonly CONTENT_FONT = CONTENT_FONT;
  public static readonly CONTENT_MAX_WIDTH = CONTENT_MAX_WIDTH;
  public static readonly PANEL_SECTION_CONTENT_OPTIONS = PANEL_SECTION_CONTENT_OPTIONS;

  // The font, max width, and options for a label for a section of content in the dialog.
  public static readonly PANEL_SECTION_LABEL_FONT = PANEL_SECTION_LABEL_FONT;
  public static readonly PANEL_SECTION_LABEL_MAX_WIDTH = PANEL_SECTION_LABEL_MAX_WIDTH;
  public static readonly PANEL_SECTION_LABEL_OPTIONS = PANEL_SECTION_LABEL_OPTIONS;

  // Default spacing between unique items in a preferences dialog
  public static readonly CONTENT_SPACING = 20;

  // Default vertical spacing between grouped items (radio buttons, vertical checkboxes, ...)
  public static readonly VERTICAL_CONTENT_SPACING = 5;

  // Content or UI component intendentation under a PreferencesPanelSection title.
  public static readonly CONTENT_INDENTATION_SPACING = 15;

  // Default vertical spacing between a label and its collection of contents for a control in the dialog.
  public static readonly LABEL_CONTENT_SPACING = 10;
}

joist.register( 'PreferencesDialog', PreferencesDialog );
export default PreferencesDialog;