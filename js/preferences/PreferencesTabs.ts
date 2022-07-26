// Copyright 2021-2022, University of Colorado Boulder

/**
 * The tabs for the PreferencesDialog. Activating a tab will select a PreferencesTabPanel to be displayed to the user.
 * The actual tabs are implemented as radio buttons, styled to look like flat like a set of tabs.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import IProperty from '../../../axon/js/IProperty.js';
import Multilink from '../../../axon/js/Multilink.js';
import optionize, { EmptySelfOptions } from '../../../phet-core/js/optionize.js';
import StringUtils from '../../../phetcommon/js/util/StringUtils.js';
import { FocusHighlightPath, KeyboardUtils, Line, Node, NodeOptions, PressListener, Rectangle, SceneryEvent, Text, Voicing } from '../../../scenery/js/imports.js';
import Tandem from '../../../tandem/js/Tandem.js';
import joist from '../joist.js';
import joistStrings from '../joistStrings.js';
import PreferencesDialog, { PreferencesTab } from './PreferencesDialog.js';

// constants
const generalTitleString = joistStrings.preferences.tabs.general.title;
const visualTitleString = joistStrings.preferences.tabs.visual.title;
const audioTitleString = joistStrings.preferences.tabs.audio.title;
const inputTitleString = 'Input';
const preferencesTabResponsePatternString = joistStrings.a11y.preferences.tabs.tabResponsePattern;

type PreferencesTabsOptions = NodeOptions;

class PreferencesTabs extends Node {


  //  A reference to the selected and focusable tab content so that we can determine which
  // tab is next in order when cycling through with alternative input.
  private selectedButton: Node | null = null;
  private readonly selectedPanelProperty: IProperty<PreferencesTab>;
  private readonly content: Tab[] = [];
  private readonly disposePreferencesTabs: () => void;

  public constructor( supportedTabs: PreferencesTab[], selectedPanelProperty: IProperty<PreferencesTab>, providedOptions?: PreferencesTabsOptions ) {
    const options = optionize<PreferencesTabsOptions, EmptySelfOptions, NodeOptions>()( {

      // pdom
      tagName: 'ul',
      ariaRole: 'tablist',
      groupFocusHighlight: true,

      // phet-io
      tandem: Tandem.REQUIRED
    }, providedOptions );

    super( options );

    this.selectedPanelProperty = selectedPanelProperty;

    const addTabIfSupported = ( preferenceTab: PreferencesTab, titleString: string, tandemName: string ) => {
      const tandem = options.tandem.createTandem( tandemName );
      _.includes( supportedTabs, preferenceTab ) && this.content.push( new Tab( titleString, selectedPanelProperty, preferenceTab, tandem ) );
    };
    addTabIfSupported( PreferencesDialog.PreferencesTab.GENERAL, generalTitleString, 'generalTab' );
    addTabIfSupported( PreferencesDialog.PreferencesTab.VISUAL, visualTitleString, 'visualTab' );
    addTabIfSupported( PreferencesDialog.PreferencesTab.AUDIO, audioTitleString, 'audioTab' );
    addTabIfSupported( PreferencesDialog.PreferencesTab.INPUT, inputTitleString, 'audioTab' );

    for ( let i = 0; i < this.content.length; i++ ) {
      this.addChild( this.content[ i ] );
      if ( this.content[ i - 1 ] ) {
        this.content[ i ].leftCenter = this.content[ i - 1 ].rightCenter.plusXY( 10, 0 );
      }
    }

    // pdom - keyboard support to move through tabs with arrow keys
    const keyboardListener = {
      keydown: ( event: SceneryEvent ) => {

        // reserve keyboard events for dragging to prevent default panning behavior with zoom features
        event.pointer.reserveForKeyboardDrag();
      },
      keyup: ( event: SceneryEvent ) => {
        if ( ( KeyboardUtils.isAnyKeyEvent( event.domEvent, [ KeyboardUtils.KEY_RIGHT_ARROW, KeyboardUtils.KEY_LEFT_ARROW ] ) ) ) {

          // prevent "native" behavior so that Safari doesn't make an error sound with arrow keys in full screen mode
          event.domEvent!.preventDefault();

          const direction = KeyboardUtils.isKeyEvent( event.domEvent, KeyboardUtils.KEY_RIGHT_ARROW ) ? 1 : -1;
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
      }
    };
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

    this.disposePreferencesTabs = () => {
      this.removeInputListener( keyboardListener );
      selectedPanelProperty.unlink( selectedPanelListener );
      this.content.forEach( tab => tab.dispose() );
    };
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

  public override dispose(): void {
    this.disposePreferencesTabs();
    super.dispose();
  }
}

/**
 * Inner class, a single tab for the list of tabs.
 * @mixes Voicing
 */
class Tab extends Voicing( Node, 0 ) {

  public readonly value: PreferencesTab;
  private readonly disposeTab: () => void;

  /**
   * @param label - text label for the tab
   * @param property
   * @param value - PreferencesTab shown when this tab is selected
   * @param tandem
   */
  public constructor( label: string, property: IProperty<PreferencesTab>, value: PreferencesTab, tandem: Tandem ) {

    const textNode = new Text( label, PreferencesDialog.TAB_OPTIONS );

    // background Node behind the Text for layout spacing, and to increase the clickable area of the tab
    const backgroundNode = new Rectangle( textNode.bounds.dilatedXY( 15, 10 ), {
      children: [ textNode ]
    } );

    const underlineNode = new Line( 0, 0, textNode.width, 0, {
      stroke: FocusHighlightPath.INNER_FOCUS_COLOR,
      lineWidth: 5,
      centerTop: textNode.centerBottom.plusXY( 0, 5 )
    } );

    super( {
      children: [ backgroundNode, underlineNode ],
      cursor: 'pointer',

      // pdom
      tagName: 'button',
      innerContent: label,
      ariaRole: 'tab',
      focusable: true,
      containerTagName: 'li',

      tandem: tandem
    } );

    this.value = value;

    this.voicingNameResponse = StringUtils.fillIn( preferencesTabResponsePatternString, {
      title: label
    } );

    const pressListener = new PressListener( {
      press: () => {
        property.set( value );

        // speak the object response on activation
        this.voicingSpeakNameResponse();
      },

      // phet-io
      tandem: tandem.createTandem( 'pressListener' )
    } );
    this.addInputListener( pressListener );

    Multilink.multilink( [ property, pressListener.isOverProperty ], ( selectedTab, isOver ) => {
      textNode.opacity = selectedTab === value ? 1 :
                         isOver ? 0.8 :
                         0.6;

      this.focusable = selectedTab === value;
      underlineNode.visible = selectedTab === value;
    } );

    this.disposeTab = () => {
      pressListener.dispose();
    };
  }

  public override dispose(): void {
    this.disposeTab();
    super.dispose();
  }
}

joist.register( 'PreferencesTabs', PreferencesTabs );
export default PreferencesTabs;