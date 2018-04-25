// Copyright 2015-2018, University of Colorado Boulder

/**
 * View for demonstrating dialogs.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var joist = require( 'JOIST/joist' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var ScreenView = require( 'JOIST/ScreenView' );
  var Text = require( 'SCENERY/nodes/Text' );

  /**
   * @constructor
   */
  function DialogsScreenView() {

    ScreenView.call( this );

    this.addChild( new Text( 'TODO: add tests for Dialog subtypes', {
      font: new PhetFont( 24 ),
      center: this.layoutBounds.center
    } ) );
  }

  joist.register( 'DialogsScreenView', DialogsScreenView );

  return inherit( ScreenView, DialogsScreenView );
} );