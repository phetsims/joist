// Copyright 2013-2023, University of Colorado Boulder

/**
 * The 'PhET' menu, which appears in the bottom-right of the home screen and the navigation bar, with options like
 * "PhET Website", "Settings", etc.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import DerivedProperty from '../../axon/js/DerivedProperty.js';
import TinyProperty from '../../axon/js/TinyProperty.js';
import TReadOnlyProperty from '../../axon/js/TReadOnlyProperty.js';
import { Shape } from '../../kite/js/imports.js';
import optionize, { EmptySelfOptions } from '../../phet-core/js/optionize.js';
import platform from '../../phet-core/js/platform.js';
import stripEmbeddingMarks from '../../phet-core/js/stripEmbeddingMarks.js';
import WithRequired from '../../phet-core/js/types/WithRequired.js';
import { FullScreen, HSeparator, KeyboardUtils, Node, NodeOptions, openPopup, Path, PDOMUtils, SceneryEvent, VBox } from '../../scenery/js/imports.js';
import Dialog from '../../sun/js/Dialog.js';
import MenuItem, { MenuItemOptions } from '../../sun/js/MenuItem.js';
import Popupable, { PopupableOptions } from '../../sun/js/Popupable.js';
import PhetioCapsule from '../../tandem/js/PhetioCapsule.js';
import IOType from '../../tandem/js/types/IOType.js';
import AboutDialog from './AboutDialog.js';
import joist from './joist.js';
import JoistStrings from './JoistStrings.js';
import ScreenshotGenerator from './ScreenshotGenerator.js';
import Sim from './Sim.js';
import updateCheck from './updateCheck.js';
import UpdateDialog from './UpdateDialog.js';
import UpdateState from './UpdateState.js';

type MenuItemDescriptor = {
  textStringProperty: TReadOnlyProperty<string>;
  present: boolean;
  shouldBeHiddenWhenLinksAreNotAllowed: boolean;
  callback: () => void;
  separatorBefore?: boolean;
  options?: MenuItemOptions;
};

type SelfOptions = EmptySelfOptions;

type ParentOptions = PopupableOptions & WithRequired<NodeOptions, 'tandem'>;
type PhetMenuOptions = SelfOptions & ParentOptions;

class PhetMenu extends Popupable( Node, 0 ) {

  // The items that will actually be shown in this runtime
  public readonly items: MenuItem[];

  private readonly disposePhetMenu: () => void;

  public constructor( sim: Sim, providedOptions?: PhetMenuOptions ) {

    // Only show certain features for PhET Sims, such as links to our website
    const isPhETBrand = phet.chipper.brand === 'phet';
    const isApp = phet.chipper.isApp;

    const options = optionize<PhetMenuOptions, SelfOptions, ParentOptions>()( {

      phetioType: PhetMenu.PhetMenuIO,
      phetioState: false,
      phetioDocumentation: 'This menu is displayed when the PhET button is pressed.',

      phetioVisiblePropertyInstrumented: false, // visible isn't toggled when showing a PhetMenu

      // pdom, tagName and role for content in the menu
      tagName: 'ul',
      ariaRole: 'menu'
    }, providedOptions );

    super( options );

    // AboutDialog is created lazily (so that Sim bounds are valid), then reused.
    // Since AboutDialog is instrumented for PhET-iO, this lazy creation requires use of PhetioCapsule.
    const aboutDialogCapsule = new PhetioCapsule( tandem => {
      return new AboutDialog( sim.simNameProperty, sim.version, sim.credits, sim.locale, {
        tandem: tandem,
        focusOnHideNode: this.focusOnHideNode
      } );
    }, [], {
      tandem: options.tandem.createTandem( 'aboutDialogCapsule' ),
      phetioType: PhetioCapsule.PhetioCapsuleIO( Dialog.DialogIO )
    } );

    // Update dialog is created lazily (so that Sim bounds are valid), then reused.
    let updateDialog: UpdateDialog | null = null;

    /*
     * Description of the items in the menu. See Menu Item for a list of properties for each itemDescriptor
     */
    const itemDescriptors: MenuItemDescriptor[] = [
      {
        textStringProperty: JoistStrings.menuItem.phetWebsiteStringProperty,
        present: isPhETBrand,
        shouldBeHiddenWhenLinksAreNotAllowed: true,
        callback: () => {

          // Open locale-specific PhET home page. If there is no website translation for locale, fallback will be handled by server. See joist#97.
          openPopup( `https://phet.colorado.edu/${sim.locale}` );
        }
      },
      {
        textStringProperty: JoistStrings.menuItem.reportAProblemStringProperty,
        present: isPhETBrand && !isApp,
        shouldBeHiddenWhenLinksAreNotAllowed: true,
        callback: () => {
          const url = `${'https://phet.colorado.edu/files/troubleshooting/' +
                         '?sim='}${encodeURIComponent( sim.simNameProperty.value )
          }&version=${encodeURIComponent( `${sim.version} ${
            phet.chipper.buildTimestamp ? phet.chipper.buildTimestamp : '(unbuilt)'}` )
          }&url=${encodeURIComponent( window.location.href )
          }&dependencies=${encodeURIComponent( JSON.stringify( {} ) )}`;
          openPopup( url );
        }
      },
      {
        textStringProperty: new TinyProperty( 'QR code' ),
        present: phet.chipper.queryParameters.qrCode,
        shouldBeHiddenWhenLinksAreNotAllowed: true,
        callback: () => {
          openPopup( `http://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent( window.location.href )}&size=220x220&margin=0` );
        }
      },
      {
        textStringProperty: JoistStrings.menuItem.getUpdateStringProperty,
        present: updateCheck.areUpdatesChecked,
        shouldBeHiddenWhenLinksAreNotAllowed: true,
        callback: () => {
          if ( !updateDialog ) {
            updateDialog = new UpdateDialog( {
              focusOnHideNode: this.focusOnHideNode
            } );
          }
          updateDialog.show();
        },
        options: {
          textFill: new DerivedProperty( [ updateCheck.stateProperty ], ( state => {
            return state === UpdateState.OUT_OF_DATE ? '#0a0' : '#000';
          } ) )
        }
      },

      // "Screenshot" Menu item
      {
        textStringProperty: JoistStrings.menuItem.screenshotStringProperty,
        present: !isApp, // Not supported by IE9, see https://github.com/phetsims/joist/issues/212
        shouldBeHiddenWhenLinksAreNotAllowed: false,
        callback: () => {
          const dataURL = ScreenshotGenerator.generateScreenshot( sim );

          // if we have FileSaver support
          if ( window.Blob && !!new window.Blob() ) {

            // construct a blob out of it
            const requiredPrefix = 'data:image/png;base64,';
            assert && assert( dataURL.startsWith( requiredPrefix ) );
            const dataBase64 = dataURL.slice( requiredPrefix.length );
            const byteChars = window.atob( dataBase64 );
            const byteArray = new window.Uint8Array( byteChars.length );
            for ( let i = 0; i < byteArray.length; i++ ) {
              byteArray[ i ] = byteChars.charCodeAt( i ); // need check to make sure this cast doesn't give problems?
            }

            const blob = new window.Blob( [ byteArray ], { type: 'image/png' } );

            // our preferred filename
            const filename = `${stripEmbeddingMarks( sim.simNameProperty.value )} screenshot.png`;

            if ( !phet.chipper.isFuzzEnabled() ) {

              // @ts-expect-error when typescript knows anything about window. . ..
              window.saveAs( blob, filename );
            }
          }
          else {
            openPopup( dataURL, true );
          }
        },
        options: {
          tandem: options.tandem.createTandem( 'screenshotMenuItem' ),
          phetioDocumentation: 'This menu item captures a screenshot from the simulation and saves it to the file system.',
          visiblePropertyOptions: { phetioFeatured: true }
        }
      },

      // "Full Screen" menu item
      {
        textStringProperty: JoistStrings.menuItem.fullscreenStringProperty,
        present: FullScreen.isFullScreenEnabled() && !isApp && !platform.mobileSafari && !phet.chipper.queryParameters.preventFullScreen,
        shouldBeHiddenWhenLinksAreNotAllowed: false,
        callback: () => {
          if ( !phet.chipper.isFuzzEnabled() ) {
            FullScreen.toggleFullScreen( sim.display );
          }
        },
        options: {
          checkedProperty: FullScreen.isFullScreenProperty,
          tandem: options.tandem.createTandem( 'fullScreenMenuItem' ),
          phetioDocumentation: 'This menu item requests full-screen access for the simulation display.',
          visiblePropertyOptions: { phetioFeatured: true }
        }
      },

      // About dialog button
      {
        textStringProperty: JoistStrings.menuItem.aboutStringProperty,
        present: true,
        shouldBeHiddenWhenLinksAreNotAllowed: false,
        callback: () => aboutDialogCapsule.getElement().show(),
        options: {
          separatorBefore: isPhETBrand,

          // phet-io
          tandem: options.tandem.createTandem( 'aboutMenuItem' ),
          phetioDocumentation: 'This menu item shows a dialog with information about the simulation.',
          visiblePropertyOptions: { phetioFeatured: true }
        }
      }
    ];

    const keepItemDescriptors = itemDescriptors.filter( itemDescriptor => {

      // If there is a tandem, then we need to create the MenuItem to have a consistent API.
      return itemDescriptor.present || ( itemDescriptor.options && itemDescriptor.options.tandem );
    } );

    // Create the menu items.
    const unfilteredItems = keepItemDescriptors.map( itemDescriptor => {
        return new MenuItem(
          () => this.hide(),
          itemDescriptor.textStringProperty,
          itemDescriptor.callback,
          itemDescriptor.present,
          itemDescriptor.shouldBeHiddenWhenLinksAreNotAllowed,
          itemDescriptor.options
        );
      }
    );
    const items = unfilteredItems.filter( item => item.present );

    // Some items that aren't present were created just to maintain a consistent PhET-iO API across all
    // runtimes, we can ignore those now.
    this.items = items;

    const content = new VBox( {
      stretch: true,
      spacing: 2,
      children: _.flatten( items.map( item => {
        return item.separatorBefore ? [ new HSeparator( { stroke: 'gray' } ), item ] : [ item ];
      } ) )
    } );

    // Create a comic-book-style bubble.
    const X_MARGIN = 5;
    const Y_MARGIN = 5;
    const bubble = new Path( null, {
      fill: 'white',
      stroke: 'black'
    } );
    content.localBoundsProperty.link( () => {
      content.left = X_MARGIN;
      content.top = Y_MARGIN;
    } );
    content.boundsProperty.link( bounds => {
      bubble.shape = createBubbleShape( bounds.width + 2 * X_MARGIN, bounds.height + 2 * Y_MARGIN );
    } );

    this.addChild( bubble );
    this.addChild( content );

    // pdom - add the keydown listener, handling arrow, escape, and tab keys
    // When using the arrow keys, we prevent the virtual cursor from moving in VoiceOver
    const keydownListener = {
      keydown: ( event: SceneryEvent ) => {
        const domEvent = event.domEvent!;

        const firstItem = this.items[ 0 ];
        const lastItem = this.items[ this.items.length - 1 ];

        const key = KeyboardUtils.getEventCode( domEvent );

        // this attempts to prevent the screen reader's virtual cursor from also moving with the arrow keys
        if ( KeyboardUtils.isArrowKey( domEvent ) || key === KeyboardUtils.KEY_ESCAPE ) {
          domEvent.preventDefault();
        }

        if ( key === KeyboardUtils.KEY_DOWN_ARROW ) {

          // On down arrow, focus next item in the list, or wrap up to the first item if focus is at the end
          const nextFocusable = lastItem.focused ? firstItem : PDOMUtils.getNextFocusable();
          nextFocusable.focus();
        }
        else if ( key === KeyboardUtils.KEY_UP_ARROW ) {

          // On up arrow, focus previous item in the list, or wrap back to the last item if focus is on first item
          const previousFocusable = firstItem.focused ? lastItem : PDOMUtils.getPreviousFocusable();
          previousFocusable.focus();
        }
        else if ( key === KeyboardUtils.KEY_ESCAPE || key === KeyboardUtils.KEY_TAB ) {

          // On escape or tab, close the menu and restore focus to the element that had focus before the menu was opened.
          this.hide();
        }

        event.pointer.reserveForKeyboardDrag();
      }
    };
    this.addInputListener( keydownListener );

    this.disposePhetMenu = () => {
      this.removeInputListener( keydownListener );
    };
  }

  /**
   * (joist-internal)
   */
  public override dispose(): void {
    this.disposePhetMenu();
    _.each( this.items, item => item.dispose() );
    super.dispose();
  }

  public static PhetMenuIO = new IOType( 'PhetMenuIO', {
    valueType: PhetMenu,
    documentation: 'The PhET Menu in the bottom right of the screen'
  } );
}

const createBubbleShape = ( width: number, height: number ): Shape => {
  const tail = new Shape()
    .moveTo( width - 20, height )
    .lineToRelative( 0, 20 )
    .lineToRelative( -20, -20 )
    .close();
  return Shape.roundRect( 0, 0, width, height, 8, 8 ).shapeUnion( tail );
};

joist.register( 'PhetMenu', PhetMenu );
export default PhetMenu;