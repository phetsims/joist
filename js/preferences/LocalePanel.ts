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
import Panel from '../../../sun/js/Panel.js';
import { FireListener, GridBox, Text } from '../../../scenery/js/imports.js';
import localeInfoModule from '../../../chipper/js/data/localeInfoModule.js';
import localeProperty from '../localeProperty.js';
import Tandem from '../../../tandem/js/Tandem.js';
import PreferencesDialog from './PreferencesDialog.js';

class LocalePanel extends Panel {
  public constructor() {

    // All available locales aligned into a grid
    const content = new GridBox( {
      xMargin: 10,
      yMargin: 3,
      xAlign: 'left',
      autoRows: 15,
      children: localeProperty.validValues!.map( locale => {

        // @ts-ignore - "Element implicitly has any type" because string cannot be used to access a type
        return new Text( localeInfoModule[ locale ].localizedName, {
          font: PreferencesDialog.CONTENT_FONT,
          cursor: 'pointer',
          inputListeners: [
            new FireListener( {
              fire: () => {
                localeProperty.value = locale;
              },

              // TODO: PhET-iO instrumentation? https://github.com/phetsims/joist/issues/814
              tandem: Tandem.OPT_OUT
            } )
          ]
        } );
      } )
    } );

    super( content );
  }
}

joist.register( 'LocalePanel', LocalePanel );
export default LocalePanel;