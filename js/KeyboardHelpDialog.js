// Copyright 2014-2015, University of Colorado Boulder

/**
 * Shows a Dialog with content describing keyboard interactions. Brought up by a button
 * in the navigation bar.
 *
 * @author Jesse Greenberg
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Dialog = require( 'JOIST/Dialog' );
  var joist = require( 'JOIST/joist' );
  var ButtonListener = require( 'SCENERY/input/ButtonListener' );
  var Path = require( 'SCENERY/nodes/Path' );
  var Text = require( 'SCENERY/nodes/Text' );
  var Shape = require( 'KITE/Shape' );
  var JoistA11yStrings = require( 'JOIST/JoistA11yStrings' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );

  // constants
  var CLOSE_BUTTON_WIDTH = 7;
  var CLOSE_BUTTON_MARGIN = 10;

  /**
   * Constructor.
   * @param {Node} helpContent - a node containing the sim specific keyboard help content
   * @param {object} options
   * @constructor
   */
  function KeyboardHelpDialog( helpContent, options ) {

    // title
    var titleText = new Text( JoistA11yStrings.hotKeysAndHelpString, {
      font: new PhetFont( {
        weight: 'bold',
        size: 20
      } ),

      // a11y options
      tagName: 'h1',
      accessibleLabel: JoistA11yStrings.hotKeysAndHelpString
    } );

    options = _.extend( {
      titleAlign: 'center',
      title: titleText,
      modal: true,
      hasCloseButton: false,
      fill: 'rgb( 214, 237, 30 )',
      xMargin: 0,
      yMargin: 0
    }, options );

    // shape and path for a custom close button
    var closeButtonShape = new Shape();
    closeButtonShape.moveTo( -CLOSE_BUTTON_WIDTH, - CLOSE_BUTTON_WIDTH ).lineTo( CLOSE_BUTTON_WIDTH, CLOSE_BUTTON_WIDTH );
    closeButtonShape.moveTo( CLOSE_BUTTON_WIDTH, -CLOSE_BUTTON_WIDTH ).lineTo( -CLOSE_BUTTON_WIDTH, CLOSE_BUTTON_WIDTH );
    var closeButtonPath = new Path( closeButtonShape, {
      stroke: 'black',
      lineCap: 'round',
      lineWidth: 2,
      cursor: 'pointer',

      // a11y
      tagName: 'button',
      accessibleLabel: JoistA11yStrings.closeString,
      focusHighlight: Shape.bounds( closeButtonShape.getBounds().dilated( 10 ) )
    } );  

    // add a listener to hide the dialog
    var self = this;
    closeButtonPath.addInputListener( new ButtonListener( {
      down: function() {
        self.hide();
      }
    } ) );
    closeButtonPath.mouseArea = Shape.rect( closeButtonPath.left - closeButtonPath.width * 2, closeButtonPath.top - CLOSE_BUTTON_MARGIN / 2, closeButtonPath.width * 4, closeButtonPath.height + CLOSE_BUTTON_MARGIN );
    closeButtonPath.touchArea = closeButtonPath.mouseArea;

    Dialog.call( this, helpContent, options );

    // position and add the close button
    closeButtonPath.right = helpContent.right - CLOSE_BUTTON_MARGIN;
    closeButtonPath.top = helpContent.top + CLOSE_BUTTON_MARGIN;
    this.addChild( closeButtonPath );

    // a11y - input listener for the close button, must be disposed
    var clickListener = { click: function() { self.hide(); } };
    closeButtonPath.addAccessibleInputListener( clickListener );

    // @private - for garbage collection
    this.disposeKeyboardHelpDialog = function() {
      closeButtonPath.removeAccessibleInputListener( clickListener );
    };
  }

  joist.register( 'KeyboardHelpDialog', KeyboardHelpDialog );

  return inherit( Dialog, KeyboardHelpDialog, {

    /**
     * So the Dialog is eligible for garbage collection.
     */
    dispose: function() {
      this.disposeKeyboardHelpDialog();
      Dialog.prototype.dispose && Dialog.prototype.dispose.call( this );
    }
  } );
} );