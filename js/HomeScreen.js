// Copyright 2015-2020, University of Colorado Boulder

/**
 * Screen for the home screen, which shows icons for selecting the sim content screens.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Property from '../../axon/js/Property.js';
import inherit from '../../phet-core/js/inherit.js';
import merge from '../../phet-core/js/merge.js';
import HomeScreenModel from './HomeScreenModel.js';
import HomeScreenView from './HomeScreenView.js';
import joist from './joist.js';
import Screen from './Screen.js';

// constants
const BACKGROUND_COLOR = 'black';

/**
 * REVIEW: Are we avoiding @param here? https://github.com/phetsims/joist/issues/602
 * {string} simName
 * {function():Property.<Screen>} getScreenProperty - at the time of construction, the Sim.screenProperty is not yet
 *                                                  - assigned (because it may itself include the HomeScreen), so we
 *                                                  - must use a function to lazily get it after it is assigned
 * REVIEW: What is the downside of creating the screenProperty before creating the HomeScreen? This seems like a lot
 * REVIEW: of work to avoid that. See https://github.com/phetsims/joist/issues/602
 * {Screen[]} simScreens
 * {Tandem} tandem
 * (options} [options]
 * @constructor
 */
function HomeScreen( simName, getScreenProperty, simScreens, tandem, options ) {

  options = merge( {

    //TODO get this color from LookAndFeel, see https://github.com/phetsims/joist/issues/255
    backgroundColorProperty: new Property( BACKGROUND_COLOR )
  }, options );

  assert && assert( !options.tandem, 'tandem is a required constructor parameter, not an option' );
  options.tandem = tandem;

  Screen.call( this,

    // createModel
    () => new HomeScreenModel( getScreenProperty(), simScreens, tandem.createTandem( 'model' ) ),

    // createView
    model => new HomeScreenView( simName, model, tandem.createTandem( 'view' ), _.pick( options, [
      'warningNode'
    ] ) ),

    options
  );
}

joist.register( 'HomeScreen', HomeScreen );

export default inherit( Screen, HomeScreen, {}, {

  // @public
  BACKGROUND_COLOR: BACKGROUND_COLOR
} );