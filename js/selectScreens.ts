// Copyright 2020-2025, University of Colorado Boulder

import type IntentionalAny from '../../phet-core/js/types/IntentionalAny.js';
import { QueryStringMachine } from '../../query-string-machine/js/QueryStringMachineModule.js';
import type HomeScreen from './HomeScreen.js';
import joist from './joist.js';
import { type AnyScreen } from './Screen.js';

export type ScreenReturnType = {
  homeScreen: HomeScreen | null;
  initialScreen: AnyScreen;
  selectedSimScreens: AnyScreen[];
  screens: AnyScreen[];
  allScreensCreated: boolean;
};

/**
 * Given an array of all possible screens that a sim can have, select and order them according to the relevant query
 * parameters. This also will create a homeScreen if needed, and specify the initialScreen for startup.
 *
 * Parameters suffixed with "Provided" will be true if the that query parameter was actually in the URL, as opposed to
 * the value of the query parameter being the default.
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 *
 * @param allSimScreens - all of the screens declared by the sim, duck-typed for tests
 * @param homeScreenQueryParameter - from phet.chipper.queryParameters.homeScreen
 * @param homeScreenQueryParameterProvided
 * @param initialScreenIndex - from phet.chipper.queryParameters.initialScreen
 * @param initialScreenQueryParameterProvided
 * @param screensQueryParameter - from phet.chipper.queryParameters.screens
 * @param screensQueryParameterProvided
 * @param createHomeScreen
 * @returns - duck-typed for tests
 * @throws Error if incompatible data is provided
 */
export default function selectScreens( allSimScreens: AnyScreen[],
                                       homeScreenQueryParameter: boolean,
                                       homeScreenQueryParameterProvided: boolean,
                                       initialScreenIndex: number,
                                       initialScreenQueryParameterProvided: boolean,
                                       screensQueryParameter: number[],
                                       screensQueryParameterProvided: boolean,
                                       setupScreens: ( screens: AnyScreen[] ) => void,
                                       createHomeScreen: ( screens: AnyScreen[] ) => HomeScreen ): ScreenReturnType {

  if ( allSimScreens.length === 1 && homeScreenQueryParameterProvided && homeScreenQueryParameter ) {
    gracefulAssert( 'homeScreen', homeScreenQueryParameter, 'cannot specify homeScreen=true for single-screen sims' );
  }

  // the ordered list of sim screens for this runtime
  let selectedSimScreens: AnyScreen[] = [];

  if ( screensQueryParameterProvided && ( !screensQueryParameter || screensQueryParameter.length === 0 ) ) {
    gracefulAssert( 'screens', screensQueryParameter, '"?screens" query parameter must have screen values' );
    selectedSimScreens = allSimScreens;
  }

  // If a subset of screens was specified with the `screens` query parameter, add them to selectedSimScreens. Otherwise,
  // use all of the available sim screens as the default. Note that if the value of `screens` did not pass validation
  // in QueryStringMachine, it will be reverted to its default value of `null`, so it also needs to be checked for
  // truthiness before attempting to use it. For `screens` documentation, see the schema at
  // phet.chipper.queryParameters.screens in initialize-globals.js.
  if ( screensQueryParameterProvided && screensQueryParameter ) {

    for ( let i = 0; i < screensQueryParameter.length; i++ ) {

      const userIndex = screensQueryParameter[ i ];
      const screenIndex = userIndex - 1; // screens query parameter uses 1-based indices, so convert to 0-based index

      if ( screenIndex >= 0 && screenIndex < allSimScreens.length ) {

        // index is valid, add screen
        selectedSimScreens.push( allSimScreens[ screenIndex ] );
      }
      else {

        // index is invalid
        gracefulAssert( 'screens', screensQueryParameter, `invalid value in screens query parameter: ${userIndex}` );
        selectedSimScreens = allSimScreens;
        break;
      }
    }
  }
  else {
    selectedSimScreens = allSimScreens;
  }

  setupScreens( selectedSimScreens );

  // Specifying ?homeScreen=false creates a simulation with no HomeScreen, and hence is incompatible with
  // ?initialScreen=0, which specifies to show the home screen. Note that the default value of initialScreen:0 is
  // ignored when there is no HomeScreen.
  if ( initialScreenQueryParameterProvided && initialScreenIndex === 0 && !homeScreenQueryParameter ) {
    const errorMessage = 'cannot specify initialScreen=0 when home screen is disabled with homeScreen=false';

    gracefulAssert( 'initialScreen', initialScreenIndex, errorMessage );
    gracefulAssert( 'homeScreen', homeScreenQueryParameter, errorMessage );
  }

  // For a single screen simulation (whether the simulation only declares one screen, or whether the user has specified
  // a single screen via ?screens), there is no HomeScreen, and hence ?initialScreen=0 which requests to show the
  // HomeScreen on startup should fail.
  if ( initialScreenQueryParameterProvided && initialScreenIndex === 0 && selectedSimScreens.length === 1 ) {

    // handle gracefully when running without ?ea
    gracefulAssert( 'initialScreen', initialScreenIndex,
      'cannot specify initialScreen=0 for single-screen sims or when only one screen is loaded with screens=n' );
  }

  const screens = selectedSimScreens.slice();

  let homeScreen = null;

  // If a sim has multiple screens and the query parameter homeScreen=false is not provided, add a HomeScreen
  if ( selectedSimScreens.length > 1 && homeScreenQueryParameter ) {
    homeScreen = createHomeScreen( selectedSimScreens );
    screens.unshift( homeScreen );
  }

  // Initial screen is 1-indexed, but taken from the 0-index list of allSimScreens. If the initial screen index is 0, then we need to consider if there is a
  // home screen to show (which "screens" already does for us).
  let initialScreen = initialScreenIndex === 0 ? screens[ 0 ]
                                               : allSimScreens[ initialScreenIndex - 1 ];

  if ( !screens.includes( initialScreen ) ) {
    gracefulAssert( 'initialScreen', initialScreenIndex, `invalid initial screen: ${initialScreenIndex}` );
    initialScreen = screens[ 0 ];
  }

  // {boolean} indicates whether all possible screens have been created (order-independent)
  const allScreensCreated = _.isEqual( new Set( allSimScreens ), new Set( selectedSimScreens ) ) &&
                            ( allSimScreens.length > 1 ? !!homeScreen : true );
  return {
    homeScreen: homeScreen,
    initialScreen: initialScreen,
    selectedSimScreens: selectedSimScreens,
    screens: screens,
    allScreensCreated: allScreensCreated
  };
}

// handle gracefully when running without ?ea, and to support setting selectedSimScreens to default values,
// see https://github.com/phetsims/joist/issues/599
function gracefulAssert( key: string, value: IntentionalAny, message: string ): void {

  // handle gracefully when running without ?ea
  QueryStringMachine.addWarning( key, value, message );

  // to support expected failures in selectScreensTests.js unit tests
  assert && assert( false, message );
}

joist.register( 'selectScreens', selectScreens );