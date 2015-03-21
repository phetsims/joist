//  Copyright 2002-2014, University of Colorado Boulder

/**
 * Together.js provides an API for accessing the simulation for enhanced features.  This file defines common data types
 * that appear in the simulation-specific files.
 *
 * I wasn't sure whether this file belonged in (a) chipper, (b) joist, (c) a new together-api repo, or (d) the together repo.
 * or (e) within the repo where each thing is defined (Color in scenery, Vector2 in dot, etc).  Or (f) one togetherAPI file
 * per repo???  (d) seemed contraindicated since it is under different licensing, but it would be advantageous to develop
 * each sim API with the sim itself, so it needs to have appropriate licensing.
 * Keeping it all consolidated seems like that would make it very easy to identify API changes.
 * Putting it in joist means we don't need to change any sim config files, since everything already conveniently imports Joist.
 * Let's discuss it.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  var Object = {
    name: 'Object',
    superType: null
  };
  var Node = {
    name: 'Node',
    superType: Object,
    visible: {
      type: 'boolean'
    },

    // Just for demonstration purposes, we may not really want these in the public API
    left: {
      type: 'number'
    },
    right: {
      type: 'number'
    },
    top: {
      type: 'number'
    },
    bottom: {
      type: 'number'
    },
    rotation: {
      type: 'number'
    }
  };

  var DraggableNode = {
    superType: Node,
    events: {
      dragStarted: 'dragStarted',
      dragged: 'dragged',
      dragEnded: 'dragEnded'
    }
  };

  var Button = {
    name: 'Button',
    superType: Node,
    events: {

      // Declaring events like this allows us to use property accessors to get to them instead of hardcoded strings
      // Still, hardcoded strings are nice and verbose, and can be checked with assertions in arch.js
      fired: 'fired'
    }
  };

  var ResetAllButton = {
    name: 'ResetAllButton',
    superType: Button
  };

  var Faucet = {
    name: 'Faucet',
    superType: DraggableNode,
    events: {
      'startTapToDispense': 'startTapToDispense',
      'endTapToDispense': 'endTapToDispense'
    }
  };

  var MomentaryButton = {
    name: 'MomentaryButton',
    superType: Node,
    events: {
      pressed: 'pressed',
      released: 'released',
      releasedDisabled: 'releasedDisabled'
    }
  };

  var ComboBox = {
    name: 'ComboBox',
    superType: Node, // not exactly a button, see implementation
    events: {
      fired: 'fired'
    }
  };

  var ComboBoxListItem = {
    name: 'ComboBoxButton',
    superType: Button // Also a special case
  };

  var RadioButton = {
    name: 'RadioButton',
    superType: Button
  };

  var CheckBox = {
    name: 'CheckBox',
    superType: Node,
    events: { 'toggled': 'toggled' }
  };

  var Boolean = {
    name: 'Boolean',
    superType: Object
  };

  var Number = {
    name: 'Number',
    superType: Object
  };

  var String = {
    name: 'String',
    superType: Object
  };

  var Color = {
    name: 'Color',
    superType: Object
  };

  // TODO: I would like this to be capitalized since it is a type, but jshint complains
  // TODO: and I'd prefer not to use new().  Perhaps a JSHint ignore?
  /**
   * Parameterized type for Properties
   * @param type
   * @returns {{name: string, value: {type: *}}}
   * @constructor
   */
  var property = function( type ) {
    return {
      name: 'Property',
      valueType: type,
      superType: Object,
      events: {
        changed: 'changed'
      }
    };
  };

  // Make property events accessible statically.  Note: We just added a property to a function, this is somewhat
  // unconventional.
  property.events = {
    changed: 'changed'
  };

  var array = function( type ) {
    return {
      name: 'Array',
      superType: Object,
      elementType: type
    };
  };

  var Sim = {
    name: 'Sim',
    superType: Object,
    events: {
      'simStarted': 'simStarted',
      'state': 'state', // The entire state for the sim, for the first frame and for keyframes
      'stateDelta': 'stateDelta' // not necessarily a stateChanged because the delta might be empty
    }
  };

  var Vector2 = {
    name: 'Vector2',
    superType: Object
  };

  var Slider = {
    name: 'Slider',
    superType: DraggableNode
  };

  var PhetButton = {
    name: 'PhetButton',
    superType: Button
  };

  var MenuItem = {
    name: 'MenuItem',
    superType: Button
  };

  var OnOffSwitch = {
    name: 'OnOffSwitch',
    superType: Node,
    events: {
      toggled: 'toggled'
    }
  };

  var ToggleButton = {
    name: 'ToggleButton',
    superType: Node,
    events: { toggled: 'toggled' }
  };

  var PlayPauseButton = {
    name: 'PlayPauseButton',
    superType: ToggleButton
  };

  // For dismissing a ComboBox when clicking outside of the popup
  var Scene = {
    name: 'Scene',
    superType: Node,
    events: { fired: 'fired' }
  };

  return {
    Node: Node,
    ResetAllButton: ResetAllButton,
    Button: Button,
    Faucet: Faucet,
    property: property,
    ComboBox: ComboBox,
    ComboBoxListItem: ComboBoxListItem,
    RadioButton: RadioButton,
    Boolean: Boolean,
    Color: Color,
    Sim: Sim,
    Vector2: Vector2,
    Slider: Slider,
    PhetButton: PhetButton,
    MenuItem: MenuItem,
    CheckBox: CheckBox,
    Number: Number,
    String: String,
    OnOffSwitch: OnOffSwitch,
    PlayPauseButton: PlayPauseButton,
    ToggleButton: ToggleButton,
    DraggableNode: DraggableNode,
    MomentaryButton: MomentaryButton,
    Scene: Scene,
    array: array,
    createSingleScreen: function( screenAPI ) {
      var singleScreenJoistAPI = {
        // TODO: Mix in joist components from another source, so they can be easily shared.
        'sim': { type: Sim },
        'navigationBar.phetButton': { type: PhetButton },
        'navigationBar.phetMenu.phetWebsiteButton': { type: MenuItem },
        'navigationBar.phetMenu.aboutButton': { type: MenuItem },
        'navigationBar.phetMenu.reportAProblemButton': { type: MenuItem },
        'sim.screenIndex': { type: property( Number ) },
        'sim.showHomeScreen': { type: property( Boolean ) }
      };
      for ( var element in screenAPI ) {
        if ( screenAPI.hasOwnProperty( element ) ) {
          assert && assert( !singleScreenJoistAPI.hasOwnProperty( element ), 'key collision' );
          singleScreenJoistAPI[ element ] = screenAPI[ element ];
        }
      }
      return singleScreenJoistAPI;
    },
    createMultipleScreen: function( screenAPIs ) {
      var singleScreenJoistAPI = {

        // TODO: Factor out shared items from above
        'sim': { type: Sim },
        'navigationBar.phetButton': { type: PhetButton },
        'navigationBar.phetMenu.phetWebsiteButton': { type: MenuItem },
        'navigationBar.phetMenu.aboutButton': { type: MenuItem },
        'navigationBar.phetMenu.reportAProblemButton': { type: MenuItem },
        'sim.screenIndex': { type: property( Number ) },
        'sim.showHomeScreen': { type: property( Boolean ) },
        'navigationBar.homeButton': { type: Button }
      };
      for ( var i = 0; i < screenAPIs.length; i++ ) {
        var screenAPI = screenAPIs[ i ];
        for ( var element in screenAPI ) {
          if ( screenAPI.hasOwnProperty( element ) ) {
            assert && assert( !singleScreenJoistAPI.hasOwnProperty( element ), 'key collision' );
            singleScreenJoistAPI[ element ] = screenAPI[ element ];
          }
        }
      }

      return singleScreenJoistAPI;
    }
  };
} );