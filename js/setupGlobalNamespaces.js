// Copyright 2002-2013, University of Colorado Boulder

/**
 * Creates global references (on the phet object) to all normal modules loaded through require.js. For example, if the
 * sim uses SCENERY_PHET/buttons/ArrowButton, calling process() will create phet.sceneryPhet.ArrowButton.
 *
 * Currently, this is mainly used as a debugging aid, so that it's possible to access modules easily from the console.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( function( require ) {
  'use strict';

  return function() {
    // Get a reference to the defined modules. There doesn't seem to be a common way to access this internal
    // information yet in the optimizer (with almond) and with require.js, so we have a fall-back set up.
    var defined = window.requirejs._defined || window.require.s.contexts._.defined;

    for ( var moduleName in defined ) {
      // Skip strings, images, or anything imported with a plugin. Could be added later if needed
      if ( moduleName.indexOf( '!' ) >= 0 ) {
        continue;
      }

      // Skip anything without a slash (the plugins themselves, and the main/config files)
      if ( moduleName.indexOf( '/' ) < 0 ) {
        continue;
      }

      // Skip anything with '..' in the path (chipper imports some things where we can't get the repository prefix)
      if ( moduleName.indexOf( '..' ) >= 0 ) {
        continue;
      }

      var prefix = moduleName.slice( 0, moduleName.indexOf( '/' ) ); // e.g. 'SCENERY_PHET'
      var name = moduleName.slice( moduleName.lastIndexOf( '/' ) + 1 ); // e.g. 'ArrowButton'

      // Convert to camel-case, e.g. 'SCENERY_PHET' to 'sceneryPhet'
      var prefixTokens = prefix.toLowerCase().split( '_' );
      var mappedPrefix = [ prefixTokens[ 0 ] ].concat( prefixTokens.slice( 1 ).map( function( token ) {
        return token.charAt( 0 ).toUpperCase() + token.slice( 1 );
      } ) ).join( '' );

      // Check to see if the repository's prefix namespace already exists (e.g. phet.sceneryPhet)
      if ( !phet[ mappedPrefix ] ) {
        phet[ mappedPrefix ] = {};
      }

      // Only set the value if the namespaced object doesn't already exist.
      if ( !phet[ mappedPrefix ][ name ] ) {
        phet[ mappedPrefix ][ name ] = defined[ moduleName ];
      }
    }
  };
} );
