// Copyright 2014-2019, University of Colorado Boulder

/**
 * Shows an Options dialog that consists of sim-global options.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 * @author Chris Malley (PixelZoom, Inc.)
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

  // strings
  var optionsTitleString = require( 'string!JOIST/options.title' );

  /**
   * @param {function(tandem:Tandem):Node} createContent - creates the dialog's content
   * @param {Object} [options]
   * @constructor
   */
  function OptionsDialog( createContent, options ) {

    options = _.extend( {

      titleAlign: 'center',
      bottomMargin: 20,
      ySpacing: 20,

      // phet-io
      tandem: Tandem.required
    }, options );

    assert && assert( !options.title, 'OptionsDialog sets title' );
    options.title = new Text( optionsTitleString, {
      font: new PhetFont( 30 ),
      maxWidth: 400, // determined empirically
      tandem: options.tandem.createTandem( 'title' )
    } );

    const content = createContent( options.tandem.createTandem( 'content' ) );

    Dialog.call( this, content, options );
  }

  joist.register( 'OptionsDialog', OptionsDialog );

  return inherit( Dialog, OptionsDialog, {}, {
    DEFAULT_FONT: new PhetFont( 15 ),
    DEFAULT_SPACING: 10
  } );
} );