// Copyright 2022-2025, University of Colorado Boulder

/**
 * A single tab of the PreferencesDialog. Selecting this PreferencesTab makes its associated PreferencesPanel
 * visible in the dialog.
 *
 * @author Jesse Greenberg
 */

import Multilink from '../../../axon/js/Multilink.js';

import PatternStringProperty from '../../../axon/js/PatternStringProperty.js';
import type TProperty from '../../../axon/js/TProperty.js';
import type TReadOnlyProperty from '../../../axon/js/TReadOnlyProperty.js';
import optionize from '../../../phet-core/js/optionize.js';
import type PickRequired from '../../../phet-core/js/types/PickRequired.js';
import type StrictOmit from '../../../phet-core/js/types/StrictOmit.js';
import HighlightPath from '../../../scenery/js/accessibility/HighlightPath.js';
import Voicing, { type VoicingOptions } from '../../../scenery/js/accessibility/voicing/Voicing.js';
import HBox from '../../../scenery/js/layout/nodes/HBox.js';
import PressListener from '../../../scenery/js/listeners/PressListener.js';
import Line from '../../../scenery/js/nodes/Line.js';
import Node, { type NodeOptions } from '../../../scenery/js/nodes/Node.js';
import Rectangle from '../../../scenery/js/nodes/Rectangle.js';
import Text from '../../../scenery/js/nodes/Text.js';
import Tandem from '../../../tandem/js/Tandem.js';
import joist from '../joist.js';
import JoistStrings from '../JoistStrings.js';
import PreferencesDialogConstants from './PreferencesDialogConstants.js';
import type PreferencesType from './PreferencesType.js';

type SelfOptions = {

  // An additional icon to display to the right of the label text for this tab.
  iconNode?: Node | null;

  // X dilation for tab pointer areas
  pointerAreaXDilation?: number;
};
type PreferencesTabOptions = SelfOptions & PickRequired<NodeOptions, 'tandem'> & StrictOmit<NodeOptions, 'children'>;
type ParentOptions = NodeOptions & VoicingOptions;

class PreferencesTab extends Voicing( Node ) {

  // The value of this tab, when this tab is Pressed, the panel of this PreferencesType will be displayed.
  public readonly value: PreferencesType;

  /**
   * @param labelProperty - text label for the tab
   * @param property
   * @param value - PreferencesType shown when this tab is selected
   * @param providedOptions
   */
  public constructor( labelProperty: TReadOnlyProperty<string>, property: TProperty<PreferencesType>, value: PreferencesType, providedOptions: PreferencesTabOptions ) {

    const options = optionize<PreferencesTabOptions, SelfOptions, ParentOptions>()( {
      iconNode: null,
      pointerAreaXDilation: 0,

      phetioFeatured: true,
      visiblePropertyOptions: {
        phetioFeatured: true
      },
      cursor: 'pointer',

      // pdom
      tagName: 'button',
      accessibleName: labelProperty,
      ariaRole: 'tab',
      focusable: true,
      containerTagName: 'li',
      containerAriaRole: 'presentation'
    }, providedOptions );

    // Visual contents for the tab, label Text and optional icon Node
    const text = new Text( labelProperty, PreferencesDialogConstants.TAB_OPTIONS );
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
      stroke: HighlightPath.INNER_FOCUS_COLOR,
      lineWidth: 5
    } );

    super( options );
    this.children = [ backgroundNode, underlineNode ];

    contentsBox.boundsProperty.link( bounds => {

      // margin around the tabContents
      backgroundNode.rectBounds = bounds.dilatedXY( 15, 10 );

      underlineNode.x2 = bounds.width;

      // spacing between the underline and the tabContents
      underlineNode.centerTop = bounds.centerBottom.plusXY( 0, 5 );

      this.mouseArea = this.localBounds.dilatedX( options.pointerAreaXDilation );
      this.touchArea = this.mouseArea;
    } );

    this.value = value;

    const voicingPatternStringProperty = new PatternStringProperty( JoistStrings.a11y.preferences.tabs.tabResponsePatternStringProperty, {
      title: labelProperty
    }, { tandem: Tandem.OPT_OUT } );
    this.voicingNameResponse = voicingPatternStringProperty;

    const pressListener = new PressListener( {
      press: () => {
        property.set( value );

        // With a screen reader virtual cursor, you can click on a tab button that is removed from the traversal order.
        // The device tries to focus the new button before clicking it, but it is not focusable yet so scenery blocks it.
        // Put focus on the button manually after the property has been set and the tab is made focusable.
        this.focus();

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
  }
}


joist.register( 'PreferencesTab', PreferencesTab );
export default PreferencesTab;