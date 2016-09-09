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
  var PropertySet = require( 'AXON/PropertySet' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var Shape = require( 'KITE/Shape' );
  var Tandem = require( 'TANDEM/Tandem' );

  // constants
  var HOME_SCREEN_ICON_SIZE = new Dimension2( 548, 373 ); // minimum size
  var NAVBAR_ICON_SIZE = new Dimension2( 147, 100 ); // minimum size
  var NAVBAR_ICON_ASPECT_RATIO = NAVBAR_ICON_SIZE.width / NAVBAR_ICON_SIZE.height;
  var HOME_SCREEN_ICON_ASPECT_RATIO = HOME_SCREEN_ICON_SIZE.width / HOME_SCREEN_ICON_SIZE.height;
  var ICON_ASPECT_RATIO_TOLERANCE = 5E-3; // how close to the ideal aspect ratio an icon must be

  // Home screen and navigation bar icons must have the same aspect ratio, see https://github.com/phetsims/joist/issues/76
  assert && assert( Math.abs( HOME_SCREEN_ICON_ASPECT_RATIO - HOME_SCREEN_ICON_ASPECT_RATIO ) < ICON_ASPECT_RATIO_TOLERANCE,
    'HOME_SCREEN_ICON_SIZE and NAVBAR_ICON_SIZE must have the same aspect ratio' );

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
      backgroundColor: 'white',

      // {Node} icon shown on the home screen.
      // For single-screen sims, there is no home screen and the default is OK.
      homeScreenIcon: new Rectangle( 0, 0, HOME_SCREEN_ICON_SIZE.width, HOME_SCREEN_ICON_SIZE.height, { fill: 'white' } ),

      // {Node|null} icon shown in the navigation bar. If null, then the home screen icon will be used, scaled to fit.
      navigationBarIcon: null,

      tandem: null
    }, options );

    // navigationBarIcon defaults to homeScreenIcon, and will be scaled down
    if ( !options.navigationBarIcon ) {
      options.navigationBarIcon = options.homeScreenIcon;
    }

    Tandem.validateOptions( options ); // The tandem is required when brand==='phet-io'

    // Validate home screen icon size and aspect ratio.
    assert && assert( options.homeScreenIcon.width >= HOME_SCREEN_ICON_SIZE.width && options.homeScreenIcon.height >= HOME_SCREEN_ICON_SIZE.height,
      'homeScreenIcon is too small: ' + options.homeScreenIcon.width + 'x' + options.homeScreenIcon.height );
    var homeScreenIconAspectRatio = options.homeScreenIcon.width / options.homeScreenIcon.height;
    assert && assert( Math.abs( HOME_SCREEN_ICON_ASPECT_RATIO - homeScreenIconAspectRatio ) < ICON_ASPECT_RATIO_TOLERANCE,
      'homeScreenIcon has invalid aspect ratio: ' + homeScreenIconAspectRatio );

    // Validate navigation bar icon size and aspect ratio, if the icon is different than homeScreenIcon.
    if ( options.navigationBarIcon !== options.homeScreenIcon ) {
      assert && assert( options.navigationBarIcon.width >= NAVBAR_ICON_SIZE.width && options.navigationBarIcon.height >= NAVBAR_ICON_SIZE.height,
        'navigationBarIcon is too small: ' + options.navigationBarIcon.width + 'x' + options.navigationBarIcon.height );
      var navigationBarIconAspectRatio = options.navigationBarIcon.width / options.navigationBarIcon.height;
      assert && assert( Math.abs( NAVBAR_ICON_ASPECT_RATIO - navigationBarIconAspectRatio ) < ICON_ASPECT_RATIO_TOLERANCE,
        'navigationBarIcon has invalid aspect ratio: ' + navigationBarIconAspectRatio );
    }

    // @private (read-only, joist)
    this.tandem = options.tandem;

    var backgroundColor = options.backgroundColor;
    if ( typeof backgroundColor === 'string' ) {
      backgroundColor = new Color( backgroundColor );
    }

    PropertySet.call( this, {
      backgroundColor: backgroundColor // @public
    } );

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

    //TODO missing tandem.addInstance ?
  }

  joist.register( 'Screen', Screen );

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

  return inherit( PropertySet, Screen, {

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
      if ( phet.chipper.getQueryParameter( 'dev' ) ) {
        this._view.addChild( devCreateLayoutBoundsNode( this._view.layoutBounds ) );
      }

      // For debugging, make it possible to see the visibleBounds.  This is not included with ?dev since
      // it should just be equal to what you see.
      if ( phet.chipper.getQueryParameter( 'showVisibleBounds' ) ) {
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
    HOME_SCREEN_ICON_SIZE: HOME_SCREEN_ICON_SIZE,

    // @public
    NAVBAR_ICON_SIZE: NAVBAR_ICON_SIZE
  } );
} );