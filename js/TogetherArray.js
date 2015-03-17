//  Copyright 2002-2014, University of Colorado Boulder

/**
 * Provides support for the internal implementation of Together API components, but not to the external API.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );

  /**
   *
   * @constructor
   */
  function TogetherArray( name ) {
    this.name = name;
    this.index = 0;
  }

  return inherit( Object, TogetherArray, {
    getComponentID: function( instance ) {
      return this.name + '[' + (this.index++) + ']';
    }
  }, {} );
} );