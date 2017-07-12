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
  var HELP_CONTENT_MARGIN = 20;
  var TITLE_MAX_WIDTH = 500;

  // string
  var keyboardShortcutsTitleString = require( 'string!JOIST/keyboardShortcuts.title' );

  /**
   * Constructor.
   * @param {KeyboardHelpButton} keyboardHelpButton
   * @param {Node} helpContent - a node containing the sim specific keyboard help content
   * @param {object} options
   * @constructor
   */
  function KeyboardHelpDialog( keyboardHelpButton, helpContent, options ) {

    // title
    var titleText = new Text( keyboardShortcutsTitleString, {
      font: new PhetFont( {
        weight: 'bold',
        size: 20
      } ),
      maxWidth: TITLE_MAX_WIDTH,

      // a11y options
      tagName: 'h1',
      accessibleLabel: JoistA11yStrings.hotKeysAndHelpString
    } );

    options = _.extend( {
      titleAlign: 'center',
      title: titleText,
      modal: true,
      hasCloseButton: false,
      fill: 'rgb( 214, 237, 249 )',
      xMargin: HELP_CONTENT_MARGIN,
      yMargin: HELP_CONTENT_MARGIN,
      titleSpacing: HELP_CONTENT_MARGIN,
      focusOnCloseNode: keyboardHelpButton
    }, options );

    // shape and path for a custom close button
    var closeButtonShape = new Shape();
    closeButtonShape.moveTo( -CLOSE_BUTTON_WIDTH, - CLOSE_BUTTON_WIDTH ).lineTo( CLOSE_BUTTON_WIDTH, CLOSE_BUTTON_WIDTH );
    closeButtonShape.moveTo( CLOSE_BUTTON_WIDTH, -CLOSE_BUTTON_WIDTH ).lineTo( -CLOSE_BUTTON_WIDTH, CLOSE_BUTTON_WIDTH );

    // @public (joist-internal)
    this.closeButtonPath = new Path( closeButtonShape, {
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
    var buttonListener = new ButtonListener( {
      down: function() {
        self.hide();
      }
    } );
    this.closeButtonPath.addInputListener( buttonListener );

    // mouse/touch areas for the close button
    var areaX = this.closeButtonPath.left - this.closeButtonPath.width * 2;
    var areaY = this.closeButtonPath.top - CLOSE_BUTTON_MARGIN / 2;
    var width = this.closeButtonPath.width * 4;
    var height = this.closeButtonPath.height + CLOSE_BUTTON_MARGIN;
    this.closeButtonPath.mouseArea = Shape.rect( areaX, areaY, width, height );
    this.closeButtonPath.touchArea = this.closeButtonPath.mouseArea;

    Dialog.call( this, helpContent, options );

    // position and add the close button
    this.closeButtonPath.right = helpContent.right + 2 * HELP_CONTENT_MARGIN - CLOSE_BUTTON_MARGIN;
    this.closeButtonPath.top = helpContent.top + CLOSE_BUTTON_MARGIN;
    this.addChild( this.closeButtonPath );

    // @private (a11y) - input listener for the close button, must be disposed
    var clickListener = this.closeButtonPath.addAccessibleInputListener( {
      click: function() {
        self.hide();
        self.focusActiveElement();  
      } }
    );

    // @private - to be called by dispose
    this.disposeKeyboardHelpDialog = function() {
      self.closeButtonPath.removeInputListener( buttonListener );
      self.closeButtonPath.removeAccessibleInputListener( clickListener );
    };
  }

  joist.register( 'KeyboardHelpDialog', KeyboardHelpDialog );

  return inherit( Dialog, KeyboardHelpDialog, {

    /**
     * So the Dialog is eligible for garbage collection.
     */
    dispose: function() {
      this.disposeKeyboardHelpDialog();
      Dialog.prototype.dispose.call( this );
    }
  } );
} );