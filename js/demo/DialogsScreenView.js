// Copyright 2015-2018, University of Colorado Boulder

/**
 * View for demonstrating dialogs.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */
define( function( require ) {
  'use strict';

  // modules
  var Dialog = require( 'SUN/Dialog' );
  var inherit = require( 'PHET_CORE/inherit' );
  var joist = require( 'JOIST/joist' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var RectangularPushButton = require( 'SUN/buttons/RectangularPushButton' );
  var ScreenView = require( 'JOIST/ScreenView' );
  var Text = require( 'SCENERY/nodes/Text' );

  // constants
  var BUTTON_FONT = new PhetFont( { size: 20 } );

  /**
   * @constructor
   */
  function DialogsScreenView() {

    ScreenView.call( this );

    // dialog will be created the first time the button is pressed, lazily because Dialog
    // requires sim bounds during Dialog construction
    var dialog = null;

    var modalDialogButton = new RectangularPushButton( {
      content: new Text( 'modal dialog', { font: BUTTON_FONT } ),
      listener: function() {
        if ( !dialog ) {
          dialog = createDialog( true );
        }
        dialog.show();
      },
      left: this.layoutBounds.left + 100,
      top: this.layoutBounds.top + 100
    } );
    this.addChild( modalDialogButton );

    // var nonModalDialogButton = new RectangularPushButton( {
    //   content: new Text( 'non-modal dialog', { font: BUTTON_FONT } ),
    //   listener: function() {
    //     createDialog( false ).show();
    //   },
    //   left: modalDialogButton.right + 20,
    //   top: modalDialogButton.top
    // } );
    // this.addChild( nonModalDialogButton );
  }

  joist.register( 'DialogsScreenView', DialogsScreenView );

  /**
   * Creates a model or non-modal dialog
   * @param {boolean} modal
   * @returns {Dialog}
   */
  var createDialog = function( modal ) {
    var contentNode = new Text( modal ? 'modal dialog' : 'non-modal dialog', {
      font: new PhetFont( 20 )
    } );
    return new Dialog( contentNode, {
      modal: modal,
      hasCloseButton: !modal
    } );
  };

  return inherit( ScreenView, DialogsScreenView );
} );