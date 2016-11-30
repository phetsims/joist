// Copyright 2013-2016, University of Colorado Boulder

/**
 * A Screen is the largest chunk of a simulation. (Java sims used the term Module, but that term
 * is too overloaded to use with JavaScript and Git.)
 * <p>
 * When creating a Sim, Screens are supplied as the arguments. They can be specified as object literals or through instances of this class.
 * This class may centralize default behavior or state for Screens in the future, but right now it only allows you to create
 * Sims without using named parameter object literals.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var Color = require( 'SCENERY/util/Color' );
  var Dimension2 = require( 'DOT/Dimension2' );
  var inherit = require( 'PHET_CORE/inherit' );
  var joist = require( 'JOIST/joist' );
  var Path = require( 'SCENERY/nodes/Path' );
  var Property = require( 'AXON/Property' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var Shape = require( 'KITE/Shape' );
  var Tandem = require( 'TANDEM/Tandem' );

  // constants
  var MINIMUM_HOME_SCREEN_ICON_SIZE = new Dimension2( 548, 373 );
  var MINIMUM_NAVBAR_ICON_SIZE = new Dimension2( 147, 100 );
  var NAVBAR_ICON_ASPECT_RATIO = MINIMUM_NAVBAR_ICON_SIZE.width / MINIMUM_NAVBAR_ICON_SIZE.height;
  var HOME_SCREEN_ICON_ASPECT_RATIO = MINIMUM_HOME_SCREEN_ICON_SIZE.width / MINIMUM_HOME_SCREEN_ICON_SIZE.height;
  var ICON_ASPECT_RATIO_TOLERANCE = 5E-3; // how close to the ideal aspect ratio an icon must be

  // Home screen and navigation bar icons must have the same aspect ratio, see https://github.com/phetsims/joist/issues/76
  assert && assert( Math.abs( HOME_SCREEN_ICON_ASPECT_RATIO - HOME_SCREEN_ICON_ASPECT_RATIO ) < ICON_ASPECT_RATIO_TOLERANCE,
    'MINIMUM_HOME_SCREEN_ICON_SIZE and MINIMUM_NAVBAR_ICON_SIZE must have the same aspect ratio' );

  /**
   * @param {function} createModel
   * @param {function} createView
   * @param {Object} [options]
   * @constructor
   */
  function Screen( createModel, createView, options ) {

    options = _.extend( {

      // {string|null} name of the sim, as displayed to the user.
      // For single-screen sims, there is no home screen or navigation bar, and null is OK.
      // For multi-screen sims, this must be provided.
      name: null,

      // {Color|string} initial background color of the Screen
      backgroundColorProperty: new Property( new Color( 'white' ) ),

      // {Node} icon shown on the home screen.
      // For single-screen sims, there is no home screen and the default is OK.
      homeScreenIcon: new Rectangle( 0, 0, MINIMUM_HOME_SCREEN_ICON_SIZE.width, MINIMUM_HOME_SCREEN_ICON_SIZE.height, {
        fill: 'white',
        stroke: 'black'
      } ),

      // {Node|null} icon shown in the navigation bar. If null, then the home screen icon will be used, scaled to fit.
      navigationBarIcon: null,

      tandem: Tandem.createDefaultTandem( 'screen' )
    }, options );

    // navigationBarIcon defaults to homeScreenIcon, and will be scaled down
    if ( !options.navigationBarIcon ) {
      options.navigationBarIcon = options.homeScreenIcon;
    }

    Tandem.validateOptions( options ); // The tandem is required when brand==='phet-io'

    // Validate icon sizes
    validateIconSize( options.homeScreenIcon, MINIMUM_HOME_SCREEN_ICON_SIZE, HOME_SCREEN_ICON_ASPECT_RATIO, 'homeScreenIcon' );
    validateIconSize( options.navigationBarIcon, MINIMUM_NAVBAR_ICON_SIZE, NAVBAR_ICON_ASPECT_RATIO, 'navigationBarIcon' );

    // @private (read-only, joist)
    this.tandem = options.tandem;

    assert && assert( !options.backgroundColor, 'Please provide backgroundColorProperty instead' );

    // @public
    this.backgroundColorProperty = options.backgroundColorProperty;

    // @public
    this.name = options.name;
    this.homeScreenIcon = options.homeScreenIcon;
    this.navigationBarIcon = options.navigationBarIcon;

    // @private
    this.createModel = createModel;
    this.createView = createView;

    // Construction of the model and view are delayed and controlled to enable features like
    // a) faster loading when only loading certain screens
    // b) showing a loading progress bar <not implemented>
    this._model = null; // @private
    this._view = null;  // @private

    //TODO missing tandem.addInstance? See https://github.com/phetsims/joist/issues/376
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
    assert && assert( icon.width >= minimumSize.width, name + ' is too small: ' + icon.width );
    assert && assert( icon.height >= minimumSize.height, name + ' is too small: ' + icon.height );

    // Validate home screen aspect ratio
    var actualAspectRatio = icon.width / icon.height;
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
  var devCreateLayoutBoundsNode = function( layoutBounds ) {
    return new Path( Shape.bounds( layoutBounds ), {
      stroke: 'red',
      lineWidth: 3,
      pickable: false
    } );
  };

  /**
   * For showing ScreenView layoutBounds with 'showVisibleBounds' query parameter.
   * @param {ScreenView} screenView
   * @returns {Node}
   */
  var devCreateVisibleBoundsNode = function( screenView ) {
    var path = new Path( Shape.bounds( screenView.visibleBoundsProperty.value ), {
      stroke: 'blue',
      lineWidth: 6,
      pickable: false
    } );
    screenView.visibleBoundsProperty.link( function( visibleBounds ) {
      path.shape = Shape.bounds( visibleBounds );
    } );
    return path;
  };

  return inherit( Object, Screen, {

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
     * Initialize the model.  Clients should use either this or initializeModelAndView
     * Clients may want to use this method to gain more control over the creation process
     * @public (joist-internal)
     */
    initializeModel: function() {
      assert && assert( this._model === null, 'there was already a model' );
      this._model = this.createModel();
    },

    /**
     * Initialize the view.  Clients should use either this or initializeModelAndView
     * Clients may want to use this method to gain more control over the creation process
     * @public (joist-internal)
     */
    initializeView: function() {
      assert && assert( this._view === null, 'there was already a view' );
      this._view = this.createView( this.model );

      // Show the home screen's layoutBounds
      if ( phet.chipper.queryParameters.dev ) {
        this._view.addChild( devCreateLayoutBoundsNode( this._view.layoutBounds ) );
      }

      // For debugging, make it possible to see the visibleBounds.  This is not included with ?dev since
      // it should just be equal to what you see.
      if ( phet.chipper.queryParameters.showVisibleBounds ) {
        this._view.addChild( devCreateVisibleBoundsNode( this._view ) );
      }
    },

    // Initialize both the model and view
    initializeModelAndView: function() {
      this.initializeModel();
      this.initializeView();
    }
  }, {

    // @public
    MINIMUM_HOME_SCREEN_ICON_SIZE: MINIMUM_HOME_SCREEN_ICON_SIZE,

    // @public
    MINIMUM_NAVBAR_ICON_SIZE: MINIMUM_NAVBAR_ICON_SIZE
  } );
} );