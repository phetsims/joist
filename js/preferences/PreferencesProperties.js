// Copyright 2021, University of Colorado Boulder

/**
 * Properties related to the PreferencesDialog, which will enable or disable various features in the simulation.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../axon/js/BooleanProperty.js';
import joist from '../joist.js';

class PreferencesProperties {
  constructor() {

    // @public {BooleanProperty} - Whether or not the Sim Toolbar is enabled, which gives quick access to various
    // controls for the simulation or active screen.
    this.toolbarEnabledProperty = new BooleanProperty( true );

    // @public {BooleanProperty} - Whether or not "Interactive Highlights" are enabled for the simulation. If enabled,
    // focus highlights will appear around focusable components with 'over' events, and persist around the focused
    // element even with mouse and touch interaction.
    this.interactiveHighlightsEnabledProperty = new BooleanProperty( false );

    // @public {BooleanProperty} - Whether or not "Gesture Controls" are enabled for the simulation. If enabled,
    // touch screen input will change to work like a screen reader. Horizontal swipes across the screen will move focus,
    // double-taps will activate the selected item, and tap then hold will initiate drag and drop interactions.
    // Note that enabling this will generally prevent all touch input from working as it does normally.
    this.gestureControlsEnabledProperty = new BooleanProperty( false );
  }
}

joist.register( 'PreferencesProperties', PreferencesProperties );
export default PreferencesProperties;