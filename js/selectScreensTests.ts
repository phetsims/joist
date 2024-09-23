// Copyright 2020-2024, University of Colorado Boulder

/**
 * QUnit tests for ScreenSelector
 *
 * Porting to TS will require re-writing tests to create Screen fixtures.
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */

import HomeScreen from './HomeScreen.js';
import { AnyScreen } from './Screen.js';
import selectScreens, { ScreenReturnType } from './selectScreens.js';

// test screen constants. Since these are tests, it is actually more valuable to typecast instead of making these actual screens.
const a = 'a' as unknown as AnyScreen;
const b = 'b' as unknown as AnyScreen;
const c = 'c' as unknown as AnyScreen;
const hs = 'hs' as unknown as HomeScreen;

const getQueryParameterValues = ( queryString: string ) => {

  // TODO: Get schema from initialize-globals.js instead of duplicating here, see https://github.com/phetsims/chipper/issues/936
  // For documentation, please see initialize-globals
  return QueryStringMachine.getAllForString( {

    homeScreen: {
      type: 'boolean',
      defaultValue: true,
      public: true
    },

    initialScreen: {
      type: 'number',
      defaultValue: 0,
      public: true

    },

    screens: {
      type: 'array',
      elementSchema: {
        type: 'number',
        isValidValue: Number.isInteger
      },
      defaultValue: null,
      isValidValue: function( value ) {
        return value === null || ( value.length === _.uniq( value ).length && value.length > 0 );
      },
      public: true
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


/**
 * Tests a valid combination of allSimScreens and screens-related query parameters, where the expectedResult should
 * equal the result returned from ScreenSelector.select
 */
const testValidScreenSelector = ( queryString: string, allSimScreens: AnyScreen[], assert: Assert, expectedResult: ScreenReturnType ) => {
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

QUnit.test( 'valid selectScreens', async assert => {

  // multi-screen
  testValidScreenSelector( '?screens=1', [ a, b ], assert, {
    homeScreen: null,
    initialScreen: a,
    selectedSimScreens: [ a ],
    screens: [ a ],
    allScreensCreated: false
  } );
  testValidScreenSelector( '?screens=2', [ a, b ], assert, {
    homeScreen: null,
    initialScreen: b,
    selectedSimScreens: [ b ],
    screens: [ b ],
    allScreensCreated: false
  } );
  testValidScreenSelector( '?screens=1,2', [ a, b ], assert, {
    homeScreen: hs,
    initialScreen: hs,
    selectedSimScreens: [ a, b ],
    screens: [ hs, a, b ],
    allScreensCreated: true
  } );
  testValidScreenSelector( '?screens=2,1', [ a, b ], assert, {
    homeScreen: hs,
    initialScreen: hs,
    selectedSimScreens: [ b, a ],
    screens: [ hs, b, a ],
    allScreensCreated: true
  } );
  testValidScreenSelector( '?initialScreen=2&homeScreen=false', [ a, b ], assert, {
    homeScreen: null,
    initialScreen: b,
    selectedSimScreens: [ a, b ],
    screens: [ a, b ],
    allScreensCreated: false
  } );
  testValidScreenSelector( '?homeScreen=false', [ a, b ], assert, {
    homeScreen: null,
    initialScreen: a,
    selectedSimScreens: [ a, b ],
    screens: [ a, b ],
    allScreensCreated: false
  } );
  testValidScreenSelector( '?screens=2,1', [ a, b, c ], assert, {
    homeScreen: hs,
    initialScreen: hs,
    selectedSimScreens: [ b, a ],
    screens: [ hs, b, a ],
    allScreensCreated: false
  } );
  testValidScreenSelector( '?screens=3,1', [ a, b, c ], assert, {
    homeScreen: hs,
    initialScreen: hs,
    selectedSimScreens: [ c, a ],
    screens: [ hs, c, a ],
    allScreensCreated: false
  } );
  testValidScreenSelector( '?screens=2,3', [ a, b, c ], assert, {
    homeScreen: hs,
    initialScreen: hs,
    selectedSimScreens: [ b, c ],
    screens: [ hs, b, c ],
    allScreensCreated: false
  } );
  testValidScreenSelector( '?initialScreen=1&homeScreen=false&screens=2,1', [ a, b ], assert, {
    homeScreen: null,
    initialScreen: a,
    selectedSimScreens: [ b, a ],
    screens: [ b, a ],
    allScreensCreated: false
  } );
  testValidScreenSelector( '?initialScreen=0&homeScreen=true&screens=2,1', [ a, b ], assert, {
    homeScreen: hs,
    initialScreen: hs,
    selectedSimScreens: [ b, a ],
    screens: [ hs, b, a ],
    allScreensCreated: true
  } );
  testValidScreenSelector( '?initialScreen=1&homeScreen=true&screens=2,1', [ a, b ], assert, {
    homeScreen: hs,
    initialScreen: a,
    selectedSimScreens: [ b, a ],
    screens: [ hs, b, a ],
    allScreensCreated: true
  } );
  testValidScreenSelector( '?initialScreen=2&homeScreen=true&screens=1,2', [ a, b ], assert, {
    homeScreen: hs,
    initialScreen: b,
    selectedSimScreens: [ a, b ],
    screens: [ hs, a, b ],
    allScreensCreated: true
  } );
  testValidScreenSelector( '?initialScreen=1&homeScreen=false&screens=1', [ a, b ], assert, {
    homeScreen: null,
    initialScreen: a,
    selectedSimScreens: [ a ],
    screens: [ a ],
    allScreensCreated: false
  } );
  testValidScreenSelector( '?initialScreen=2&homeScreen=false&screens=2', [ a, b ], assert, {
    homeScreen: null,
    initialScreen: b,
    selectedSimScreens: [ b ],
    screens: [ b ],
    allScreensCreated: false
  } );

  // single-screen
  // Like ph-scale-basics_en.html?screens=1
  testValidScreenSelector( '?screens=1', [ a ], assert, {
    homeScreen: null,
    initialScreen: a,
    selectedSimScreens: [ a ],
    screens: [ a ],
    allScreensCreated: true
  } );
  testValidScreenSelector( '?initialScreen=1', [ a ], assert, {
    homeScreen: null,
    initialScreen: a,
    selectedSimScreens: [ a ],
    screens: [ a ],
    allScreensCreated: true
  } );
  testValidScreenSelector( '?homeScreen=false', [ a ], assert, {
    homeScreen: null,
    initialScreen: a,
    selectedSimScreens: [ a ],
    screens: [ a ],
    allScreensCreated: true
  } );
} );

QUnit.test( 'invalid selectScreens (with assertions)', async assert => {

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

// Public query parameters can't just error out, they need to support adding warnings and setting to a reasonable default, so only run these when assertions are disabled. At the time of writing, the above assertion tests were copied directly into this test, to ensure each of those had a correct fallback default.
QUnit.test( 'invalid selectScreens (grace without assertions)', async assert => {

  if ( window.assert === null ) {

    testValidScreenSelector( '?screens=1,2,5&initialScreen=4', [ a, b, c ], assert, {
      homeScreen: hs,
      initialScreen: hs,
      selectedSimScreens: [ a, b, c ],
      screens: [ hs, a, b, c ],
      allScreensCreated: true
    } );
    testValidScreenSelector( '?screens=1,2,5&initialScreen=2', [ a, b, c ], assert, {
      homeScreen: hs,
      initialScreen: b,
      selectedSimScreens: [ a, b, c ],
      screens: [ hs, a, b, c ],
      allScreensCreated: true
    } );

    testValidScreenSelector( '?screens=1,2&homeScreen=false&initialScreen=7', [ a, b, c ], assert, {
      homeScreen: null,
      initialScreen: a,
      selectedSimScreens: [ a, b ],
      screens: [ a, b ],
      allScreensCreated: false
    } );

    testValidScreenSelector( '?screens=1,2&initialScreen=7', [ a, b, c ], assert, {
      homeScreen: hs,
      initialScreen: hs,
      selectedSimScreens: [ a, b ],
      screens: [ hs, a, b ],
      allScreensCreated: false
    } );

    // multi-screen
    testValidScreenSelector( '?screens=0', [ a, b ], assert, {
      homeScreen: hs,
      initialScreen: hs,
      selectedSimScreens: [ a, b ],
      screens: [ hs, a, b ],
      allScreensCreated: true
    } );
    testValidScreenSelector( '?screens=3', [ a, b ], assert, {
      homeScreen: hs,
      initialScreen: hs,
      selectedSimScreens: [ a, b ],
      screens: [ hs, a, b ],
      allScreensCreated: true
    } );
    testValidScreenSelector( '?screens=', [ a, b ], assert, {
      homeScreen: hs,
      initialScreen: hs,
      selectedSimScreens: [ a, b ],
      screens: [ hs, a, b ],
      allScreensCreated: true
    } );
    testValidScreenSelector( '?homeScreen=false&screens=', [ a, b ], assert, {
      homeScreen: null,
      initialScreen: a,
      selectedSimScreens: [ a, b ],
      screens: [ a, b ],
      allScreensCreated: false
    } );
    testValidScreenSelector( '?initialScreen=0&homeScreen=true&screens=1', [ a, b ], assert, {
      homeScreen: null,
      initialScreen: a,
      selectedSimScreens: [ a ],
      screens: [ a ],
      allScreensCreated: false
    } );

    testValidScreenSelector( '?initialScreen=0&homeScreen=true&screens=2,1', [ a, b ], assert, {
      homeScreen: hs,
      initialScreen: hs,
      selectedSimScreens: [ b, a ],
      screens: [ hs, b, a ],
      allScreensCreated: true
    } );
    testValidScreenSelector( '?initialScreen=0&homeScreen=false&screens=0', [ a, b ], assert, {
      homeScreen: null,
      initialScreen: a,
      selectedSimScreens: [ a, b ],
      screens: [ a, b ],
      allScreensCreated: false
    } );
    testValidScreenSelector( '?initialScreen=1&homeScreen=false&screens=0', [ a, b ], assert, {
      homeScreen: null,
      initialScreen: a,
      selectedSimScreens: [ a, b ],
      screens: [ a, b ],
      allScreensCreated: false
    } );
    testValidScreenSelector( '?initialScreen=0&homeScreen=false&screens=2,1', [ a, b ], assert, {
      homeScreen: null,
      initialScreen: b,
      selectedSimScreens: [ b, a ],
      screens: [ b, a ],
      allScreensCreated: false
    } );
    testValidScreenSelector( '?initialScreen=0&homeScreen=false&screens=1', [ a, b ], assert, {
      homeScreen: null,
      initialScreen: a,
      selectedSimScreens: [ a ],
      screens: [ a ],
      allScreensCreated: false
    } );
    testValidScreenSelector( '?initialScreen=2&homeScreen=false&screens=1', [ a, b ], assert, {
      homeScreen: null,
      initialScreen: a,
      selectedSimScreens: [ a ],
      screens: [ a ],
      allScreensCreated: false
    } );

    // Like ph-scale_en.html?screens=1,4
    testValidScreenSelector( '?screens=1,4', [ a, b, c ], assert, {
      homeScreen: hs,
      initialScreen: hs,
      selectedSimScreens: [ a, b, c ],
      screens: [ hs, a, b, c ],
      allScreensCreated: true
    } );

    // single-screen
    testValidScreenSelector( '?initialScreen=0', [ a ], assert, {
      homeScreen: null,
      initialScreen: a,
      selectedSimScreens: [ a ],
      screens: [ a ],
      allScreensCreated: true
    } );
    testValidScreenSelector( '?initialScreen=2', [ a ], assert, {
      homeScreen: null,
      initialScreen: a,
      selectedSimScreens: [ a ],
      screens: [ a ],
      allScreensCreated: true
    } );
    testValidScreenSelector( '?homeScreen=true', [ a ], assert, {
      homeScreen: null,
      initialScreen: a,
      selectedSimScreens: [ a ],
      screens: [ a ],
      allScreensCreated: true
    } );
    testValidScreenSelector( '?screens=0', [ a ], assert, {
      homeScreen: null,
      initialScreen: a,
      selectedSimScreens: [ a ],
      screens: [ a ],
      allScreensCreated: true
    } );
    testValidScreenSelector( '?screens=2', [ a ], assert, {
      homeScreen: null,
      initialScreen: a,
      selectedSimScreens: [ a ],
      screens: [ a ],
      allScreensCreated: true
    } );

    testValidScreenSelector( '?screens=2', [ a ], assert, {
      homeScreen: null,
      initialScreen: a,
      selectedSimScreens: [ a ],
      screens: [ a ],
      allScreensCreated: true
    } );

    // These contain errors, display warning dialog, and revert to default.
    // like ph-scale-basics_en.html?screens=2,1
    testValidScreenSelector( '?screens=2,1', [ a ], assert, {
      homeScreen: null,
      initialScreen: a,
      selectedSimScreens: [ a ],
      screens: [ a ],
      allScreensCreated: true
    } );

    testValidScreenSelector( '?screens=1.2,Screen2', [ a, b, c ], assert, {
      homeScreen: hs,
      initialScreen: hs,
      selectedSimScreens: [ a, b, c ],
      screens: [ hs, a, b, c ],
      allScreensCreated: true
    } );
  }
  else {
    assert.ok( true, 'cannot test for grace when assertions are enabled' );
  }
} );