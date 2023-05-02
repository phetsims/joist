// Copyright 2020-2023, University of Colorado Boulder

/**
 * QUnit tests for ScreenSelector
 *
 * Porting to TS will require re-writing tests to create Screen fixtures.
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */

import selectScreens, { ScreenReturnType } from './selectScreens.js';
import { AnyScreen } from './Screen.js';
import HomeScreen from './HomeScreen.js';

// test screen constants. Since these are tests, it is actually more valuable to typecast instead of making these actual screens.
const a = 'a' as unknown as AnyScreen;
const b = 'b' as unknown as AnyScreen;
const c = 'c' as unknown as AnyScreen;
const hs = 'hs' as unknown as HomeScreen;

const getQueryParameterValues = ( queryString: string ) => {

  // TODO: Get schema from initialize-globals.js instead of duplicating here, see https://github.com/phetsims/chipper/issues/936
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
      defaultValue: [],
      isValidValue: function( value ) {
        return value === null || ( value.length === _.uniq( value ).length );
      }
    }

  }, queryString );
};

/**
 * Formats a message for each testValidScreenSelector result
 */
const formatMessage = ( key: keyof ScreenReturnType, expectedResult: ScreenReturnType, result: ScreenReturnType, description: string ): string =>
  `expected ${key}: ${expectedResult[ key ]}, actual ${key}: ${result[ key ]} for valid selectScreens test ${description}`;

/**
 * Format the query string + all sim screens to uniquely identify the test.
 */
const getDescription = ( queryString: string, allSimScreens: AnyScreen[] ): string => `${queryString} ${JSON.stringify( allSimScreens )}`;

QUnit.test( 'valid selectScreens', async assert => {

  /**
   * Tests a valid combination of allSimScreens and screens-related query parameters, where the expectedResult should
   * equal the result returned from ScreenSelector.select
   */
  const testValidScreenSelector = ( queryString: string, allSimScreens: AnyScreen[], expectedResult: ScreenReturnType ) => {
    const queryParameterValues = getQueryParameterValues( queryString );

    const result = selectScreens(
      allSimScreens,
      queryParameterValues.homeScreen,
      QueryStringMachine.containsKeyForString( 'homeScreen', queryString ),
      queryParameterValues.initialScreen,
      QueryStringMachine.containsKeyForString( 'initialScreen', queryString ),
      queryParameterValues.screens,
      QueryStringMachine.containsKeyForString( 'screens', queryString ),
      _.noop,
      () => hs
    );

    const description = getDescription( queryString, allSimScreens );

    // test the four return values from selectScreens
    assert.ok( result.homeScreen === expectedResult.homeScreen,
      formatMessage( 'homeScreen', expectedResult, result, description ) );
    assert.ok( result.initialScreen === expectedResult.initialScreen,
      formatMessage( 'initialScreen', expectedResult, result, description ) );
    assert.ok( _.isEqual( result.selectedSimScreens, expectedResult.selectedSimScreens ),
      formatMessage( 'selectedSimScreens', expectedResult, result, description ) );
    assert.ok( _.isEqual( result.screens, expectedResult.screens ),
      formatMessage( 'screens', expectedResult, result, description ) );

    assert.ok( _.isEqual( result.allScreensCreated, expectedResult.allScreensCreated ),
      formatMessage( 'allScreensCreated', expectedResult, result, description ) );
  };

  // multi-screen
  testValidScreenSelector( '?screens=1', [ a, b ], {
    homeScreen: null,
    initialScreen: a,
    selectedSimScreens: [ a ],
    screens: [ a ],
    allScreensCreated: false
  } );
  testValidScreenSelector( '?screens=2', [ a, b ], {
    homeScreen: null,
    initialScreen: b,
    selectedSimScreens: [ b ],
    screens: [ b ],
    allScreensCreated: false
  } );
  testValidScreenSelector( '?screens=1,2', [ a, b ], {
    homeScreen: hs,
    initialScreen: hs,
    selectedSimScreens: [ a, b ],
    screens: [ hs, a, b ],
    allScreensCreated: true
  } );
  testValidScreenSelector( '?screens=2,1', [ a, b ], {
    homeScreen: hs,
    initialScreen: hs,
    selectedSimScreens: [ b, a ],
    screens: [ hs, b, a ],
    allScreensCreated: true
  } );
  testValidScreenSelector( '?homeScreen=false', [ a, b ], {
    homeScreen: null,
    initialScreen: a,
    selectedSimScreens: [ a, b ],
    screens: [ a, b ],
    allScreensCreated: false
  } );
  testValidScreenSelector( '?screens=2,1', [ a, b, c ], {
    homeScreen: hs,
    initialScreen: hs,
    selectedSimScreens: [ b, a ],
    screens: [ hs, b, a ],
    allScreensCreated: false
  } );
  testValidScreenSelector( '?screens=3,1', [ a, b, c ], {
    homeScreen: hs,
    initialScreen: hs,
    selectedSimScreens: [ c, a ],
    screens: [ hs, c, a ],
    allScreensCreated: false
  } );
  testValidScreenSelector( '?screens=2,3', [ a, b, c ], {
    homeScreen: hs,
    initialScreen: hs,
    selectedSimScreens: [ b, c ],
    screens: [ hs, b, c ],
    allScreensCreated: false
  } );
  testValidScreenSelector( '?initialScreen=1&homeScreen=false&screens=2,1', [ a, b ], {
    homeScreen: null,
    initialScreen: a,
    selectedSimScreens: [ b, a ],
    screens: [ b, a ],
    allScreensCreated: false
  } );
  testValidScreenSelector( '?initialScreen=0&homeScreen=true&screens=2,1', [ a, b ], {
    homeScreen: hs,
    initialScreen: hs,
    selectedSimScreens: [ b, a ],
    screens: [ hs, b, a ],
    allScreensCreated: true
  } );
  testValidScreenSelector( '?initialScreen=1&homeScreen=true&screens=2,1', [ a, b ], {
    homeScreen: hs,
    initialScreen: a,
    selectedSimScreens: [ b, a ],
    screens: [ hs, b, a ],
    allScreensCreated: true
  } );
  testValidScreenSelector( '?initialScreen=2&homeScreen=true&screens=1,2', [ a, b ], {
    homeScreen: hs,
    initialScreen: b,
    selectedSimScreens: [ a, b ],
    screens: [ hs, a, b ],
    allScreensCreated: true
  } );
  testValidScreenSelector( '?initialScreen=1&homeScreen=false&screens=1', [ a, b ], {
    homeScreen: null,
    initialScreen: a,
    selectedSimScreens: [ a ],
    screens: [ a ],
    allScreensCreated: false
  } );
  testValidScreenSelector( '?initialScreen=2&homeScreen=false&screens=2', [ a, b ], {
    homeScreen: null,
    initialScreen: b,
    selectedSimScreens: [ b ],
    screens: [ b ],
    allScreensCreated: false
  } );

  // single-screen
  // Like ph-scale-basics_en.html?screens=1
  testValidScreenSelector( '?screens=1', [ a ], {
    homeScreen: null,
    initialScreen: a,
    selectedSimScreens: [ a ],
    screens: [ a ],
    allScreensCreated: true
  } );
  testValidScreenSelector( '?initialScreen=1', [ a ], {
    homeScreen: null,
    initialScreen: a,
    selectedSimScreens: [ a ],
    screens: [ a ],
    allScreensCreated: true
  } );
  testValidScreenSelector( '?homeScreen=false', [ a ], {
    homeScreen: null,
    initialScreen: a,
    selectedSimScreens: [ a ],
    screens: [ a ],
    allScreensCreated: true
  } );
} );

