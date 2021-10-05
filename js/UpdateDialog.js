// Copyright 2015-2021, University of Colorado Boulder

/**
 * Shows a fixed-size dialog that displays the current update status
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import stepTimer from '../../axon/js/stepTimer.js';
import Node from '../../scenery/js/nodes/Node.js';
import Dialog from '../../sun/js/Dialog.js';
import joist from './joist.js';
import updateCheck from './updateCheck.js';
import UpdateNodes from './UpdateNodes.js';
import UpdateState from './UpdateState.js';

class UpdateDialog extends Dialog {

  /**
   * @param {Object} [options]
   */
  constructor( options ) {
    assert && assert( updateCheck.areUpdatesChecked,
      'Updates need to be checked for UpdateDialog to be created' );

    const positionOptions = { centerX: 0, centerY: 0, big: true };
    const checkingNode = UpdateNodes.createCheckingNode( positionOptions );
    const upToDateNode = UpdateNodes.createUpToDateNode( positionOptions );

    const outOfDateNode = new Node( {

      // pdom - dialog content contained in parent div so ARIA roles can be applied to all children
      tagName: 'div'
    } );

    const offlineNode = UpdateNodes.createOfflineNode( positionOptions );

    const content = new Node( {
      children: [
        checkingNode,
        upToDateNode,
        outOfDateNode,
        offlineNode
      ],

      // pdom
      tagName: 'div'
    } );

    super( content, options );

    const updateOutOfDateNode = () => {

      // fallback size placeholder for version
      const latestVersionString = updateCheck.latestVersion ? updateCheck.latestVersion.toString() : 'x.x.xx';
      const ourVersionString = updateCheck.ourVersion.toString();

      outOfDateNode.children = [
        UpdateNodes.createOutOfDateDialogNode( this, ourVersionString, latestVersionString, positionOptions )
      ];
    };

    updateOutOfDateNode();

    // @private - Listener that should be called every frame where we are shown, with {number} dt as a single parameter.
    this.updateStepListener = checkingNode.stepListener;

    // Listener that should be called whenever our update state changes (while we are displayed)
    this.updateVisibilityListener = function( state ) {
      if ( state === UpdateState.OUT_OF_DATE ) {
        updateOutOfDateNode();
      }

      checkingNode.visible = state === UpdateState.CHECKING;
      upToDateNode.visible = state === UpdateState.UP_TO_DATE;
      outOfDateNode.visible = state === UpdateState.OUT_OF_DATE;
      offlineNode.visible = state === UpdateState.OFFLINE;

      // pdom - update visibility of update nodes for screen readers by adding/removing content from the DOM,
      // necessary because screen readers will read hidden content in a Dialog
      checkingNode.pdomVisible = checkingNode.visible;
      upToDateNode.pdomVisible = upToDateNode.visible;
      outOfDateNode.pdomVisible = outOfDateNode.visible;
      offlineNode.pdomVisible = offlineNode.visible;
    };
  }

  /**
   * Shows the UpdateDialog, registering listeners that should only be called while the dialog is shown.
   * @public (joist-internal)
   */
  show() {
    if ( updateCheck.areUpdatesChecked && !this.isShowingProperty.value ) {
      updateCheck.resetTimeout();

      // Fire off a new update check if we were marked as offline or unchecked before, and we handle updates.
      if ( updateCheck.stateProperty.value === UpdateState.OFFLINE || updateCheck.stateProperty.value === UpdateState.UNCHECKED ) {
        updateCheck.check();
      }

      // Hook up our spinner listener when we're shown
      stepTimer.addListener( this.updateStepListener );

      // Hook up our visibility listener
      updateCheck.stateProperty.link( this.updateVisibilityListener );
    }

    super.show();
  }

  /**
   * Removes listeners that should only be called when the Dialog is shown.
   * @public (joist-internal)
   */
  hide() {
    if ( this.isShowingProperty.value ) {
      super.hide();

      if ( updateCheck.areUpdatesChecked ) {

        // Disconnect our visibility listener
        updateCheck.stateProperty.unlink( this.updateVisibilityListener );

        // Disconnect our spinner listener when we're hidden
        stepTimer.removeListener( this.updateStepListener );
      }
    }
  }
}

joist.register( 'UpdateDialog', UpdateDialog );
export default UpdateDialog;