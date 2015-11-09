// Copyright 2013-2015, University of Colorado Boulder

/**
 * Shows the About dialog.
 *
 * @author Sam Reid (PhET Interactive Simulations)
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
  var SubSupText = require( 'SCENERY_PHET/SubSupText' );
  var packageJSON = require( 'JOIST/packageJSON' );

  // strings
  var versionPatternString = require( 'string!JOIST/versionPattern' );

  /**
   * @param {string} name - The name of the simulation
   * @param {string} version - The version of the simulation
   * @param {string} credits - The credits for the simulation, or falsy to show no credits
   * @param {Brand} Brand
   * @param {string} locale - The locale string
   * @constructor
   */
  function AboutDialog( name, version, credits, Brand, locale ) {
    var dialog = this;

    var children = [];
    children.push( new Text( name, { font: new PhetFont( 28 ) } ) );
    children.push( new Text( StringUtils.format( versionPatternString, version ), { font: new PhetFont( 20 ) } ) );
    if ( phet.chipper.buildTimestamp ) {
      children.push( new Text( phet.chipper.buildTimestamp, { font: new PhetFont( 13 ) } ) );
    }

    if ( UpdateCheck.areUpdatesChecked ) {
      var positionOptions = { left: 0, top: 0 };
      var checkingNode = UpdateNodes.createCheckingNode( positionOptions );
      var upToDateNode = UpdateNodes.createUpToDateNode( positionOptions );
      var outOfDateNode = UpdateNodes.createOutOfDateAboutNode( positionOptions );
      var offlineNode = UpdateNodes.createOfflineNode( positionOptions );

      // @private - Listener that should be called every frame where we are shown, with {number} dt as a single parameter.
      this.updateStepListener = checkingNode.stepListener;

      // @private - Listener that should be called whenever our update state changes (while we are displayed)
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

    // Show the brand name, if it exists
    if ( Brand.name ) {
      children.push( new SubSupText( Brand.name, {
        font: new PhetFont( 16 ),
        supScale: 0.5,
        supYOffset: 2
      } ) );
    }

    // Show the brand copyright statement, if it exists
    if ( Brand.copyright ) {
      children.push( new Text( Brand.copyright, { font: new PhetFont( 12 ) } ) );
    }

    // Add credits for specific brands
    if ( credits && ( Brand.id === 'phet' || Brand.id === 'phet-io' ) ) {
      children.push( new VStrut( 15 ) );
      children.push( new CreditsNode( credits ) );
    }

    // Show any links identified in the brand
    var links = Brand.getLinks( packageJSON.name, locale );
    if ( links && links.length > 0 ) {
      children.push( new VStrut( 15 ) );
      for ( var i = 0; i < links.length; i++ ) {
        var link = links[ i ];
        children.push( new LinkText( link.text, link.url, { font: new PhetFont( 14 ) } ) );
      }
    }

    var content = new VBox( {
      align: 'left',
      spacing: 5,
      children: children
    } );

    Dialog.call( this, content, {
      modal: true,
      hasCloseButton: false,

      // Focusable so it can be dismissed
      focusable: true,

      // accessible content
      accessibleContent: {
        createPeer: function( accessibleInstance ) {
          var accessiblePeer = Dialog.DialogAccessiblePeer( accessibleInstance, dialog );
          var trail = accessibleInstance.trail;

          var domElement = accessiblePeer.domElement;

          var nameElement = document.createElement( 'h1' );
          nameElement.id = 'simName-' + trail.uniqueId;
          nameElement.innerText = name;

          domElement.appendChild( nameElement );
          return accessiblePeer;
        }
      }
    } );

    // close it on a click
    this.addInputListener( new ButtonListener( {
      fire: dialog.hide.bind( dialog )
    } ) );
  }

  return inherit( Dialog, AboutDialog, {

    /**
     * Show the dialog
     * @public
     */
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

    /**
     * Hide the dialog
     * @public
     */
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