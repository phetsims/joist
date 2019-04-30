// Copyright 2013-2019, University of Colorado Boulder

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
  var BooleanProperty = require( 'AXON/BooleanProperty' );
  var Dimension2 = require( 'DOT/Dimension2' );
  var inherit = require( 'PHET_CORE/inherit' );
  var joist = require( 'JOIST/joist' );
  var JoistA11yStrings = require( 'JOIST/JoistA11yStrings' );
  var Path = require( 'SCENERY/nodes/Path' );
  var Property = require( 'AXON/Property' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var ScreenSummaryNode = require( 'SCENERY_PHET/accessibility/nodes/ScreenSummaryNode' );
  var Shape = require( 'KITE/Shape' );
  var StringUtils = require( 'PHETCOMMON/util/StringUtils' );
  var Tandem = require( 'TANDEM/Tandem' );

  // a11y strings
  var screenNamePatternString = JoistA11yStrings.screenNamePattern.value;
  var screenSimPatternString = JoistA11yStrings.screenSimPattern.value;
  var simScreenString = JoistA11yStrings.simScreen.value;

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
   * @param {function:Object } createView - function( model )
   * @param {Object} [options]
   * @constructor
   */
  function Screen( createModel, createView, options ) {

    options = _.extend( {

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

      tandem: Tandem.required,

      // a11y - The description that is used when interacting with screen icons/buttons in joist.
      // This is often a full but short sentence with a period at the end of it.
      descriptionContent: null
    }, options );

    assert && assert( _.includes( [ 'black', 'white', null ], options.showScreenIconFrameForNavigationBarFill ),
      'invalid showScreenIconFrameForNavigationBarFill: ' + options.showScreenIconFrameForNavigationBarFill );

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

    // @public (read-only, joist)
    this.screenTandem = options.tandem;

    assert && assert( !options.backgroundColor, 'Please provide backgroundColorProperty instead' );

    // @public
    this.backgroundColorProperty = options.backgroundColorProperty;

    // @public (read-only)
    this.name = options.name;
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
      phetioDocumentation: 'Indicates whether the screen is active.  For single-screen simulations, the screen is always active.'
    } );

    // @public (a11y) - used to set the ScreenView's descriptionContent. This is a bit of a misnomer because Screen is
    // not a Node subtype, so this is a value property rather than a setter.
    this.descriptionContent = '';
    if ( options.descriptionContent ) {
      this.descriptionContent = options.descriptionContent;
    }
    else if ( this.name ) {
      this.descriptionContent = StringUtils.fillIn( screenNamePatternString, {
        name: this.name
      } );
    }
    else {
      this.descriptionContent = simScreenString; // fall back on generic name
    }

    var self = this;
    assert && this.activeProperty.lazyLink( function() {
      assert( self._view, 'isActive should not change before the Screen view has been initialized' );

      // In phet-io mode, the state of a sim can be set without a deterministic order. The activeProperty could be
      // changed before the view's visibility is set.
      if ( !phet.phetio ) {
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
          var screenNameWithScreen = StringUtils.fillIn( screenNamePatternString, {
            name: this.name
          } );

          // initialize proper PDOM labelling for ScreenView
          this._view.labelContent = StringUtils.fillIn( screenSimPatternString, {
            screenName: screenNameWithScreen,
            simName: simName
          } );
        }

        if ( this._view.screenSummaryNode ) {
          assert && assert( this._view.screenSummaryNode instanceof ScreenSummaryNode, 'type different from expected, was it overwritten?' );

          // if there is a screenSummaryNode, then set its intro string now
          this._view.screenSummaryNode.setIntroString( simName, numberOfScreens );
        }
      }
      assert && this._view.accessibleAudit();
    },

    // Initialize both the model and view
    initializeModelAndView: function() {
      this.initializeModel();
      this.initializeView();
    }
  }, {

    // @public
    MINIMUM_HOME_SCREEN_ICON_SIZE: MINIMUM_HOME_SCREEN_ICON_SIZE,
    HOME_SCREEN_ICON_ASPECT_RATIO: HOME_SCREEN_ICON_ASPECT_RATIO,

    // @public
    MINIMUM_NAVBAR_ICON_SIZE: MINIMUM_NAVBAR_ICON_SIZE
  } );
} );