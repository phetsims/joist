// Copyright 2014-2015, University of Colorado Boulder

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

  // phet-io modules
  var TOptionsDialog = require( 'ifphetio!PHET_IO/types/joist/TOptionsDialog' );

  // strings
  var optionsTitleString = require( 'string!JOIST/options.title' );

  /**
   * @param {Node} optionsNode
   * @constructor
   */
  function OptionsDialog( optionsNode, options ) {
    options = _.extend( {
      title: new Text( optionsTitleString, { font: new PhetFont( 30 ) } ),
      titleAlign: 'center',
      modal: true,
      hasCloseButton: true,
      tandem: Tandem.createDefaultTandem( 'optionsDialog' )
    }, options );

    var thisTandem = options.tandem;
    var superTandem = options.tandem.createSupertypeTandem();
    options.tandem = superTandem;

    Dialog.call( this, optionsNode, options );

    thisTandem.addInstance( this, TOptionsDialog );
    // Panel calls tandem.addInstance
  }

  joist.register( 'OptionsDialog', OptionsDialog );

  return inherit( Dialog, OptionsDialog, {}, {
    DEFAULT_FONT: new PhetFont( 15 ),
    DEFAULT_SPACING: 10
  } );
} );