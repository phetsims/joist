// Copyright 2021-2025, University of Colorado Boulder

/**
 * The tabs for the PreferencesDialog. Activating a tab will select a PreferencesTabPanel to be displayed to the user.
 * The actual tabs are implemented as radio buttons, styled to look like flat like a set of tabs.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import Multilink from '../../../axon/js/Multilink.js';
import TProperty from '../../../axon/js/TProperty.js';
import TReadOnlyProperty from '../../../axon/js/TReadOnlyProperty.js';
import optionize, { EmptySelfOptions } from '../../../phet-core/js/optionize.js';
import PickRequired from '../../../phet-core/js/types/PickRequired.js';
import { HBox, HBoxOptions, KeyboardListener, Node, Path } from '../../../scenery/js/imports.js';
import globeSolidShape from '../../../sun/js/shapes/globeSolidShape.js';
import joist from '../joist.js';
import JoistStrings from '../JoistStrings.js';
import PreferencesTab from './PreferencesTab.js';
import PreferencesType from './PreferencesType.js';

type SelfOptions = EmptySelfOptions;

export type PreferencesTabsOptions = HBoxOptions & PickRequired<HBoxOptions, 'tandem'>;

const DEFAULT_TAB_SPACING = 10;

class PreferencesTabs extends HBox {

  //  A reference to the selected and focusable tab content so that we can determine which
  // tab is next in order when cycling through with alternative input.
  private selectedButton: Node | null = null;
  private readonly selectedPanelProperty: TProperty<PreferencesType>;
  private readonly content: PreferencesTab[] = [];

  public constructor( supportedTabs: PreferencesType[], selectedPanelProperty: TProperty<PreferencesType>, providedOptions: PreferencesTabsOptions ) {
    const options = optionize<PreferencesTabsOptions, SelfOptions, HBoxOptions>()( {
      isDisposable: false,

      // pdom
      tagName: 'ul',
      ariaRole: 'tablist',
      groupFocusHighlight: true,
      spacing: DEFAULT_TAB_SPACING,
      align: 'bottom'
    }, providedOptions );

    super( options );

    this.selectedPanelProperty = selectedPanelProperty;

    const isTabSupported = ( preferencesType: PreferencesType ) => _.includes( supportedTabs, preferencesType );

    // A dilation of the pointer areas makes it so that highlights that sorround the tabs are flush against eachother
    // which looks better, see https://github.com/phetsims/joist/issues/932
    const dilation = options.spacing / 2;
    if ( isTabSupported( PreferencesType.OVERVIEW ) ) {
      this.content.push( new PreferencesTab( JoistStrings.preferences.tabs.overview.titleStringProperty, selectedPanelProperty, PreferencesType.OVERVIEW, {
        pointerAreaXDilation: dilation,
        tandem: options.tandem.createTandem( 'overviewTab' )
      } ) );
    }
    if ( isTabSupported( PreferencesType.SIMULATION ) ) {
      this.content.push( new PreferencesTab( JoistStrings.preferences.tabs.simulation.titleStringProperty, selectedPanelProperty, PreferencesType.SIMULATION, {
        pointerAreaXDilation: dilation,
        tandem: options.tandem.createTandem( 'simulationTab' )
      } ) );
    }
    if ( isTabSupported( PreferencesType.VISUAL ) ) {
      this.content.push( new PreferencesTab( JoistStrings.preferences.tabs.visual.titleStringProperty, selectedPanelProperty, PreferencesType.VISUAL, {
        pointerAreaXDilation: dilation,
        tandem: options.tandem.createTandem( 'visualTab' )
      } ) );
    }
    if ( isTabSupported( PreferencesType.AUDIO ) ) {
      this.content.push( new PreferencesTab( JoistStrings.preferences.tabs.audio.titleStringProperty, selectedPanelProperty, PreferencesType.AUDIO, {
        pointerAreaXDilation: dilation,
        tandem: options.tandem.createTandem( 'audioTab' )
      } ) );
    }
    if ( isTabSupported( PreferencesType.INPUT ) ) {
      this.content.push( new PreferencesTab( JoistStrings.preferences.tabs.input.titleStringProperty, selectedPanelProperty, PreferencesType.INPUT, {
        pointerAreaXDilation: dilation,
        tandem: options.tandem.createTandem( 'inputTab' )
      } ) );
    }
    if ( isTabSupported( PreferencesType.LOCALIZATION ) ) {
      this.content.push( new PreferencesTab( JoistStrings.preferences.tabs.localization.titleStringProperty, selectedPanelProperty, PreferencesType.LOCALIZATION, {
        pointerAreaXDilation: dilation,

        // Display a globe icon next to the localization label
        iconNode: new Path( globeSolidShape, {
          scale: 0.734, // by inspection
          fill: 'black'
        } ),

        tandem: options.tandem.createTandem( 'localizationTab' )
      } ) );
    }

    this.children = this.content;

    // If the currently selected tab is hidden via phet-io, then select the first visible tab (if there is one)
    Multilink.multilinkAny( [ selectedPanelProperty, ...this.content.map( tab => tab.visibleProperty ) ], () => {

      // Find the tab corresponding to the current selection
      const tab = this.content.find( tab => tab.value === selectedPanelProperty.value )!;

      // If the selected tab is not showing...
      if ( !tab.visibleProperty.value ) {

        // Find the leftmost tab that is showing (if there are any showing tabs)
        const firstShowingTab = this.content.find( tab => tab.visibleProperty.value );
        if ( firstShowingTab ) {
          selectedPanelProperty.value = firstShowingTab.value;
        }
      }
    } );

    // pdom - keyboard support to move through tabs with arrow keys
    const keyboardListener = new KeyboardListener( {
      keys: [ 'arrowRight', 'arrowLeft' ],
      fireOnDown: false,
      fire: ( event, keysPressed ) => {

        // prevent "native" behavior so that Safari doesn't make an error sound with arrow keys in full screen mode
        if ( event ) {
          event.preventDefault();
        }

        const direction = keysPressed === 'arrowRight' ? 1 : -1;
        for ( let i = 0; i < this.content.length; i++ ) {
          if ( this.selectedButton === this.content[ i ] ) {
            const nextButtonContent = this.content[ i + direction ];
            if ( nextButtonContent ) {

              // select the next tab and move focus to it - a listener on selectedPanelProperty sets the next
              // selectedButton and makes it focusable
              selectedPanelProperty.value = nextButtonContent.value;
              this.selectedButton.focus();

              break;
            }
          }
        }
      }
    } );
    this.addInputListener( keyboardListener );

    const selectedPanelListener = () => {
      this.content.forEach( content => {
        if ( content.value === this.selectedPanelProperty.value ) {
          this.selectedButton = content;
        }
      } );
    };
    selectedPanelProperty.link( selectedPanelListener );

    // if there is only one tab, it is not interactive
    if ( supportedTabs.length === 1 ) {
      this.focusable = false;
      this.inputEnabledProperty.value = false;
    }
  }

  /**
   * Returns the visibleProperty for the Tab associated with the PreferencesType. PreferencesTabs need to be hidden
   * if the Tab becomes invisible (mostly needed for PhET-iO).
   */
  public getTabVisibleProperty( preferencesType: PreferencesType ): TReadOnlyProperty<boolean> {
    const tab = _.find( this.content, content => content.value === preferencesType );
    assert && assert( tab, `tab not found for PreferencesType, ${preferencesType.name}` );
    return tab!.visibleProperty;
  }

  /**
   * Move focus to the selected tab. Useful when the Preferences dialog is opened.
   */
  public focusSelectedTab(): void {
    this.content.forEach( content => {
      if ( content.value === this.selectedPanelProperty.value ) {
        content.focus();
      }
    } );
  }
}

joist.register( 'PreferencesTabs', PreferencesTabs );
export default PreferencesTabs;