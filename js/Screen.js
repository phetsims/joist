// Copyright 2013-2020, University of Colorado Boulder

/**
 * A Screen is the largest chunk of a simulation. (Java sims used the term Module, but that term
 * is too overloaded to use with JavaScript and Git.)
 *
 * When creating a Sim, Screens are supplied as the arguments. They can be specified as object literals or through
 * instances of this class. This class may centralize default behavior or state for Screens in the future, but right
 * now it only allows you to create Sims without using named parameter object literals.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import BooleanProperty from '../../axon/js/BooleanProperty.js';
import Property from '../../axon/js/Property.js';
import PropertyIO from '../../axon/js/PropertyIO.js';
import Dimension2 from '../../dot/js/Dimension2.js';
import Shape from '../../kite/js/Shape.js';
import inherit from '../../phet-core/js/inherit.js';
import merge from '../../phet-core/js/merge.js';
import StringUtils from '../../phetcommon/js/util/StringUtils.js';
import Path from '../../scenery/js/nodes/Path.js';
import Rectangle from '../../scenery/js/nodes/Rectangle.js';
import PhetioObject from '../../tandem/js/PhetioObject.js';
import Tandem from '../../tandem/js/Tandem.js';
import NullableIO from '../../tandem/js/types/NullableIO.js';
import StringIO from '../../tandem/js/types/StringIO.js';
import joist from './joist.js';
import joistStrings from './joist-strings.js';
import ScreenIO from './ScreenIO.js';

// a11y strings
const screenNamePatternString = joistStrings.a11y.screenNamePattern;
const screenSimPatternString = joistStrings.a11y.screenSimPattern;
const simScreenString = joistStrings.a11y.simScreen;

// constants
const MINIMUM_HOME_SCREEN_ICON_SIZE = new Dimension2( 548, 373 );
const MINIMUM_NAVBAR_ICON_SIZE = new Dimension2( 147, 100 );
const NAVBAR_ICON_ASPECT_RATIO = MINIMUM_NAVBAR_ICON_SIZE.width / MINIMUM_NAVBAR_ICON_SIZE.height;
const HOME_SCREEN_ICON_ASPECT_RATIO = MINIMUM_HOME_SCREEN_ICON_SIZE.width / MINIMUM_HOME_SCREEN_ICON_SIZE.height;
const ICON_ASPECT_RATIO_TOLERANCE = 5E-3; // how close to the ideal aspect ratio an icon must be

// Home screen and navigation bar icons must have the same aspect ratio, see https://github.com/phetsims/joist/issues/76
assert && assert( Math.abs( HOME_SCREEN_ICON_ASPECT_RATIO - HOME_SCREEN_ICON_ASPECT_RATIO ) < ICON_ASPECT_RATIO_TOLERANCE,
  'MINIMUM_HOME_SCREEN_ICON_SIZE and MINIMUM_NAVBAR_ICON_SIZE must have the same aspect ratio' );

/**
 * @param {function} createModel
 * @param {function:Object } createView - function( model )
 * @param {Object} [options]
 * @constructor
 */
