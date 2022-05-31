// Copyright 2021-2022, University of Colorado Boulder

/**
 * Button in the NavigationBar that opens the PreferencesDialog.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import Property from '../../../axon/js/Property.js';
import OmitStrict from '../../../phet-core/js/types/OmitStrict.js';
import optionize from '../../../phet-core/js/optionize.js';
import { Color, Path } from '../../../scenery/js/imports.js';
import userCogSolidShape from '../../../sherpa/js/fontawesome-5/userCogSolidShape.js';
import Dialog from '../../../sun/js/Dialog.js';
import PhetioCapsule from '../../../tandem/js/PhetioCapsule.js';
import Tandem from '../../../tandem/js/Tandem.js';
import joist from '../joist.js';
import JoistButton, { JoistButtonOptions } from '../JoistButton.js';
import joistStrings from '../joistStrings.js';
import PreferencesDialog from './PreferencesDialog.js';
import PreferencesManager from './PreferencesManager.js';

type NavigationBarPreferencesButtonOptions = OmitStrict<JoistButtonOptions, 'listener'>;

class NavigationBarPreferencesButton extends JoistButton {

  constructor( preferencesModel: PreferencesManager, backgroundColorProperty: Property<Color>, providedOptions: NavigationBarPreferencesButtonOptions ) {

    const options = optionize<NavigationBarPreferencesButtonOptions, {}, JoistButtonOptions>()( {
      tandem: Tandem.REQUIRED
    }, providedOptions );

    const icon = new Path( userCogSolidShape, {
      maxWidth: 25
    } );

    // @ts-ignore TODO https://github.com/phetsims/joist/issues/795 - until Popupable is in Typescript, TS doesn't know about the hierarchy it seems.
    const preferencesDialogCapsule = new PhetioCapsule( tandem => {
      return new PreferencesDialog( preferencesModel, {
        tandem: tandem
      } );
    }, [], {
      tandem: options.tandem.createTandem( 'preferencesDialogCapsule' ),
      phetioType: PhetioCapsule.PhetioCapsuleIO( Dialog.DialogIO )
    } );

    super( icon, backgroundColorProperty, options.tandem, {
      listener: () => {
        const preferencesDialog = preferencesDialogCapsule.getElement();

        // @ts-ignore
        preferencesDialog.show();

        // @ts-ignore
        preferencesDialog.focusSelectedTab();
      },
      highlightExtensionWidth: 5,
      highlightExtensionHeight: 10,

      // pdom
      innerContent: joistStrings.preferences.title,
      positionInPDOM: true,

      // voicing
      voicingNameResponse: joistStrings.preferences.title
    } );

    // change the icon so that it is visible when the background changes from dark to light
    backgroundColorProperty.link( backgroundColor => {
      icon.fill = backgroundColor.equals( Color.BLACK ) ? 'white' : 'black';
    } );

    // pdom - Signal to screen readers that the button will open a dialog. For some reason, this also seems to
    // prevent a bug in iOS Safari where two events are dispatched to the screen on activation instead of one.
    // The result was that one press would open the dialog and the second buggy press would immediately close it.
    // Make sure that the dialog can be opened on iOS Safari before removing this.
    this.setPDOMAttribute( 'aria-haspopup', true );
  }
}

joist.register( 'NavigationBarPreferencesButton', NavigationBarPreferencesButton );
export default NavigationBarPreferencesButton;