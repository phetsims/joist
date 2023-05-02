// Copyright 2013-2023, University of Colorado Boulder

/**
 * Shows the home screen for a multi-screen simulation, which lets the user see all of the screens and select one.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Bounds2 from '../../dot/js/Bounds2.js';
import StringUtils from '../../phetcommon/js/util/StringUtils.js';
import PhetFont from '../../scenery-phet/js/PhetFont.js';
import { AlignBox, HBox, Node, Text } from '../../scenery/js/imports.js';
import soundManager from '../../tambo/js/soundManager.js';
import HomeScreenButton from './HomeScreenButton.js';
import HomeScreenSoundGenerator from './HomeScreenSoundGenerator.js';
import joist from './joist.js';
import JoistStrings from './JoistStrings.js';
import ScreenView, { ScreenViewOptions } from './ScreenView.js';
import { AnyScreen } from './Screen.js';
import HomeScreenModel from './HomeScreenModel.js';
import Property from '../../axon/js/Property.js';
import optionize from '../../phet-core/js/optionize.js';
import TReadOnlyProperty from '../../axon/js/TReadOnlyProperty.js';
import PickRequired from '../../phet-core/js/types/PickRequired.js';
import PatternStringProperty from '../../axon/js/PatternStringProperty.js';

type SelfOptions = {

  // to display below the icons as a warning if available
  warningNode?: Node | null;
};

type HomeScreenViewOptions = SelfOptions & PickRequired<ScreenViewOptions, 'tandem'>;

class HomeScreenView extends ScreenView {

  private homeScreenScreenSummaryIntroProperty!: TReadOnlyProperty<string>;
  private selectedScreenProperty: Property<AnyScreen>;
  public screenButtons: HomeScreenButton[];

  // NOTE: In https://github.com/phetsims/joist/issues/640, we attempted to use ScreenView.DEFAULT_LAYOUT_BOUNDS here.
  // Lots of problems were encountered, since both the Home screen and navigation bar are dependent on this value.
  // If/when joist is cleaned up, this should be ScreenView.DEFAULT_LAYOUT_BOUNDS.
  public static readonly LAYOUT_BOUNDS = new Bounds2( 0, 0, 768, 504 );

  // iPad doesn't support Century Gothic, so fall back to Futura, see http://wordpress.org/support/topic/font-not-working-on-ipad-browser
  public static readonly TITLE_FONT_FAMILY = 'Century Gothic, Futura';

  /**
   * @param simNameProperty - the internationalized text for the sim name
   * @param model
   * @param [providedOptions]
   */
  public constructor( simNameProperty: TReadOnlyProperty<string>, model: HomeScreenModel, providedOptions?: HomeScreenViewOptions ) {

    const options = optionize<HomeScreenViewOptions, SelfOptions, ScreenViewOptions>()( {
      layoutBounds: HomeScreenView.LAYOUT_BOUNDS,
      warningNode: null,

      // Remove the "normal" PDOM structure Nodes like the screen summary, play area, and control area Nodes from the
      // HomeScreen. The HomeScreen handles its own description.
      includePDOMNodes: false
    }, providedOptions );

    super( options );

    const homeScreenPDOMNode = new Node( {
      tagName: 'p'
    } );
    this.addChild( homeScreenPDOMNode );

    this.selectedScreenProperty = model.selectedScreenProperty;

    const titleText = new Text( simNameProperty, {
      font: new PhetFont( {
        size: 52,
        family: HomeScreenView.TITLE_FONT_FAMILY
      } ),
      fill: 'white',
      y: 130,
      maxWidth: this.layoutBounds.width - 10, // To support PhET-iO Clients setting this
      tandem: options.tandem.createTandem( 'titleText' ),
      stringPropertyOptions: { phetioReadOnly: true }
    } );

    // Have this before adding the child to support the startup layout. Use `localBoundsProperty` to avoid an infinite loop.
    titleText.localBoundsProperty.link( () => {
      titleText.centerX = this.layoutBounds.centerX;
    } );
    this.addChild( titleText );

    const buttonGroupTandem = options.tandem.createTandem( 'buttonGroup' );

    this.screenButtons = _.map( model.simScreens, ( screen: AnyScreen ) => {

      assert && assert( screen.nameProperty.value, `name is required for screen ${model.simScreens.indexOf( screen )}` );
      assert && assert( screen.homeScreenIcon, `homeScreenIcon is required for screen ${screen.nameProperty.value}` );

      const homeScreenButton = new HomeScreenButton(
        screen,
        model, {
          showUnselectedHomeScreenIconFrame: screen.showUnselectedHomeScreenIconFrame,

          // pdom
          descriptionContent: screen.descriptionContent,

          // voicing
          voicingHintResponse: screen.descriptionContent,

          // phet-io
          tandem: buttonGroupTandem.createTandem( `${screen.tandem.name}Button` )
        } );

      homeScreenButton.voicingNameResponse = screen.pdomDisplayNameProperty;
      homeScreenButton.innerContent = screen.pdomDisplayNameProperty;

      return homeScreenButton;
    } );

    // Space the icons out more if there are fewer, so they will be spaced nicely.
    // Cannot have only 1 screen because for 1-screen sims there is no home screen.
    let spacing = 60;
    if ( model.simScreens.length === 4 ) {
      spacing = 33;
    }
    if ( model.simScreens.length >= 5 ) {
      spacing = 20;
    }

    this.homeScreenScreenSummaryIntroProperty = new PatternStringProperty( JoistStrings.a11y.homeScreenDescriptionPatternStringProperty, {
      name: simNameProperty,
      screens: model.simScreens.length
    } );


    // Add the home screen description, since there are no PDOM container Nodes for this ScreenView
    homeScreenPDOMNode.innerContent = new PatternStringProperty( JoistStrings.a11y.homeScreenIntroPatternStringProperty, {
      description: this.homeScreenScreenSummaryIntroProperty,
      hint: JoistStrings.a11y.homeScreenHintStringProperty
    } );

    this.screenButtons.forEach( screenButton => {
      screenButton.voicingContextResponse = simNameProperty;
    } );

    const buttonBox = new HBox( {
      spacing: spacing,
      align: 'top',
      maxWidth: this.layoutBounds.width - 118,

      // pdom
      tagName: 'ol'
    } );
    model.activeSimScreensProperty.link( simScreens => {
      buttonBox.children = simScreens.map( screen => _.find( this.screenButtons, screenButton => screenButton.screen === screen )! );
    } );

    this.addChild( new AlignBox( buttonBox, {
      alignBounds: this.layoutBounds,
      yAlign: 'top',
      topMargin: this.layoutBounds.height / 3 + 20
    } ) );

    // Add sound generation for screen selection.  This generates sound for all changes between screens, not just for the
    // home screen.
    soundManager.addSoundGenerator( new HomeScreenSoundGenerator( model, { initialOutputLevel: 0.5 } ), {
      categoryName: 'user-interface'
    } );

    if ( options.warningNode ) {
      const warningNode = options.warningNode;
      this.addChild( warningNode );
      warningNode.centerX = this.layoutBounds.centerX;
      warningNode.bottom = this.layoutBounds.maxY - 2;
    }
  }

  /**
   * For a11y, highlight the currently selected screen button
   */
  public focusHighlightedScreenButton(): void {
    for ( let i = 0; i < this.screenButtons.length; i++ ) {
      const screenButton = this.screenButtons[ i ];
      if ( screenButton.screen === this.selectedScreenProperty.value ) {
        screenButton.focus();
        break;
      }
    }
  }

  /**
   * To support voicing.
   */
  public override getVoicingOverviewContent(): TReadOnlyProperty<string> {
    return this.homeScreenScreenSummaryIntroProperty;
  }

  /**
   * To support voicing.
   */
  public override getVoicingDetailsContent(): string {

    let details = '';

    // Do this dynamically so that it supports changes that may occur to the pdomDisplayNameProperty
    this.screenButtons.forEach( screenButton => {
      if ( details !== '' ) {
        details += ' ';
      }
      details += StringUtils.fillIn( JoistStrings.a11y.homeScreenButtonDetailsPattern, {
        name: screenButton.screen.pdomDisplayNameProperty.value,
        screenHint: screenButton.screen.descriptionContent
      } );
    } );
    return details;
  }

  /**
   * To support voicing.
   */
  public override getVoicingHintContent(): TReadOnlyProperty<string> {
    return JoistStrings.a11y.homeScreenHintStringProperty;
  }
}

joist.register( 'HomeScreenView', HomeScreenView );
export default HomeScreenView;