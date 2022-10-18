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
import { FireListener, GridBox, HighlightOverlay, Rectangle, Text } from '../../../scenery/js/imports.js';
import localeInfoModule from '../../../chipper/js/data/localeInfoModule.js';
import Tandem from '../../../tandem/js/Tandem.js';
import PreferencesDialog from './PreferencesDialog.js';
import PhetColorScheme from '../../../scenery-phet/js/PhetColorScheme.js';
import Property from '../../../axon/js/Property.js';

class LocalePanel extends Panel {
  private readonly disposeLocalePanel: () => void;

  public constructor( localeProperty: Property<string> ) {

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

        // @ts-ignore - "Element implicitly has any type" because string cannot be used to access a type
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

/**
 * Class for items of the Panel. Locales shown in their localized name wrapped in a Rectangle for highlighting
 * and input listeners.
 */
export class LanguageSelectionNode extends Rectangle {
  private readonly disposeLanguageSelectionNode: () => void;

  public constructor( localeProperty: Property<string>, locale: string ) {

    // @ts-ignore - "Element implicitly has any type" because string cannot be used to access a type
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

joist.register( 'LocalePanel', LocalePanel );
export default LocalePanel;