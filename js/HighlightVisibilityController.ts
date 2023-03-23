// Copyright 2021-2023, University of Colorado Boulder

/**
 * A listener that manages the visibility of different highlights when switching between mouse/touch and alternative
 * input for a Display.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import Multilink from '../../axon/js/Multilink.js';
import Vector2 from '../../dot/js/Vector2.js';
import { Display, FocusManager, globalKeyStateTracker, KeyboardUtils, SceneryEvent, TInputListener } from '../../scenery/js/imports.js';
import joist from './joist.js';
import PreferencesModel from './preferences/PreferencesModel.js';

// constants
// The amount of Pointer movement required to switch from showing focus highlights to Interactive Highlights if both
// are enabled, in the global coordinate frame.
const HIDE_FOCUS_HIGHLIGHTS_MOVEMENT_THRESHOLD = 100;

class HighlightVisibilityController {
  private readonly display: Display;

  // {null|Vector2} - The initial point of the Pointer when focus highlights are made visible and Interactive
  // highlights are enabled. Pointer movement to determine whether to switch to showing Interactive Highlights
  // instead of focus highlights will be relative to this point. A value of null means we haven't saved a point
  // yet and we need to on the next move event.
  private initialPointerPoint: Vector2 | null = null;

  // {number} - The amount of distance that the Pointer has moved relative to initialPointerPoint, in the global
  // coordinate frame.
  private relativePointerDistance = 0;

  public constructor( display: Display, preferencesModel: PreferencesModel ) {

    // A reference to the Display whose FocusManager we will operate on to control the visibility of various kinds of highlights
    this.display = display;

    // A listener that is added/removed from the display to manage visibility of highlights on move events. We
    // usually don't need this listener so it is only added when we need to listen for move events.
    const moveListener = {
      move: this.handleMove.bind( this )
    };

    const setHighlightsVisible = () => { this.display.focusManager.pdomFocusHighlightsVisibleProperty.value = true; };
    const focusHighlightVisibleListener: TInputListener = {};

    // Restore display of focus highlights if we receive PDOM events. Exclude focus-related events here
    // so that we can support some iOS cases where we want PDOM behavior even though iOS + VO only provided pointer
    // events. See https://github.com/phetsims/scenery/issues/1137 for details.
    ( [ 'click', 'input', 'change', 'keydown', 'keyup' ] as const ).forEach( eventType => {
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

    if ( preferencesModel.visualModel.supportsInteractiveHighlights ) {

      preferencesModel.visualModel.interactiveHighlightsEnabledProperty.link( visible => {
        this.display.focusManager.interactiveHighlightsVisibleProperty.value = visible;
      } );

      // When both Interactive Highlights are enabled and the PDOM focus highlights are visible, add a listener that
      // will make focus highlights invisible and interactive highlights visible if we receive a certain amount of
      // mouse movement. The listener is removed as soon as PDOM focus highlights are made invisible or Interactive
      // Highlights are disabled.
      const interactiveHighlightsEnabledProperty = preferencesModel.visualModel.interactiveHighlightsEnabledProperty;
      const pdomFocusHighlightsVisibleProperty = this.display.focusManager.pdomFocusHighlightsVisibleProperty;
      Multilink.multilink(
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
            this.display.hasInputListener( moveListener ) && this.display.removeInputListener( moveListener );
          }
        }
      );
    }

    this.display.addInputListener( {

      // Whenever we receive a down event focus highlights are made invisible. We may also blur the active element in
      // some cases, but not always as is necessary for iOS VoiceOver. See documentation details in the function.
      down: event => {

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
    } );
  }

  /**
   * Switches between focus highlights and Interactive Highlights if there is enough mouse movement.
   */
  private handleMove( event: SceneryEvent ): void {

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

joist.register( 'HighlightVisibilityController', HighlightVisibilityController );
export default HighlightVisibilityController;
