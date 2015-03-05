// Copyright 2002-2013, University of Colorado Boulder

/**
 * A Screen is the largest chunk of a simulation. (Java sims used the term Module, but that term
 * is too overloaded to use with JavaScript and Git.)
 * <p>
 * When creating a Sim, Screens are supplied as the arguments. They can be specified as object literals or through instances of this class.
 * This class may centralize default behavior or state for Screens in the future, but right now it only allows you to create
 * Sims without using named parameter object literals.
 *
 * @author Sam Reid
 */
define( function( require ) {
  'use strict';

  var inherit = require( 'PHET_CORE/inherit' );
  var PropertySet = require( 'AXON/PropertySet' );
  var Dimension2 = require( 'DOT/Dimension2' );
  var Color = require( 'SCENERY/util/Color' );

  /**
   * @param {string} name
   * @param {Node} homeScreenIcon optimal size is 548x373, will be scaled by HomeScreen
   * @param {function} createModel
   * @param {function} createView
   * @param {Object} [options]
   * @constructor
   */
  function Screen( name, homeScreenIcon, createModel, createView, options ) {

    options = _.extend( {
      backgroundColor: 'white', // {Color|string} - Initial background color of the screen
      navigationBarIcon: homeScreenIcon // must be a minimum of 147x100 and have an aspect ratio of 548/373=1.469.  See https://github.com/phetsims/joist/issues/76
    }, options );

    var backgroundColor = options.backgroundColor;
    if ( typeof backgroundColor === 'string' ) {
      backgroundColor = new Color( backgroundColor );
    }

    PropertySet.call( this, {
      backgroundColor: backgroundColor
    } );

    this.name = name;
    this.homeScreenIcon = homeScreenIcon;
    this.navigationBarIcon = options.navigationBarIcon;
    this.createModel = createModel;
    this.createView = createView;

    // Construction of the model and view are delayed and controlled to enable features like
    // a) faster loading when only loading certain screens
    // b) showing a loading progress bar <not implemented>
    this._model = null;
    this._view = null;
  }

  Screen.HOME_SCREEN_ICON_SIZE = new Dimension2( 548, 373 );
  Screen.NAVBAR_ICON_SIZE = new Dimension2( 147, 100 );

  return inherit( PropertySet, Screen, {

    // Returns the model (if it has been constructed)
    get model() {
      assert && assert( this._model, 'Model has not yet been constructed' );
      return this._model;
    },

    // Returns the view (if it has been constructed)
    get view() {
      assert && assert( this._view, 'View has not yet been constructed' );
      return this._view;
    },

    initializeModel: function() {
      assert && assert( this._model === null, 'there was already a model' );
      this._model = this.createModel();
    },

    initializeView: function() {
      assert && assert( this._view === null, 'there was already a view' );
      this._view = this.createView( this.model );
    },

    initializeModelAndView: function() {
      this.initializeModel();
      this.initializeView();
    },
    
    getAPI: function( route ) {
      return {
        model: this.model.getAPI( route + '.model' ),
        view: this.view.getAPI( route + '.view' )
      };
    }
  } );
} );