// Copyright 2021-2023, University of Colorado Boulder

/**
 * Abstract class that creates alert content for the VoicingToolbarItem. Buttons in that item will call these
 * functions to create content that is spoken using speech synthesis. Extend this class and implement these
 * functions. Then pass this as an entry to the PreferencesModel when creating a Sim.
 *
 * @author Jesse Greenberg
 */

import TReadOnlyProperty from '../../../axon/js/TReadOnlyProperty.js';
import { SpeakableResolvedResponse } from '../../../utterance-queue/js/ResponsePacket.js';
import joist from '../joist.js';
import { AnyScreen } from '../Screen.js';

class VoicingToolbarAlertManager {

  // The active Screen for the simulation, to generate Voicing descriptions that are related to the active screen.
  private readonly screenProperty: TReadOnlyProperty<AnyScreen>;

  /**
   * @param screenProperty - indicates the active screen
   */
  public constructor( screenProperty: TReadOnlyProperty<AnyScreen> ) {
    this.screenProperty = screenProperty;
  }

  /**
   * Create the alert content for the simulation overview for the "Overview" button.
   */
  public createOverviewContent(): SpeakableResolvedResponse {
    const screenView = this.screenProperty.value.view;
    assert && assert( screenView, 'view needs to be inititalized for voicing toolbar content' );
    return screenView.getVoicingOverviewContent();
  }

  /**
   * Creates the alert content for the simulation details when the "Current Details"
   * button is pressed.
   */
  public createDetailsContent(): SpeakableResolvedResponse {
    const screenView = this.screenProperty.value.view;
    assert && assert( screenView, 'view needs to be inititalized for voicing toolbar content' );
    return screenView.getVoicingDetailsContent();
  }

  /**
   * Creates the alert content for an interaction hint when the "Hint" button is pressed.
   */
  public createHintContent(): SpeakableResolvedResponse {
    const screenView = this.screenProperty.value.view;
    assert && assert( screenView, 'view needs to be inititalized for voicing toolbar content' );
    return this.screenProperty.value.view.getVoicingHintContent();
  }
}

joist.register( 'VoicingToolbarAlertManager', VoicingToolbarAlertManager );
export default VoicingToolbarAlertManager;