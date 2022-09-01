// Copyright 2021-2022, University of Colorado Boulder

/**
 * The tabs for the PreferencesDialog. Activating a tab will select a PreferencesTabPanel to be displayed to the user.
 * The actual tabs are implemented as radio buttons, styled to look like flat like a set of tabs.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import TProperty from '../../../axon/js/TProperty.js';
import Multilink from '../../../axon/js/Multilink.js';
import TinyProperty from '../../../axon/js/TinyProperty.js';
import TReadOnlyProperty from '../../../axon/js/TReadOnlyProperty.js';
import optionize, { EmptySelfOptions } from '../../../phet-core/js/optionize.js';
import globeSolidShape from '../../../sherpa/js/fontawesome-5/globeSolidShape.js';
import StringUtils from '../../../phetcommon/js/util/StringUtils.js';
import { FocusHighlightPath, HBox, HBoxOptions, KeyboardUtils, Line, Node, Path, PressListener, Rectangle, SceneryEvent, Text, Voicing } from '../../../scenery/js/imports.js';
import Tandem from '../../../tandem/js/Tandem.js';
import joist from '../joist.js';
import joistStrings from '../joistStrings.js';
import PreferencesDialog from './PreferencesDialog.js';
import PreferencesType from './PreferencesType.js';

type SelfOptions = EmptySelfOptions;

export type PreferencesTabsOptions = HBoxOptions;

class PreferencesTabs extends HBox {


  //  A reference to the selected and focusable tab content so that we can determine which
  // tab is next in order when cycling through with alternative input.
  private selectedButton: Node | null = null;
  private readonly selectedPanelProperty: TProperty<PreferencesType>;
  private readonly content: Tab[] = [];
  private readonly disposePreferencesTabs: () => void;

  public constructor( supportedTabs: PreferencesType[], selectedPanelProperty: TProperty<PreferencesType>, providedOptions?: PreferencesTabsOptions ) {
    const options = optionize<PreferencesTabsOptions, SelfOptions, HBoxOptions>()( {

      // pdom
      tagName: 'ul',
      ariaRole: 'tablist',
      groupFocusHighlight: true,
      spacing: 10
    }, providedOptions );

    super( options );

    this.selectedPanelProperty = selectedPanelProperty;

    const isTabSupported = ( preferencesType: PreferencesType ) => _.includes( supportedTabs, preferencesType );

    if ( isTabSupported( PreferencesType.OVERVIEW ) ) {
      this.content.push( new Tab( joistStrings.preferences.tabs.overview.titleStringProperty, selectedPanelProperty, PreferencesType.OVERVIEW ) );
    }
    if ( isTabSupported( PreferencesType.SIMULATION ) ) {
      this.content.push( new Tab( joistStrings.preferences.tabs.simulation.titleStringProperty, selectedPanelProperty, PreferencesType.SIMULATION ) );
    }
    if ( isTabSupported( PreferencesType.VISUAL ) ) {
      this.content.push( new Tab( joistStrings.preferences.tabs.visual.titleStringProperty, selectedPanelProperty, PreferencesType.VISUAL ) );
    }
    if ( isTabSupported( PreferencesType.AUDIO ) ) {
      this.content.push( new Tab( joistStrings.preferences.tabs.audio.titleStringProperty, selectedPanelProperty, PreferencesType.AUDIO ) );
    }
    if ( isTabSupported( PreferencesType.INPUT ) ) {

      // NOT translatable yet because these are not in any published sim and not viewable in-sim by translators.
      // When ready to publish, move to translatable strings.
      this.content.push( new Tab( new TinyProperty( 'Input' ), selectedPanelProperty, PreferencesType.INPUT ) );
    }
    if ( isTabSupported( PreferencesType.LOCALIZATION ) ) {

      // NOT translatable yet because these are not in any published sim and not viewable in-sim by translators.
      // When ready to publish, move to translatable strings.
      this.content.push( new Tab( new TinyProperty( 'Localization' ), selectedPanelProperty, PreferencesType.LOCALIZATION, {

        // Display a globe icon next to the localization label
        iconNode: new Path( globeSolidShape, {
          scale: 1 / 25, // by inspection
          fill: 'black'
        } )
      } ) );
    }

    this.children = this.content;

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

type TabOptions = {

  // An additional icon to display to the right of the label text for this tab.
  iconNode: Node | null;
};

/**
 * Inner class, a single tab for the list of tabs.
 * @mixes Voicing
 */
class Tab extends Voicing( Node ) {

  public readonly value: PreferencesType;
  private readonly disposeTab: () => void;

  /**
   * @param label - text label for the tab
   * @param property
   * @param value - PreferencesType shown when this tab is selected
   * @param providedOptions
   */
  public constructor( label: TReadOnlyProperty<string>, property: TProperty<PreferencesType>, value: PreferencesType, providedOptions?: TabOptions ) {

    const options = optionize<TabOptions>()( {
      iconNode: null
    }, providedOptions );

    // Visual contents for the tab, label Text and optional icon Node
    const textNode = new Text( label, PreferencesDialog.TAB_OPTIONS );
    const tabContents: Node[] = [ textNode ];
    if ( options.iconNode ) {
      tabContents.push( options.iconNode );
    }
    const contentsLayoutBox = new HBox( {
      children: tabContents,
      spacing: 8
    } );

    // background Node behind the tab contents for layout spacing and to increase the clickable area of the tab
    const backgroundNode = new Rectangle( {
      children: [ contentsLayoutBox ]
    } );
    contentsLayoutBox.boundsProperty.link( bounds => {
      backgroundNode.rectBounds = bounds.dilatedXY( 15, 10 );
    } );

    // Pink underline Node to indicate which tab is selected
    const underlineNode = new Line( 0, 0, 0, 0, {
      stroke: FocusHighlightPath.INNER_FOCUS_COLOR,
      lineWidth: 5
    } );
    contentsLayoutBox.boundsProperty.link( bounds => {
      underlineNode.x2 = bounds.width;
      underlineNode.centerTop = bounds.centerBottom.plusXY( 0, 5 );
    } );

    super( {
      children: [ backgroundNode, underlineNode ],
      cursor: 'pointer',

      // pdom
      tagName: 'button',
      ariaRole: 'tab',
      focusable: true,
      containerTagName: 'li'
    } );

    label.link( string => {
      this.innerContent = string;
    } );

    this.value = value;

    const voicingMultilink = Multilink.multilink( [ joistStrings.a11y.preferences.tabs.tabResponsePatternStringProperty, label ], ( pattern, labelString ) => {
      this.voicingNameResponse = StringUtils.fillIn( pattern, {
        title: labelString
      } );
    } );

    const pressListener = new PressListener( {
      press: () => {
        property.set( value );

        // speak the object response on activation
        this.voicingSpeakNameResponse();
      },

      // phet-io
      tandem: Tandem.OPT_OUT // We don't want to instrument components for preferences, https://github.com/phetsims/joist/issues/744#issuecomment-1196028362
    } );
    this.addInputListener( pressListener );

    Multilink.multilink( [ property, pressListener.isOverProperty ], ( selectedTab, isOver ) => {
      backgroundNode.opacity = selectedTab === value ? 1 :
                               isOver ? 0.8 :
                               0.6;

      this.focusable = selectedTab === value;
      underlineNode.visible = selectedTab === value;
    } );

    this.disposeTab = () => {
      pressListener.dispose();
      voicingMultilink.dispose();
    };
  }

  public override dispose(): void {
    this.disposeTab();
    super.dispose();
  }
}

joist.register( 'PreferencesTabs', PreferencesTabs );
export default PreferencesTabs;