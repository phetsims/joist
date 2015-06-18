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
  var inherit = require( 'PHET_CORE/inherit' );
  var ButtonListener = require( 'SCENERY/input/ButtonListener' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var StringUtils = require( 'PHETCOMMON/util/StringUtils' );
  var VStrut = require( 'SCENERY/nodes/VStrut' );
  var Dialog = require( 'JOIST/Dialog' );
  var CreditsNode = require( 'JOIST/CreditsNode' );
  var UpdateNode = require( 'JOIST/UpdateNode' );
  var UpdateCheck = require( 'JOIST/UpdateCheck' );
  var LinkText = require( 'JOIST/LinkText' );
  var Input = require( 'SCENERY/input/Input' );

  // strings
  var versionPattern = require( 'string!JOIST/versionPattern' );

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
      this.updateNode = new UpdateNode();
      children.push( this.updateNode );
    }

    children.push( new VStrut( 15 ) );
    children.push( new Text( Brand.name, { font: new PhetFont( 16 ) } ) );
    children.push( new Text( Brand.copyright, { font: new PhetFont( 12 ) } ) );

    if ( credits ) {
      children.push( new VStrut( 15 ) );
      children.push( new CreditsNode( credits ) );
    }

    if ( Brand.links && Brand.links.length ) {
      children.push( new VStrut( 15 ) );
      for ( var i = 0; i < Brand.links.length; i++ ) {
        var link = Brand.links[ i ];
        children.push( new LinkText( link.text, link.url, { font: new PhetFont( 14 ) } ) );
      }
    }

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
      this.updateNode && this.updateNode.show();

      Dialog.prototype.show.call( this );
    },

    hide: function() {
      Dialog.prototype.hide.call( this );

      this.updateNode && this.updateNode.hide();
    }
  } );
} );