function Screen( createModel, createView, options ) {

  options = merge( {

    // {string|null} name of the sim, as displayed to the user.
    // For single-screen sims, there is no home screen or navigation bar, and null is OK.
    // For multi-screen sims, this must be provided.
    name: null,

    // {Property.<Color|string>} background color of the Screen
    backgroundColorProperty: new Property( 'white' ),

    // {Node|null} icon shown on the home screen. If null, then a default is created.
    // For single-screen sims, there is no home screen and the default is OK.
    homeScreenIcon: null,

    // {boolean} whether to draw a frame around the small icons on home screen
    showUnselectedHomeScreenIconFrame: false,

    // {Node|null} icon shown in the navigation bar. If null, then the home screen icon will be used, scaled to fit.
    navigationBarIcon: null,

    // {string|null} show a frame around the screen icon when the navbar's background fill is this color
    // 'black', 'white', or null (no frame)
    showScreenIconFrameForNavigationBarFill: null,

    // dt cap in seconds, see https://github.com/phetsims/joist/issues/130
    maxDT: 0.5,

    tandem: Tandem.REQUIRED,
    phetioType: ScreenIO,
    phetioState: false,
    phetioFeatured: true,

    // a11y - The description that is used when interacting with screen icons/buttons in joist.
    // This is often a full but short sentence with a period at the end of it.
    descriptionContent: null
  }, options );

  assert && assert( _.includes( [ 'black', 'white', null ], options.showScreenIconFrameForNavigationBarFill ),
    'invalid showScreenIconFrameForNavigationBarFill: ' + options.showScreenIconFrameForNavigationBarFill );

  PhetioObject.call( this, options );

  // Create a default homeScreenIcon, using the Screen's background color
  if ( !options.homeScreenIcon ) {
    options.homeScreenIcon = new Rectangle( 0, 0, MINIMUM_HOME_SCREEN_ICON_SIZE.width, MINIMUM_HOME_SCREEN_ICON_SIZE.height, {
      fill: options.backgroundColorProperty.value,
      stroke: 'black'
    } );
  }

  // navigationBarIcon defaults to homeScreenIcon, and will be scaled down
  if ( !options.navigationBarIcon ) {
    options.navigationBarIcon = options.homeScreenIcon;
  }

  // Validate icon sizes
  validateIconSize( options.homeScreenIcon, MINIMUM_HOME_SCREEN_ICON_SIZE, HOME_SCREEN_ICON_ASPECT_RATIO, 'homeScreenIcon' );
  validateIconSize( options.navigationBarIcon, MINIMUM_NAVBAR_ICON_SIZE, NAVBAR_ICON_ASPECT_RATIO, 'navigationBarIcon' );

  if ( assert && options.tandem.supplied ) {
    assert && assert( _.endsWith( options.tandem.phetioID, 'Screen' ), 'Screen tandems should end with Screen suffix' );
  }

  assert && assert( !options.backgroundColor, 'Please provide backgroundColorProperty instead' );

  // @public
  this.backgroundColorProperty = options.backgroundColorProperty;

  // @public (read-only) {Property<String|null>}
  this.nameProperty = new Property( options.name, {
    phetioType: PropertyIO( NullableIO( StringIO ) ),
    tandem: options.tandem.createTandem( 'nameProperty' )
  } );

  // @public (read-only)
  this.homeScreenIcon = options.homeScreenIcon;
  this.navigationBarIcon = options.navigationBarIcon;
  this.showUnselectedHomeScreenIconFrame = options.showUnselectedHomeScreenIconFrame;
  this.showScreenIconFrameForNavigationBarFill = options.showScreenIconFrameForNavigationBarFill;

  // @public (read-only, joist)
  this.maxDT = options.maxDT;

  // @private
  this.createModel = createModel;
  this.createView = createView;

  // Construction of the model and view are delayed and controlled to enable features like
  // a) faster loading when only loading certain screens
  // b) showing a loading progress bar <not implemented>
  this._model = null; // @private
  this._view = null;  // @private

  // @public {Property.<boolean>} indicates whether the Screen is active. Clients can read this, joist sets it.
  // To prevent potential visual glitches, the value should change only while the screen's view is invisible.
  // That is: transitions from false to true before a Screen becomes visible, and from true to false after a Screen becomes invisible.
  this.activeProperty = new BooleanProperty( true, {
    tandem: options.tandem.createTandem( 'activeProperty' ),
    phetioReadOnly: true,
    phetioDocumentation: 'Indicates whether the screen is currently displayed in the simulation.  For single-screen ' +
                         'simulations, there is only one screen and it is always active.'
  } );

  // @public (a11y) - used to set the ScreenView's descriptionContent. This is a bit of a misnomer because Screen is
  // not a Node subtype, so this is a value property rather than a setter.
  this.descriptionContent = '';
  if ( options.descriptionContent ) {
    this.descriptionContent = options.descriptionContent;
  }
  else if ( this.nameProperty.value ) {
    this.descriptionContent = StringUtils.fillIn( screenNamePatternString, {
      name: this.nameProperty.value
    } );
  }
  else {
    this.descriptionContent = simScreenString; // fall back on generic name
  }

  const self = this;
  assert && this.activeProperty.lazyLink( function() {
    assert( self._view, 'isActive should not change before the Screen view has been initialized' );

    // In phet-io mode, the state of a sim can be set without a deterministic order. The activeProperty could be
    // changed before the view's visibility is set.
    if ( !Tandem.PHET_IO_ENABLED ) {
      assert( !self._view.isVisible(), 'isActive should not change while the Screen view is visible' );
    }
  } );
}

joist.register( 'Screen', Screen );

/**
 * Convenience function to validate the sizes for the home screen icon and navigation bar icon.
 * @param {Node} icon - the icon to validate
 * @param {Dimension2} minimumSize - the minimum allowed size for the icon
 * @param {number} aspectRatio - the required aspect ratio
 * @param {string} name - the name of the icon type (for assert messages)
 */
