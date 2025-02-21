// Copyright 2022-2025, University of Colorado Boulder

/**
 * A UI component that allows you to change language of the simulation at runtime by controlling the localeProperty.
 * It appears in the "Localization" tab of the Preferences dialog.
 *
 * This is a first iteration of this UI component. It may be improved in the future. See
 * https://github.com/phetsims/joist/issues/814 for more history.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import GridBox from '../../../scenery/js/layout/nodes/GridBox.js';
import Panel from '../../../sun/js/Panel.js';
import { type LocaleProperty } from '../i18n/localeProperty.js';
import joist from '../joist.js';
import LanguageSelectionNode from './LanguageSelectionNode.js';

class LocalePanel extends Panel {
  public constructor( localeProperty: LocaleProperty ) {

    // All available locales aligned into a grid
    const content = new GridBox( {
      xMargin: 5,
      xAlign: 'left',
      autoRows: 15,

      // By inspection, safety net in case there are too many languages. Will scale down this panel without
      // the entire PreferencesDialog scaling down.
      maxWidth: 1000,

      // We don't want the GridBox to resize as selection highlights update with input
      resize: false,
      children: localeProperty.availableRuntimeLocales.map( locale => {
        return new LanguageSelectionNode( localeProperty, locale );
      } )
    } );

    super( content );
  }
}

joist.register( 'LocalePanel', LocalePanel );
export default LocalePanel;