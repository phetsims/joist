// Copyright 2015-2018, University of Colorado Boulder

/**
 * Checks global references (on the phet object) to verify all modules loaded through require.js that match the usual
 * pattern that would be namespaced. For example, if the sim uses SCENERY_PHET/buttons/ArrowButton, calling this
 * will check for the presence of phet.sceneryPhet.ArrowButton.
 *
 * See https://github.com/phetsims/tasks/issues/378
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( function( require ) {
  'use strict';

  // modules
  var joist = require( 'JOIST/joist' );

  var checkNamespaces = function() {

    // Get a reference to the defined modules. There doesn't seem to be a common way to access this internal
    // information yet in the optimizer (with almond) and with require.js, so we have a fall-back set up.
    // Conditionals added due to https://github.com/phetsims/phet-io/issues/1149#issuecomment-345416924
    var defined = ( window.requirejs && window.requirejs._defined ) || ( window.require && window.require.s.contexts._.defined );

    /**
     * This function iterates over all defined AMD modules and reports to a problemHandler any problems.
     * @param {function} problemHandler, a function that is called when an error occurs, with an {string} argument that
     * describes the problem
     */
    var visit = function( problemHandler ) {
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
        var namespace = [ prefixTokens[ 0 ] ].concat( prefixTokens.slice( 1 ).map( function( token ) {
          return token.charAt( 0 ).toUpperCase() + token.slice( 1 );
        } ) ).join( '' );

        // Skip the module that contains the namespace object (e.g. scenery.js, tandemNamespace.js)
        if ( name === namespace || name === ( namespace + 'Namespace' ) ) {
          continue;
        }

        var namespacedObject = phet[ namespace ] && phet[ namespace ][ name ];

        if ( !namespacedObject ) {
          problemHandler( 'not namespaced: ' + namespace + '.' + name );
        }
        if ( namespacedObject && namespacedObject !== defined[ moduleName ] ) {
          problemHandler( namespace + '.' + name + ' is different than the expected namespaced object' );
        }
      }
    };

    // First pass prints out all issues, to assist developers as we are adding the namespace register calls
    visit( function( errorMessage ) {
      console.log( errorMessage );
    } );

    // Second pass fails with an assertion error.
    visit( function( errorMessage ) {
      assert && assert( false, errorMessage );
    } );
  };

  joist.register( 'checkNamespaces', checkNamespaces );

  return checkNamespaces;
} );