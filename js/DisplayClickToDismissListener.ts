// Copyright 2021-2022, University of Colorado Boulder

/**
 * A listener that can be added to a Display to (typically) dismiss a UI component after we receive a press.
 * Provide a listener to be called when the Pointer is released. It will be called unless this there is
 * listener cancel/interruption.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import joist from './joist.js';
import { TInputListener, Pointer, SceneryEvent, SceneryListenerFunction } from '../../scenery/js/imports.js';
import dotRandom from '../../dot/js/dotRandom.js';

class DisplayClickToDismissListener {
  private pointer: null | Pointer;
  private readonly pointerListener: TInputListener;

  /**
   * @param listener - The listener to be called when the Pointer goes up, likely to dismiss something.
   */
  public constructor( listener: SceneryListenerFunction ) {

    // The active Pointer for this listener, after a down event a subsequent up event on this Pointer will trigger
    // the behavior of `listener`.
    this.pointer = null;

    // A listener added to the Pointer on a down event which will do the work of `listener` when the pointer is
    // released. If this Pointer listener is interrupted we will never call the `listener`.
    this.pointerListener = {
      up: ( event: SceneryEvent ) => {
        listener( event );
        this.dismissPointer( this.pointer );
      },

      interrupt: () => {
        this.dismissPointer( this.pointer );
      },
      cancel: () => {
        this.dismissPointer( this.pointer );
      }
    };
  }

  /**
   * Part of the scenery Input API.
   */
  public down( event: SceneryEvent ): void {

    // When fuzz testing we want to exercise the component that is going to be dismissed so this should keep it up
    // long enough to hopefully receive some fuzzing.
    if ( phet.chipper.isFuzzEnabled() && dotRandom.nextDouble() < 0.99 ) {
      return;
    }

    this.observePointer( event.pointer );
  }

  /**
   * Attach a listener to the Pointer that will watch when it goes up.
   */
  private observePointer( pointer: Pointer ): void {

    // only observe one Pointer (for multitouch) and don't try to add a listener if the Pointer is already attached
    if ( this.pointer === null && !pointer.isAttached() ) {
      this.pointer = pointer;
      this.pointer.addInputListener( this.pointerListener, true );
    }
  }

  /**
   * Remove the attached listener from the Pointer and clear it (if we are observing currently observing a Pointer).
   */
  private dismissPointer( pointer: Pointer | null ): void {
    if ( this.pointer !== null ) {
      assert && assert( this.pointerListener, 'There should be a pointerListener to remove.' );
      this.pointer.removeInputListener( this.pointerListener );
      this.pointer = null;
    }
  }

  public dispose(): void {
    this.dismissPointer( this.pointer );
  }
}

joist.register( 'DisplayClickToDismissListener', DisplayClickToDismissListener );
export default DisplayClickToDismissListener;
