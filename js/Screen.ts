// Copyright 2013-2025, University of Colorado Boulder

/**
 * A Screen is the largest chunk of a simulation. (Java sims used the term Module, but that term
 * is too overloaded to use with JavaScript and Git.)
 *
 * When creating a Sim, Screens are supplied as the arguments. They can be specified as object literals or through
 * instances of this class. This class may centralize default behavior or state for Screens in the future, but right
 * now it only allows you to create Sims without using named parameter object literals.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import BooleanProperty from '../../axon/js/BooleanProperty.js';
import DerivedProperty from '../../axon/js/DerivedProperty.js';
import Multilink from '../../axon/js/Multilink.js';
import PatternStringProperty from '../../axon/js/PatternStringProperty.js';
import PhetioProperty from '../../axon/js/PhetioProperty.js';
import Property from '../../axon/js/Property.js';
import TReadOnlyProperty from '../../axon/js/TReadOnlyProperty.js';
import Bounds2 from '../../dot/js/Bounds2.js';
import Dimension2 from '../../dot/js/Dimension2.js';
import Shape from '../../kite/js/Shape.js';
import optionize from '../../phet-core/js/optionize.js';
import IntentionalAny from '../../phet-core/js/types/IntentionalAny.js';
import PickRequired from '../../phet-core/js/types/PickRequired.js';
import StrictOmit from '../../phet-core/js/types/StrictOmit.js';
import StringUtils from '../../phetcommon/js/util/StringUtils.js';
import { PDOMValueType } from '../../scenery/js/accessibility/pdom/ParallelDOM.js';
import Node from '../../scenery/js/nodes/Node.js';
import Path from '../../scenery/js/nodes/Path.js';
import Rectangle from '../../scenery/js/nodes/Rectangle.js';
import Color from '../../scenery/js/util/Color.js';
import ProfileColorProperty from '../../scenery/js/util/ProfileColorProperty.js';
import PhetioObject, { PhetioObjectOptions } from '../../tandem/js/PhetioObject.js';
import Tandem from '../../tandem/js/Tandem.js';
import IOType from '../../tandem/js/types/IOType.js';
import ReferenceIO from '../../tandem/js/types/ReferenceIO.js';
import joist from './joist.js';
import JoistStrings from './JoistStrings.js';
import ScreenIcon, { MINIMUM_HOME_SCREEN_ICON_SIZE } from './ScreenIcon.js';
import ScreenView from './ScreenView.js';
import TModel from './TModel.js';

const screenNamePatternStringProperty = JoistStrings.a11y.translatable.screenNamePatternStringProperty;
const goToScreenPatternStringProperty = JoistStrings.a11y.translatable.goToScreenPatternStringProperty;
const screenSimPatternStringProperty = JoistStrings.a11y.translatable.screenSimPatternStringProperty;
const simScreenStringProperty = JoistStrings.a11y.translatable.simScreenStringProperty;

// constants
const MINIMUM_NAVBAR_ICON_SIZE = new Dimension2( 147, 100 );
const NAVBAR_ICON_ASPECT_RATIO = MINIMUM_NAVBAR_ICON_SIZE.width / MINIMUM_NAVBAR_ICON_SIZE.height;
const HOME_SCREEN_ICON_ASPECT_RATIO = MINIMUM_HOME_SCREEN_ICON_SIZE.width / MINIMUM_HOME_SCREEN_ICON_SIZE.height;
const ICON_ASPECT_RATIO_TOLERANCE = 5E-3; // how close to the ideal aspect ratio an icon must be

// Home screen and navigation bar icons must have the same aspect ratio, see https://github.com/phetsims/joist/issues/76
assert && assert( Math.abs( HOME_SCREEN_ICON_ASPECT_RATIO - HOME_SCREEN_ICON_ASPECT_RATIO ) < ICON_ASPECT_RATIO_TOLERANCE,
  'MINIMUM_HOME_SCREEN_ICON_SIZE and MINIMUM_NAVBAR_ICON_SIZE must have the same aspect ratio' );

// Documentation is by the defaults
type SelfOptions = {
  name?: PhetioProperty<string> | null;
  instrumentNameProperty?: boolean;

  // It would be preferable to support Property<Color | string> solely, but many subtypes are hardcoded to be Color only
  // or string only, so we support this polymorphic form
  backgroundColorProperty?: Property<Color | string> | Property<Color> | Property<string> | ProfileColorProperty;
  homeScreenIcon?: ScreenIcon | null;
  showUnselectedHomeScreenIconFrame?: boolean;
  navigationBarIcon?: ScreenIcon | null;
  showScreenIconFrameForNavigationBarFill?: string | null;

  // dt cap in seconds, see https://github.com/phetsims/joist/issues/130
  maxDT?: number;
  createKeyboardHelpNode?: null | ( ( tandem: Tandem ) => Node );

  // Help text that will be added to the Home screen button and navigation bar button for this screen.
  // This is often a full but short sentence with a period at the end of it. This is also used as the
  // hint response for these buttons with the Voicing feature.
  screenButtonsHelpText?: PDOMValueType | null;
};
export type ScreenOptions = SelfOptions &
  StrictOmit<PhetioObjectOptions, 'tandemNameSuffix'> & // Tandem.RootTandem.createTandem requires that the suffix is Tandem.SCREEN_TANDEM_NAME_SUFFIX.
  PickRequired<PhetioObjectOptions, 'tandem'>;

// @joist-internal - This type is uses IntentionalAny to break the contravariance dependency that the createView function
// has on Screen. Ideally we could use TModel instead, but that would involve a rewrite of how we pass closures into
// Screen instead of the already created Model/View themselves. See https://github.com/phetsims/joist/issues/783#issuecomment-1231017213
export type AnyScreen = Screen<IntentionalAny, ScreenView>;

// Parameterized on M=Model and V=View
class Screen<M extends TModel, V extends ScreenView> extends PhetioObject {

  public backgroundColorProperty: Property<Color> | Property<string> | Property<Color | string>;

  // dt cap in seconds, see https://github.com/phetsims/joist/issues/130
  public readonly maxDT: number;
  public readonly activeProperty: BooleanProperty;

  // Help text used on the screen buttons, see options above.
  public readonly screenButtonsHelpText: PDOMValueType;
  public readonly nameProperty: TReadOnlyProperty<string>;

  public readonly showScreenIconFrameForNavigationBarFill: string | null;
  public readonly homeScreenIcon: ScreenIcon | null;
  public navigationBarIcon: ScreenIcon | null;
  public readonly showUnselectedHomeScreenIconFrame: boolean;
  public readonly createKeyboardHelpNode: null | ( ( tandem: Tandem ) => Node ); // joist-internal
  public readonly pdomDisplayNameProperty: TReadOnlyProperty<string>;
  private readonly createModel: () => M;
  private readonly createView: ( model: M ) => V;
  private _model: M | null;
  private _view: V | null;

  public static readonly HOME_SCREEN_ICON_ASPECT_RATIO = HOME_SCREEN_ICON_ASPECT_RATIO;
  public static readonly MINIMUM_HOME_SCREEN_ICON_SIZE = MINIMUM_HOME_SCREEN_ICON_SIZE;
  public static readonly MINIMUM_NAVBAR_ICON_SIZE = MINIMUM_NAVBAR_ICON_SIZE;
  public static readonly ScreenIO = new IOType( 'ScreenIO', {
    valueType: Screen,
    supertype: ReferenceIO( IOType.ObjectIO ),
    documentation: 'Section of a simulation which has its own model and view.'
  } );

  public constructor( createModel: () => M, createView: ( model: M ) => V, providedOptions: ScreenOptions ) {

    const options = optionize<ScreenOptions, SelfOptions, PhetioObjectOptions>()( {

      // {TProperty<string>|null} name of the sim, as displayed to the user.
      // For single-screen sims, there is no home screen or navigation bar, and null is OK.
      // For multi-screen sims, this must be provided.
      name: null,

      // {boolean} whether nameProperty should be instrumented. see usage for explanation of its necessity.
      instrumentNameProperty: true,

      backgroundColorProperty: new Property<Color | string>( 'white' ),

      // {Node|null} icon shown on the home screen. If null, then a default is created.
      // For single-screen sims, there is no home screen and the default is OK.
      homeScreenIcon: null,

      // {boolean} whether to draw a frame around the small icons on home screen
      showUnselectedHomeScreenIconFrame: false,

      // {Node|null} icon shown in the navigation bar. If null, then the home screen icon will be used, scaled to fit.
      navigationBarIcon: null,

      // {string|null} show a frame around the screen icon when the navbar's background fill is this color
      // 'black', 'white', or null (no frame)
      showScreenIconFrameForNavigationBarFill: null,

      maxDT: 0.5,

      // a {null|function():Node} placed into the keyboard help dialog that can be opened from the navigation bar when this
      // screen is selected
      createKeyboardHelpNode: null,

      screenButtonsHelpText: null,

      // phet-io
      // @ts-expect-error include a default for un-instrumented, JavaScript sims
      tandem: Tandem.REQUIRED,
      tandemNameSuffix: Tandem.SCREEN_TANDEM_NAME_SUFFIX,
      phetioType: Screen.ScreenIO,
      phetioState: false,
      phetioFeatured: true
    }, providedOptions );

    assert && assert( _.includes( [ 'black', 'white', null ], options.showScreenIconFrameForNavigationBarFill ),
      `invalid showScreenIconFrameForNavigationBarFill: ${options.showScreenIconFrameForNavigationBarFill}` );

    assert && assert( typeof options.name !== 'string', 'Screen no longer supports a name string, instead it should be a Property<string>' );

    super( options );

    // Create a default homeScreenIcon, using the Screen's background color
    if ( !options.homeScreenIcon ) {
      const iconNode = new Rectangle( 0, 0, MINIMUM_HOME_SCREEN_ICON_SIZE.width, MINIMUM_HOME_SCREEN_ICON_SIZE.height );
      options.homeScreenIcon = new ScreenIcon( iconNode, {
        fill: options.backgroundColorProperty.value,
        maxIconWidthProportion: 1,
        maxIconHeightProportion: 1
      } );
    }

    // navigationBarIcon defaults to homeScreenIcon, and will be scaled down
    if ( !options.navigationBarIcon ) {
      options.navigationBarIcon = options.homeScreenIcon;
    }

    // Validate icon sizes
    validateIconSize( options.homeScreenIcon, MINIMUM_HOME_SCREEN_ICON_SIZE, HOME_SCREEN_ICON_ASPECT_RATIO, 'homeScreenIcon' );
    validateIconSize( options.navigationBarIcon, MINIMUM_NAVBAR_ICON_SIZE, NAVBAR_ICON_ASPECT_RATIO, 'navigationBarIcon' );

    this.backgroundColorProperty = options.backgroundColorProperty;

    if ( options.name ) {
      this.nameProperty = options.name;

      // Don't instrument this.nameProperty if options.instrumentNameProperty is false or if options.name is not provided.
      // This additional option is needed because designers requested the ability to not instrument a screen's nameProperty
      // even if it has a name, see https://github.com/phetsims/joist/issues/627 and https://github.com/phetsims/joist/issues/629.
      options.instrumentNameProperty && this.addLinkedElement( options.name, {
        tandemName: 'nameProperty'
      } );
    }
    else {

      // may be null for single-screen simulations, just make it blank
      this.nameProperty = new Property( '' );
    }

    this.homeScreenIcon = options.homeScreenIcon;
    this.navigationBarIcon = options.navigationBarIcon;
    this.showUnselectedHomeScreenIconFrame = options.showUnselectedHomeScreenIconFrame;
    this.showScreenIconFrameForNavigationBarFill = options.showScreenIconFrameForNavigationBarFill;
    this.createKeyboardHelpNode = options.createKeyboardHelpNode;

    // may be null for single-screen simulations
    this.pdomDisplayNameProperty = new DerivedProperty( [ this.nameProperty, screenNamePatternStringProperty ], name => {
      return name === null ? '' : StringUtils.fillIn( screenNamePatternStringProperty, {
        name: name
      } );
    } );

    this.maxDT = options.maxDT;

    this.createModel = createModel;
    this.createView = createView;

    // Construction of the model and view are delayed and controlled to enable features like
    // a) faster loading when only loading certain screens
    // b) showing a loading progress bar <not implemented>
    this._model = null;
    this._view = null;

    // Indicates whether the Screen is active. Clients can read this, joist sets it.
    // To prevent potential visual glitches, the value should change only while the screen's view is invisible.
    // That is: transitions from false to true before a Screen becomes visible, and from true to false after a Screen becomes invisible.
    this.activeProperty = new BooleanProperty( true, {
      tandem: options.tandem.createTandem( 'activeProperty' ),
      phetioReadOnly: true,
      phetioDocumentation: 'Indicates whether the screen is currently displayed in the simulation.  For single-screen ' +
                           'simulations, there is only one screen and it is always active.'
    } );

    // The accessibleHelpText for the screen buttons uses the provided option, but creates reasonable defaults
    // from the nameProperty otherwise.
    this.screenButtonsHelpText = '';
    if ( options.screenButtonsHelpText ) {
      this.screenButtonsHelpText = options.screenButtonsHelpText;
    }
    else if ( this.nameProperty.value ) {

      // Fall back to "Go to {{Screen Name}} Screen" as a default.
      this.screenButtonsHelpText = new PatternStringProperty( goToScreenPatternStringProperty, {
        name: this.nameProperty
      }, { tandem: Tandem.OPT_OUT } );
    }
    else {
      this.screenButtonsHelpText = simScreenStringProperty; // fall back on generic name
    }

    assert && this.activeProperty.lazyLink( () => {
      assert && assert( this._view, 'isActive should not change before the Screen view has been initialized' );

      // In phet-io mode, the state of a sim can be set without a deterministic order. The activeProperty could be
      // changed before the view's visibility is set.
      if ( !Tandem.PHET_IO_ENABLED ) {
        assert && assert( !this._view!.isVisible(), 'isActive should not change while the Screen view is visible' );
      }
    } );
  }

  // Returns the model (if it has been constructed)
  public get model(): M {
    assert && assert( this._model, 'Model has not yet been constructed' );
    return this._model!;
  }

  // Returns the view (if it has been constructed)
  public get view(): V {
    assert && assert( this._view, 'View has not yet been constructed' );
    return this._view!;
  }

  public hasModel(): boolean {
    return !!this._model;
  }

  public hasView(): boolean {
    return !!this._view;
  }

  public reset(): void {

    // Background color not reset, as it's a responsibility of the code that changes the property
  }

  /**
   * Initialize the model.
   * (joist-internal)
   */
  public initializeModel(): void {
    assert && assert( this._model === null, 'there was already a model' );
    this._model = this.createModel();
  }

  /**
   * Initialize the view.
   * (joist-internal)
   * @param simNameProperty - The Property of the name of the sim, used for a11y.
   * @param displayedSimNameProperty - The Property of the display name of the sim, used for a11y. Could change based on screen.
   * @param numberOfScreens - the number of screens in the sim this runtime (could change with `?screens=...`.
   * @param isHomeScreen - if this screen is the home screen.
   */
  public initializeView( simNameProperty: TReadOnlyProperty<string>, displayedSimNameProperty: TReadOnlyProperty<string>, numberOfScreens: number, isHomeScreen: boolean ): void {
    assert && assert( this._view === null, 'there was already a view' );
    this._view = this.createView( this.model );
    this._view.setVisible( false ); // a Screen is invisible until selected

    // Show the home screen's layoutBounds
    if ( phet.chipper.queryParameters.dev ) {
      this._view.addChild( devCreateLayoutBoundsNode( this._view.layoutBounds ) );
    }

    // For debugging, make it possible to see the visibleBounds.  This is not included with ?dev since
    // it should just be equal to what you see.
    if ( phet.chipper.queryParameters.showVisibleBounds ) {
      this._view.addChild( devCreateVisibleBoundsNode( this._view ) );
    }

    // Set the accessible label for the screen.
    Multilink.multilink( [ displayedSimNameProperty, simNameProperty, this.pdomDisplayNameProperty ],
      ( displayedName, simName, pdomDisplayName ) => {

        let titleString;

        // Single screen sims don't need screen names, instead just show the title of the sim.
        // Using total screens for sim breaks modularity a bit, but it also is needed as that parameter changes the
        // labelling of this screen, see https://github.com/phetsims/joist/issues/496
        if ( numberOfScreens === 1 ) {
          titleString = displayedName; // for multiscreen sims, like "Ratio and Proportion -- Create"
        }
        else if ( isHomeScreen ) {
          titleString = simName; // Like "Ratio and Propotion"
        }
        else {

          // initialize proper PDOM labelling for ScreenView
          titleString = StringUtils.fillIn( screenSimPatternStringProperty, {
            screenName: pdomDisplayName,
            simName: simName
          } );
        }

        // if there is a screenSummaryNode, then set its intro string now
        this._view!.setScreenSummaryIntroAndTitle( simName, pdomDisplayName, titleString, numberOfScreens > 1 );
      } );

    assert && this._view.pdomAudit();
  }
}

