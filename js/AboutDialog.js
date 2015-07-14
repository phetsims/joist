// Copyright 2002-2013, University of Colorado Boulder

/**
 * Shows the About dialog.
 *
 * @author Sam Reid
 */
define( function( require ) {
  'use strict';

  // modules
  var VBox = require( 'SCENERY/nodes/VBox' );
  var Text = require( 'SCENERY/nodes/Text' );
  var Node = require( 'SCENERY/nodes/Node' );
  var inherit = require( 'PHET_CORE/inherit' );
  var ButtonListener = require( 'SCENERY/input/ButtonListener' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var StringUtils = require( 'PHETCOMMON/util/StringUtils' );
  var VStrut = require( 'SCENERY/nodes/VStrut' );
  var Dialog = require( 'JOIST/Dialog' );
  var Timer = require( 'JOIST/Timer' );
  var CreditsNode = require( 'JOIST/CreditsNode' );
  var UpdateNodes = require( 'JOIST/UpdateNodes' );
  var UpdateCheck = require( 'JOIST/UpdateCheck' );
  var LinkText = require( 'JOIST/LinkText' );
  var Input = require( 'SCENERY/input/Input' );
  var SubSupText = require( 'SCENERY_PHET/SubSupText' );

  // strings
  var versionPattern = require( 'string!JOIST/versionPattern' );
  var translationCreditString = require( 'string!JOIST/translation.credits.link' );

  /**
   * @param {string} name - The name of the simulation
   * @param {string} version - The version of the simulation
   * @param {string} credits - The credits for the simulation, or falsy to show no credits
   * @param {Brand} Brand
   * @constructor
   */
  function AboutDialog( name, version, credits, Brand ) {
    var dialog = this;

    var children = [];
    children.push( new Text( name, { font: new PhetFont( 28 ) } ) );
    children.push( new Text( StringUtils.format( versionPattern, version ), { font: new PhetFont( 20 ) } ) );
    if ( phet.chipper.buildTimestamp ) {
      children.push( new Text( phet.chipper.buildTimestamp, { font: new PhetFont( 13 ) } ) );
    }

    if ( UpdateCheck.areUpdatesChecked ) {
      var positionOptions = { left: 0, top: 0 };
      var checkingNode = UpdateNodes.createCheckingNode( positionOptions );
      var upToDateNode = UpdateNodes.createUpToDateNode( positionOptions );
      var outOfDateNode = UpdateNodes.createOutOfDateAboutNode( positionOptions );
      var offlineNode = UpdateNodes.createOfflineNode( positionOptions );

      // Listener that should be called every frame where we are shown, with {number} dt as a single parameter.
      this.updateStepListener = checkingNode.stepListener;

      // Listener that should be called whenever our update state changes (while we are displayed)
      this.updateVisibilityListener = function( state ) {
        checkingNode.visible = state === 'checking';
        upToDateNode.visible = state === 'up-to-date';
        outOfDateNode.visible = state === 'out-of-date';
        offlineNode.visible = state === 'offline';
      };

      children.push( new Node( {
        children: [
          checkingNode,
          upToDateNode,
          outOfDateNode,
          offlineNode
        ]
      } ) );
    }

    children.push( new VStrut( 15 ) );
    if ( Brand.name ) {
      children.push( new SubSupText( Brand.name, {
        font: new PhetFont( 16 ),
        supScale: 0.5,
        supYOffset: 2
      } ) );
    }
    if ( Brand.copyright ) {
      children.push( new Text( Brand.copyright, { font: new PhetFont( 12 ) } ) );
    }

    if ( credits ) {
      children.push( new VStrut( 15 ) );
      children.push( new CreditsNode( credits ) );
    }

    if ( Brand.links && Brand.links.length > 0 ) {
      children.push( new VStrut( 15 ) );
      for ( var i = 0; i < Brand.links.length; i++ ) {
        var link = Brand.links[ i ];
        children.push( new LinkText( link.text, link.url, { font: new PhetFont( 14 ) } ) );
      }
    }

    // This will only work on english names. TODO make a more robust solution.
    var displayNameToDevName = function( name ) {
      var splitName = name.split( " " );

      var devName = '';
      for ( var i in splitName ) {
        if ( splitName.hasOwnProperty( i ) ) {
          devName += splitName[ i ].replace( ":", '' ).toLowerCase() + "-";
        }
      }
      // The last part added a '-' to the end to, so we take it out.
      // There are wierd unicode chacters as the first index: %E2%80%AA
      return devName.substring( 1, devName.length - 2 );

    };

    var devName = displayNameToDevName( name );

    children.push( new LinkText( translationCreditString,
      'http://phet-dev.colorado.edu/en/for-translators/translation-credit#' + devName + '-header', { font: new PhetFont( 14 ) } ) );

    var content = new VBox( { align: 'left', spacing: 5, children: children } );

    Dialog.call( this, content, {
      modal: true,
      hasCloseButton: false,

      // Focusable so it can be dismissed
      focusable: true
    } );

    // close it on a click
    this.addInputListener( new ButtonListener( {
      fire: dialog.hide.bind( dialog )
    } ) );

    // Close the dialog when escape is pressed, the ButtonListener above will also close it when enter/space pressed
    this.addInputListener( {
      keydown: function( event ) {
        var keyCode = event.domEvent.keyCode;
        if ( keyCode === Input.KEY_ESCAPE ) {
          dialog.hide();
        }
      }
    } );
  }

  return inherit( Dialog, AboutDialog, {
    show: function() {
      if ( UpdateCheck.areUpdatesChecked ) {
        UpdateCheck.resetTimeout();

        // Fire off a new update check if we were marked as offline or unchecked before, and we handle updates.
        if ( UpdateCheck.state === 'offline' || UpdateCheck.state === 'unchecked' ) {
          UpdateCheck.check();
        }

        // Hook up our spinner listener when we're shown
        Timer.addStepListener( this.updateStepListener );

        // Hook up our visibility listener
        UpdateCheck.stateProperty.link( this.updateVisibilityListener );
      }

      Dialog.prototype.show.call( this );
    },

    hide: function() {
      Dialog.prototype.hide.call( this );

      if ( UpdateCheck.areUpdatesChecked ) {
        // Disconnect our visibility listener
        UpdateCheck.stateProperty.unlink( this.updateVisibilityListener );

        // Disconnect our spinner listener when we're hidden
        Timer.removeStepListener( this.updateStepListener );
      }
    }
  } );
} );
