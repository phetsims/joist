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
import { FireListener, GridBox, Node, Text } from '../../../scenery/js/imports.js';
import localeProperty from '../localeProperty.js';
import localeInfoModule from '../../../chipper/js/data/localeInfoModule.js';
import Dialog from '../../../sun/js/Dialog.js';
import PreferencesDialog from './PreferencesDialog.js';
import Tandem from '../../../tandem/js/Tandem.js';
import Carousel from '../../../sun/js/Carousel.js';

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

    function createInteractiveLocales(): Node[] {
      return localeProperty.validValues!.map( locale => {

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
        // const toggleButtonProperty = new BooleanProperty( false );
        // toggleButtonProperty.link( ( isPressed: boolean ) => {
        //   if ( isPressed ) {
        //     localeProperty.value = locale;
        //   }
        // } );
        // localeProperty.link( pressedLocale => {
        //   toggleButtonProperty.value = pressedLocale === locale;
        // } );
        //
        // return new BooleanRectangularStickyToggleButton( toggleButtonProperty, {
        //
        //   // @ts-ignore
        //   content: new Text( localeInfoModule[ locale ].localizedName, {
        //     font: PreferencesDialog.CONTENT_FONT
        //   } ),
        //   minWidth: minButtonWidth + 15, // Why is UK button a bit bigger?
        //   maxWidth: minButtonWidth,
        //
        //   tandem: Tandem.OPT_OUT
        // } );

        // A prototype displaying clickable text for each locale
        // // @ts-ignore
        return new Text( localeInfoModule[ locale ].localizedName, {
          font: PreferencesDialog.CONTENT_FONT,
          cursor: 'pointer',
          inputListeners: [
            new FireListener( {
              fire: () => {
                localeProperty.value = locale;
              },
              tandem: Tandem.OPT_OUT
            } )
          ]
        } );
      } );
    }

    // A prototype where we show all languages in grid managed by a Carousel so that there aren't too many items
    // displayed at one time
    const chunckedLocaleItems = _.chunk( createInteractiveLocales(), 5 );
    const carouselItems = chunckedLocaleItems.map( localeItem => {
      return new GridBox( {
        xMargin: 10,
        yMargin: 3,
        xAlign: 'center',
        autoRows: 5,
        children: [ ...localeItem ]
      } );
    } );
    const carousel = new Carousel( carouselItems );
    const content = carousel;

    // A prototype where we show all languages in a grid of clickable text or buttons
    // const content = new GridBox( {
    //   xMargin: 10,
    //   yMargin: 3,
    //   xAlign: 'center',
    //   autoRows: 20,
    //
    //   children: createInteractiveLocales()
    // } );

    super( content, {
      title: new Text( 'Language', { font: PreferencesDialog.TITLE_FONT } ),
      ySpacing: 15
    } );
  }
}

joist.register( 'LocaleDialog', LocaleDialog );
export default LocaleDialog;