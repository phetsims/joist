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
      titleAlign: 'center',
      modal: true,
      hasCloseButton: true,
      tandem: Tandem.tandemRequired(),
      phetioType: TOptionsDialog
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