/**
 * Validates the sizes for the home screen icon and navigation bar icon.
 * @param icon - the icon to validate
 * @param minimumSize - the minimum allowed size for the icon
 * @param aspectRatio - the required aspect ratio
 * @param name - the name of the icon type (for assert messages)
 */
function validateIconSize( icon: Node, minimumSize: Dimension2, aspectRatio: number, name: string ): void {
  assert && assert( icon.width >= minimumSize.width, `${name} width is too small: ${icon.width} < ${minimumSize.width}` );
  assert && assert( icon.height >= minimumSize.height, `${name} height is too small: ${icon.height} < ${minimumSize.height}` );

  // Validate home screen aspect ratio
  const actualAspectRatio = icon.width / icon.height;
  assert && assert(
    Math.abs( aspectRatio - actualAspectRatio ) < ICON_ASPECT_RATIO_TOLERANCE,
    `${name} has invalid aspect ratio: ${actualAspectRatio}`
  );
}

/**
 * Creates a Node for visualizing the ScreenView layoutBounds with 'dev' query parameter.
 */
function devCreateLayoutBoundsNode( layoutBounds: Bounds2 ): Node {
  return new Path( Shape.bounds( layoutBounds ), {
    stroke: 'red',
    lineWidth: 3,
    pickable: false
  } );
}

/**
 * Creates a Node for visualizing the ScreenView visibleBoundsProperty with 'showVisibleBounds' query parameter.
 */
function devCreateVisibleBoundsNode( screenView: ScreenView ): Node {
  const path = new Path( Shape.bounds( screenView.visibleBoundsProperty.value ), {
    stroke: 'blue',
    lineWidth: 6,
    pickable: false
  } );
  screenView.visibleBoundsProperty.link( visibleBounds => {
    path.shape = Shape.bounds( visibleBounds );
  } );
  return path;
}

joist.register( 'Screen', Screen );
export default Screen;