// Copyright 2020, University of Colorado Boulder

import joist from './joist.js';

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
 * @param {Object[]} allSimScreens - all of the screens declared by the sim
 * @param {boolean} homeScreenQueryParameter - from phet.chipper.queryParameters.homeScreen
 * @param {boolean} homeScreenQueryParameterProvided
 * @param {number} initialScreenIndex - from phet.chipper.queryParameters.initialScreen
 * @param {boolean} initialScreenQueryParameterProvided
 * @param {number[]} screensQueryParameter - from phet.chipper.queryParameters.screens
 * @param {boolean} screensQueryParameterProvided
 * @param {function( selectedSimScreens ):HomeScreen} createHomeScreen
 * @returns {{homeScreen:Object, initialScreen:Object, selectedSimScreens:Object[], screens:Object[]}}
 * @throws Error if incompatible data is provided
 */
const selectScreens = ( allSimScreens,
                        homeScreenQueryParameter,
                        homeScreenQueryParameterProvided,
                        initialScreenIndex,
                        initialScreenQueryParameterProvided,
                        screensQueryParameter,
                        screensQueryParameterProvided,
                        createHomeScreen ) => {

  if ( allSimScreens.length === 1 ) {

    // Problems related to query parameters throw errors instead of assertions (so they are not stripped out)
    if ( homeScreenQueryParameterProvided && homeScreenQueryParameter ) {
      throw new Error( 'cannot specify homeScreen=true for single-screen sims' );
    }
  }

  // the sim screens for this runtime, accounting for specifying a subset with `?screens`
  let selectedSimScreens;

  // The screens to be included, and their order, may be specified via a query parameter.
  // For documentation, see the schema for phet.chipper.queryParameters.screens in initialize-globals.js.
  // TODO: Use QueryStringMachine to validate instead, see https://github.com/phetsims/joist/issues/599
  if ( screensQueryParameterProvided ) {
    //REVIEW: Shouldn't we just see if the result is the default value of `null`, instead of checking if it was
    //REVIEW: provided? See https://github.com/phetsims/joist/issues/614
    selectedSimScreens = screensQueryParameter.map( userIndex => {
      const screenIndex = userIndex - 1; // screens query parameter is 1-based
      if ( screenIndex < 0 || screenIndex > allSimScreens.length - 1 ) {
        throw new Error( 'invalid screen index: ' + userIndex );
      }
      return allSimScreens[ screenIndex ];
    } );
  }
  else {
    selectedSimScreens = allSimScreens;
  }

  // Specifying ?homeScreen=false creates a simulation with no homescreen, and hence is incompatible with ?initialScreen=0,
  // which specifies to show the home screen. Note that the default value of initialScreen:0 is ignored when there is
  // no home screen.
  if ( initialScreenQueryParameterProvided && initialScreenIndex === 0 && homeScreenQueryParameter === false ) {
    // TODO: Use QueryStringMachine to validate instead, see https://github.com/phetsims/joist/issues/599
    throw new Error( 'cannot specify initialScreen=0 when home screen is disabled with homeScreen=false' );
  }

  // For a single screen simulation (whether the simulation only declares one screen, or whether the user has specified
  // a single screen via ?screens), there is no home screen, and hence ?initialScreen=0 which requests to show the homescreen
  // on startup should fail.
  if ( initialScreenQueryParameterProvided && initialScreenIndex === 0 && selectedSimScreens.length === 1 ) {
    throw new Error( 'cannot specify initialScreen=0 when one screen is specified with screens=n' );
  }

  const screens = selectedSimScreens.slice();

  let homeScreen = null;

  // If a sim has multiple screens and the query parameter homeScreen=false is not provided, add a HomeScreen
  if ( selectedSimScreens.length > 1 && homeScreenQueryParameter ) {
    homeScreen = createHomeScreen( selectedSimScreens );
    screens.unshift( homeScreen );
  }

  // The first screen for the sim, can be the HomeScreen if applicable
  let initialScreen;
  if ( homeScreen && initialScreenIndex === 0 ) {

    // If the home screen is supplied, then it is at index 0, so use the query parameter value directly (because the
    // query parameter is 1-based). If `?initialScreen` is 0 then there is no offset to apply.
    initialScreen = homeScreen;
  }
  else if ( initialScreenIndex === 0 ) {

    // There is no home screen and the initialScreen query parameter was not supplied, so we select the first sim screen.
    initialScreen = selectedSimScreens[ 0 ];
  }
  else {

    // If the home screen is not supplied, then the first sim screen is at index 0, so subtract 1 from the query parameter.
    initialScreen = allSimScreens[ initialScreenIndex - 1 ];
  }

  if ( screens.indexOf( initialScreen ) === -1 ) {
    throw new Error( 'screen not found: ' + initialScreenIndex );
  }

  return {
    homeScreen: homeScreen,
    initialScreen: initialScreen,
    selectedSimScreens: selectedSimScreens,
    screens: screens
  };
};

joist.register( 'selectScreens', selectScreens );
export default selectScreens;