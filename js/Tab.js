/**
 * A Tab is the largest chunk of a simulation. It's name is a byproduct of the UI component (tabs) that was used to switch
 * between these chunks in PhET Java and Flash simulations. Non-programmer members of the PhET team referred to these
 * chunks as tabs, and that became the term used in team discussions. (Java sims used the term Module, but that term
 * is too overloaded to use with JavaScript and Git.)
 * <p>
 * When creating a Sim, Tabs are supplied as the arguments.  They can be specified as object literals or through instances of this class.
 * This class may centralize default behavior or state for Tabs in the future, but right now it only allows you to create
 * Sims without using named parameter object literals.
 *
 * @author Sam Reid
 */
define( function( require ) {
  'use strict';

  function Tab( name, icon, createModel, createView ) {
    this.name = name;
    this.icon = icon;
    this.createModel = createModel;
    this.createView = createView;
  }

  return Tab;
} );