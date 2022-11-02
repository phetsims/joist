// Copyright 2022, University of Colorado Boulder

/**
 * The content for the "Overview" panel of the Preferences dialog. It includes an introduction blurb
 * about features available in Preferences. This panel is always present in the dialog.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import TReadOnlyProperty from '../../../axon/js/TReadOnlyProperty.js';
import merge from '../../../phet-core/js/merge.js';
import { VBox, VoicingRichText } from '../../../scenery/js/imports.js';
import isLeftToRightProperty from '../i18n/isLeftToRightProperty.js';
import joist from '../joist.js';
import JoistStrings from '../JoistStrings.js';
import PreferencesDialog from './PreferencesDialog.js';
import PreferencesPanel from './PreferencesPanel.js';
import PreferencesType from './PreferencesType.js';

class OverviewPreferencesPanel extends PreferencesPanel {
  private readonly disposeOverviewPreferencesPanel: () => void;

  public constructor( selectedTabProperty: TReadOnlyProperty<PreferencesType>, tabVisibleProperty: TReadOnlyProperty<boolean> ) {
    super( PreferencesType.OVERVIEW, selectedTabProperty, tabVisibleProperty );

    const introTextOptions = merge( {}, PreferencesDialog.PANEL_SECTION_CONTENT_OPTIONS, {

      // using lineWrap instead of default maxWidth for content
      maxWidth: null,
      lineWrap: 600,
      maxHeight: 600,
      tagName: 'p'
    } );

    const introParagraphsTexts = [

      // These string keys go through preferences.tabs.general because they used to
      // live in that tab. But now we cannot rename the string keys.
      new VoicingRichText( JoistStrings.preferences.tabs.general.accessibilityIntroStringProperty, introTextOptions ),
      new VoicingRichText( JoistStrings.preferences.tabs.general.moreAccessibilityStringProperty, introTextOptions )
    ];

    const panelContent = new VBox( { spacing: 10, children: introParagraphsTexts } );
    this.addChild( panelContent );

    const leftToRightListener = ( isLTR: boolean ) => {
      introParagraphsTexts.forEach( text => {
        const align = isLTR ? 'left' : 'right';
        text.align = align;
        panelContent.align = align;
      } );
    };
    isLeftToRightProperty.link( leftToRightListener );

    this.disposeOverviewPreferencesPanel = () => {
      isLeftToRightProperty.unlink( leftToRightListener );
      panelContent.dispose();
      introParagraphsTexts.forEach( introParagraphsText => introParagraphsText.dispose() );
    };
  }

  public override dispose(): void {
    this.disposeOverviewPreferencesPanel();
    super.dispose();
  }
}

joist.register( 'OverviewPreferencesPanel', OverviewPreferencesPanel );
export default OverviewPreferencesPanel;
