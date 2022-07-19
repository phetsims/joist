// Copyright 2021-2022, University of Colorado Boulder

/**
 * A section of content in a PreferencesPanel of the PreferencseDialog. Handles layout for the title of the section
 * and its content. The preferences panels are responsible for layout of multiple PreferencesTabPanelSections.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import optionize from '../../../phet-core/js/optionize.js';
import StrictOmit from '../../../phet-core/js/types/StrictOmit.js';
import { AlignGroup, Node, VBox, VBoxOptions } from '../../../scenery/js/imports.js';
import joist from '../joist.js';

type SelfOptions = {

  // if provided, will be the title for the section and content will be nested under the titleNode
  // indented with contentLeftMargin
  titleNode?: Node | null;

  // if provided, the content for the section which will be nested under the titleNode
  contentNode?: Node | null;

  // indentation for the contentNode (if provided) for layout as it is nested under the titleNode
  contentLeftMargin?: number;
};
type PreferencesPanelSectionOptions = SelfOptions & StrictOmit<VBoxOptions, 'children'>;

class PreferencesPanelSection extends VBox {
  private readonly disposePreferencesPanelSection: () => void;

  public constructor( providedOptions?: PreferencesPanelSectionOptions ) {
    const options = optionize<PreferencesPanelSectionOptions, SelfOptions, VBoxOptions>()( {
      spacing: 20,
      titleNode: null,
      contentNode: null,
      contentLeftMargin: 30
    }, providedOptions );

    // layout - supports the layout of contentNode nested under the titleNode with indentation
    const sectionAlignGroup = new AlignGroup( { matchVertical: false } );

    const sectionChildren = [];
    if ( options.titleNode ) {
      sectionChildren.push( sectionAlignGroup.createBox( options.titleNode, {
        xAlign: 'left'
      } ) );
    }
    if ( options.contentNode ) {
      sectionChildren.push( sectionAlignGroup.createBox( new Node( { children: [ options.contentNode ] } ), {
        leftMargin: options.contentLeftMargin,
        xAlign: 'left'
      } ) );
    }

    options.children = sectionChildren;
    super( options );

    this.disposePreferencesPanelSection = () => {
      sectionAlignGroup.dispose();
    };
  }

  /**
   * Disposal is necessary because this component uses AlignGroup.
   */
  public override dispose(): void {
    this.disposePreferencesPanelSection();
    super.dispose();
  }
}

joist.register( 'PreferencesPanelSection', PreferencesPanelSection );
export default PreferencesPanelSection;