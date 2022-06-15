// Copyright 2013-2022, University of Colorado Boulder

/**
 * The Home button that appears in the navigation bar.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Multilink from '../../axon/js/Multilink.js';
import StrictOmit from '../../phet-core/js/types/StrictOmit.js';
import Property from '../../axon/js/Property.js';
import { Shape } from '../../kite/js/imports.js';
import optionize from '../../phet-core/js/optionize.js';
import EmptyObjectType from '../../phet-core/js/types/EmptyObjectType.js';
import { Color, FocusHighlightPath, Node, Path, Rectangle, VoicingOptions } from '../../scenery/js/imports.js';
import homeSolidShape from '../../sherpa/js/fontawesome-5/homeSolidShape.js';
import ButtonInteractionState from '../../sun/js/buttons/ButtonInteractionState.js';
import Tandem from '../../tandem/js/Tandem.js';
import Utterance from '../../utterance-queue/js/Utterance.js';
import joist from './joist.js';
import JoistButton, { JoistButtonOptions } from './JoistButton.js';
import joistStrings from './joistStrings.js';

// constants
const homeScreenDescriptionString = joistStrings.a11y.homeScreenDescription;

type SelfOptions = EmptyObjectType;
type HomeButtonOptions = SelfOptions & StrictOmit<JoistButtonOptions, 'innerContent'>;

export default class HomeButton extends JoistButton {

  /**
   * @param navBarHeight
   * @param navigationBarFillProperty - the color of the navbar, as a string.
   * @param tandem
   * @param pdomDisplayNameProperty - for the HomeScreen, for description
   * @param [providedOptions]
   */
  public constructor(
    navBarHeight: number,
    navigationBarFillProperty: Property<Color>,
    pdomDisplayNameProperty: Property<string | null>,
    tandem: Tandem,
    providedOptions: HomeButtonOptions
  ) {

    const options = optionize<HomeButtonOptions, SelfOptions, JoistButtonOptions & VoicingOptions>()( {
      highlightExtensionWidth: 4,
      listener: null,

      // pdom,
      containerTagName: 'li',
      descriptionContent: homeScreenDescriptionString,
      appendDescription: true,

      voicingHintResponse: homeScreenDescriptionString
    }, providedOptions );

    const homeIcon = new Path( homeSolidShape );

    // scale so that the icon is slightly taller than screen button icons, value determined empirically, see joist#127
    homeIcon.setScaleMagnitude( 0.48 * navBarHeight / homeIcon.height );

    // transparent background, size determined empirically so that highlight is the same size as highlight on screen buttons
    const background = new Rectangle( 0, 0, homeIcon.width + 12, navBarHeight );
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

    super( content, navigationBarFillProperty, tandem, options );

    // pdom - Pass a shape to the focusHighlight to prevent dilation, then tweak the bottom up just a hair so it
    // isn't off the screen.
    const highlightLineWidth = FocusHighlightPath.getOuterLineWidthFromNode( this );
    this.focusHighlight = Shape.bounds( this.bounds.setMaxY( this.bounds.maxY - highlightLineWidth / 2 ) );

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
      this.innerContent = name;
      this.voicingNameResponse = name;
    } );
  }
}

joist.register( 'HomeButton', HomeButton );