// Copyright 2015-2018, University of Colorado Boulder

/**
 * UI parts for update-related dialogs
 */
define( function( require ) {
  'use strict';

  // modules
  var FontAwesomeNode = require( 'SUN/FontAwesomeNode' );
  var HBox = require( 'SCENERY/nodes/HBox' );
  var joist = require( 'JOIST/joist' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var RichText = require( 'SCENERY/nodes/RichText' );
  var SpinningIndicatorNode = require( 'SCENERY_PHET/SpinningIndicatorNode' );
  var StringUtils = require( 'PHETCOMMON/util/StringUtils' );
  var Text = require( 'SCENERY/nodes/Text' );
  var TextPushButton = require( 'SUN/buttons/TextPushButton' );
  var UpdateCheck = require( 'JOIST/UpdateCheck' );
  var VBox = require( 'SCENERY/nodes/VBox' );
  var VStrut = require( 'SCENERY/nodes/VStrut' );

  // strings
  var updatesCheckingString = require( 'string!JOIST/updates.checking' );
  var updatesGetUpdateString = require( 'string!JOIST/updates.getUpdate' );
  var updatesNewVersionAvailableString = require( 'string!JOIST/updates.newVersionAvailable' );
  var updatesNoThanksString = require( 'string!JOIST/updates.noThanks' );
  var updatesOfflineString = require( 'string!JOIST/updates.offline' );
  var updatesOutOfDateString = require( 'string!JOIST/updates.outOfDate' );
  var updatesUpToDateString = require( 'string!JOIST/updates.upToDate' );
  var updatesYourCurrentVersionString = require( 'string!JOIST/updates.yourCurrentVersion' );

  var updateTextFont = new PhetFont( 14 );

  // Maximum width of the resulting update items
  var MAX_WIDTH = 550;

  var UpdateNodes = {

    /**
     * "Checking" state node. With two size options (if options.big == true, it will be bigger)
     *
     * @param {Object} [options] - passed to the Node
     * @returns {Node} the Checking node, with step( dt ) and stepListener (bound to the node itself)
     * @public (joist-internal)
     */
    createCheckingNode: function( options ) {
      var spinningIndicatorNode = new SpinningIndicatorNode( { indicatorSize: options.big ? 24 : 18 } );
      var checkingNode = new HBox( _.extend( {
        spacing: options.big ? 10 : 8,
        maxWidth: MAX_WIDTH,
        children: [
          spinningIndicatorNode,
          new Text( updatesCheckingString, { font: new PhetFont( options.big ? 16 : 14 ), fontWeight: options.big ? 'bold' : 'normal' } )
        ],

        // a11y
        tagName: 'p',
        innerContent: updatesCheckingString
      }, options ) );
      checkingNode.step = function( dt ) {
        if ( UpdateCheck.stateProperty === 'checking' ) {
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
     * @public (joist-internal)
     */
    createUpToDateNode: function( options ) {
      return new HBox( _.extend( {
        spacing: 8,
        maxWidth: MAX_WIDTH,
        children: [
          new Rectangle( 0, 0, 20, 20, 5, 5, { fill: '#5c3', scale: options.big ? 1.2 : 1, children: [
            new FontAwesomeNode( 'check', { fill: '#fff', scale: 0.38, centerX: 10, centerY: 10 } )
          ] } ),
          new Text( updatesUpToDateString, { font: new PhetFont( options.big ? 16 : 14 ), fontWeight: options.big ? 'bold' : 'normal' } )
        ],

        // a11y
        tagName: 'p',
        innerContent: updatesUpToDateString
      }, options ) );
    },

    /**
     * "Out-of-date" state node for the "About" dialog.
     * @param {Object} [options] - passed to the Node
     * @returns {Node}
     * @public (joist-internal)
     */
    createOutOfDateAboutNode: function( options ) {
      return new HBox( _.extend( {
        spacing: 8,
        cursor: 'pointer',
        maxWidth: MAX_WIDTH,
        children: [
          new FontAwesomeNode( 'warning_sign', { fill: '#E87600', scale: 0.5 } ), // "safety orange", according to Wikipedia
          new RichText( '<a href="{{url}}">' + updatesOutOfDateString + '</a>', {
            links: { url: UpdateCheck.updateURL }, // RichText must fill in URL for link
            font: updateTextFont
          } )
        ],

        // a11y
        tagName: 'div'
      }, options ) );
    },

    /**
     * "Out-of-date" state node for the "Check for update" dialog.
     * @param {UpdateDialog} dialog - the dialog, so that it can be closed with the "No thanks..." button
     * @param {string} ourVersionString
     * @param {string} latestVersionString
     * @param {Object} [options] - passed to the Node
     * @returns {Node}
     * @public (joist-internal)
     */
    createOutOfDateDialogNode: function( dialog, ourVersionString, latestVersionString, options ) {
      return new VBox( _.extend( {
        spacing: 15,
        maxWidth: MAX_WIDTH,
        children: [
          new VBox( { spacing: 5, align: 'left', children: [
            new Text( StringUtils.format( updatesNewVersionAvailableString, latestVersionString ), {
              font: new PhetFont( 16 ), fontWeight: 'bold'
            } ),
            new Text( StringUtils.format( updatesYourCurrentVersionString, ourVersionString ), {
              font: updateTextFont
            } )
          ] } ),
          new HBox( { spacing: 25, children: [
            new TextPushButton( updatesGetUpdateString, { baseColor: '#6f6', font: updateTextFont, listener: function() {
              var newWindow = window.open( UpdateCheck.updateURL, '_blank' ); // open in a new window/tab
              newWindow.focus();
            } } ),
            new TextPushButton( updatesNoThanksString, { baseColor: '#ddd', font: updateTextFont, listener: function() {
              dialog.hide();
              // Closing the dialog is handled by the Dialog listener itself, no need to add code to close it here.
            } } )
          ] } )
        ]
      }, options ) );
    },

    /**
     * "Offline" state node
     * @param {Object} [options] - passed to the Node
     * @returns {Node}
     * @public (joist-internal)
     */
    createOfflineNode: function( options ) {
      return new HBox( _.extend( {
        spacing: 0,
        maxWidth: MAX_WIDTH,
        children: [
          new VStrut( 20 ), // spacer to match layout of other nodes
          new Text( updatesOfflineString, { font: new PhetFont( options.big ? 16 : 14 ), fontWeight: options.big ? 'bold' : 'normal' } )
        ],

        // a11y
        tagName: 'p',
        innerContent: updatesOfflineString
      }, options ) );
    }
  };

  joist.register( 'UpdateNodes', UpdateNodes );

  return UpdateNodes;
} );
