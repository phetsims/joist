// Copyright 2013-2022, University of Colorado Boulder

/**
 * The 'PhET' menu, which appears in the bottom-right of the home screen and the navigation bar, with options like
 * "PhET Website", "Settings", etc.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import DerivedProperty from '../../axon/js/DerivedProperty.js';
import { Shape } from '../../kite/js/imports.js';
import gracefulBind from '../../phet-core/js/gracefulBind.js';
import openPopup from '../../phet-core/js/openPopup.js';
import optionize from '../../phet-core/js/optionize.js';
import platform from '../../phet-core/js/platform.js';
import stripEmbeddingMarks from '../../phet-core/js/stripEmbeddingMarks.js';
import PickRequired from '../../phet-core/js/types/PickRequired.js';
import PhetFont from '../../scenery-phet/js/PhetFont.js';
import { Focus, FocusManager, FullScreen, KeyboardUtils, Node, NodeOptions, Path, PDOMUtils, Rectangle, SceneryEvent, Text } from '../../scenery/js/imports.js';
import Dialog from '../../sun/js/Dialog.js';
import HSeparator from '../../sun/js/HSeparator.js';
import MenuItem, { MenuItemOptions } from '../../sun/js/MenuItem.js';
import { PopupableNode } from '../../sun/js/Popupable.js';
import soundManager from '../../tambo/js/soundManager.js';
import PhetioCapsule from '../../tandem/js/PhetioCapsule.js';
import IOType from '../../tandem/js/types/IOType.js';
import AboutDialog from './AboutDialog.js';
import audioManager from './audioManager.js';
import joist from './joist.js';
import joistStrings from './joistStrings.js';
import OptionsDialog from './OptionsDialog.js';
import ScreenshotGenerator from './ScreenshotGenerator.js';
import Sim from './Sim.js';
import updateCheck from './updateCheck.js';
import UpdateDialog from './UpdateDialog.js';
import UpdateState from './UpdateState.js';

const menuItemAboutString = joistStrings.menuItem.about;
const menuItemExtraSoundString = joistStrings.menuItem.enhancedSound;
const menuItemFullscreenString = joistStrings.menuItem.fullscreen;
const menuItemGetUpdateString = joistStrings.menuItem.getUpdate;
const menuItemOptionsString = joistStrings.menuItem.options;
const menuItemPhetWebsiteString = joistStrings.menuItem.phetWebsite;
const menuItemReportAProblemString = joistStrings.menuItem.reportAProblem;
const menuItemScreenshotString = joistStrings.menuItem.screenshot;

// constants
const FONT_SIZE = 18;
const MAX_ITEM_WIDTH = 400;

// the supported keys allowed in each itemDescriptor for a MenuItem
const allowedItemDescriptorKeys = [ 'text', 'callback', 'present', 'options' ];

type PopupToggler = ( popup: PopupableNode, isModal: boolean ) => void;
type MenuItemDescriptor = {
  text: string;
  present: boolean;
  callback: () => void;
  separatorBefore?: boolean;
  options?: MenuItemOptions;
};

type SelfOptions = {
  showPopup?: PopupToggler;
  hidePopup?: PopupToggler;
  closeCallback: () => void;
};
type PhetMenuOptions = SelfOptions & PickRequired<NodeOptions, 'tandem'>;

class PhetMenu extends Node {
  private focusOnHideNode: Node | null;
  private readonly showPopup: PopupToggler;
  private readonly hidePopup: PopupToggler;

  // whether the PhetMenu is showing
  private isShowing = false;

  // The items that will actually be shown in this runtime
  public readonly items: MenuItem[];

  private readonly disposePhetMenu: () => void;

  public constructor( sim: Sim, providedOptions?: PhetMenuOptions ) {

    // Only show certain features for PhET Sims, such as links to our website
    const isPhETBrand = phet.chipper.brand === 'phet';
    const isApp = phet.chipper.isApp;

    const options = optionize<PhetMenuOptions, SelfOptions, NodeOptions>()( {

      showPopup: gracefulBind( 'phet.joist.sim.showPopup' ) as unknown as PopupToggler,
      hidePopup: gracefulBind( 'phet.joist.sim.hidePopup' ) as unknown as PopupToggler,

      phetioType: PhetMenu.PhetMenuIO,
      phetioState: false,
      phetioDocumentation: 'This menu is displayed when the PhET button is pressed.',

      visiblePropertyOptions: {
        phetioReadOnly: true
      },

      // pdom, tagname and role for content in the menu
      tagName: 'ul',
      ariaRole: 'menu'
    }, providedOptions );

    assert && assert( typeof options.showPopup === 'function', 'showPopup is required, and must be provided if phet.joist.sim is not available.' );
    assert && assert( typeof options.hidePopup === 'function', 'hidePopup is required, and must be provided if phet.joist.sim is not available.' );

    super();

    // (a11y) {Node|null} see setFocusOnHideNode
    this.focusOnHideNode = null;
    this.showPopup = options.showPopup;
    this.hidePopup = options.hidePopup;

    // AboutDialog is created lazily (so that Sim bounds are valid), then reused.
    // Since AboutDialog is instrumented for PhET-iO, this lazy creation requires use of PhetioCapsule.
    const aboutDialogCapsule = new PhetioCapsule( tandem => {
      return new AboutDialog( sim.simNameProperty.value, sim.version, sim.credits, sim.locale, {
        tandem: tandem,
        focusOnHideNode: this.focusOnHideNode
      } );
    }, [], {
      tandem: options.tandem.createTandem( 'aboutDialogCapsule' ),
      phetioType: PhetioCapsule.PhetioCapsuleIO( Dialog.DialogIO )
    } );

    // If content was provided, OptionsDialog is created lazily (so that Sim bounds are valid), then reused.
    // Since OptionsDialog is instrumented for PhET-iO, this lazy creation requires use of PhetioCapsule.
    let optionsDialogCapsule: PhetioCapsule<OptionsDialog> | null = null;
    if ( sim.createOptionsDialogContent ) {
      optionsDialogCapsule = new PhetioCapsule( tandem => {
        return new OptionsDialog( sim.createOptionsDialogContent!, {
          tandem: tandem,
          focusOnHideNode: this.focusOnHideNode
        } );
      }, [], {
        tandem: options.tandem.createTandem( 'optionsDialogCapsule' ),
        phetioType: PhetioCapsule.PhetioCapsuleIO( Dialog.DialogIO )
      } );
    }

    const restoreFocusCallback = () => this.restoreFocus();

    // Update dialog is created lazily (so that Sim bounds are valid), then reused.
    let updateDialog: UpdateDialog | null = null;

    /*
     * Description of the items in the menu. See Menu Item for a list of properties for each itemDescriptor
     */
    const itemDescriptors: MenuItemDescriptor[] = [
      {
        text: menuItemOptionsString,
        present: !!sim.createOptionsDialogContent,
        callback: () => optionsDialogCapsule!.getElement().show(),
        options: {
          tandem: options.tandem.createTandem( 'optionsMenuItem' ),
          visiblePropertyOptions: { phetioFeatured: true },
          phetioDocumentation: 'This menu item shows an options dialog.'
        }
      },
      {
        text: menuItemPhetWebsiteString,
        present: isPhETBrand,
        callback: () => {
          if ( !phet.chipper.isFuzzEnabled() ) {

            // Open locale-specific PhET home page. If there is no website translation for locale, fallback will be handled by server. See joist#97.
            openPopup( `https://phet.colorado.edu/${sim.locale}` );
          }
        },
        options: {
          handleFocusCallback: restoreFocusCallback
        }
      },
      {
        text: menuItemReportAProblemString,
        present: isPhETBrand && !isApp,
        callback: () => {
          if ( !phet.chipper.isFuzzEnabled() ) {
            const url = `${'https://phet.colorado.edu/files/troubleshooting/' +
                           '?sim='}${encodeURIComponent( sim.simNameProperty.value )
            }&version=${encodeURIComponent( `${sim.version} ${
              phet.chipper.buildTimestamp ? phet.chipper.buildTimestamp : '(unbuilt)'}` )
            }&url=${encodeURIComponent( window.location.href )
            }&dependencies=${encodeURIComponent( JSON.stringify( {} ) )}`;
            openPopup( url );
          }
        },
        options: {
          handleFocusCallback: restoreFocusCallback
        }
      },
      {
        text: 'QR code',
        present: phet.chipper.queryParameters.qrCode,
        callback: () => {
          if ( !phet.chipper.isFuzzEnabled() ) {
            openPopup( `http://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent( window.location.href )}&size=220x220&margin=0` );
          }
        },
        options: {
          handleFocusCallback: restoreFocusCallback
        }
      },
      {
        text: menuItemGetUpdateString,
        present: updateCheck.areUpdatesChecked,
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
        text: menuItemScreenshotString,
        present: !isApp, // Not supported by IE9, see https://github.com/phetsims/joist/issues/212
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

              // @ts-ignore when typescript knows anything about window. . ..
              window.saveAs( blob, filename );
            }
          }
          else if ( !phet.chipper.isFuzzEnabled() ) {
            openPopup( dataURL );
          }
        },
        options: {
          tandem: options.tandem.createTandem( 'screenshotMenuItem' ),
          phetioDocumentation: 'This menu item captures a screenshot from the simulation and saves it to the file system.',
          visiblePropertyOptions: { phetioFeatured: true },

          // pdom
          handleFocusCallback: restoreFocusCallback
        }
      },

      // "Extra Sound" menu item
      {
        text: menuItemExtraSoundString,

        // if the sim has a PreferencesConfiguration the control for extra sounds will be in the Dialog
        present: audioManager.supportsExtraSound && !sim.preferencesManager,
        callback: () => {
          soundManager.extraSoundEnabledProperty.set( !soundManager.extraSoundEnabledProperty.get() );
        },
        options: {
          checkedProperty: soundManager.extraSoundEnabledProperty,
          tandem: options.tandem.createTandem( 'extraSoundMenuItem' ),
          phetioDocumentation: 'This menu item toggles between basic and extra sound modes. This will only be ' +
                               'displayed if the simulation supports extra sounds.',
          visiblePropertyOptions: { phetioFeatured: true },

          // pdom
          handleFocusCallback: restoreFocusCallback
        }
      },

      // "Full Screen" menu item
      {
        text: menuItemFullscreenString,
        present: FullScreen.isFullScreenEnabled() && !isApp && !platform.mobileSafari && !phet.chipper.queryParameters.preventFullScreen,
        callback: () => {
          if ( !phet.chipper.isFuzzEnabled() ) {
            FullScreen.toggleFullScreen( sim.display );
          }
        },
        options: {
          checkedProperty: FullScreen.isFullScreenProperty,
          tandem: options.tandem.createTandem( 'fullScreenMenuItem' ),
          phetioDocumentation: 'This menu item requests full-screen access for the simulation display.',
          visiblePropertyOptions: { phetioFeatured: true },

          // pdom
          handleFocusCallback: restoreFocusCallback
        }
      },

      // About dialog button
      {
        text: menuItemAboutString,
        present: true,
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

    const keepItemDescriptors = _.filter( itemDescriptors, itemDescriptor => {
      if ( assert ) {
        const descriptorKeys = Object.keys( itemDescriptor );
        assert && assert( descriptorKeys.length === _.intersection( descriptorKeys, allowedItemDescriptorKeys ).length,
          `unexpected key provided in itemDescriptor; one of: ${descriptorKeys}` );
      }

      // If there is a tandem, then we need to create the MenuItem to have a consistent API.
      return itemDescriptor.present || ( itemDescriptor.options && itemDescriptor.options.tandem );
    } );

    // Menu items have uniform size, so compute the max text dimensions.  These are only used for sizing and thus don't
    // need to be PhET-iO instrumented.
    const textNodes = _.map( keepItemDescriptors, ( item: MenuItemDescriptor ) => {
      return new Text( item.present ? item.text : ' ', { // don't count items that will just be ignored.
        font: new PhetFont( FONT_SIZE ),
        maxWidth: MAX_ITEM_WIDTH
      } );
    } ) as unknown as Text[];

    const maxTextWidth = _.maxBy( textNodes, ( node: Node ) => node.width )!.width;
    const maxTextHeight = _.maxBy( textNodes, ( node: Node ) => node.height )!.height;

    // Create the menu items.
    const unfilteredItems = _.map( keepItemDescriptors, ( itemDescriptor: MenuItemDescriptor ) => {
        return new MenuItem(
          maxTextWidth,
          maxTextHeight,
          options.closeCallback,
          itemDescriptor.text,
          itemDescriptor.callback,
          itemDescriptor.present,
          itemDescriptor.options
        );
      }
    );
    const items = _.filter( unfilteredItems, ( item: MenuItemDescriptor ) => item.present ) as unknown as MenuItem[];

    // Some items that aren't present were created just to maintain a consistent PhET-iO API across all
    // runtimes, we can ignore those now.
    this.items = items;
    const separatorWidth = _.maxBy( items, ( item: Node ) => item.width )!.width;
    const itemHeight = _.maxBy( items, ( item: Node ) => item.height )!.height;
    const content = new Node();
    let y = 0;
    const ySpacing = 2;
    let separator;
    _.each( items, item => {

      // Don't add a separator for the first item
      if ( item.separatorBefore && items[ 0 ] !== item ) {
        y += ySpacing;
        separator = new HSeparator( separatorWidth, {
          stroke: 'gray',
          y: y
        } );
        content.addChild( separator );
        y = y + separator.height + ySpacing;
      }
      item.top = y;
      content.addChild( item );
      y += itemHeight;
    } );

    // Create a comic-book-style bubble.
    const X_MARGIN = 5;
    const Y_MARGIN = 5;
    const bubble = createBubble( content.width + X_MARGIN + X_MARGIN, content.height + Y_MARGIN + Y_MARGIN );

    this.addChild( bubble );
    this.addChild( content );
    content.left = X_MARGIN;
    content.top = Y_MARGIN;

    // pdom - add the keydown listener, handling arrow, escape, and tab keys
    // When using the arrow keys, we prevent the virtual cursor from moving in VoiceOver
    const keydownListener = {
      keydown: ( event: SceneryEvent ) => {
        const domEvent = event.domEvent;

        const firstItem = this.items[ 0 ];
        const lastItem = this.items[ this.items.length - 1 ];

        const key = KeyboardUtils.getEventCode( domEvent );

        // this attempts to prevents the scren reader's virtual cursor from also moving with the arrow keys
        if ( KeyboardUtils.isArrowKey( domEvent ) ) {
          domEvent!.preventDefault();
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
          options.closeCallback();
          this.restoreFocus();
        }

        event.pointer.reserveForKeyboardDrag();
      }
    };
    this.addInputListener( keydownListener );

    // pdom - if the focus goes to something outside of the PhET menu, close it
    const focusListener = ( focus: Focus | null ) => {
      if ( focus && !_.includes( focus.trail.nodes, this ) ) {
        this.hide();
      }
    };
    FocusManager.pdomFocusProperty.lazyLink( focusListener );

    this.mutate( options );

    this.disposePhetMenu = () => {
      this.removeInputListener( keydownListener );
      FocusManager.pdomFocusProperty.unlink( focusListener );
    };
  }

  public show(): void {
    if ( !this.isShowing ) {

      // make sure that any previously focused elements no longer have focus
      FocusManager.pdomFocus = null;

      this.showPopup( this as unknown as PopupableNode, true );
      this.isShowing = true;
    }
  }

  public hide(): void {
    if ( this.isShowing ) {
      this.isShowing = false;
      this.hidePopup( this as unknown as PopupableNode, true );
    }
  }

  /**
   * (joist-internal)
   */
  public override dispose(): void {
    this.disposePhetMenu();
    _.each( this.items, item => item.dispose() );
    super.dispose();
  }

  /**
   * Sets the Node that receives focus when the menu is closed. If null, focus returns to the element that had focus
   * when the menu was opened.
   */
  public setFocusOnHideNode( node: Node | null ): void {
    this.focusOnHideNode = node;
  }

  /**
   * Restores focus to either focusOnHideNode, or the element that had focus when the menu was opened.
   */
  private restoreFocus(): void {
    const focusNode = this.focusOnHideNode || FocusManager.pdomFocusedNode;
    if ( focusNode ) {
      focusNode.focus();
    }
  }

  public static PhetMenuIO = new IOType( 'PhetMenuIO', {
    valueType: PhetMenu,
    documentation: 'The PhET Menu in the bottom right of the screen'
  } );
}

// Creates a comic-book style bubble.
const createBubble = function( width: number, height: number ): Node {

  const rectangle = new Rectangle( 0, 0, width, height, 8, 8, { fill: 'white', lineWidth: 1, stroke: 'black' } );

  const tail = new Shape();
  tail.moveTo( width - 20, height - 2 );
  tail.lineToRelative( 0, 20 );
  tail.lineToRelative( -20, -20 );
  tail.close();

  const tailOutline = new Shape();
  tailOutline.moveTo( width - 20, height );
  tailOutline.lineToRelative( 0, 20 - 2 );
  tailOutline.lineToRelative( -18, -18 );

  const bubble = new Node();
  bubble.addChild( rectangle );
  bubble.addChild( new Path( tail, { fill: 'white' } ) );
  bubble.addChild( new Path( tailOutline, { stroke: 'black', lineWidth: 1 } ) );

  return bubble;
};


joist.register( 'PhetMenu', PhetMenu );
export default PhetMenu;