// Copyright 2013-2025, University of Colorado Boulder

/**
 * The Home button that appears in the navigation bar.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Multilink from '../../axon/js/Multilink.js';
import PatternStringProperty from '../../axon/js/PatternStringProperty.js';
import type TReadOnlyProperty from '../../axon/js/TReadOnlyProperty.js';
import Bounds2 from '../../dot/js/Bounds2.js';
import Shape from '../../kite/js/Shape.js';
import optionize, { type EmptySelfOptions } from '../../phet-core/js/optionize.js';
import type PickRequired from '../../phet-core/js/types/PickRequired.js';
import Node from '../../scenery/js/nodes/Node.js';
import Path from '../../scenery/js/nodes/Path.js';
import Rectangle from '../../scenery/js/nodes/Rectangle.js';
import Color from '../../scenery/js/util/Color.js';
import ButtonInteractionState from '../../sun/js/buttons/ButtonInteractionState.js';
import homeSolidShape from '../../sun/js/shapes/homeSolidShape.js';
import Utterance from '../../utterance-queue/js/Utterance.js';
import joist from './joist.js';
import JoistButton, { type JoistButtonOptions } from './JoistButton.js';
import JoistStrings from './JoistStrings.js';

// constants
const homeStringProperty = JoistStrings.a11y.homeStringProperty;
const goToScreenPatternStringProperty = JoistStrings.a11y.goToScreenPatternStringProperty;

type SelfOptions = EmptySelfOptions;
type HomeButtonOptions = SelfOptions & JoistButtonOptions & PickRequired<JoistButtonOptions, 'listener' | 'tandem'>;

export default class HomeButton extends JoistButton {

  /**
   * @param navBarHeight
   * @param navigationBarFillProperty - the color of the navbar, as a string.
   * @param pdomDisplayNameProperty - for the HomeScreen, for description
   * @param [providedOptions]
   */
  public constructor(
    navBarHeight: number,
    navigationBarFillProperty: TReadOnlyProperty<Color>,
    pdomDisplayNameProperty: TReadOnlyProperty<string | null>,
    providedOptions: HomeButtonOptions
  ) {

    const descriptionStringProperty = new PatternStringProperty( goToScreenPatternStringProperty, {
      name: homeStringProperty
    } );

    const options = optionize<HomeButtonOptions, SelfOptions, JoistButtonOptions>()( {
      highlightExtensionWidth: 4,

      // pdom,
      containerTagName: 'li',
      accessibleHelpText: descriptionStringProperty,
      appendDescription: true,

      voicingHintResponse: descriptionStringProperty
    }, providedOptions );

    const homeIcon = new Path( homeSolidShape );

    // scale so that the icon is slightly taller than screen button icons, value determined empirically, see joist#127
    homeIcon.setScaleMagnitude( 0.48 * navBarHeight / homeIcon.height * 0.85 );

    // transparent background, size determined empirically so that highlight is the same size as highlight on screen buttons
    const background = new Rectangle( 0, 0, homeIcon.width / 0.85 + 12, navBarHeight );
    homeIcon.center = background.center;

    const content = new Node( { children: [ background, homeIcon ] } );

    // Create a new Utterance that isn't registered through Voicing so that it isn't silenced when the
    // home screen is hidden upon selection. (invisible nodes have their voicing silenced).
    const buttonSelectionUtterance = new Utterance();

    const providedListener = options.listener;
    options.listener = () => {
      providedListener && providedListener();

      this.voicingSpeakFullResponse( {
        objectResponse: null,
        hintResponse: null,
        utterance: buttonSelectionUtterance
      } );
    };

    super( content, navigationBarFillProperty, options );

    // pdom - A custom highlight so the highlight does not get cut off at the bottom and does not extend beyond the top of the
    // navigation bar.
    this.focusHighlight = Shape.bounds( new Bounds2(
      this.bounds.minX - options.highlightExtensionWidth,
      this.bounds.minY + 2,
      this.bounds.maxX + options.highlightExtensionWidth,
      this.bounds.maxY - 2
    ) );

    Multilink.multilink( [ this.interactionStateProperty, navigationBarFillProperty ],
      ( interactionState, navigationBarFill ) => {
        if ( navigationBarFill.equals( Color.BLACK ) ) {
          homeIcon.fill = interactionState === ButtonInteractionState.PRESSED ? 'gray' : 'white';
        }
        else {
          homeIcon.fill = interactionState === ButtonInteractionState.PRESSED ? '#444' : '#222';
        }
      } );

    this.addInputListener( {
      focus: () => {
        this.voicingSpeakFullResponse( {
          objectResponse: null,
          contextResponse: null
        } );
      }
    } );

    pdomDisplayNameProperty.link( name => {
      this.accessibleName = name;
      this.voicingNameResponse = name;
    } );
  }
}

joist.register( 'HomeButton', HomeButton );