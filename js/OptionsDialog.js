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
  var OptionsDialogIO = require( 'JOIST/OptionsDialogIO' );
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
      tandem: Tandem.required,
      phetioType: OptionsDialogIO
    }, options );

    assert && assert( !options.title, 'OptionsDialog sets title' );
    options.title = new Text( optionsTitleString, {
      font: new PhetFont( 30 ),
      maxWidth: 400 // determined empirically

      // TODO: Support instrumented element that is dynamic/lazily created, see https://github.com/phetsims/phet-io/issues/1454
      // tandem: options.tandem.createTandem( 'title' )
    } );

    // TODO: Support instrumented element that is dynamic/lazily created, see https://github.com/phetsims/phet-io/issues/1454
    // const content = createContent( options.tandem.createTandem( 'content' ) );
    const content = createContent( Tandem.optional );

    Dialog.call( this, content, options );
  }

  joist.register( 'OptionsDialog', OptionsDialog );

  return inherit( Dialog, OptionsDialog, {}, {
    DEFAULT_FONT: new PhetFont( 15 ),
    DEFAULT_SPACING: 10
  } );
} );