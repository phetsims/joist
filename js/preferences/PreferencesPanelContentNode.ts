// Copyright 2022, University of Colorado Boulder

/**
 * Parent class for layout and styling of content nodes that can be passed through to
 * PreferencesPanelSection.
 *
 * @author Marla Schulz (PhET Interactive Simulations)
 *
 */

import joist from '../joist.js';
import { Node, VBox } from '../../../scenery/js/imports.js';
import optionize from '../../../phet-core/js/optionize.js';
import Panel, { PanelOptions } from '../../../sun/js/Panel.js';

type SelfOptions = {
  content: Array<Node>;
};

type PreferencesPanelContentNodeOptions = SelfOptions & PanelOptions;
export default class PreferencesPanelContentNode extends Panel {

  public constructor( providedOptions: PreferencesPanelContentNodeOptions ) {

    const options = optionize<PreferencesPanelContentNodeOptions, SelfOptions, PanelOptions>()( {
      fill: '#B2B2B2'
    }, providedOptions );

    const contentVBox = new VBox( { children: options.content, spacing: 10 } );

    super( contentVBox, options );
  }
}

joist.register( 'PreferencesPanelContentNode', PreferencesPanelContentNode );