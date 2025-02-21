// Copyright 2021-2025, University of Colorado Boulder

/**
 * Dialog with preferences to enable or disable various features for the simulation. Groups of preferences are
 * organized and displayed in a tab panel.
 *
 * Once the dialog is created it is never destroyed so listeners and components do not need to be disposed.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import DerivedProperty from '../../../axon/js/DerivedProperty.js';
import EnumerationProperty from '../../../axon/js/EnumerationProperty.js';
import optionize, { type EmptySelfOptions } from '../../../phet-core/js/optionize.js';
import type PickRequired from '../../../phet-core/js/types/PickRequired.js';
import { getPDOMFocusedNode, pdomFocusProperty } from '../../../scenery/js/accessibility/pdomFocusProperty.js';
import HSeparator from '../../../scenery/js/layout/nodes/HSeparator.js';
import VBox from '../../../scenery/js/layout/nodes/VBox.js';
import KeyboardListener from '../../../scenery/js/listeners/KeyboardListener.js';
import Text from '../../../scenery/js/nodes/Text.js';
import Dialog, { type DialogOptions } from '../../../sun/js/Dialog.js';
import soundManager from '../../../tambo/js/soundManager.js';
import joist from '../joist.js';
import JoistStrings from '../JoistStrings.js';
import PreferencesDialogConstants from './PreferencesDialogConstants.js';
import type PreferencesModel from './PreferencesModel.js';
import PreferencesPanels from './PreferencesPanels.js';
import PreferencesTabs from './PreferencesTabs.js';
import PreferencesTabSwitchSoundGenerator from './PreferencesTabSwitchSoundGenerator.js';
import PreferencesType from './PreferencesType.js';

type PreferencesDialogOptions = DialogOptions & PickRequired<DialogOptions, 'tandem'>;

class PreferencesDialog extends Dialog {
  private readonly preferencesTabs: PreferencesTabs;
  private readonly preferencesPanels: PreferencesPanels;

  public constructor( preferencesModel: PreferencesModel, providedOptions?: PreferencesDialogOptions ) {

    const titleText = new Text( JoistStrings.preferences.titleStringProperty, {
      font: PreferencesDialogConstants.TITLE_FONT,
      maxWidth: PreferencesDialogConstants.CONTENT_MAX_WIDTH // The width of the title should be the same max as for a panel section
    } );

    const options = optionize<PreferencesDialogOptions, EmptySelfOptions, DialogOptions>()( {
      titleAlign: 'center',
      title: titleText,
      isDisposable: false,

      // phet-io
      phetioDynamicElement: true,

      closeButtonVoicingDialogTitle: JoistStrings.preferences.titleStringProperty
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
    preferencesTabs.addInputListener( new KeyboardListener( {
      keys: [ 'arrowDown' ],
      fire: () => {
        this.focusSelectedPanel();
      }
    } ) );
    content.addInputListener( new KeyboardListener( {
      keys: [ 'arrowUp' ],
      fire: event => {
        this.focusSelectedTab();
      },

      // This listener is only enabled when the focus is on the panel itself, not its children. Panel contents
      // will often use arrow keys themselves, so this prevents an overlap.
      enabledProperty: new DerivedProperty( [ pdomFocusProperty ], () => {
        const pdomFocusedNode = getPDOMFocusedNode();
        return !!pdomFocusedNode && this.preferencesPanels.isFocusableSelectedContent( pdomFocusedNode );
      } )
    } ) );
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
}

joist.register( 'PreferencesDialog', PreferencesDialog );
export default PreferencesDialog;