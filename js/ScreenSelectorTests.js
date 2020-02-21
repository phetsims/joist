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

  /**
   * Formats a message for each testValidScreenSelector result
   *
   * @param {string} key
   * @param {Object} expectedResult
   * @param {Object} result
   * @param {number} testNumber
   * @returns {string}
   */
  const formatMessage = ( key, expectedResult, result, testNumber ) =>
    `expected ${key}: ${expectedResult[ key ]}, actual ${key}: ${result[ key ]} for testValidScreenSelector test ${testNumber}`;

  QUnit.test( 'ScreenSelector tests', async assert => {

    /**
     * Tests a valid combination of allSimScreens and screens-related query parameters, where the expectedResult should
     * equal the result returned from ScreenSelector.select
     *
     * @param {string} queryString
     * @param {Object[]} allSimScreens
     * @param {Object} expectedResult, see ScreenSelector @returns for doc
     * @param {string} message
     */
    const testValidScreenSelector = ( queryString, allSimScreens, expectedResult, testNumber ) => {
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
        formatMessage( 'homeScreen', expectedResult, result, testNumber ) );
      assert.ok( result.initialScreen === expectedResult.initialScreen,
        formatMessage( 'initialScreen', expectedResult, result, testNumber ) );
      assert.ok( _.isEqual( result.selectedSimScreens, expectedResult.selectedSimScreens ),
        formatMessage( 'selectedSimScreens', expectedResult, result, testNumber ) );
      assert.ok( _.isEqual( result.screens, expectedResult.screens ),
        formatMessage( 'screens', expectedResult, result, testNumber ) );
    };

    /**
     * Tests an invalid combination of allSimScreens and screens-related query parameters, where ScreenSelector.select
     * should throw an error
     *
     * @param {string} queryString
     * @param {Object[]} allSimScreens
     * @param {string} message
     */
    const testInvalidScreenSelector = ( queryString, allSimScreens, testNumber ) => {
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
      }, `expected error for testInvalidScreenSelector test ${testNumber}` );
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
    }, 1 );
    testValidScreenSelector( '?screens=2', [ a, b ], {
      homeScreen: null,
      initialScreen: b,
      selectedSimScreens: [ b ],
      screens: [ b ]
    }, 2 );
    testValidScreenSelector( '?screens=1,2', [ a, b ], {
      homeScreen: hs,
      initialScreen: hs,
      selectedSimScreens: [ a, b ],
      screens: [ hs, a, b ]
    }, 3 );
    testValidScreenSelector( '?screens=2,1', [ a, b ], {
      homeScreen: hs,
      initialScreen: hs,
      selectedSimScreens: [ b, a ],
      screens: [ hs, b, a ]
    }, 4 );
    testValidScreenSelector( '?homeScreen=false', [ a, b ], {
      homeScreen: null,
      initialScreen: a,
      selectedSimScreens: [ a, b ],
      screens: [ a, b ]
    }, 5 );
    testValidScreenSelector( '?screens=2,1', [ a, b ], {
      homeScreen: hs,
      initialScreen: hs,
      selectedSimScreens: [ b, a ],
      screens: [ hs, b, a ]
    }, 6 );
    testValidScreenSelector( '?screens=2,1', [ a, b, c ], {
      homeScreen: hs,
      initialScreen: hs,
      selectedSimScreens: [ b, a ],
      screens: [ hs, b, a ]
    }, 7 );
    testValidScreenSelector( '?screens=3,1', [ a, b, c ], {
      homeScreen: hs,
      initialScreen: hs,
      selectedSimScreens: [ c, a ],
      screens: [ hs, c, a ]
    }, 8 );
    testValidScreenSelector( '?screens=2,3', [ a, b, c ], {
      homeScreen: hs,
      initialScreen: hs,
      selectedSimScreens: [ b, c ],
      screens: [ hs, b, c ]
    }, 9 );
    testValidScreenSelector( '?initialScreen=1&homeScreen=false&screens=2,1', [ a, b ], {
      homeScreen: null,
      initialScreen: a,
      selectedSimScreens: [ b, a ],
      screens: [ b, a ]
    }, 10 );
    testValidScreenSelector( '?initialScreen=0&homeScreen=true&screens=2,1', [ a, b ], {
      homeScreen: hs,
      initialScreen: hs,
      selectedSimScreens: [ b, a ],
      screens: [ hs, b, a ]
    }, 11 );
    testValidScreenSelector( '?initialScreen=1&homeScreen=true&screens=2,1', [ a, b ], {
      homeScreen: hs,
      initialScreen: a,
      selectedSimScreens: [ b, a ],
      screens: [ hs, b, a ]
    }, 12 );
    testValidScreenSelector( '?initialScreen=2&homeScreen=true&screens=1,2', [ a, b ], {
      homeScreen: hs,
      initialScreen: b,
      selectedSimScreens: [ a, b ],
      screens: [ hs, a, b ]
    }, 13 );
    testValidScreenSelector( '?initialScreen=1&homeScreen=false&screens=1', [ a, b ], {
      homeScreen: null,
      initialScreen: a,
      selectedSimScreens: [ a ],
      screens: [ a ]
    }, 14 );
    testValidScreenSelector( '?initialScreen=2&homeScreen=false&screens=2', [ a, b ], {
      homeScreen: null,
      initialScreen: b,
      selectedSimScreens: [ b ],
      screens: [ b ]
    }, 15 );

    //// incorrect QP usage ////

    // multi screen
    testInvalidScreenSelector( '?screens=0', [ a, b ], 1 );
    testInvalidScreenSelector( '?screens=3', [ a, b ], 2 );
    testInvalidScreenSelector( '?initialScreen=0&homeScreen=true&screens=1', [ a, b ], 3 );
    testInvalidScreenSelector( '?initialScreen=0&homeScreen=false&screens=0', [ a, b ], 4 );
    testInvalidScreenSelector( '?initialScreen=0&homeScreen=false&screens=2,1', [ a, b ], 5 );
    testInvalidScreenSelector( '?initialScreen=0&homeScreen=false&screens=1', [ a, b ], 6 );
    testInvalidScreenSelector( '?initialScreen=2&homeScreen=false&screens=1', [ a, b ], 7 );

    // single screen
    testInvalidScreenSelector( '?initialScreen=0', [ a ], 8 );
    testInvalidScreenSelector( '?initialScreen=1', [ a ], 9 );
    testInvalidScreenSelector( '?homeScreen=true', [ a ], 10 );
    testInvalidScreenSelector( '?homeScreen=false', [ a ], 11 );
    testInvalidScreenSelector( '?screens=0', [ a ], 12 );
    testInvalidScreenSelector( '?screens=1', [ a ], 13 );

  } );
} );