// Copyright 2021-2022, University of Colorado Boulder

/**
 * The panels that contain preferences controls. There is one panel for every tab, and it is shown when the
 * corresponding tab is selected.
 *
 * Once the dialog is created it is never destroyed so listeners do not need to be disposed.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import optionize, { EmptySelfOptions } from '../../../phet-core/js/optionize.js';
import { AlignGroup, Node, NodeOptions } from '../../../scenery/js/imports.js';
import Tandem from '../../../tandem/js/Tandem.js';
import joist from '../joist.js';
import AudioPreferencesPanel from './AudioPreferencesPanel.js';
import GeneralPreferencesPanel from './GeneralPreferencesPanel.js';
import InputPreferencesPanel from './InputPreferencesPanel.js';
import PreferencesDialog, { PreferencesTab } from './PreferencesDialog.js';
import VisualPreferencesPanel from './VisualPreferencesPanel.js';
import PreferencesModel from './PreferencesModel.js';
import IReadOnlyProperty from '../../../axon/js/IReadOnlyProperty.js';

type SelfOptions = EmptySelfOptions;
type PreferencesPanelsOptions = SelfOptions & NodeOptions;

class PreferencesPanels extends Node {

  // Each Preferences Panel as a Node collected into this array for layout and other management.
  private readonly content: PreferencesPanelContainer[] = [];

  // Property controlling the selected tab, so we can control which panel should be visible.
  private readonly selectedTabProperty: IReadOnlyProperty<PreferencesTab>;

  private readonly disposePreferencesPanel: () => void;

  /**
   * @param preferencesModel
   * @param supportedTabs - list of Tabs supported by this Dialog
   * @param selectedTabProperty
   * @param [providedOptions]
   */
  public constructor( preferencesModel: PreferencesModel, supportedTabs: PreferencesTab[], selectedTabProperty: IReadOnlyProperty<PreferencesTab>, providedOptions?: PreferencesPanelsOptions ) {
    const options = optionize<PreferencesPanelsOptions, SelfOptions, NodeOptions>()( {
      tandem: Tandem.REQUIRED,
      phetioVisiblePropertyInstrumented: false
    }, providedOptions );

    super( options );

    this.selectedTabProperty = selectedTabProperty;

    const panelAlignGroup = new AlignGroup( {
      matchVertical: false
    } );

    let generalPreferencesPanel: Node | null = null;
    if ( supportedTabs.includes( PreferencesDialog.PreferencesTab.GENERAL ) ) {
      generalPreferencesPanel = new GeneralPreferencesPanel( preferencesModel.generalModel, {
        tandem: options.tandem.createTandem( 'generalPreferencesPanel' )
      } );
      const generalBox = panelAlignGroup.createBox( generalPreferencesPanel );
      this.addChild( generalBox );
      this.content.push( new PreferencesPanelContainer( generalPreferencesPanel, PreferencesDialog.PreferencesTab.GENERAL ) );
    }

    let visualPreferencesPanel: Node | null = null;
    if ( supportedTabs.includes( PreferencesDialog.PreferencesTab.VISUAL ) ) {
      visualPreferencesPanel = new VisualPreferencesPanel( preferencesModel.visualModel, {
        tandem: options.tandem.createTandem( 'visualPreferencesPanel' )
      } );
      const visualBox = panelAlignGroup.createBox( visualPreferencesPanel );
      this.addChild( visualBox );
      this.content.push( new PreferencesPanelContainer( visualPreferencesPanel, PreferencesDialog.PreferencesTab.VISUAL ) );
    }

    let audioPreferencesPanel: Node | null = null;
    if ( supportedTabs.includes( PreferencesDialog.PreferencesTab.AUDIO ) ) {
      audioPreferencesPanel = new AudioPreferencesPanel( preferencesModel.audioModel, preferencesModel.toolbarEnabledProperty, {
        tandem: options.tandem.createTandem( 'audioPreferencesPanel' )
      } );
      const audioBox = panelAlignGroup.createBox( audioPreferencesPanel );
      this.addChild( audioBox );
      this.content.push( new PreferencesPanelContainer( audioPreferencesPanel, PreferencesDialog.PreferencesTab.AUDIO ) );
    }

    let inputPreferencesPanel: Node | null = null;
    if ( supportedTabs.includes( PreferencesDialog.PreferencesTab.INPUT ) ) {
      inputPreferencesPanel = new InputPreferencesPanel( preferencesModel.inputModel, {
        tandem: options.tandem.createTandem( 'inputPreferencesPanel' )
      } );
      this.addChild( inputPreferencesPanel );
      this.content.push( new PreferencesPanelContainer( inputPreferencesPanel, PreferencesDialog.PreferencesTab.INPUT ) );
    }

    // display the selected panel
    selectedTabProperty.link( tab => {
      generalPreferencesPanel && ( generalPreferencesPanel.visible = tab === PreferencesDialog.PreferencesTab.GENERAL );
      visualPreferencesPanel && ( visualPreferencesPanel.visible = tab === PreferencesDialog.PreferencesTab.VISUAL );
      audioPreferencesPanel && ( audioPreferencesPanel.visible = tab === PreferencesDialog.PreferencesTab.AUDIO );
      inputPreferencesPanel && ( inputPreferencesPanel.visible = tab === PreferencesDialog.PreferencesTab.INPUT );
    } );

    this.disposePreferencesPanel = () => {
      panelAlignGroup.dispose();

      generalPreferencesPanel && generalPreferencesPanel.dispose();
      visualPreferencesPanel && visualPreferencesPanel.dispose();
      audioPreferencesPanel && audioPreferencesPanel.dispose();
      inputPreferencesPanel && inputPreferencesPanel.dispose();
    };
  }

  public override dispose(): void {
    this.disposePreferencesPanel();
    super.dispose();
  }

  /**
   * Returns the visible content panel Node for the selected PreferencesTab.
   * NOTE: Loop shouldn't be necessary, create a map that goes from PreferencesTab -> content.
   */
  private getSelectedContent(): PreferencesPanelContainer | null {
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
   */
  public focusSelectedPanel(): void {
    const selectedContent = this.getSelectedContent();
    selectedContent!.panelContent.focusable = true;
    selectedContent!.panelContent.focus();
  }

  /**
   * @param node - the potential content for the selected panel that is focusable
   * @returns true if the provided node is the currently selected panel
   */
  public isFocusableSelectedContent( node: Node ): boolean {
    const selectedContent = this.getSelectedContent();
    return node === selectedContent!.panelContent; // the panelContent is what is focused in focusSelectedPanel()
  }
}

/**
 * An inner class that manages the panelContent and its value. A listener as added to the panel so that
 * whenever focus is lost from the panel, it is removed from the traversal order.
 */
class PreferencesPanelContainer extends Node {
  public readonly panelContent: Node;
  public readonly selectedTabValue: PreferencesTab;

  public constructor( panelContent: Node, selectedTabValue: PreferencesTab ) {
    super();

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