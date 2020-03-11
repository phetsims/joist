// Copyright 2020, University of Colorado Boulder

import joist from './joist.js';

/**
 * Given an array of all possible screens that a sim can have, select and order them according to the relevant query
 * parameters. This also will create a homeScreen if needed, and specify the initialScreen for startup.
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
    if ( homeScreenQueryParameterProvided ) {
      throw new Error( 'homeScreen query parameter not supported for single-screen sims' );
    }
    //REVIEW: Why is initialScreen not allowed on single-screen sims? Does this mean that for anything that iterates
    //REVIEW: over sims and tries to go to the 1st screen, we'll need to record whether they have just one and omit
    //REVIEW: the query parameter for no other reason than it would error out due to this assertion?
    //REVIEW: See https://github.com/phetsims/joist/issues/613
    if ( initialScreenQueryParameterProvided ) {
      throw new Error( 'initialScreen query parameter not supported for single-screen sims' );
    }
    //REVIEW: Similar issue to initialScreen, since screens=1 presumably would work ok?
    //REVIEW: https://github.com/phetsims/joist/issues/613
    if ( screensQueryParameterProvided ) {
      throw new Error( 'screens query parameter not supported for single-screen sims' );
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

  // If the user specified an initial screen other than the homescreen and specified a subset of screens
  // remap the selected 1-based index from the original screens list to the filtered screens list.
  if ( initialScreenQueryParameterProvided && initialScreenIndex === 0 ) {
    //REVIEW: Why is the containsKey needed? Seems like the default is zero, which is checked by the second condition.
    //REVIEW: https://github.com/phetsims/joist/issues/602. Also, the `initialScreenIndex === 0` check seems to be
    //REVIEW: the opposite of the documentation ("initial screen other than the homescreen"). It appears the doc
    //REVIEW: is incorrect in this case?

    if ( homeScreenQueryParameter === false ) {
      // TODO: Use QueryStringMachine to validate instead, see https://github.com/phetsims/joist/issues/599
      throw new Error( 'cannot specify initialScreen=0 when home screen is disabled with homeScreen=false' );
    }
    if ( selectedSimScreens.length === 1 ) {
      throw new Error( 'cannot specify initialScreen=0 when one screen is specified with screens=n' );
    }
  }

  const screens = selectedSimScreens.slice();

  let homeScreen = null;

  // If a sim has multiple screens and the query parameter homeScreen=false is not provided, add a HomeScreen
  if ( selectedSimScreens.length > 1 && homeScreenQueryParameter ) {
    //REVIEW: Visibility docs? https://github.com/phetsims/joist/issues/602
    homeScreen = createHomeScreen( selectedSimScreens );
    screens.unshift( homeScreen );
  }

  // The first screen for the sim, can be the HomeScreen if applicable
  let initialScreen = null;
  if ( homeScreen && initialScreenIndex === 0 ) {
    // If the home screen is supplied, then it is at index 0, so use the query parameter value directly (because the
    // query parameter is 1-based). If `?initialScreen` is 0 then there is no offset to apply.
    initialScreen = homeScreen;
  }
  else if ( initialScreenIndex === 0 ) {
    initialScreen = selectedSimScreens[ initialScreenIndex ];
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