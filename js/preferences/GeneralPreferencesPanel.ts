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
import PreferencesDialog from './PreferencesDialog.js';
import { GeneralModel } from './PreferencesModel.js';
import optionize, { EmptySelfOptions } from '../../../phet-core/js/optionize.js';
import PickRequired from '../../../phet-core/js/types/PickRequired.js';
import PreferencesPanelSection from './PreferencesPanelSection.js';
import Emitter from '../../../axon/js/Emitter.js';

type SelfOptions = EmptySelfOptions;
type GeneralPreferencesPanelOptions = SelfOptions & VBoxOptions & PickRequired<VBoxOptions, 'tandem'>;

class GeneralPreferencesPanel extends VBox {
  private readonly disposeGeneralPreferencesPanel: () => void;

  /**
   * @param generalModel - configuration for the Tab, see PreferencesModel for entries
   * @param [providedOptions]
   */
  public constructor( generalModel: GeneralModel, providedOptions?: GeneralPreferencesPanelOptions ) {
    const options = optionize<GeneralPreferencesPanelOptions, SelfOptions, VBoxOptions>()( {
      align: 'left',
      spacing: PreferencesPanelSection.DEFAULT_ITEM_SPACING,

      // pdom
      tagName: 'section',
      labelTagName: 'h2',
      labelContent: 'General',

      // phet-io
      // Still required, even though it is preferences because the general tab houses sim-specific elements that
      // should support customization. https://github.com/phetsims/joist/issues/744#issuecomment-1196028362
      tandem: Tandem.REQUIRED,
      phetioVisiblePropertyInstrumented: false
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
      new VoicingRichText( joistStrings.preferences.tabs.general.accessibilityIntroProperty, introTextOptions ),
      new VoicingRichText( joistStrings.preferences.tabs.general.moreAccessibilityProperty, introTextOptions )
    ];

    // Just the provided panel content with its own spacing
    const providedChildren: Node[] = [];

    const disposeEmitter = new Emitter();
    generalModel.customPreferences.forEach( customPreference => {
      const contentNode = customPreference.createContent( options.tandem );
      const preferencesPanelSection = new PreferencesPanelSection( { contentNode: contentNode } );
      disposeEmitter.addListener( () => {
        preferencesPanelSection.dispose();
        contentNode.dispose();
      } );
      providedChildren.push( preferencesPanelSection );
    } );

    if ( providedChildren.length > 0 ) {
      const providedContent = new VBox( { spacing: 30, align: 'left', children: providedChildren } );
      panelContent.push( providedContent );

      // If there was provided content for this panel, separate from intro statements
      panelContent.push( new HSeparator( introParagraphs.width ) );
    }

    panelContent.push( introParagraphs );

    this.children = panelContent;

    this.disposeGeneralPreferencesPanel = () => {
      disposeEmitter.emit();
    };
  }

  public override dispose(): void {
    this.disposeGeneralPreferencesPanel();
    super.dispose();
  }
}

joist.register( 'GeneralPreferencesPanel', GeneralPreferencesPanel );
export default GeneralPreferencesPanel;