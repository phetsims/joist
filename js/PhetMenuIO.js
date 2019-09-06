// Copyright 2017-2019, University of Colorado Boulder

/**
 * IO type for PhetMenu
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Andrew Adare (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var joist = require( 'JOIST/joist' );
  var ObjectIO = require( 'TANDEM/types/ObjectIO' );

  class PhetMenuIO extends ObjectIO {}

  PhetMenuIO.documentation = 'The PhET Menu in the bottom right of the screen';
  PhetMenuIO.validator = { isValidValue: v => v instanceof phet.joist.PhetMenu };
  PhetMenuIO.typeName = 'PhetMenuIO';
  ObjectIO.validateSubtype( PhetMenuIO );

  return joist.register( 'PhetMenuIO', PhetMenuIO );
} );