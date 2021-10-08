// Copyright 2021, University of Colorado Boulder

/**
 * A listener that manages the visibility of different highlights when switching between mouse/touch and alternative
 * input for a Display.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import Property from '../../axon/js/Property.js';
import FocusManager from '../../scenery/js/accessibility/FocusManager.js';
import globalKeyStateTracker from '../../scenery/js/accessibility/globalKeyStateTracker.js';
import KeyboardUtils from '../../scenery/js/accessibility/KeyboardUtils.js';
import voicingManager from '../../scenery/js/accessibility/voicing/voicingManager.js';
import audioManager from './audioManager.js';
import joist from './joist.js';

// constants
// The amount of Pointer movement required to switch from showing focus highlights to Interactive Highlights if both
// are enabled, in the global coordinate frame.
const HIDE_FOCUS_HIGHLIGHTS_MOVEMENT_THRESHOLD = 100;

class HighlightVisibilityListener {

  /**
   * @param {Sim} sim - TODO: try to get rid of this reference, https://github.com/phetsims/joist/issues/753
   * @param {Display} display
   */
  constructor( sim, display ) {

    // @private {Display} - A reference to the Display whose FocusManager we will operate on to control the visibility
    // of various kinds of highlights
    this.display = display;

    // {null|Vector2} - The initial point of the Pointer when focus highlights are made visible and Interactive
    // highlights are enabled. Pointer movement to determine whether to switch to showing Interactive Highlights
    // instead of focus highlights will be relative to this point. A value of null means we haven't saved a point
    // yet and we need to on the next move event.
    this.initialPointerPoint = null;

    // {number} - The amount of distance that the Pointer has moved relative to initialPointerPoint, in the global
    // coordinate frame.
    this.relativePointerDistance = 0;

    // A listener that is added/removed from the display to manage visibility of highlights on move events. We
    // usually don't need this listener so it is only added when we need to listen for move events.
    const moveListener = {
      move: this.handleMove.bind( this )
    };

    const setHighlightsVisible = () => { this.display.focusManager.pdomFocusHighlightsVisibleProperty.value = true; };
    const focusHighlightVisibleListener = {};

    // Restore display of focus highlights if we receive PDOM events. Exclude focus-related events here
    // so that we can support some iOS cases where we want PDOM behavior even though iOS + VO only provided pointer
    // events. See https://github.com/phetsims/scenery/issues/1137 for details.
    [ 'click', 'input', 'change', 'keydown', 'keyup' ].forEach( eventType => {
      focusHighlightVisibleListener[ eventType ] = setHighlightsVisible;
    } );
    this.display.addInputListener( focusHighlightVisibleListener );

    // When tabbing into the sim, make focus highlights visible - on keyup because the keydown is likely to have
    // occurred on an element outside of the DOM scope.
    globalKeyStateTracker.keyupEmitter.addListener( event => {
      if ( KeyboardUtils.isKeyEvent( event, KeyboardUtils.KEY_TAB ) ) {
        setHighlightsVisible();
      }
    } );

    if ( sim.preferencesConfiguration && sim.preferencesConfiguration.audioOptions.supportsVoicing ) {

      // For now, ReadingBlocks are only enabled when voicing is fully enabled and when sound is on. We decided that
      // having ReadingBlock highlights that do nothing is too confusing so they should be removed unless they
      // have some output.
      Property.multilink( [
        voicingManager.voicingFullyEnabledProperty,
        audioManager.audioEnabledProperty
      ], ( voicingFullyEnabled, allAudioEnabled ) => {
        display.focusManager.readingBlockHighlightsVisibleProperty.value = voicingFullyEnabled && allAudioEnabled;
      } );
    }

    if ( sim.preferencesManager ) {
      sim.preferencesManager.preferencesProperties.interactiveHighlightsEnabledProperty.link( visible => {
        display.focusManager.interactiveHighlightsVisibleProperty.value = visible;
      } );
    }

    // If Interactive Highlights are supported add a listener that switch between using focus highlights and Interactive
    // Highlights depending on the input received.
    if ( sim.preferencesConfiguration &&
         sim.preferencesConfiguration.visualOptions.supportsInteractiveHighlights ) {

      // When both Interactive Highlights are enabled and the PDOM focus highlights are visible, add a listener that
      // will make focus highlights invisible and interactive highlights visible if we receive a certain amount of
      // mouse movement. The listener is removed as soon as PDOM focus highlights are made invisible or Interactive
      // Highlights are disabled.
      const interactiveHighlightsEnabledProperty = sim.preferencesManager.preferencesProperties.interactiveHighlightsEnabledProperty;
      const pdomFocusHighlightsVisibleProperty = this.display.focusManager.pdomFocusHighlightsVisibleProperty;
      Property.multilink(
        [ interactiveHighlightsEnabledProperty, pdomFocusHighlightsVisibleProperty ],
        ( interactiveHighlightsEnabled, pdomHighlightsVisible ) => {
          if ( interactiveHighlightsEnabled && pdomHighlightsVisible ) {
            this.display.addInputListener( moveListener );

            // Setting to null indicates that we should store the Pointer.point as the initialPointerPoint on next move.
            this.initialPointerPoint = null;

            // Reset distance of movement for the mouse pointer since we are looking for changes again.
            this.relativePointerDistance = 0;
          }
          else {
            if ( this.display.hasInputListener( moveListener ) ) {
              this.display.removeInputListener( moveListener );
            }
          }
        }
      );
    }
  }

  /**
   * Whenever we receive a down event focus highlights are made invisible. We may also blur the active element in
   * some cases, but not always as is necessary for iOS VoiceOver. See documentation details in the function.
   *
   * @private
   * @param {SceneryEvent} event
   */
  down( event ) {

    // An AT might have sent a down event outside of the display, if this happened we will not do anything
    // to change focus
    if ( this.display.bounds.containsPoint( event.pointer.point ) ) {

      // in response to pointer events, always hide the focus highlight so it isn't distracting
      this.display.focusManager.pdomFocusHighlightsVisibleProperty.value = false;

      // no need to do this work unless some element in the simulation has focus
      if ( FocusManager.pdomFocusedNode ) {

        // if the event trail doesn't include the focusedNode, clear it - otherwise DOM focus is kept on the
        // active element so that it can remain the target for assistive devices using pointer events
        // on behalf of the user, see https://github.com/phetsims/scenery/issues/1137
        if ( !event.trail.nodes.includes( FocusManager.pdomFocusedNode ) ) {
          FocusManager.pdomFocus = null;
        }
      }
    }
  }

  /**
   * Switches between focus highlights and Interactive Highlights if there is enough mouse movement.
   * @private
   *
   * @param {SceneryEvent} event
   */
  handleMove( event ) {

    // A null initialPointerPoint means that we have not set the point yet since we started listening for mouse
    // movements - set it now so that distance of mose movement will be relative to this initial point.
    if ( this.initialPointerPoint === null ) {
      this.initialPointerPoint = event.pointer.point;
    }
    else {
      this.relativePointerDistance = event.pointer.point.distance( this.initialPointerPoint );

      // we have moved enough to switch from focus highlights to Interactive Highlights. Setting the
      // pdomFocusHighlightsVisibleProperty to false will remove this listener for us.
      if ( this.relativePointerDistance > HIDE_FOCUS_HIGHLIGHTS_MOVEMENT_THRESHOLD ) {
        this.display.focusManager.pdomFocusHighlightsVisibleProperty.value = false;
        this.display.focusManager.interactiveHighlightsVisibleProperty.value = true;
      }
    }
  }
}

joist.register( 'HighlightVisibilityListener', HighlightVisibilityListener );
export default HighlightVisibilityListener;
