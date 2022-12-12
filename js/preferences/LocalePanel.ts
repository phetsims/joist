// Copyright 2022, University of Colorado Boulder

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

class LocalePanel extends Panel {
  private readonly disposeLocalePanel: () => void;

  public constructor( localeProperty: Property<Locale> ) {

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
      children: localeProperty.validValues!.map( locale => {
        return new LanguageSelectionNode( localeProperty, locale );
      } )
    } );

    super( content );

    this.disposeLocalePanel = () => {
      content.children.forEach( languageSelectionNode => {
        languageSelectionNode.dispose();
      } );
      content.dispose();
    };
  }

  public override dispose(): void {
    this.disposeLocalePanel();
    super.dispose();
  }
}

joist.register( 'LocalePanel', LocalePanel );
export default LocalePanel;