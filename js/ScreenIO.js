// Copyright 2020, University of Colorado Boulder

/**
 * IO type for Screen
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const joist = require( 'JOIST/joist' );
  const ObjectIO = require( 'TANDEM/types/ObjectIO' );
  const ReferenceIO = require( 'TANDEM/types/ReferenceIO' );

  class ScreenIO extends ReferenceIO {}

  ScreenIO.documentation = 'Section of a simulation which has its own model and view.';
  ScreenIO.validator = { isValidValue: v => v instanceof phet.joist.Screen };
  ScreenIO.typeName = 'ScreenIO';
  ObjectIO.validateSubtype( ScreenIO );

  return joist.register( 'ScreenIO', ScreenIO );
} );