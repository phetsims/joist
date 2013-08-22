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

  function Screen( name, icon, createModel, createView, backgroundColor ) {
    this.name = name;
    this.icon = icon; // should be 548x373, size displayed on home screen
    this.createModel = createModel;
    this.createView = createView;
    this.backgroundColor = backgroundColor || 'white';
  }

  return Screen;
} );