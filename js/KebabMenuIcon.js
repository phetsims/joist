// Copyright 2018-2019, University of Colorado Boulder

/**
 * The "kebab" menu icon, 3 dots stacked vertically that look like a shish kebab.
 * See https://github.com/phetsims/joist/issues/544
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */
define( require => {
  'use strict';

  // modules
  const joist = require( 'JOIST/joist' );
  const Path = require( 'SCENERY/nodes/Path' );
  const Shape = require( 'KITE/Shape' );

  // constants
  const CIRCLE_RADIUS = 2.5;

  class KebabMenuIcon extends Path {

    /**
     * @param {Object} [options]
     */
    constructor( options ) {

      const shape = new Shape();
      for ( let i = 0; i < 3; i++ ) {
        shape.circle( 0, i * 3.543 * CIRCLE_RADIUS, CIRCLE_RADIUS ); // args are: x, y, radius
      }

      super( shape, options );
    }
  }

  return joist.register( 'KebabMenuIcon', KebabMenuIcon );
} ); 