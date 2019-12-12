// Copyright 2014-2019, University of Colorado Boulder

/**
 * Shows an Options dialog that consists of sim-global options.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 * @author Chris Malley (PixelZoom, Inc.)
 */
define( require => {
  'use strict';

  // modules
  const Dialog = require( 'SUN/Dialog' );
  const inherit = require( 'PHET_CORE/inherit' );
  const joist = require( 'JOIST/joist' );
  const merge = require( 'PHET_CORE/merge' );
  const PhetFont = require( 'SCENERY_PHET/PhetFont' );
  const Tandem = require( 'TANDEM/Tandem' );
  const Text = require( 'SCENERY/nodes/Text' );

  // strings
  const optionsTitleString = require( 'string!JOIST/options.title' );

  /**
   * @param {function(tandem:Tandem):Node} createContent - creates the dialog's content
   * @param {Object} [options]
   * @constructor
   */
  function OptionsDialog( createContent, options ) {

    options = merge( {

      titleAlign: 'center',
      bottomMargin: 20,
      ySpacing: 20,

      // phet-io
      tandem: Tandem.REQUIRED,
      phetioDynamicElement: true
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