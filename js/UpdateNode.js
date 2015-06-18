// Copyright 2002-2013, University of Colorado Boulder

/**
 * Displays current update progress, for use in the About dialog.
 */
define( function( require ) {
  'use strict';

  // modules
  var HBox = require( 'SCENERY/nodes/HBox' );
  var Text = require( 'SCENERY/nodes/Text' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var inherit = require( 'PHET_CORE/inherit' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var FontAwesomeNode = require( 'SUN/FontAwesomeNode' );
  var SpinningIndicatorNode = require( 'SCENERY_PHET/SpinningIndicatorNode' );
  var VStrut = require( 'SCENERY/nodes/VStrut' );
  var Timer = require( 'JOIST/Timer' );
  var UpdateCheck = require( 'JOIST/UpdateCheck' );
  var LinkText = require( 'JOIST/LinkText' );

  // strings
  var upToDateString = require( 'string!JOIST/updates.upToDate' );
  var outOfDateString = require( 'string!JOIST/updates.outOfDate' );
  var checkingString = require( 'string!JOIST/updates.checking' );
  var offlineString = require( 'string!JOIST/updates.offline' );

  /**
   * Creates the display for showing simulation version status, and whether updates are recommended.
   * @param {UpdateNode} - The dialog, so we can properly set up the spinning listener.
   * @constructor
   */
  function UpdateNode( options ) {
    Node.call( this, options );

    var updateTextFont = new PhetFont( 14 );

    // "Checking" state node
    var spinningIndicatorNode = new SpinningIndicatorNode( { indicatorSize: 18 } );
    this.spinningIndicatorListener = function( dt ) {
      if ( UpdateCheck.state === 'checking' ) {
        spinningIndicatorNode.step( dt );
      }
    };
    var checkingNode = new HBox( { spacing: 8, left: 0, top: 0, children: [
      spinningIndicatorNode,
      new Text( checkingString, { font: updateTextFont } )
    ] } );
    this.addChild( checkingNode );

    // "Up-to-date" state node
    var upToDateNode = new HBox( { spacing: 8, left: 0, top: 0, children: [
      new Rectangle( 0, 0, 20, 20, 5, 5, { fill: '#5c3', children: [
        new FontAwesomeNode( 'check_without_box', { fill: '#fff', scale: 0.38, centerX: 10, centerY: 10 } )
      ] } ),
      new Text( upToDateString, { font: updateTextFont } )
    ] } );
    this.addChild( upToDateNode );

    // "Out-of-date" state node
    var outOfDateNode = new HBox( { spacing: 8, left: 0, top: 0, cursor: 'pointer', children: [
      new FontAwesomeNode( 'warning_sign', { fill: '#E87600', scale: 0.5 } ), // "safety orange", according to Wikipedia
      new LinkText( outOfDateString, UpdateCheck.updateURL, { font: updateTextFont } )
    ] } );
    this.addChild( outOfDateNode );

    // "Offline" state node
    var offlineNode = new HBox( { spacing: 0, left: 0, top: 0, children: [
      new VStrut( 20 ),
      new Text( offlineString, { font: updateTextFont} )
    ] } );
    this.addChild( offlineNode );

    // Show only the node corresponding the the current state (if any).
    UpdateCheck.stateProperty.link( function( state ) {
      checkingNode.visible = state === 'checking';
      upToDateNode.visible = state === 'up-to-date';
      outOfDateNode.visible = state === 'out-of-date';
      offlineNode.visible = state === 'offline';
    } );
  }

  return inherit( Node, UpdateNode, {
    show: function() {
      // Fire off a new update check if we were marked as offline or unchecked before, and we handle updates.
      if ( UpdateCheck.areUpdatesChecked && ( UpdateCheck.state === 'offline' || UpdateCheck.state === 'unchecked' ) ) {
        UpdateCheck.check();
      }

      // Hook up our spinner listener when we're shown
      if ( UpdateCheck.areUpdatesChecked ) {
        Timer.addStepListener( this.spinningIndicatorListener );
      }
    },

    hide: function() {
      // Disconnect our spinner listener when we're hidden
      if ( UpdateCheck.areUpdatesChecked ) {
        Timer.removeStepListener( this.spinningIndicatorListener );
      }
    }
  } );
} );
