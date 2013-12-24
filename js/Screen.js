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
define( function() {
  'use strict';

  /**
   * @param {String} name
   * @param {Node} homeScreenIcon optimal size is 548x373, will be scaled by HomeScreen
   * @param {function} createModel
   * @param {function} createView
   * @param {*} options
   * @constructor
   */
  function Screen( name, homeScreenIcon, createModel, createView, options ) {

    options = _.extend( {
      backgroundColor: 'white',
      navigationBarIcon: homeScreenIcon // must be a minimum of 147x100 and have an aspect ratio of 548/373=1.469.  See https://github.com/phetsims/joist/issues/76
    }, options );

    this.name = name;
    this.homeScreenIcon = homeScreenIcon;
    this.navigationBarIcon = options.navigationBarIcon;
    this.backgroundColor = options.backgroundColor;
    this.createModel = createModel;
    this.createView = createView;
  }

  return Screen;
} );