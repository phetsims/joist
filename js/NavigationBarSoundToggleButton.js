// Copyright 2018, University of Colorado Boulder

/**
 * The button that is on the nav bar when sound is present in a sim and is used to enable or disable all sound.
 *
 * @author John Blanco
 */

define( function( require ) {
  'use strict';

  // modules
  var FontAwesomeNode = require( 'SUN/FontAwesomeNode' );
  var inherit = require( 'PHET_CORE/inherit' );
  var joist = require( 'JOIST/joist' );
  var JoistA11yStrings = require( 'JOIST/JoistA11yStrings' );
  var JoistButton = require( 'JOIST/JoistButton' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Path = require( 'SCENERY/nodes/Path' );
  var Shape = require( 'KITE/Shape' );
  var ToggleNode = require( 'SUN/ToggleNode' );

  // a11y strings
  var soundOnOffString = JoistA11yStrings.soundOnOffButton.value;

  // constants
  var NODE_HEIGHT = 20; // empirically determined
  var X_WIDTH = NODE_HEIGHT * 0.8; // empirically determined

  /**
   * @param {BooleanProperty} soundEnabledProperty
   * @param {Tandem} tandem
   * @param {Object} options
   * @constructor
   */
  function NavigationBarSoundToggleButton( soundEnabledProperty, simLookAndFeel, tandem, options ) {

    options = _.extend( {
      highlightExtensionWidth: 5,
      highlightExtensionHeight: 10,
      highlightCenterOffsetY: 3,
      listener: function() {
        soundEnabledProperty.set( !soundEnabledProperty.get() );
      },

      // a11y
      tagName: 'button',
      innerContent: soundOnOffString
    }, options );

    // 'on' icon is a font-awesome icon
    var soundOnNode = new FontAwesomeNode( 'volume_up' );

    // 'off' icon is a font-awesome icon, with an 'x' added to the right.
    var soundOffNode = new Node();
    var soundOffIcon = new FontAwesomeNode( 'volume_off' );
    soundOffNode.addChild( soundOffIcon );
    var soundOffX = new Path(
      new Shape().moveTo( 0, 0 ).lineTo( X_WIDTH, X_WIDTH ).moveTo( 0, X_WIDTH ).lineTo( X_WIDTH, 0 ),
      {
        stroke: 'black',
        lineWidth: 4,
        right: soundOnNode.width, // position the 'x' so that both icons have the same width, see scenery-phet#329
        centerY: soundOffNode.centerY
      }
    );
    soundOffNode.addChild( soundOffX );

    var toggleNode = new ToggleNode(
      [
        { value: true, node: soundOnNode },
        { value: false, node: soundOffNode }
      ],
      soundEnabledProperty,
      { maxHeight: NODE_HEIGHT }
    );

    JoistButton.call( this, toggleNode, simLookAndFeel.navigationBarFillProperty, tandem, options );

    // change the icon so that it is visible when the navigation bar changes from dark to light
    simLookAndFeel.navigationBarDarkProperty.link( function( navigationBarDark ) {
      var baseColor = navigationBarDark ? 'black' : 'white';
      soundOnNode.fill = baseColor;
      soundOffIcon.fill = baseColor;
      soundOffX.stroke = baseColor;
    } );
  }

  joist.register( 'NavigationBarSoundToggleButton', NavigationBarSoundToggleButton );

  return inherit( JoistButton, NavigationBarSoundToggleButton, {

    /**
     * To make eligible for garbage collection.
     * @public
     */
    dispose: function() {
      JoistButton.prototype.dispose && JoistButton.prototype.dispose.call( this );
    }
  } );

} );