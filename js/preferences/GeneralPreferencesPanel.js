// Copyright 2021, University of Colorado Boulder

/**
 * The content for the "General" tab in the PreferencesDialog. This is always present. Contains an introductory
 * sentence about accessibility features, and any simulation-specific settings if provided.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import merge from '../../../phet-core/js/merge.js';
import { VoicingRichText } from '../../../scenery/js/imports.js';
import { VBox } from '../../../scenery/js/imports.js';
import joist from '../joist.js';
import joistStrings from '../joistStrings.js';
import PreferencesDialog from './PreferencesDialog.js';
import SimControlsPanelSection from './SimControlsPanelSection.js';

// constants
const accessibilityIntroString = joistStrings.preferences.tabs.general.accessibilityIntro;
const moreAccessibilityString = joistStrings.preferences.tabs.general.moreAccessibility;

class GeneralPreferencesPanel extends VBox {

  /**
   * @param {Object} generalConfiguration - configuration for the Tab, see PreferencesConfiguration for entries
   */
  constructor( generalConfiguration ) {
    super( {
      align: 'left',
      spacing: 40,

      // pdom
      tagName: 'section',
      labelTagName: 'h2',
      labelContent: 'General'
    } );

    const panelChildren = [];
    if ( generalConfiguration.simControls ) {
      panelChildren.push( new SimControlsPanelSection( generalConfiguration.simControls ) );
    }

    const introParagraphs = new VBox( { spacing: 10, align: 'left' } );
    const introTextOptions = merge( {}, PreferencesDialog.PANEL_SECTION_CONTENT_OPTIONS, {

      // using lineWrap instead of default maxWidth for content
      maxWidth: null,
      lineWrap: 600,
      tagName: 'p'
    } );
    introParagraphs.children = [
      new VoicingRichText( accessibilityIntroString, merge( {
        innerContent: accessibilityIntroString
      }, introTextOptions ) ),
      new VoicingRichText( moreAccessibilityString, merge( {
        innerContent: moreAccessibilityString
      }, introTextOptions ) )
    ];
    panelChildren.push( introParagraphs );

    this.children = panelChildren;
  }
}

joist.register( 'GeneralPreferencesPanel', GeneralPreferencesPanel );
export default GeneralPreferencesPanel;