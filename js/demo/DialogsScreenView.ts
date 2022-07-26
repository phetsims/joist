// Copyright 2015-2022, University of Colorado Boulder

/**
 * View for demonstrating dialogs.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Property from '../../../axon/js/Property.js';
import BasicActionsKeyboardHelpSection from '../../../scenery-phet/js/keyboard/help/BasicActionsKeyboardHelpSection.js';
import { VBox } from '../../../scenery/js/imports.js';
import Panel from '../../../sun/js/Panel.js';
import Tandem from '../../../tandem/js/Tandem.js';
import joist from '../joist.js';
import KeyboardHelpButton from '../KeyboardHelpButton.js';
import ScreenView from '../ScreenView.js';
import Screen from '../Screen.js';
import Sim from '../Sim.js';

class DialogsScreenView extends ScreenView {
  public constructor() {

    super();

    const sim = phet.joist.sim as Sim;

    const keyboardHelpDialogContent = new BasicActionsKeyboardHelpSection();

    const keyboardHelpButton = new KeyboardHelpButton(
      new Property( { keyboardHelpNode: keyboardHelpDialogContent } as unknown as Screen ),
      sim.lookAndFeel.navigationBarFillProperty, {
        tandem: Tandem.GENERAL_VIEW.createTandem( 'keyboardHelpButton' )
      } );
    keyboardHelpButton.setScaleMagnitude( 2 );

    // Since KeyboardHelpButton adapts its color to the navigation bar, put the button in a panel that's the same
    // color as the navigation bar. You can test this by toggling sim.lookAndFeel.backgroundColorProperty
    // between 'white' and 'black' is the browser console.
    const keyboardHelpPanel = new Panel( keyboardHelpButton, {
      fill: sim.lookAndFeel.navigationBarFillProperty.value
    } );
    sim.lookAndFeel.navigationBarFillProperty.link( navigationBarFill => {
      keyboardHelpPanel.setFill( navigationBarFill );
    } );

    this.addChild( new VBox( {
      children: [
        keyboardHelpPanel
      ],
      spacing: 20,
      center: this.layoutBounds.center
    } ) );
  }
}

joist.register( 'DialogsScreenView', DialogsScreenView );
export default DialogsScreenView;