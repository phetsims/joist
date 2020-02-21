// Copyright 2020, University of Colorado Boulder

// import {QUERY_PARAMETERS_SCHEMA} from '../../chipper/js/initialize-globals';

/**
 * QUnit tests for ScreenSelector
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const ScreenSelector = require( 'JOIST/ScreenSelector' );

  const getQueryParameterValues = queryString => {

    // TODO: Get schema from initialize-globals.js instead of duplicating here, see https://github.com/phetsims/joist/issues/603
    return QueryStringMachine.getAllForString( {

      homeScreen: {
        type: 'boolean',
        defaultValue: true
      },

      initialScreen: {
        type: 'number',
        defaultValue: 0
      },

      screens: {
        type: 'array',
        elementSchema: {
          type: 'number'
        },
        defaultValue: null,
        isValidValue: function( value ) {
          return value === null || ( value.length === _.uniq( value ).length );
        }
      }

    }, queryString );
  };

  const formatMessage = ( key, expectedResult, result, message ) =>
    `expected ${key}: ${expectedResult[ key ]}, actual ${key}: ${result[ key ]}, for: ${message}`;

  QUnit.test( 'ScreenSelector tests', async assert => {

    /**
     *
     * @param {string} queryString
     * @param {Object[]} allSimScreens
     * @param {Object} expectedResult, see ScreenSelector @returns for doc
     * @param {string} message
     */
    const testValidScreenSelector = ( queryString, allSimScreens, expectedResult, message = '' ) => {
      const queryParameterValues = getQueryParameterValues( queryString );

      const result = ScreenSelector.select(
        allSimScreens,
        queryParameterValues.homeScreen,
        QueryStringMachine.containsKeyForString( 'homeScreen', queryString ),
        queryParameterValues.initialScreen,
        QueryStringMachine.containsKeyForString( 'initialScreen', queryString ),
        queryParameterValues.screens,
        QueryStringMachine.containsKeyForString( 'screens', queryString ),
        simScreens => hs,
        queryString
      );

      // test the four return values from ScreenSelector
      assert.ok( result.homeScreen === expectedResult.homeScreen,
        formatMessage( 'homeScreen', expectedResult, result, message ) );
      assert.ok( result.initialScreen === expectedResult.initialScreen,
        formatMessage( 'initialScreen', expectedResult, result, message ) );
      assert.ok( _.isEqual( result.selectedSimScreens, expectedResult.selectedSimScreens ),
        formatMessage( 'selectedSimScreens', expectedResult, result, message ) );
      assert.ok( _.isEqual( result.screens, expectedResult.screens ),
        formatMessage( 'screens', expectedResult, result, message ) );
    };

    /**
     * @param {string} queryString
     * @param {Object[]} allSimScreens
     * @param {string} message
     */
    const testInvalidScreenSelector = ( queryString, allSimScreens, message ) => {
      const queryParameterValues = getQueryParameterValues( queryString );

      window.assert && assert.throws( () => {
        ScreenSelector.select(
          allSimScreens,
          queryParameterValues.homeScreen,
          QueryStringMachine.containsKeyForString( 'homeScreen', queryString ),
          queryParameterValues.initialScreen,
          QueryStringMachine.containsKeyForString( 'initialScreen', queryString ),
          queryParameterValues.screens,
          QueryStringMachine.containsKeyForString( 'screens', queryString ),
          simScreens => hs,
          queryString
        );
      }, '' );
    };

    // test screen constants
    const a = 'a';
    const b = 'b';
    const c = 'c';
    const hs = 'hs';

    //// correct QP usage ////

    testValidScreenSelector( '?screens=1', [ a, b ], {
      homeScreen: null,
      initialScreen: a,
      selectedSimScreens: [ a ],
      screens: [ a ]
    } );
    testValidScreenSelector( '?screens=2', [ a, b ], {
      homeScreen: null,
      initialScreen: b,
      selectedSimScreens: [ b ],
      screens: [ b ]
    } );
    testValidScreenSelector( '?screens=1,2', [ a, b ], {
      homeScreen: hs,
      initialScreen: hs,
      selectedSimScreens: [ a, b ],
      screens: [ hs, a, b ]
    } );
    testValidScreenSelector( '?screens=2,1', [ a, b ], {
      homeScreen: hs,
      initialScreen: hs,
      selectedSimScreens: [ b, a ],
      screens: [ hs, b, a ]
    } );
    testValidScreenSelector( '?homeScreen=false', [ a, b ], {
      homeScreen: null,
      initialScreen: a,
      selectedSimScreens: [ a, b ],
      screens: [ a, b ]
    } );
    testValidScreenSelector( '?screens=2,1', [ a, b ], {
      homeScreen: hs,
      initialScreen: hs,
      selectedSimScreens: [ b, a ],
      screens: [ hs, b, a ]
    } );
    testValidScreenSelector( '?screens=2,1', [ a, b, c ], {
      homeScreen: hs,
      initialScreen: hs,
      selectedSimScreens: [ b, a ],
      screens: [ hs, b, a ]
    } );
    testValidScreenSelector( '?screens=3,1', [ a, b, c ], {
      homeScreen: hs,
      initialScreen: hs,
      selectedSimScreens: [ c, a ],
      screens: [ hs, c, a ]
    } );
    testValidScreenSelector( '?screens=2,3', [ a, b, c ], {
      homeScreen: hs,
      initialScreen: hs,
      selectedSimScreens: [ b, c ],
      screens: [ hs, b, c ]
    } );
    testValidScreenSelector( '?initialScreen=1&homeScreen=false&screens=2,1', [ a, b ], {
      homeScreen: null,
      initialScreen: a,
      selectedSimScreens: [ b, a ],
      screens: [ b, a ]
    } );
    testValidScreenSelector( '?initialScreen=0&homeScreen=true&screens=2,1', [ a, b ], {
      homeScreen: hs,
      initialScreen: hs,
      selectedSimScreens: [ b, a ],
      screens: [ hs, b, a ]
    } );
    testValidScreenSelector( '?initialScreen=1&homeScreen=true&screens=2,1', [ a, b ], {
      homeScreen: hs,
      initialScreen: a,
      selectedSimScreens: [ b, a ],
      screens: [ hs, b, a ]
    } );
    testValidScreenSelector( '?initialScreen=2&homeScreen=true&screens=1,2', [ a, b ], {
      homeScreen: hs,
      initialScreen: b,
      selectedSimScreens: [ a, b ],
      screens: [ hs, a, b ]
    } );
    testValidScreenSelector( '?initialScreen=1&homeScreen=false&screens=1', [ a, b ], {
      homeScreen: null,
      initialScreen: a,
      selectedSimScreens: [ a ],
      screens: [ a ]
    } );
    testValidScreenSelector( '?initialScreen=2&homeScreen=false&screens=2', [ a, b ], {
      homeScreen: null,
      initialScreen: b,
      selectedSimScreens: [ b ],
      screens: [ b ]
    } );

    //// incorrect QP usage ////

    // multi screen
    testInvalidScreenSelector( '?screens=3', [ a, b ] );
    testInvalidScreenSelector( '?initialScreen=0&homeScreen=true&screens=1', [ a, b ] );
    testInvalidScreenSelector( '?initialScreen=0&homeScreen=false&screens=0', [ a, b ] );
    testInvalidScreenSelector( '?initialScreen=0&homeScreen=false&screens=2,1', [ a, b ] );
    testInvalidScreenSelector( '?initialScreen=0&homeScreen=false&screens=1', [ a, b ] );
    testInvalidScreenSelector( '?initialScreen=2&homeScreen=false&screens=1', [ a, b ] );

    // single screen
    testInvalidScreenSelector( '?initialScreen=0', [ a ] );
    testInvalidScreenSelector( '?homeScreen=true', [ a ] );
    testInvalidScreenSelector( '?homeScreen=false', [ a ] );
    testInvalidScreenSelector( '?screens=1', [ a ] );

  } );
} );