// Copyright 2021-2022, University of Colorado Boulder

/**
 * The content for the "General" tab in the PreferencesDialog. This is always present. Contains an introductory
 * sentence about accessibility features, and any simulation-specific settings if provided.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import merge from '../../../phet-core/js/merge.js';
import { Node, VBox, VBoxOptions, VoicingRichText } from '../../../scenery/js/imports.js';
import HSeparator from '../../../sun/js/HSeparator.js';
import Tandem from '../../../tandem/js/Tandem.js';
import joist from '../joist.js';
import joistStrings from '../joistStrings.js';
import LocalizationControlsPanelSection from './LocalizationControlsPanelSection.js';
import PreferencesDialog from './PreferencesDialog.js';
import SimControlsPanelSection from './SimControlsPanelSection.js';
import { GeneralModel } from './PreferencesModel.js';
import optionize, { EmptySelfOptions } from '../../../phet-core/js/optionize.js';

// constants
const accessibilityIntroString = joistStrings.preferences.tabs.general.accessibilityIntro;
const moreAccessibilityString = joistStrings.preferences.tabs.general.moreAccessibility;

type SelfOptions = EmptySelfOptions;
type GeneralPreferencesPanelOptions = SelfOptions & VBoxOptions;

class GeneralPreferencesPanel extends VBox {
  private readonly disposeGeneralPreferencesPanel: () => void;

  /**
   * @param generalModel - configuration for the Tab, see PreferencesModel for entries
   * @param [providedOptions]
   */
  public constructor( generalModel: GeneralModel, providedOptions?: GeneralPreferencesPanelOptions ) {
    const options = optionize<GeneralPreferencesPanelOptions, SelfOptions, VBoxOptions>()( {
      align: 'left',
      spacing: 20,

      // pdom
      tagName: 'section',
      labelTagName: 'h2',
      labelContent: 'General',

      // phet-io
      tandem: Tandem.REQUIRED
    }, providedOptions );

    super( options );

    // All panel content collected in this final array
    const panelContent = [];

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

    // Just the provided panel content with its own spacing
    const providedChildren = [];

    // references to the controls and sections kept so that they can be disposed if necessary (mostly for phet-io)
    let simControls: Node | null = null;
    let localizationControls: Node | null = null;
    let simControlsPanelSection: Node | null = null;
    let localizationControlsPanelSection: Node | null = null;

    if ( generalModel.createSimControls ) {
      simControls = generalModel.createSimControls( options.tandem );
      simControlsPanelSection = new SimControlsPanelSection( simControls );
      providedChildren.push( simControlsPanelSection );
    }
    if ( generalModel.createLocalizationControls ) {
      localizationControls = generalModel.createLocalizationControls( options.tandem );
      localizationControlsPanelSection = new LocalizationControlsPanelSection( localizationControls );
      providedChildren.push( localizationControlsPanelSection );
    }

    if ( providedChildren.length > 0 ) {
      const providedContent = new VBox( { spacing: 30, align: 'left', children: providedChildren } );
      panelContent.push( providedContent );

      // If there was provided content for this panel, separate from intro statements
      panelContent.push( new HSeparator( introParagraphs.width ) );
    }

    panelContent.push( introParagraphs );

    this.children = panelContent;

    this.disposeGeneralPreferencesPanel = () => {
      simControls && simControls.dispose();
      localizationControls && localizationControls.dispose();

      simControlsPanelSection && simControlsPanelSection.dispose();
      localizationControlsPanelSection && localizationControlsPanelSection.dispose();
    };
  }

  public override dispose(): void {
    this.disposeGeneralPreferencesPanel();
    super.dispose();
  }
}

joist.register( 'GeneralPreferencesPanel', GeneralPreferencesPanel );
export default GeneralPreferencesPanel;