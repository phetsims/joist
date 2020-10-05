// Copyright 2015-2020, University of Colorado Boulder

/**
 * Screen for the home screen, which shows icons for selecting the sim content screens.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Property from '../../axon/js/Property.js';
import merge from '../../phet-core/js/merge.js';
import HomeScreenKeyboardHelpContent from './HomeScreenKeyboardHelpContent.js';
import HomeScreenModel from './HomeScreenModel.js';
import HomeScreenView from './HomeScreenView.js';
import joist from './joist.js';
import joistStrings from './joistStrings.js';
import Screen from './Screen.js';

// constants
const homeString = joistStrings.a11y.home;
const BACKGROUND_COLOR = 'black';

class HomeScreen extends Screen {

  /**
   * @param {Property.<string>} simNameProperty
   * @param {function():Property.<Screen>} getScreenProperty - at the time of construction, the Sim.screenProperty is
   *                                                         - not yet assigned (because it may itself include the
   *                                                         - HomeScreen), so we must use a function to lazily get it
   *                                                         - after it is assigned
   * @param {Screen[]} simScreens
   * @param {Tandem} tandem
   * @param {Object} [options]
   * @constructor
   */
  constructor( simNameProperty, getScreenProperty, simScreens, tandem, options ) {

    options = merge( {

      //TODO get this color from LookAndFeel, see https://github.com/phetsims/joist/issues/255
      backgroundColorProperty: new Property( BACKGROUND_COLOR ),

      name: homeString,

      keyboardHelpNode: new HomeScreenKeyboardHelpContent(),

      // phet-io
      instrumentNameProperty: false // requested by designers, see https://github.com/phetsims/joist/issues/627
    }, options );

    assert && assert( !options.tandem, 'tandem is a required constructor parameter, not an option' );
    options.tandem = tandem;

    super(
      () => new HomeScreenModel( getScreenProperty(), simScreens, tandem.createTandem( 'model' ) ),
      model => new HomeScreenView( simNameProperty, model, tandem.createTandem( 'view' ), _.pick( options, [
        'warningNode'
      ] ) ),
      options
    );
  }
}

// @public (read-only)
HomeScreen.BACKGROUND_COLOR = BACKGROUND_COLOR;

joist.register( 'HomeScreen', HomeScreen );

export default HomeScreen;