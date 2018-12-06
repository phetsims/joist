// Copyright 2018, University of Colorado Boulder

/**
 * The "kebab" menu icon, 3 dots stacked vertically that look like a shish kebob.
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

  // const
  const CIRCLE_RADIUS = 2.5;

  class KebabMenuIcon extends Path {

    /**
     * @param {Object} [options]
     */
    constructor( options ) {

      const shape = new Shape();
      for ( var i = 0; i < 3; i++ ) {
        var circleOffset = i * 3.5 * CIRCLE_RADIUS;
        shape.arc( 0, circleOffset, CIRCLE_RADIUS, 0, 2 * Math.PI, false );
      }

      super( shape, options );
    }
  }

  return joist.register( 'KebabMenuIcon', KebabMenuIcon );
} ); 