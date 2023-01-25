// Copyright 2018-2023, University of Colorado Boulder

/**
 * NavigationBarAudioToggleButton is a button for controlling whether audio is enabled or disabled that is designed to
 * work on the PhET navigation bar. Audio includes all auditory features in the sim, so when this is button is toggled
 * "off", the sim should be totally silent.
 *
 * If you're wondering why this is drawn in code rather than using a Font Awesome node, please see
 * https://github.com/phetsims/tambo/issues/19.
 *
 * @author John Blanco
 * @author Chris Klusendorf
 */

import BooleanProperty from '../../axon/js/BooleanProperty.js';
import TReadOnlyProperty from '../../axon/js/TReadOnlyProperty.js';
import Vector2 from '../../dot/js/Vector2.js';
import { Shape } from '../../kite/js/imports.js';
import optionize from '../../phet-core/js/optionize.js';
import PickRequired from '../../phet-core/js/types/PickRequired.js';
import { Color, Node, Path, Rectangle, voicingManager } from '../../scenery/js/imports.js';
import ToggleNode from '../../sun/js/ToggleNode.js';
import ActivationUtterance from '../../utterance-queue/js/ActivationUtterance.js';
import audioManager from './audioManager.js';
import joist from './joist.js';
import JoistButton, { JoistButtonOptions } from './JoistButton.js';
import JoistStrings from './JoistStrings.js';

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

type SelfOptions = {

  // This button is always created for a consistent PhET-iO API, but has limited functionality if audio is not supported.
  supportsAudioPreferences: boolean;
};
type NavigationBarAudioToggleButtonOptions = SelfOptions & PickRequired<JoistButtonOptions, 'tandem'> & Pick<JoistButtonOptions, 'pointerAreaDilationX' | 'pointerAreaDilationY'>;

class NavigationBarAudioToggleButton extends JoistButton {

  public constructor( soundEnabledProperty: BooleanProperty,
                      backgroundColorProperty: TReadOnlyProperty<Color>,
                      providedOptions: NavigationBarAudioToggleButtonOptions ) {

    const options = optionize<NavigationBarAudioToggleButtonOptions, SelfOptions, JoistButtonOptions>()( {

      // JoistButton options
      highlightExtensionWidth: 5 + 3.6,
      highlightExtensionHeight: 10,
      highlightCenterOffsetY: 0,

      // enabled:true by default, but disable if fuzzing when supporting voicing
      enabled: !( phet.chipper.isFuzzEnabled() && phet.chipper.queryParameters.supportsVoicing ),

      visiblePropertyOptions: { phetioFeatured: true },

      // pdom
      innerContent: JoistStrings.a11y.soundToggle.labelStringProperty,

      // voicing
      voicingNameResponse: JoistStrings.a11y.soundToggle.labelStringProperty
    }, providedOptions );

    assert && assert( options.listener === undefined, 'NavigationBarAudioToggleButton sets listener' );
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

    // If "Audio" and at least one subcomponent of audio is enabled, show the "sound on" icon. Otherwise,
    // show the "sound off" icon because there will be no output, even if "Audio" is enabled.
    const toggleNode = new ToggleNode( audioManager.anyOutputEnabledProperty,
      [
        { value: true, createNode: () => soundOnNode },
        { value: false, createNode: () => soundOffNode }
      ],
      { maxHeight: NODE_HEIGHT * 0.85 }
    );

    super( toggleNode, backgroundColorProperty, options );

    // must be after the button is instrumented
    this.addLinkedElement( soundEnabledProperty, {
      tandem: options.tandem.createTandem( 'property' )
    } );

    // pdom attribute lets user know when the toggle is pressed, linked lazily so that an alert isn't triggered
    // on construction and must be unlinked in dispose
    const soundUtterance = new ActivationUtterance();
    const enabledListener = ( enabled: boolean ) => {
      if ( options.supportsAudioPreferences ) {
        this.setPDOMAttribute( 'aria-pressed', enabled );

        soundUtterance.alert = enabled ? JoistStrings.a11y.soundToggle.alert.simSoundOnStringProperty
                                       : JoistStrings.a11y.soundToggle.alert.simSoundOffStringProperty;
        this.alertDescriptionUtterance( soundUtterance );
        if ( voicingManager.voicingFullyEnabledProperty.value ) {
          voicingManager.speakIgnoringEnabled( soundUtterance );
        }
      }
    };
    soundEnabledProperty.lazyLink( enabledListener );
    this.setPDOMAttribute( 'aria-pressed', soundEnabledProperty.get() );

    // If no subcomponents of the audioManager that are enabled disable this button
    // to make it clear that toggling the audioEnabledProperty will have no impact
    // on the output.
    audioManager.anySubcomponentEnabledProperty.link( enabled => {
      this.enabled = enabled;
    } );

    // change the icon so that it is visible when the background changes from dark to light
    backgroundColorProperty.link( backgroundColor => {
      const baseColor = backgroundColor.equals( Color.BLACK ) ? 'white' : 'black';
      speakerNode.stroke = baseColor;
      soundOffX.stroke = baseColor;
      soundOnCurves.stroke = baseColor;
    } );
  }
}

joist.register( 'NavigationBarAudioToggleButton', NavigationBarAudioToggleButton );
export default NavigationBarAudioToggleButton;