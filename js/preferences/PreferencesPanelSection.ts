// Copyright 2021-2023, University of Colorado Boulder

/**
 * A section of content in a PreferencesPanel of the PreferencseDialog. Handles layout for the title of the section
 * and its content. The preferences panels are responsible for layout of multiple PreferencesTabPanelSections.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import optionize, { combineOptions } from '../../../phet-core/js/optionize.js';
import StrictOmit from '../../../phet-core/js/types/StrictOmit.js';
import { AlignGroup, Node, NodeOptions, VBox, VBoxOptions } from '../../../scenery/js/imports.js';
import joist from '../joist.js';
import PreferencesDialog from './PreferencesDialog.js';

type SelfOptions = {

  // if provided, will be the title for the section and content will be nested under the titleNode
  // indented with contentLeftMargin
  titleNode?: Node | null;

  // if provided, the content for the section which will be nested under the titleNode
  contentNode?: Node | null;

  contentNodeOptions?: StrictOmit<NodeOptions, 'children'>;

  // indentation for the contentNode (if provided) for layout as it is nested under the titleNode
  contentLeftMargin?: number;
};
export type PreferencesPanelSectionOptions = SelfOptions & StrictOmit<VBoxOptions, 'children'>;

class PreferencesPanelSection extends VBox {
  private readonly disposePreferencesPanelSection: () => void;

  public constructor( providedOptions?: PreferencesPanelSectionOptions ) {
    const options = optionize<PreferencesPanelSectionOptions, SelfOptions, VBoxOptions>()( {
      spacing: PreferencesDialog.CONTENT_SPACING,
      titleNode: null,
      contentNode: null,
      contentNodeOptions: {},
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
      const contentNodeOptions = combineOptions<NodeOptions>( { children: [ options.contentNode ] }, options.contentNodeOptions );
      sectionChildren.push( sectionAlignGroup.createBox( new Node( contentNodeOptions ), {
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