// Copyright 2018-2020, University of Colorado Boulder

/**
 * a button for controlling whether sound is enabled or disabled for the sim and that is designed to work on the PhET
 * navigation bar
 *
 * @author John Blanco
 * @author Chris Klusendorf
 */

import Vector2 from '../../dot/js/Vector2.js';
import Shape from '../../kite/js/Shape.js';
import merge from '../../phet-core/js/merge.js';
import Node from '../../scenery/js/nodes/Node.js';
import Path from '../../scenery/js/nodes/Path.js';
import Rectangle from '../../scenery/js/nodes/Rectangle.js';
import ToggleNode from '../../sun/js/ToggleNode.js';
import ActivationUtterance from '../../utterance-queue/js/ActivationUtterance.js';
import joist from './joist.js';
import JoistButton from './JoistButton.js';
import joistStrings from './joistStrings.js';

// constants for node background
const NODE_HEIGHT = 22.0;
const NODE_WIDTH = NODE_HEIGHT * 1.13;

// constants for drawing speaker
const SPEAKER_HEIGHT = NODE_HEIGHT * 0.77;
const SPEAKER_WIDTH = SPEAKER_HEIGHT * 0.58;
const SPEAKER_BACK_WIDTH = SPEAKER_WIDTH * 0.46;
const SPEAKER_BACK_HEIGHT = SPEAKER_HEIGHT * 0.35;
const SPEAKER_BACK_Y_SPACE = ( SPEAKER_HEIGHT - SPEAKER_BACK_HEIGHT ) / 2.0; // space between top of speaker back and top of cone
const CORNER_RADIUS = 1.0;

// constant for drawing sound off X
const X_WIDTH = SPEAKER_HEIGHT * 0.52;

// constants for drawing sound on curves
const MAX_CURVE_RADIUS = SPEAKER_HEIGHT * 0.63;
const RADIUS_STEPPER = SPEAKER_HEIGHT * 0.23;
const MED_CURVE_RADIUS = MAX_CURVE_RADIUS - RADIUS_STEPPER;
const MIN_CURVE_RADIUS = MED_CURVE_RADIUS - RADIUS_STEPPER;
const CURVE_ANGLE = Math.PI / 2.7;
const NEG_CURVE_ANGLE = CURVE_ANGLE * -1.0;

class NavigationBarSoundToggleButton extends JoistButton {

  /**
   * @param {BooleanProperty} soundEnabledProperty
   * @param {Property.<Color|string>} backgroundColorProperty
   * @param {Tandem} tandem
   * @param {Object} [options]
   */
  constructor( soundEnabledProperty, backgroundColorProperty, tandem, options ) {

    options = merge( {

      // JoistButton options
      highlightExtensionWidth: 5,
      highlightExtensionHeight: 10,
      highlightCenterOffsetY: 0,

      visiblePropertyOptions: { phetioFeatured: true },

      // pdom
      tagName: 'button',
      innerContent: joistStrings.a11y.soundToggle.label
    }, options );

    assert && assert( options.listener === undefined, 'NavigationBarSoundToggleButton sets listener' );
    options.listener = () => soundEnabledProperty.set( !soundEnabledProperty.get() );

    const soundOnNode = new Node();
    const soundOffNode = new Node();
    const backgroundNode = new Rectangle( 0, 0, NODE_WIDTH, NODE_HEIGHT, { fill: 'transparent' } );
    soundOnNode.addChild( backgroundNode );
    soundOffNode.addChild( backgroundNode );

    // create speaker for both sound on and sound off
    const speakerNode = new Path(
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
    const soundOffX = new Path(
      new Shape().moveTo( 0, 0 ).lineTo( X_WIDTH, X_WIDTH ).moveTo( 0, X_WIDTH )
        .lineTo( X_WIDTH, 0 ),
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
    const soundOnCurves = new Path(
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

    const toggleNode = new ToggleNode( soundEnabledProperty,
      [
        { value: true, node: soundOnNode },
        { value: false, node: soundOffNode }
      ],
      { maxHeight: NODE_HEIGHT }
    );

    super( toggleNode, backgroundColorProperty, tandem, options );

    // must be after the button is instrumented
    this.addLinkedElement( soundEnabledProperty, {
      tandem: tandem.createTandem( 'property' )
    } );

    // pdom attribute lets user know when the toggle is pressed, linked lazily so that an alert isn't triggered
    // on construction and must be unlinked in dispose
    const soundUtterance = new ActivationUtterance();
    const pressedListener = value => {
      this.setPDOMAttribute( 'aria-pressed', !value );

      soundUtterance.alert = value ? joistStrings.a11y.soundToggle.alert.simSoundOn
                                   : joistStrings.a11y.soundToggle.alert.simSoundOff;
      phet.joist.sim.utteranceQueue.addToBack( soundUtterance );
    };
    soundEnabledProperty.lazyLink( pressedListener );
    this.setPDOMAttribute( 'aria-pressed', !soundEnabledProperty.get() );

    // change the icon so that it is visible when the background changes from dark to light
    backgroundColorProperty.link( backgroundColor => {
      const baseColor = backgroundColor === 'black' ? 'white' : 'black';
      speakerNode.stroke = baseColor;
      soundOffX.stroke = baseColor;
      soundOnCurves.stroke = baseColor;
    } );
  }
}

joist.register( 'NavigationBarSoundToggleButton', NavigationBarSoundToggleButton );
export default NavigationBarSoundToggleButton;