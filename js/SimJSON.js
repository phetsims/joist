// Copyright 2002-2013, University of Colorado Boulder

/**
 * Utilities for conversion to/from JSON, consolidated here to simplify maintenance.
 * Note: Not all dependencies should be put here, or this file will have too many require statements.  At some point, we will probably have to allow
 * sims to declare some of their own components for replacer/reviver.
 *
 * @author Sam Reid
 */
define( function( require ) {
  'use strict';

  var Vector2 = require( 'DOT/Vector2' );
  var Color = require( 'SCENERY/util/Color' );

  return {
    replacer: function( key, value ) {
      if ( value instanceof Vector2 ) {
        return { _type: 'Vector2', x: value.x, y: value.y };
      }
      else if ( value instanceof Color ) {
        return { _type: 'Color', r: value.r, g: value.g, b: value.b, a: value.a };
      }
      else {
        return value;
      }
    },

    reviver: function( k, v ) {
      if ( k === "" ) {
        return v;
      }
      if ( v && v._type && v._type === 'Vector2' ) {
        return new Vector2( v.x, v.y );
      }
      else if ( v && v._type && v._type === 'Color' ) {
        return new Color( v.r, v.g, v.b, v.a );
      }
      return v;
    }
  };
} );