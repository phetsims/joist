// Copyright 2021-2023, University of Colorado Boulder

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
import joist from '../joist.js';
import AudioPreferencesPanel from './AudioPreferencesPanel.js';
import SimulationPreferencesPanel from './SimulationPreferencesPanel.js';
import InputPreferencesPanel from './InputPreferencesPanel.js';
import VisualPreferencesPanel from './VisualPreferencesPanel.js';
import PreferencesModel from './PreferencesModel.js';
import TReadOnlyProperty from '../../../axon/js/TReadOnlyProperty.js';
import LocalizationPreferencesPanel from './LocalizationPreferencesPanel.js';
import PreferencesType from './PreferencesType.js';
import OverviewPreferencesPanel from './OverviewPreferencesPanel.js';
import PreferencesTabs from './PreferencesTabs.js';
import PickRequired from '../../../phet-core/js/types/PickRequired.js';
import Tandem from '../../../tandem/js/Tandem.js';

type SelfOptions = EmptySelfOptions;
type PreferencesPanelsOptions = SelfOptions & NodeOptions & PickRequired<NodeOptions, 'tandem'>;

class PreferencesPanels extends Node {

  // Each Preferences Panel as a Node collected into this array for layout and other management.
  private readonly content: PreferencesPanelContainer[] = [];

  // Property controlling the selected tab, so we can control which panel should be visible.
  private readonly selectedTabProperty: TReadOnlyProperty<PreferencesType>;

  private readonly disposePreferencesPanel: () => void;

  /**
   * @param preferencesModel
   * @param supportedTabs - list of Tabs supported by this Dialog
   * @param selectedTabProperty
   * @param preferencesTabs
   * @param [providedOptions]
   */
  public constructor( preferencesModel: PreferencesModel, supportedTabs: PreferencesType[],
                      selectedTabProperty: TReadOnlyProperty<PreferencesType>, preferencesTabs: PreferencesTabs,
                      providedOptions?: PreferencesPanelsOptions ) {
    const options = optionize<PreferencesPanelsOptions, SelfOptions, NodeOptions>()( {
      phetioVisiblePropertyInstrumented: false
    }, providedOptions );

    const tandem = options.tandem;

    // Don't instrument the actual PreferencesPanels Node. Then if it doesn't have any children, it won't be in the Studio Tree)
    options.tandem = Tandem.OPT_OUT;

    super( options );

    this.selectedTabProperty = selectedTabProperty;

    const panelAlignGroup = new AlignGroup( {
      matchVertical: false
    } );

    let overviewPreferencesPanel: Node | null = null;
    if ( supportedTabs.includes( PreferencesType.OVERVIEW ) ) {
      overviewPreferencesPanel = new OverviewPreferencesPanel( selectedTabProperty, preferencesTabs.getTabVisibleProperty( PreferencesType.OVERVIEW ) );
      const overviewBox = panelAlignGroup.createBox( overviewPreferencesPanel );
      this.addChild( overviewBox );
      this.content.push( new PreferencesPanelContainer( overviewPreferencesPanel, PreferencesType.OVERVIEW ) );
    }

    let simulationPreferencesPanel: Node | null = null;
    if ( supportedTabs.includes( PreferencesType.SIMULATION ) ) {
      simulationPreferencesPanel = new SimulationPreferencesPanel(
        preferencesModel.simulationModel, selectedTabProperty, preferencesTabs.getTabVisibleProperty( PreferencesType.SIMULATION ), {
          tandem: tandem.createTandem( 'simulationPreferencesPanel' )
        } );
      const simulationBox = panelAlignGroup.createBox( simulationPreferencesPanel );
      this.addChild( simulationBox );
      this.content.push( new PreferencesPanelContainer( simulationPreferencesPanel, PreferencesType.SIMULATION ) );
    }

    let visualPreferencesPanel: Node | null = null;
    if ( supportedTabs.includes( PreferencesType.VISUAL ) ) {
      visualPreferencesPanel = new VisualPreferencesPanel(
        preferencesModel.visualModel,
        selectedTabProperty,
        preferencesTabs.getTabVisibleProperty( PreferencesType.VISUAL ), {
          tandem: tandem.createTandem( 'visualPreferencesPanel' )
        } );
      const visualBox = panelAlignGroup.createBox( visualPreferencesPanel );
      this.addChild( visualBox );
      this.content.push( new PreferencesPanelContainer( visualPreferencesPanel, PreferencesType.VISUAL ) );
    }

    let audioPreferencesPanel: Node | null = null;
    if ( supportedTabs.includes( PreferencesType.AUDIO ) ) {
      audioPreferencesPanel = new AudioPreferencesPanel(
        preferencesModel.audioModel,
        selectedTabProperty,
        preferencesTabs.getTabVisibleProperty( PreferencesType.AUDIO ), {
          tandem: tandem.createTandem( 'audioPreferencesPanel' )
        } );
      const audioBox = panelAlignGroup.createBox( audioPreferencesPanel );
      this.addChild( audioBox );
      this.content.push( new PreferencesPanelContainer( audioPreferencesPanel, PreferencesType.AUDIO ) );
    }

    let inputPreferencesPanel: Node | null = null;
    if ( supportedTabs.includes( PreferencesType.INPUT ) ) {
      inputPreferencesPanel = new InputPreferencesPanel(
        preferencesModel.inputModel,
        selectedTabProperty,
        preferencesTabs.getTabVisibleProperty( PreferencesType.INPUT ), {
          tandem: tandem.createTandem( 'inputPreferencesPanel' )
        }
      );
      const inputBox = panelAlignGroup.createBox( inputPreferencesPanel );
      this.addChild( inputBox );
      this.content.push( new PreferencesPanelContainer( inputPreferencesPanel, PreferencesType.INPUT ) );
    }

    let localizationPreferencesPanel: Node | null = null;
    if ( supportedTabs.includes( PreferencesType.LOCALIZATION ) ) {
      localizationPreferencesPanel = new LocalizationPreferencesPanel(
        preferencesModel.localizationModel,
        selectedTabProperty,
        preferencesTabs.getTabVisibleProperty( PreferencesType.LOCALIZATION ),
        {
          tandem: tandem.createTandem( 'localizationPreferencesPanel' )
        } );
      const localizationBox = panelAlignGroup.createBox( localizationPreferencesPanel );
      this.addChild( localizationBox );
      this.content.push( new PreferencesPanelContainer( localizationPreferencesPanel, PreferencesType.LOCALIZATION ) );
    }

    this.disposePreferencesPanel = () => {
      panelAlignGroup.dispose();
      this.content.forEach( panelContent => panelContent.dispose() );

      overviewPreferencesPanel && overviewPreferencesPanel.dispose();
      simulationPreferencesPanel && simulationPreferencesPanel.dispose();
      visualPreferencesPanel && visualPreferencesPanel.dispose();
      audioPreferencesPanel && audioPreferencesPanel.dispose();
      inputPreferencesPanel && inputPreferencesPanel.dispose();
      localizationPreferencesPanel && localizationPreferencesPanel.dispose();
    };
  }

  public override dispose(): void {
    this.disposePreferencesPanel();
    super.dispose();
  }

  /**
   * Returns the visible content panel Node for the selected PreferencesType.
   * NOTE: Loop shouldn't be necessary, create a map that goes from PreferencesType -> content.
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
  public readonly selectedTabValue: PreferencesType;

  public constructor( panelContent: Node, selectedTabValue: PreferencesType ) {
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