QUnit.test( 'invalid selectScreens', async assert => {

  assert.ok( true, 'At least one assert must run, even if not running with ?ea' );

  /**
   * Tests an invalid combination of allSimScreens and screens-related query parameters, where selectScreens should
   * throw an error
   */
  const testInvalidScreenSelector = ( queryString: string, allSimScreens: AnyScreen[] ) => {
    const queryParameterValues = getQueryParameterValues( queryString );
    const description = getDescription( queryString, allSimScreens );

    window.assert && assert.throws( () => {
      selectScreens(
        allSimScreens,
        queryParameterValues.homeScreen,
        QueryStringMachine.containsKeyForString( 'homeScreen', queryString ),
        queryParameterValues.initialScreen,
        QueryStringMachine.containsKeyForString( 'initialScreen', queryString ),
        queryParameterValues.screens,
        QueryStringMachine.containsKeyForString( 'screens', queryString ),
        _.noop,
        () => hs
      );
    }, `expected error for invalid selectScreens test ${description}` );
  };

  // multi-screen
  testInvalidScreenSelector( '?screens=0', [ a, b ] );
  testInvalidScreenSelector( '?screens=3', [ a, b ] );
  testInvalidScreenSelector( '?screens=', [ a, b ] );
  testInvalidScreenSelector( '?initialScreen=0&homeScreen=true&screens=1', [ a, b ] );
  testInvalidScreenSelector( '?initialScreen=0&homeScreen=false&screens=0', [ a, b ] );
  testInvalidScreenSelector( '?initialScreen=0&homeScreen=false&screens=2,1', [ a, b ] );
  testInvalidScreenSelector( '?initialScreen=0&homeScreen=false&screens=1', [ a, b ] );
  testInvalidScreenSelector( '?initialScreen=2&homeScreen=false&screens=1', [ a, b ] );

  // Like ph-scale_en.html?screens=1,4
  testInvalidScreenSelector( '?screens=1,4', [ a, b, c ] );

  // single-screen
  testInvalidScreenSelector( '?initialScreen=0', [ a ] );
  testInvalidScreenSelector( '?initialScreen=2', [ a ] );
  testInvalidScreenSelector( '?homeScreen=true', [ a ] );
  testInvalidScreenSelector( '?screens=0', [ a ] );
  testInvalidScreenSelector( '?screens=2', [ a ] );

  testInvalidScreenSelector( '?screens=2', [ a ] );

  // These contain errors, display warning dialog, and revert to default.
  // like ph-scale-basics_en.html?screens=2,1
  testInvalidScreenSelector( '?screens=2,1', [ a ] );
} );