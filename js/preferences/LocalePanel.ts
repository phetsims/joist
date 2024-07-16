// Copyright 2022-2023, University of Colorado Boulder

/**
 * A UI component that allows you to change language of the simulation at runtime by controlling the localeProperty.
 * It appears in the "Localization" tab of the Preferences dialog.
 *
 * This is a first iteration of this UI component. It may be improved in the future. See
 * https://github.com/phetsims/joist/issues/814 for more history.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import joist from '../joist.js';
import Panel from '../../../sun/js/Panel.js';
import { GridBox } from '../../../scenery/js/imports.js';
import Property from '../../../axon/js/Property.js';
import LanguageSelectionNode from './LanguageSelectionNode.js';
import { Locale } from '../i18n/localeProperty.js';
import JoistStrings from '../JoistStrings.js';
import StringUtils from '../../../phetcommon/js/util/StringUtils.js';

class LocalePanel extends Panel {
  public constructor( localeProperty: Property<Locale> ) {

    const locales = localeProperty.validValues!;

    // Sort these properly by their localized name (without using _.sortBy, since string comparison does not provide
    // a good sorting experience). See https://github.com/phetsims/joist/issues/965
    const sortedLocalizedNameLocales = locales.slice().sort( ( a, b ) => {
      const lowerCaseA = StringUtils.localeToLocalizedName( a ).toLowerCase();
      const lowerCaseB = StringUtils.localeToLocalizedName( b ).toLowerCase();
      return lowerCaseA.localeCompare( lowerCaseB, 'en-US', { sensitivity: 'base' } );
    } );

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
      children: sortedLocalizedNameLocales.map( locale => {
        return new LanguageSelectionNode( localeProperty, locale );
      } )
    } );

    super( content, {

      // pdom
      tagName: 'div',
      labelTagName: 'h3',
      labelContent: JoistStrings.preferences.tabs.localization.languageSelection.titleStringProperty,
      descriptionTagName: 'p',
      descriptionContent: JoistStrings.preferences.tabs.localization.languageSelection.descriptionStringProperty
    } );
  }
}

joist.register( 'LocalePanel', LocalePanel );
export default LocalePanel;