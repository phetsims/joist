// Copyright 2014-2018, University of Colorado Boulder

/**
 * Shows an Options dialog that consists of sim-global options.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( function( require ) {
  'use strict';

  // modules
  var Dialog = require( 'SUN/Dialog' );
  var inherit = require( 'PHET_CORE/inherit' );
  var joist = require( 'JOIST/joist' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Tandem = require( 'TANDEM/Tandem' );
  var Text = require( 'SCENERY/nodes/Text' );
  var OptionsDialogIO = require( 'JOIST/OptionsDialogIO' );

  // strings
  var optionsTitleString = require( 'string!JOIST/options.title' );

  /**
   * @param {Node} optionsNode
   * @param {Object} [options]
   * @constructor
   */
  function OptionsDialog( optionsNode, options ) {
    options = _.extend( {
      titleAlign: 'center',
      modal: true,
      hasCloseButton: true,
      tandem: Tandem.required,
      phetioType: OptionsDialogIO
    }, options );

    // Can't be in the extend call because it needs the tandem.
    if ( !options.title ) {
      options.title = new Text( optionsTitleString, {
        font: new PhetFont( 30 ),
        maxWidth: 400,
        tandem: options.tandem.createTandem( 'title' )
      } );
    }

    Dialog.call( this, optionsNode, options );

    // @private - to be called by dispose
    this.disposeOptionsDialog = function(){
      options.title && options.title.dispose();
    };
  }

  joist.register( 'OptionsDialog', OptionsDialog );

  return inherit( Dialog, OptionsDialog, {

    /**
     * Make the options dialog eligible for garbage collection.
     * @public
     */
    dispose: function() {
      this.disposeOptionsDialog();
      Dialog.prototype.dispose.call( this );
    }
  }, {
    DEFAULT_FONT: new PhetFont( 15 ),
    DEFAULT_SPACING: 10
  } );
} );