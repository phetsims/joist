// Copyright 2015-2020, University of Colorado Boulder

/**
 * View for demonstrating dialogs.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import GeneralKeyboardHelpSection from '../../../scenery-phet/js/keyboard/help/GeneralKeyboardHelpSection.js';
import VBox from '../../../scenery/js/nodes/VBox.js';
import Panel from '../../../sun/js/Panel.js';
import Tandem from '../../../tandem/js/Tandem.js';
import joist from '../joist.js';
import KeyboardHelpButton from '../KeyboardHelpButton.js';
import ScreenView from '../ScreenView.js';

class DialogsScreenView extends ScreenView {
  constructor() {

    super();

    const keyboardHelpDialogContent = new GeneralKeyboardHelpSection();

    const keyboardHelpButton = new KeyboardHelpButton(
      keyboardHelpDialogContent,
      phet.joist.sim.lookAndFeel.navigationBarFillProperty,
      Tandem.GENERAL.createTandem( 'keyboardHelpButton' )
    );
    keyboardHelpButton.setScaleMagnitude( 2 );

    // Since KeyboardHelpButton adapts its color to the navigation bar,
    // put the button in a panel that's the same color as the navigation bar
    const keyboardHelpPanel = new Panel( keyboardHelpButton, {
      fill: phet.joist.sim.lookAndFeel.navigationBarFillProperty.value
    } );
    phet.joist.sim.lookAndFeel.navigationBarFillProperty.link( navigationBarFill => {
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