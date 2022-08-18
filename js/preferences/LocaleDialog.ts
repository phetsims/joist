// Copyright 2022, University of Colorado Boulder

/**
 * A Dialog that allows you to change language of the simulation at runtime by controlling the localeProperty.
 *
 * This is a prototype and the UI for this is still being designed. See https://github.com/phetsims/joist/issues/814
 * for more information.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import joist from '../joist.js';
import { GridBox, Text } from '../../../scenery/js/imports.js';
import localeProperty from '../localeProperty.js';
import localeInfoModule from '../../../chipper/js/data/localeInfoModule.js';
import Dialog from '../../../sun/js/Dialog.js';
import BooleanProperty from '../../../axon/js/BooleanProperty.js';
import PreferencesDialog from './PreferencesDialog.js';
import BooleanRectangularStickyToggleButton from '../../../sun/js/buttons/BooleanRectangularStickyToggleButton.js';
import Tandem from '../../../tandem/js/Tandem.js';

class LocaleDialog extends Dialog {
  public constructor() {

    let minButtonWidth = 0;
    localeProperty.validValues!.forEach( locale => {

      // @ts-ignore
      const text = new Text( localeInfoModule[ locale ].localizedName, {
        font: PreferencesDialog.CONTENT_FONT
      } );

      if ( text.width > minButtonWidth ) {
        minButtonWidth = text.width;
      }
    } );

    const content = new GridBox( {
      xMargin: 10,
      yMargin: 3,
      xAlign: 'center',
      autoRows: 20,

      children: localeProperty.validValues!.map( locale => {

        // A prototype displaying TextPushButtons of matching width for each locale
        // @ts-ignore
        // return new TextPushButton( localeInfoModule[ locale ].localizedName, {
        //   font: PreferencesDialog.CONTENT_FONT,
        //   minWidth: minButtonWidth,
        //   maxWidth: minButtonWidth,
        //   listener: () => {
        //     localeProperty.value = locale;
        //   }
        //   tandem: Tandem.OPT_OUT
        // } );

        // A prototype displaying sticky toggle buttons for each language so it is clear which
        // one is selected.
        const toggleButtonProperty = new BooleanProperty( false );
        toggleButtonProperty.link( ( isPressed: boolean ) => {
          if ( isPressed ) {
            localeProperty.value = locale;
          }
        } );
        localeProperty.link( pressedLocale => {
          toggleButtonProperty.value = pressedLocale === locale;
        } );

        return new BooleanRectangularStickyToggleButton( toggleButtonProperty, {

          // @ts-ignore
          content: new Text( localeInfoModule[ locale ].localizedName, {
            font: PreferencesDialog.CONTENT_FONT
          } ),
          minWidth: minButtonWidth + 15, // Why is UK button a bit bigger?
          maxWidth: minButtonWidth,

          tandem: Tandem.OPT_OUT
        } );

        // A prototype displaying clickable text for each locale
        // // @ts-ignore
        // return new Text( localeInfoModule[ locale ].localizedName, {
        //   font: PreferencesDialog.CONTENT_FONT,
        //   cursor: 'pointer',
        //   inputListeners: [
        //     new FireListener( {
        //       fire: () => {
        //         localeProperty.value = locale;
        //       },
        //       tandem: Tandem.OPT_OUT
        //     } )
        //   ]
        // } );
      } )
    } );

    super( content, {
      title: new Text( 'Language', { font: PreferencesDialog.TITLE_FONT } ),
      ySpacing: 15
    } );
  }
}

joist.register( 'LocaleDialog', LocaleDialog );
export default LocaleDialog;