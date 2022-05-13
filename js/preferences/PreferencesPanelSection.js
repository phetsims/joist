// Copyright 2021-2022, University of Colorado Boulder

/**
 * A section of content in a PreferencesPanel of the PreferencseDialog. Handles layout for the title of the section
 * and its content. The preferences panels are responsible for layout of multiple PreferencesTabPanelSections.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import merge from '../../../phet-core/js/merge.js';
import { AlignGroup, Node, VBox } from '../../../scenery/js/imports.js';
import joist from '../joist.js';

class PreferencesPanelSection extends VBox {

  constructor( options ) {
    options = merge( {

      // VBox options
      spacing: 20,

      // section options
      // {null|Node} - if provided, will be the title for the section and content will be nested under the titleNode
      // indented with contentLeftMargin
      titleNode: null,

      // {null|Node} - if provided, the content for the section which will be nested under the titleNode
      contentNode: null,

      // {number} - indentation for the contentNode (if provided) for layout as it is nested under the titleNode
      contentLeftMargin: 30
    }, options );
    assert && assert( options.children === undefined, 'PreferencesPanelSection sets children' );

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
  }
}

joist.register( 'PreferencesPanelSection', PreferencesPanelSection );
export default PreferencesPanelSection;