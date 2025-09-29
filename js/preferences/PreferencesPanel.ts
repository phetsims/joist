// Copyright 2022-2025, University of Colorado Boulder

/**
 * A superclass for a panel of content in the Preferences Dialog. Mostly responsible for visibility of panel content.
 *
 * @author Jesse Greenberg
 */

import Multilink from '../../../axon/js/Multilink.js';
import type { TReadOnlyProperty } from '../../../axon/js/TReadOnlyProperty.js';
import optionize, { EmptySelfOptions } from '../../../phet-core/js/optionize.js';
import type StrictOmit from '../../../phet-core/js/types/StrictOmit.js';
import Node, { type NodeOptions } from '../../../scenery/js/nodes/Node.js';
import Tandem from '../../../tandem/js/Tandem.js';
import joist from '../joist.js';
import type PreferencesType from './PreferencesType.js';

export type PreferencesPanelOptions = StrictOmit<NodeOptions, 'tagName' | 'labelTagName'>;

class PreferencesPanel extends Node {

  /**
   * @param preferencesType - PreferencesType for this panel
   * @param selectedTabProperty - Property representing the selected tab to be displayed.
   * @param tabVisibleProperty - Is the Tab for this panel invisible (so this panel should also be invisible)?
   * @param providedOptions
   */
  public constructor( preferencesType: PreferencesType, selectedTabProperty: TReadOnlyProperty<PreferencesType>, tabVisibleProperty: TReadOnlyProperty<boolean>, providedOptions?: PreferencesPanelOptions ) {
    const options = optionize<PreferencesPanelOptions, EmptySelfOptions, NodeOptions>()( {

      // pdom - The PreferencesPanel content is expected to be focusable. A special KeyboardListener moves focus
      // to the entire container, so it needs to have some PDOM representation.
      tagName: 'div',

      // don't instrument the Panel Node itself, though many subclasses make it required for subcomponents
      tandem: Tandem.OPT_OUT
    }, providedOptions );

    super( options );

    // This panel is only visible when selected tab is this preferencesType, but it can also be hidden explicitly by
    // PhET-iO.
    Multilink.multilink( [ selectedTabProperty, tabVisibleProperty ], ( selectedTab, tabVisible ) => {
      this.visible = selectedTab === preferencesType && tabVisible;
    } );
  }
}

joist.register( 'PreferencesPanel', PreferencesPanel );
export default PreferencesPanel;