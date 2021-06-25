// Copyright 2021, University of Colorado Boulder

/**
 * The content for the "General" tab in the PreferencesDialog. This is always present. Contains an introductory
 * sentence about accessibility features, and any simulation-specific settings if provided.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import merge from '../../../phet-core/js/merge.js';
import VoicingRichText from '../../../scenery/js/accessibility/voicing/nodes/VoicingRichText.js';
import VBox from '../../../scenery/js/nodes/VBox.js';
import joist from '../joist.js';
import joistStrings from '../joistStrings.js';
import PreferencesDialog from './PreferencesDialog.js';
import SimControlsTabPanelSection from './SimControlsPanelSection.js';

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
      tagName: 'div',
      labelTagName: 'h2',
      labelContent: 'General'
    } );

    const panelChildren = [];
    if ( generalConfiguration.simControls ) {
      panelChildren.push( new SimControlsTabPanelSection( generalConfiguration.simControls ) );
    }

    const introParagraphs = new VBox( { spacing: 10, align: 'left' } );
    const introTextOptions = { font: PreferencesDialog.CONTENT_FONT, lineWrap: 600, tagName: 'p' };
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