var validateIconSize = function( icon, minimumSize, aspectRatio, name ) {
  assert && assert( icon.width >= minimumSize.width, `${name} width is too small: ${icon.width} < ${minimumSize.width}` );
  assert && assert( icon.height >= minimumSize.height, `${name} height is too small: ${icon.height} < ${minimumSize.height}` );

  // Validate home screen aspect ratio
  const actualAspectRatio = icon.width / icon.height;
  assert && assert(
    Math.abs( aspectRatio - actualAspectRatio ) < ICON_ASPECT_RATIO_TOLERANCE,
    name + ' has invalid aspect ratio: ' + actualAspectRatio
  );
};

/**
 * For showing ScreenView layoutBounds with 'dev' query parameter.
 * @param {Bounds2} layoutBounds
 * @returns {Node}
 */
const devCreateLayoutBoundsNode = function( layoutBounds ) {
  return new Path( Shape.bounds( layoutBounds ), {
    stroke: 'red',
    lineWidth: 3,
    pickable: false
  } );
};

/**
 * For showing ScreenView visible bounds with 'showVisibleBounds' query parameter.
 * @param {ScreenView} screenView
 * @returns {Node}
 */
const devCreateVisibleBoundsNode = function( screenView ) {
  const path = new Path( Shape.bounds( screenView.visibleBoundsProperty.value ), {
    stroke: 'blue',
    lineWidth: 6,
    pickable: false
  } );
  screenView.visibleBoundsProperty.link( function( visibleBounds ) {
    path.shape = Shape.bounds( visibleBounds );
  } );
  return path;
};

inherit( PhetioObject, Screen, {

  // @public
  reset: function() {
    // Background color not reset, as it's a responsibility of the code that changes the property
  },

  // @public - Returns the model (if it has been constructed)
  get model() {
    assert && assert( this._model, 'Model has not yet been constructed' );
    return this._model;
  },

  // @public - Returns the view (if it has been constructed)
  get view() {
    assert && assert( this._view, 'View has not yet been constructed' );
    return this._view;
  },

  /**
   * Initialize the model.
   * @public (joist-internal)
   */
  initializeModel: function() {
    assert && assert( this._model === null, 'there was already a model' );
    this._model = this.createModel();
  },

  /**
   * Initialize the view.
   * @public (joist-internal)
   * @param {string} [simName] - The display name of the sim, used for a11y. Not provided for the home screen.
   * @param {number} [numberOfScreens] - the number of screens in the whole sim.
   */
  initializeView: function( simName, numberOfScreens ) {
    assert && assert( this._view === null, 'there was already a view' );
    this._view = this.createView( this.model );
    this._view.setVisible( false ); // a Screen is invisible until selected

    // Show the home screen's layoutBounds
    if ( phet.chipper.queryParameters.dev ) {
      this._view.addChild( devCreateLayoutBoundsNode( this._view.layoutBounds ) );
    }

    // For debugging, make it possible to see the visibleBounds.  This is not included with ?dev since
    // it should just be equal to what you see.
    if ( phet.chipper.queryParameters.showVisibleBounds ) {
      this._view.addChild( devCreateVisibleBoundsNode( this._view ) );
    }

    // Set the accessible label for the screen. If simName is not provided, then we are creating the home screen.
    if ( simName ) {

      // Single screen sims don't need screen names, instead just show the title of the sim.
      // Using total screens for sim breaks modularity a bit, but it also is needed as that parameter changes the
      // labelling of this screen, see https://github.com/phetsims/joist/issues/496
      if ( numberOfScreens === 1 ) {
        this._view.labelContent = simName;
      }
      else {

        // Like "My Awesome Screen" because "My Awesome" is the name of the screen.
        const screenNameWithScreen = StringUtils.fillIn( screenNamePatternString, {
          name: this.nameProperty.value
        } );

        // initialize proper PDOM labelling for ScreenView
        this._view.labelContent = StringUtils.fillIn( screenSimPatternString, {
          screenName: screenNameWithScreen,
          simName: simName
        } );
      }

      // if there is a screenSummaryNode, then set its intro string now
      this._view.setScreenSummaryIntroString( simName, numberOfScreens );
    }
    assert && this._view.accessibleAudit();
  }
}, {

  // @public
  MINIMUM_HOME_SCREEN_ICON_SIZE: MINIMUM_HOME_SCREEN_ICON_SIZE,
  HOME_SCREEN_ICON_ASPECT_RATIO: HOME_SCREEN_ICON_ASPECT_RATIO,

  // @public
  MINIMUM_NAVBAR_ICON_SIZE: MINIMUM_NAVBAR_ICON_SIZE
} );

export default Screen;