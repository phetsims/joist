// Copyright 2018, University of Colorado Boulder

/**
 * a button for controlling whether sound is enabled or disabled for the sim and that is designed to work on the PhET
 * navigation bar
 *
 * @author John Blanco
 * @author Chris Klusendorf
 */

define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var joist = require( 'JOIST/joist' );
  var JoistA11yStrings = require( 'JOIST/JoistA11yStrings' );
  var JoistButton = require( 'JOIST/JoistButton' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Path = require( 'SCENERY/nodes/Path' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var Shape = require( 'KITE/Shape' );
  var ToggleNode = require( 'SUN/ToggleNode' );
  var Vector2 = require( 'DOT/Vector2' );

  // a11y strings
  var soundOnOffString = JoistA11yStrings.soundOnOffButton.value;

  // constants for node background
  var NODE_HEIGHT = 22.0;
  var NODE_WIDTH = NODE_HEIGHT * 1.13;

  // constants for drawing speaker
  var SPEAKER_HEIGHT = NODE_HEIGHT * 0.77;
  var SPEAKER_WIDTH = SPEAKER_HEIGHT * 0.58;
  var SPEAKER_BACK_WIDTH = SPEAKER_WIDTH * 0.46;
  var SPEAKER_BACK_HEIGHT = SPEAKER_HEIGHT * 0.35;
  var SPEAKER_BACK_Y_SPACE = ( SPEAKER_HEIGHT - SPEAKER_BACK_HEIGHT ) / 2.0; // space between top of speaker back and top of cone

  // constant for drawing sound off X
  var X_WIDTH = SPEAKER_HEIGHT * 0.52;

  // constants for drawing sound on curves
  var MAX_CURVE_RADIUS = SPEAKER_HEIGHT * 0.63;
  var RADIUS_STEPPER = SPEAKER_HEIGHT * 0.23;
  var MED_CURVE_RADIUS = MAX_CURVE_RADIUS - RADIUS_STEPPER;
  var MIN_CURVE_RADIUS = MED_CURVE_RADIUS - RADIUS_STEPPER;
  var CURVE_ANGLE = Math.PI / 2.7;
  var NEG_CURVE_ANGLE = CURVE_ANGLE * -1.0;

  /**
   * @param {BooleanProperty} soundEnabledProperty
   * @param {LookAndFeel} simLookAndFeel
   * @param {Tandem} tandem
   * @param {Object} [options]
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

    var soundOnNode = new Node();
    var soundOffNode = new Node();
    var backgroundNode = new Rectangle( 0, 0, NODE_WIDTH, NODE_HEIGHT, { fill: 'transparent' } );
    soundOnNode.addChild( backgroundNode );
    soundOffNode.addChild( backgroundNode );

    // create speaker for both sound on and sound off
    var speakerNode = new Path(
      new Shape()
        .moveTo( SPEAKER_WIDTH, 0 )
        .lineTo( SPEAKER_BACK_WIDTH, SPEAKER_BACK_Y_SPACE )
        .lineTo( 0, SPEAKER_BACK_Y_SPACE )
        .lineToRelative( 0, SPEAKER_BACK_HEIGHT )
        .lineToRelative( SPEAKER_BACK_WIDTH, 0 )
        .lineTo( SPEAKER_WIDTH, SPEAKER_HEIGHT )
        .lineTo( SPEAKER_WIDTH, 0 )
        .close(),
      {
        stroke: 'black',
        lineWidth: 1.5,
        lineJoin: 'round',
        fill: 'black',
        centerY: soundOffNode.centerY,
        left: 0
      }
    );

    soundOnNode.addChild( speakerNode );
    soundOffNode.addChild( speakerNode );

    // create X for sound off
    var soundOffX = new Path(
      new Shape().moveTo( 0, 0 ).lineTo( X_WIDTH, X_WIDTH ).moveTo( 0, X_WIDTH ).lineTo( X_WIDTH, 0 ),
      {
        stroke: 'black',
        lineWidth: 1.7,
        lineCap: 'round',
        right: soundOffNode.width,
        centerY: soundOffNode.centerY
      }
    );
    soundOffNode.addChild( soundOffX );

    // create curved lines for sound on
    var soundOnCurves = new Path(
      new Shape()
        .arc( 0, 0, MAX_CURVE_RADIUS, CURVE_ANGLE, NEG_CURVE_ANGLE, true )
        .moveToPoint( new Vector2( MED_CURVE_RADIUS, 0 ).rotated( CURVE_ANGLE ) )
        .arc( 0, 0, MED_CURVE_RADIUS, CURVE_ANGLE, NEG_CURVE_ANGLE, true )
        .moveToPoint( new Vector2( MIN_CURVE_RADIUS, 0 ).rotated( CURVE_ANGLE ) )
        .arc( 0, 0, MIN_CURVE_RADIUS, CURVE_ANGLE, NEG_CURVE_ANGLE, true ),
      {
        stroke: 'black',
        lineWidth: 1.7,
        lineCap: 'round',
        right: soundOnNode.width,
        centerY: soundOnNode.centerY
      }
    );
    soundOnNode.addChild( soundOnCurves );

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
      speakerNode.stroke = baseColor;
      speakerNode.fill = baseColor;
      soundOffX.stroke = baseColor;
      soundOnCurves.stroke = baseColor;
    } );
  }

  joist.register( 'NavigationBarSoundToggleButton', NavigationBarSoundToggleButton );

  return inherit( JoistButton, NavigationBarSoundToggleButton );

} );