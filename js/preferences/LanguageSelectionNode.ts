// Copyright 2022-2024, University of Colorado Boulder

/**
 * Class for items of a LocalePanel. Locales shown in their localized name wrapped in a Rectangle for highlighting
 * and input listeners.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import Property from '../../../axon/js/Property.js';
import StringUtils from '../../../phetcommon/js/util/StringUtils.js';
import PhetColorScheme from '../../../scenery-phet/js/PhetColorScheme.js';
import { Color, FireListener, HighlightOverlay, Rectangle, Text } from '../../../scenery/js/imports.js';
import sharedSoundPlayers from '../../../tambo/js/sharedSoundPlayers.js';
import Tandem from '../../../tandem/js/Tandem.js';
import { Locale } from '../i18n/localeProperty.js';
import joist from '../joist.js';
import JoistStrings from '../JoistStrings.js';
import PreferencesDialog from './PreferencesDialog.js';

export default class LanguageSelectionNode extends Rectangle {

  public readonly locale: Locale; // locale associated with this Node

  public constructor( localeProperty: Property<Locale>, locale: Locale ) {

    // Wrap it with embedding marks to ensure it displays correctly, see https://github.com/phetsims/chipper/issues/1379
    const wrappedLocaleString = StringUtils.localeToLocalizedName( locale );

    // Include the locale code when running with ?dev.
    const string = phet.chipper.queryParameters.dev ?
                   StringUtils.wrapLTR( `${wrappedLocaleString} (${locale})` ) :
                   wrappedLocaleString;

    // The english name of the locale is reported for accessibility because PDOM strings are not translatable.
    // If you use the localized name, it might change the screen reader voice.
    const localeData = phet.chipper.localeData[ locale ];
    assert && assert( localeData, `No localeData for ${locale}` );
    const englishLocaleString = localeData.englishName;

    const text = new Text( string, {
      font: PreferencesDialog.CONTENT_FONT
    } );

    super( text.bounds.dilated( 5 ), {
      cursor: 'pointer',

      // pdom
      tagName: 'button',
      innerContent: englishLocaleString
    } );
    text.center = this.center;
    this.addChild( text );

    this.locale = locale;
    const pushButtonSoundPlayer = sharedSoundPlayers.get( 'pushButton' );

    const fireListener = new FireListener( {
      fire: () => {
        localeProperty.value = locale;

        pushButtonSoundPlayer.play();
        this.alertDescriptionUtterance( StringUtils.fillIn(
          JoistStrings.a11y.preferences.tabs.localization.languageSelection.languageChangeResponsePatternStringProperty, {
            language: englishLocaleString
          } )
        );
      },

      // Preferences components are not instrumented, see https://github.com/phetsims/joist/issues/744
      tandem: Tandem.OPT_OUT
    } );
    this.addInputListener( fireListener );

    fireListener.isOverProperty.link( isOver => {

      // makes the mouse interactive, keep the same dimensions so the layout will not change
      this.stroke = isOver ? HighlightOverlay.getInnerGroupHighlightColor() : Color.TRANSPARENT;
    } );

    const localeListener = ( selectedLocale: string ) => {

      // identifies the selected locale
      this.fill = selectedLocale === locale ? PhetColorScheme.PHET_LOGO_BLUE : null;
    };
    localeProperty.link( localeListener );
  }
}

joist.register( 'LanguageSelectionNode', LanguageSelectionNode );