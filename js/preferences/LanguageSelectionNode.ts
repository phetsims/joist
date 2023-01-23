// Copyright 2022-2023, University of Colorado Boulder

/**
 * Class for items of a LocalePanel. Locales shown in their localized name wrapped in a Rectangle for highlighting
 * and input listeners.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import joist from '../joist.js';
import { FireListener, HighlightOverlay, Rectangle, Text } from '../../../scenery/js/imports.js';
import localeInfoModule from '../../../chipper/js/data/localeInfoModule.js';
import Tandem from '../../../tandem/js/Tandem.js';
import PreferencesDialog from './PreferencesDialog.js';
import PhetColorScheme from '../../../scenery-phet/js/PhetColorScheme.js';
import Property from '../../../axon/js/Property.js';
import { Locale } from '../i18n/localeProperty.js';

export default class LanguageSelectionNode extends Rectangle {

  public readonly locale: Locale; // locale associated with this Node
  private readonly disposeLanguageSelectionNode: () => void;

  public constructor( localeProperty: Property<Locale>, locale: Locale ) {
    const text = new Text( localeInfoModule[ locale ].localizedName, {
      font: PreferencesDialog.CONTENT_FONT
    } );

    super( text.bounds.dilated( 5 ), {
      cursor: 'pointer',

      // So that the item is tab-navigable and can be activated with the FireListener
      tagName: 'button'
    } );
    text.center = this.center;
    this.addChild( text );

    this.locale = locale;

    const fireListener = new FireListener( {
      fire: () => {
        localeProperty.value = locale;
      },

      // Preferences components are not instrumented, see https://github.com/phetsims/joist/issues/744
      tandem: Tandem.OPT_OUT
    } );
    this.addInputListener( fireListener );

    // Will be unlinked with FireListener disposal
    fireListener.isOverProperty.link( isOver => {

      // makes the mouse interactive
      this.stroke = isOver ? HighlightOverlay.getInnerGroupHighlightColor() : null;
    } );

    const localeListener = ( selectedLocale: string ) => {

      // identifies the selected locale
      this.fill = selectedLocale === locale ? PhetColorScheme.PHET_LOGO_BLUE : null;
    };
    localeProperty.link( localeListener );

    this.disposeLanguageSelectionNode = () => {
      text.dispose();
      localeProperty.unlink( localeListener );
      this.removeInputListener( fireListener );
      fireListener.dispose();
    };
  }

  public override dispose(): void {
    this.disposeLanguageSelectionNode();
    super.dispose();
  }
}

joist.register( 'LanguageSelectionNode', LanguageSelectionNode );