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

class DialogsScreenView extends ScreenView {
  constructor() {

    super();

    const keyboardHelpDialogContent = new BasicActionsKeyboardHelpSection();

    const keyboardHelpButton = new KeyboardHelpButton(
      new Property( { keyboardHelpNode: keyboardHelpDialogContent } ),
      phet.joist.sim.lookAndFeel.navigationBarFillProperty, {
        tandem: Tandem.GENERAL_VIEW.createTandem( 'keyboardHelpButton' )
      } );
    keyboardHelpButton.setScaleMagnitude( 2 );

    // Since KeyboardHelpButton adapts its color to the navigation bar, put the button in a panel that's the same
    // color as the navigation bar. You can test this by toggling phet.joist.sim.lookAndFeel.backgroundColorProperty
    // between 'white' and 'black' is the browser console.
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