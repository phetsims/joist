// Copyright 2022-2023, University of Colorado Boulder

/**
 * A single tab of the PreferencesDialog. Selecting this PreferencesTab makes its associated PreferencesPanel
 * visible in the dialog.
 *
 * @author Jesse Greenberg
 */

import joist from '../joist.js';
import { FocusHighlightPath, HBox, Line, Node, NodeOptions, PressListener, Rectangle, Text, Voicing, VoicingOptions } from '../../../scenery/js/imports.js';
import PreferencesType from './PreferencesType.js';
import TReadOnlyProperty from '../../../axon/js/TReadOnlyProperty.js';
import TProperty from '../../../axon/js/TProperty.js';
import optionize from '../../../phet-core/js/optionize.js';
import PreferencesDialog from './PreferencesDialog.js';
import Multilink from '../../../axon/js/Multilink.js';
import JoistStrings from '../JoistStrings.js';
import Tandem from '../../../tandem/js/Tandem.js';
import PickRequired from '../../../phet-core/js/types/PickRequired.js';
import StrictOmit from '../../../phet-core/js/types/StrictOmit.js';

import PatternStringProperty from '../../../axon/js/PatternStringProperty.js';

type SelfOptions = {

  // An additional icon to display to the right of the label text for this tab.
  iconNode?: Node | null;
};
type PreferencesTabOptions = SelfOptions & PickRequired<NodeOptions, 'tandem'> & StrictOmit<NodeOptions, 'children'>;
type ParentOptions = NodeOptions & VoicingOptions;

class PreferencesTab extends Voicing( Node ) {

  // The value of this tab, when this tab is Pressed, the panel of this PreferencesType will be displayed.
  public readonly value: PreferencesType;

  // garbage collection
  private readonly disposePreferencesTab: () => void;

  /**
   * @param labelProperty - text label for the tab
   * @param property
   * @param value - PreferencesType shown when this tab is selected
   * @param providedOptions
   */
  public constructor( labelProperty: TReadOnlyProperty<string>, property: TProperty<PreferencesType>, value: PreferencesType, providedOptions: PreferencesTabOptions ) {

    const options = optionize<PreferencesTabOptions, SelfOptions, ParentOptions>()( {
      iconNode: null,

      phetioFeatured: true,
      visiblePropertyOptions: {
        phetioFeatured: true
      },
      cursor: 'pointer',

      // pdom
      tagName: 'button',
      innerContent: labelProperty,
      ariaRole: 'tab',
      focusable: true,
      containerTagName: 'li',
      containerAriaRole: 'presentation'
    }, providedOptions );

    // Visual contents for the tab, label Text and optional icon Node
    const text = new Text( labelProperty, PreferencesDialog.TAB_OPTIONS );
    const tabContents: Node[] = [ text ];
    if ( options.iconNode ) {
      tabContents.push( options.iconNode );
    }
    const contentsBox = new HBox( {
      children: tabContents,
      spacing: 8
    } );

    // background Node behind the tab contents for layout spacing and to increase the clickable area of the tab
    const backgroundNode = new Rectangle( {
      children: [ contentsBox ]
    } );

    // Pink underline Node to indicate which tab is selected
    const underlineNode = new Line( 0, 0, 0, 0, {
      stroke: FocusHighlightPath.INNER_FOCUS_COLOR,
      lineWidth: 5
    } );
    contentsBox.boundsProperty.link( bounds => {

      // margin around the tabContents
      backgroundNode.rectBounds = bounds.dilatedXY( 15, 10 );

      underlineNode.x2 = bounds.width;

      // spacing between the underline and the tabContents
      underlineNode.centerTop = bounds.centerBottom.plusXY( 0, 5 );
    } );

    super( options );
    this.children = [ backgroundNode, underlineNode ];

    this.value = value;

    const voicingPatternStringProperty = new PatternStringProperty( JoistStrings.a11y.preferences.tabs.tabResponsePatternStringProperty, {
      title: labelProperty
    } );
    this.voicingNameResponse = voicingPatternStringProperty;

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

    const tabInputMultilink = Multilink.multilink( [ property, pressListener.isOverProperty ], ( selectedTab, isOver ) => {
      backgroundNode.opacity = selectedTab === value ? 1 :
                               isOver ? 0.8 :
                               0.6;

      this.focusable = selectedTab === value;
      underlineNode.visible = selectedTab === value;
    } );

    this.disposePreferencesTab = () => {
      tabInputMultilink.dispose();
      pressListener.dispose();
      voicingPatternStringProperty.dispose();
      contentsBox.dispose();
      backgroundNode.dispose();
      text.dispose();
    };
  }

  public override dispose(): void {
    this.disposePreferencesTab();
    super.dispose();
  }
}


joist.register( 'PreferencesTab', PreferencesTab );
export default PreferencesTab;