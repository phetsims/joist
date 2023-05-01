// Copyright 2016-2023, University of Colorado Boulder

/**
 * The button that pops up the Keyboard Help Dialog, which appears in the right side of the navbar and
 * to the left of the PhetButton.
 *
 * @author Jesse Greenberg
 */

import Property from '../../axon/js/Property.js';
import optionize, { EmptySelfOptions } from '../../phet-core/js/optionize.js';
import { Color, Image } from '../../scenery/js/imports.js';
import Dialog from '../../sun/js/Dialog.js';
import PhetioCapsule from '../../tandem/js/PhetioCapsule.js';
import keyboardIconOnWhite_png from '../images/keyboardIconOnWhite_png.js'; // on a white navbar
import keyboardIcon_png from '../images/keyboardIcon_png.js'; // on a black navbar
import joist from './joist.js';
import JoistButton, { JoistButtonOptions } from './JoistButton.js';
import JoistStrings from './JoistStrings.js';
import KeyboardHelpDialog from './KeyboardHelpDialog.js';
import { AnyScreen } from './Screen.js';
import PickRequired from '../../phet-core/js/types/PickRequired.js';
import TReadOnlyProperty from '../../axon/js/TReadOnlyProperty.js';

// constants
const keyboardShortcutsStringProperty = JoistStrings.a11y.keyboardHelp.keyboardShortcutsStringProperty;
const ICON_DESIRED_HEIGHT = 17.085; // empirically determined

type SelfOptions = EmptySelfOptions;
export type KeyboardHelpButtonOptions = SelfOptions & PickRequired<JoistButtonOptions, 'tandem'> & Pick<JoistButtonOptions, 'pointerAreaDilationX' | 'pointerAreaDilationY'>;

class KeyboardHelpButton extends JoistButton {

  public constructor( screens: AnyScreen[], screenProperty: Property<AnyScreen>,
                      backgroundColorProperty: TReadOnlyProperty<Color>,
                      providedOptions: KeyboardHelpButtonOptions ) {

    const options = optionize<KeyboardHelpButtonOptions, SelfOptions, JoistButtonOptions>()( {
      highlightExtensionWidth: 5 + 3.6,
      highlightExtensionHeight: 10,

      // The keyboard button is not vertically symmetric, due to the cable on the top.
      // This offset adjusts the body of the keyboard to be in the center, so it
      // will align with the speaker button and the PhET logo
      highlightCenterOffsetY: 2,

      // phet-io
      visiblePropertyOptions: { phetioFeatured: true },

      // pdom
      innerContent: keyboardShortcutsStringProperty,

      // voicing
      voicingNameResponse: keyboardShortcutsStringProperty
    }, providedOptions );

    let keyboardHelpDialogCapsule: PhetioCapsule<KeyboardHelpDialog> | null = null; // set after calling super
    options.listener = () => {
      assert && assert( keyboardHelpDialogCapsule );

      const keyboardHelpDialog = keyboardHelpDialogCapsule!.getElement();

      keyboardHelpDialog.show();
    };

    const icon = new Image( keyboardIcon_png, {
      scale: ICON_DESIRED_HEIGHT / keyboardIcon_png.height,
      pickable: false
    } );

    super( icon, backgroundColorProperty, options );

    keyboardHelpDialogCapsule = new PhetioCapsule<KeyboardHelpDialog>( tandem => {

      // Wrap in a node to prevent DAG problems if archetypes are also created
      return new KeyboardHelpDialog( screens, screenProperty, {
        tandem: tandem,
        focusOnHideNode: this
      } );
    }, [], {
      tandem: options.tandem.createTandem( 'keyboardHelpDialogCapsule' ),
      phetioType: PhetioCapsule.PhetioCapsuleIO( Dialog.DialogIO )
    } );

    // change the icon so that it is visible when the background changes from dark to light
    backgroundColorProperty.link( backgroundColor => {
      icon.image = backgroundColor.equals( Color.BLACK ) ? keyboardIcon_png : keyboardIconOnWhite_png;
    } );
  }
}

joist.register( 'KeyboardHelpButton', KeyboardHelpButton );
export default KeyboardHelpButton;