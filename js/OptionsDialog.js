// Copyright 2002-2013, University of Colorado Boulder

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

  // strings
  var optionsTitleString = require( 'string!JOIST/options.title' );

  /**
   * @param {Node} optionsNode
   * @constructor
   */
  function OptionsDialog( optionsNode ) {
    Dialog.call( this, optionsNode, {
      title: new Text( optionsTitleString, { font: new PhetFont( 30 ) } ),
      titleAlign: 'center',
      modal: true,
      hasCloseButton: false
    } );
  }

  inherit( Dialog, OptionsDialog );

  OptionsDialog.DEFAULT_FONT = new PhetFont( 15 );
  OptionsDialog.DEFAULT_SPACING = 10;

  return OptionsDialog;
} );