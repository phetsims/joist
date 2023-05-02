// Copyright 2015-2023, University of Colorado Boulder

/**
 * View for demonstrating dialogs.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Property from '../../../axon/js/Property.js';
import BasicActionsKeyboardHelpSection from '../../../scenery-phet/js/keyboard/help/BasicActionsKeyboardHelpSection.js';
import { HBox, VBox } from '../../../scenery/js/imports.js';
import Panel from '../../../sun/js/Panel.js';
import Tandem from '../../../tandem/js/Tandem.js';
import joist from '../joist.js';
import KeyboardHelpButton from '../KeyboardHelpButton.js';
import ScreenView, { ScreenViewOptions } from '../ScreenView.js';
import { AnyScreen } from '../Screen.js';
import Sim from '../Sim.js';
import NavigationBarPreferencesButton from '../preferences/NavigationBarPreferencesButton.js';
import PreferencesModel from '../preferences/PreferencesModel.js';
import PreferencesDialogDemoSection from './PreferencesDialogDemoSection.js';

class DialogsScreenView extends ScreenView {
  public constructor( providedOptions: ScreenViewOptions ) {

    super( providedOptions );

    const sim = phet.joist.sim as Sim;

    const keyboardHelpDialogContent = new BasicActionsKeyboardHelpSection();

    const fakeScreen = { createKeyboardHelpNode: () => keyboardHelpDialogContent, tandem: Tandem.OPTIONAL } as unknown as AnyScreen;
    const keyboardHelpButton = new KeyboardHelpButton(
      [ fakeScreen ],
      new Property( fakeScreen ),
      sim.lookAndFeel.navigationBarFillProperty, {
        tandem: Tandem.GENERAL_VIEW.createTandem( 'keyboardHelpButton' )
      } );

    const preferencesModel = new PreferencesModel( {
      simulationOptions: {
        customPreferences: [ {
          createContent: tandem => new PreferencesDialogDemoSection()
        } ]
      }
    } );
    const preferencesButton = new NavigationBarPreferencesButton(
      preferencesModel,
      sim.lookAndFeel.navigationBarFillProperty, {
        tandem: Tandem.GENERAL_VIEW.createTandem( 'preferencesButton' )
      } );


    const buttonsHBox = new HBox( { children: [ keyboardHelpButton, preferencesButton ] } );
    buttonsHBox.setScaleMagnitude( 2 );
    // Since KeyboardHelpButton adapts its color to the navigation bar, put the button in a panel that's the same
    // color as the navigation bar. You can test this by toggling sim.lookAndFeel.backgroundColorProperty
    // between 'white' and 'black' is the browser console.
    const keyboardHelpPanel = new Panel( buttonsHBox, {
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