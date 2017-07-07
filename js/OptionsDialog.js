// Copyright 2014-2017, University of Colorado Boulder

/**
 * Shows an Options dialog that consists of sim-global options.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( function( require ) {
  'use strict';

  // modules
  var Text = require( 'SCENERY/nodes/Text' );
  var inherit = require( 'PHET_CORE/inherit' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Dialog = require( 'JOIST/Dialog' );
  var joist = require( 'JOIST/joist' );
  var Tandem = require( 'TANDEM/Tandem' );
  var TOptionsDialog = require( 'JOIST/TOptionsDialog' );

  // strings
  var optionsTitleString = require( 'string!JOIST/options.title' );

  /**
   * @param {Node} optionsNode
   * @param {Object} [options]
   * @constructor
   */
  function OptionsDialog( optionsNode, options ) {
    options = _.extend( {
      title: new Text( optionsTitleString, {
        font: new PhetFont( 30 ),
        maxWidth: 400
      } ),
      titleAlign: 'center',
      modal: true,
      hasCloseButton: true,
      tandem: Tandem.tandemRequired(),
      phetioType: TOptionsDialog
    }, options );

    Dialog.call( this, optionsNode, options );
  }

  joist.register( 'OptionsDialog', OptionsDialog );

  return inherit( Dialog, OptionsDialog, {

    /**
     * Override Dialog's hide function to properly dispose what needs to be disposed on hide.
     * @public
     */
    hide: function() {
      this.disposeOptionsDialog();
      Dialog.prototype.hide.call( this );
    }
  }, {
    DEFAULT_FONT: new PhetFont( 15 ),
    DEFAULT_SPACING: 10
  } );
} );