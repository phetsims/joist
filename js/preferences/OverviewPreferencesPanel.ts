// Copyright 2022, University of Colorado Boulder

/**
 * The content for the "Overview" panel of the Preferences dialog. It includes an introduction blurb
 * about features available in Preferences. This panel is always present in the dialog.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import merge from '../../../phet-core/js/merge.js';
import { VBox, VoicingRichText } from '../../../scenery/js/imports.js';
import isLeftToRightProperty from '../isLeftToRightProperty.js';
import joist from '../joist.js';
import joistStrings from '../joistStrings.js';
import PreferencesDialog from './PreferencesDialog.js';

class OverviewPreferencesPanel extends VBox {
  private readonly disposeOverviewPreferencesPanel: () => void;

  public constructor() {
    const introTextOptions = merge( {}, PreferencesDialog.PANEL_SECTION_CONTENT_OPTIONS, {

      // using lineWrap instead of default maxWidth for content
      maxWidth: null,
      lineWrap: 600,
      tagName: 'p'
    } );

    const introParagraphsTexts = [
      new VoicingRichText( joistStrings.preferences.tabs.general.accessibilityIntroStringProperty, introTextOptions ),
      new VoicingRichText( joistStrings.preferences.tabs.general.moreAccessibilityStringProperty, introTextOptions )
    ];

    super( { spacing: 10, children: introParagraphsTexts } );

    const leftToRightListener = ( isLTR: boolean ) => {
      introParagraphsTexts.forEach( text => {
        const align = isLTR ? 'left' : 'right';
        text.align = align;
        this.align = align;
      } );
    };
    isLeftToRightProperty.link( leftToRightListener );

    this.disposeOverviewPreferencesPanel = () => {
      isLeftToRightProperty.unlink( leftToRightListener );
    };
  }

  public override dispose(): void {
    this.disposeOverviewPreferencesPanel();
    super.dispose();
  }
}

joist.register( 'OverviewPreferencesPanel', OverviewPreferencesPanel );
export default OverviewPreferencesPanel;
