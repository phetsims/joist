// Copyright 2002-2013, University of Colorado Boulder

/**
 * UI parts for update-related dialogs
 */
define( function( require ) {
  'use strict';

  // modules
  var HBox = require( 'SCENERY/nodes/HBox' );
  var VBox = require( 'SCENERY/nodes/VBox' );
  var Text = require( 'SCENERY/nodes/Text' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var StringUtils = require( 'PHETCOMMON/util/StringUtils' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var FontAwesomeNode = require( 'SUN/FontAwesomeNode' );
  var TextPushButton = require( 'SUN/buttons/TextPushButton' );
  var SpinningIndicatorNode = require( 'SCENERY_PHET/SpinningIndicatorNode' );
  var VStrut = require( 'SCENERY/nodes/VStrut' );
  var UpdateCheck = require( 'JOIST/UpdateCheck' );
  var LinkText = require( 'JOIST/LinkText' );

  // strings
  var upToDateString = require( 'string!JOIST/updates.upToDate' );
  var outOfDateString = require( 'string!JOIST/updates.outOfDate' );
  var checkingString = require( 'string!JOIST/updates.checking' );
  var offlineString = require( 'string!JOIST/updates.offline' );
  var newVersionAvailableString = require( 'string!JOIST/updates.newVersionAvailable' );
  var yourCurrentVersionlineString = require( 'string!JOIST/updates.yourCurrentVersion' );
  var getUpdateString = require( 'string!JOIST/updates.getUpdate' );
  var noThanksString = require( 'string!JOIST/updates.noThanks' );

  var updateTextFont = new PhetFont( 14 );

  return {
    /**
     * "Checking" state node. With two size options (if options.big == true, it will be bigger)
     *
     * @param {Object} [options] - passed to the Node
     * @returns {Node} the Checking node, with step( dt ) and stepListener (bound to the node itself)
     */
    createCheckingNode: function( options ) {
      var spinningIndicatorNode = new SpinningIndicatorNode( { indicatorSize: options.big ? 24 : 18 } );
      var checkingNode = new HBox( _.extend( { spacing: options.big ? 10 : 8, children: [
        spinningIndicatorNode,
        new Text( checkingString, { font: new PhetFont( options.big ? 16 : 14 ), fontWeight: options.big ? 'bold' : 'normal' } )
      ] }, options ) );
      checkingNode.step = function( dt ) {
        if ( UpdateCheck.state === 'checking' ) {
          spinningIndicatorNode.step( dt );
        }
      };
      checkingNode.stepListener = checkingNode.step.bind( checkingNode );
      return checkingNode;
    },

    /**
     * "Up-to-date" state node
     * @param {Object} [options] - passed to the Node
     * @returns {Node}
     */
    createUpToDateNode: function( options ) {
      return new HBox( _.extend( { spacing: 8, children: [
        new Rectangle( 0, 0, 20, 20, 5, 5, { fill: '#5c3', scale: options.big ? 1.2 : 1, children: [
          new FontAwesomeNode( 'check_without_box', { fill: '#fff', scale: 0.38, centerX: 10, centerY: 10 } )
        ] } ),
        new Text( upToDateString, { font: new PhetFont( options.big ? 16 : 14 ), fontWeight: options.big ? 'bold' : 'normal' } )
      ] }, options ) );
    },

    /**
     * "Out-of-date" state node for the "About" dialog.
     * @param {Object} [options] - passed to the Node
     * @returns {Node}
     */
    createOutOfDateAboutNode: function( options ) {
      return new HBox( _.extend( { spacing: 8, cursor: 'pointer', children: [
        new FontAwesomeNode( 'warning_sign', { fill: '#E87600', scale: 0.5 } ), // "safety orange", according to Wikipedia
        new LinkText( outOfDateString, UpdateCheck.updateURL, { font: updateTextFont } )
      ] }, options ) );
    },

    /**
     * "Out-of-date" state node for the "Check for udpate" dialog.
     * @param {string} ourVersionString
     * @param {string} latestVersionString
     * @param {Object} [options] - passed to the Node
     * @returns {Node}
     */
    createOutOfDateDialogNode: function( ourVersionString, latestVersionString, options ) {
      return new VBox( _.extend( { spacing: 15, children: [
        new VBox( { spacing: 5, align: 'left', children: [
          new Text( StringUtils.format( newVersionAvailableString, latestVersionString ), {
            font: new PhetFont( 16 ), fontWeight: 'bold'
          } ),
          new Text( StringUtils.format( yourCurrentVersionlineString, ourVersionString ), {
            font: updateTextFont
          } )
        ] } ),
        new HBox( { spacing: 25, children: [
          new TextPushButton( getUpdateString, { baseColor: '#6f6', font: updateTextFont, listener: function() {
            var newWindow = window.open( UpdateCheck.updateURL, '_blank' ); // open in a new window/tab
            newWindow.focus();
          } } ),
          new TextPushButton( noThanksString, { baseColor: '#ddd', font: updateTextFont, listener: function() {
            // Closing the dialog is handled by the Dialog listener itself, no need to add code to close it here.
          } } )
        ] } )
      ] }, options ) );
    },

    /**
     * "Offline" state node
     * @param {Object} [options] - passed to the Node
     * @returns {Node}
     */
    createOfflineNode: function( options ) {
      return new HBox( _.extend( { spacing: 0, children: [
        new VStrut( 20 ), // spacer to match layout of other nodes
        new Text( offlineString, { font: new PhetFont( options.big ? 16 : 14 ), fontWeight: options.big ? 'bold' : 'normal' } )
      ] }, options ) );
    }
  };
} );
