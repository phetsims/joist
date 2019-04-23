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
  var ActivationUtterance = require( 'SCENERY_PHET/accessibility/ActivationUtterance' );
  var inherit = require( 'PHET_CORE/inherit' );
  var joist = require( 'JOIST/joist' );
  var JoistA11yStrings = require( 'JOIST/JoistA11yStrings' );
  var JoistButton = require( 'JOIST/JoistButton' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Path = require( 'SCENERY/nodes/Path' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var Shape = require( 'KITE/Shape' );
  var ToggleNode = require( 'SUN/ToggleNode' );
  var utteranceQueue = require( 'SCENERY_PHET/accessibility/utteranceQueue' );
  var Vector2 = require( 'DOT/Vector2' );

  // a11y strings
  var soundOnOffString = JoistA11yStrings.soundOnOffButton.value;
  var simSoundOnString = JoistA11yStrings.simSoundOnString.value;
  var simSoundOffString = JoistA11yStrings.simSoundOffString.value;

  // constants for node background
  var NODE_HEIGHT = 22.0;
  var NODE_WIDTH = NODE_HEIGHT * 1.13;

  // constants for drawing speaker
  var SPEAKER_HEIGHT = NODE_HEIGHT * 0.77;
  var SPEAKER_WIDTH = SPEAKER_HEIGHT * 0.58;
  var SPEAKER_BACK_WIDTH = SPEAKER_WIDTH * 0.46;
  var SPEAKER_BACK_HEIGHT = SPEAKER_HEIGHT * 0.35;
  var SPEAKER_BACK_Y_SPACE = ( SPEAKER_HEIGHT - SPEAKER_BACK_HEIGHT ) / 2.0; // space between top of speaker back and top of cone
  var CORNER_RADIUS = 1.0;

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
   * @param {Property.<Color|string>} backgroundColorProperty
   * @param {Tandem} tandem
   * @param {Object} [options]
   * @constructor
   */
  function NavigationBarSoundToggleButton( soundEnabledProperty, backgroundColorProperty, tandem, options ) {
    var self = this;

    options = _.extend( {
      highlightExtensionWidth: 5,
      highlightExtensionHeight: 10,
      highlightCenterOffsetY: 0,
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
        .lineTo( CORNER_RADIUS, SPEAKER_BACK_Y_SPACE )
        .arc( CORNER_RADIUS, SPEAKER_BACK_Y_SPACE + CORNER_RADIUS, CORNER_RADIUS, Math.PI * 1.5, Math.PI, true )
        .lineToRelative( 0, SPEAKER_BACK_HEIGHT - ( 2 * CORNER_RADIUS ) )
        .arc( CORNER_RADIUS, SPEAKER_BACK_Y_SPACE + SPEAKER_BACK_HEIGHT - CORNER_RADIUS, CORNER_RADIUS, Math.PI, Math.PI * 0.5, true )
        .lineToRelative( SPEAKER_BACK_WIDTH - CORNER_RADIUS, 0 )
        .lineTo( SPEAKER_WIDTH, SPEAKER_HEIGHT )
        .lineTo( SPEAKER_WIDTH, 0 )
        .close(),
      {
        stroke: 'black',
        lineWidth: 1.5,
        lineJoin: 'round',
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

    var toggleNode = new ToggleNode( soundEnabledProperty,
      [
        { value: true, node: soundOnNode },
        { value: false, node: soundOffNode }
      ],
      { maxHeight: NODE_HEIGHT }
    );

    JoistButton.call( this, toggleNode, backgroundColorProperty, tandem, options );

    // accessible attribute lets user know when the toggle is pressed, linked lazily so that an alert isn't triggered
    // on construction and must be unlinked in dispose
    var soundUtterance = new ActivationUtterance();
    var pressedListener = function( value ) {
      self.setAccessibleAttribute( 'aria-pressed', !value );

      soundUtterance.alert = value ? simSoundOnString : simSoundOffString;
      utteranceQueue.addToBack( soundUtterance );
    };
    soundEnabledProperty.lazyLink( pressedListener );
    this.setAccessibleAttribute( 'aria-pressed', !soundEnabledProperty.get() );

    // change the icon so that it is visible when the background changes from dark to light
    backgroundColorProperty.link( function( backgroundColor ) {
      var baseColor = backgroundColor === 'black' ? 'white' : 'black';
      speakerNode.stroke = baseColor;
      soundOffX.stroke = baseColor;
      soundOnCurves.stroke = baseColor;
    } );
  }

  joist.register( 'NavigationBarSoundToggleButton', NavigationBarSoundToggleButton );

  return inherit( JoistButton, NavigationBarSoundToggleButton );

} );