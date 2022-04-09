// Copyright 2021-2022, University of Colorado Boulder

/**
 * Abstract class that creates alert content for the VoicingToolbarItem. Buttons in that item will call these
 * functions to create content that is spoken using speech synthesis. Extend this class and implement these
 * functions. Then pass this as an entry to the PreferencesConfiguration when creating a Sim.
 *
 * @author Jesse Greenberg
 */

import Property from '../../../axon/js/Property.js';
import IntentionalAny from '../../../phet-core/js/types/IntentionalAny.js';
import joist from '../joist.js';
import Screen from '../Screen.js';
import ScreenView from '../ScreenView.js';

class VoicingToolbarAlertManager {

  // The active Screen for the simulation, to generate Voicing descriptions that are related to the active screen.
  private readonly screenProperty: Property<Screen<IntentionalAny, ScreenView>>;

  /**
   * @param {Property.<Screen>} screenProperty - indicates the active screen
   */
  constructor( screenProperty: Property<Screen<IntentionalAny, ScreenView>> ) {
    this.screenProperty = screenProperty;
  }

  /**
   * Create the alert content for the simulation overview for the "Overview" button.
   */
  public createOverviewContent(): string {
    const screenView = this.screenProperty.value.view;
    assert && assert( screenView, 'view needs to be inititalized for voicing toolbar content' );
    return screenView.getVoicingOverviewContent();
  }

  /**
   * Creates the alert content for the simulation details when the "Current Details"
   * button is pressed.
   */
  public createDetailsContent(): string {
    const screenView = this.screenProperty.value.view;
    assert && assert( screenView, 'view needs to be inititalized for voicing toolbar content' );
    return screenView.getVoicingDetailsContent();
  }

  /**
   * Creates the alert content for an interaction hint when the "Hint" button is pressed.
   */
  public createHintContent(): string {
    const screenView = this.screenProperty.value.view;
    assert && assert( screenView, 'view needs to be inititalized for voicing toolbar content' );
    return this.screenProperty.value.view.getVoicingHintContent();
  }
}

joist.register( 'VoicingToolbarAlertManager', VoicingToolbarAlertManager );
export default VoicingToolbarAlertManager;