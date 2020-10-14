// Copyright 2013-2020, University of Colorado Boulder

/**
 * The 'PhET' menu, which appears in the bottom-right of the home screen and the navigation bar, with options like
 * "PhET Website", "Settings", etc.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import DerivedProperty from '../../axon/js/DerivedProperty.js';
import Shape from '../../kite/js/Shape.js';
import merge from '../../phet-core/js/merge.js';
import openPopup from '../../phet-core/js/openPopup.js';
import platform from '../../phet-core/js/platform.js';
import stripEmbeddingMarks from '../../phet-core/js/stripEmbeddingMarks.js';
import PhetFont from '../../scenery-phet/js/PhetFont.js';
import KeyboardUtils from '../../scenery/js/accessibility/KeyboardUtils.js';
import PDOMUtils from '../../scenery/js/accessibility/pdom/PDOMUtils.js';
import Display from '../../scenery/js/display/Display.js';
import Node from '../../scenery/js/nodes/Node.js';
import Path from '../../scenery/js/nodes/Path.js';
import Rectangle from '../../scenery/js/nodes/Rectangle.js';
import Text from '../../scenery/js/nodes/Text.js';
import FullScreen from '../../scenery/js/util/FullScreen.js';
import Dialog from '../../sun/js/Dialog.js';
import MenuItem from '../../sun/js/MenuItem.js';
import soundManager from '../../tambo/js/soundManager.js';
import PhetioCapsule from '../../tandem/js/PhetioCapsule.js';
import IOType from '../../tandem/js/types/IOType.js';
import AboutDialog from './AboutDialog.js';
import joist from './joist.js';
import joistStrings from './joistStrings.js';
import OptionsDialog from './OptionsDialog.js';
import ScreenshotGenerator from './ScreenshotGenerator.js';
import updateCheck from './updateCheck.js';
import UpdateDialog from './UpdateDialog.js';
import UpdateState from './UpdateState.js';

const menuItemAboutString = joistStrings.menuItem.about;
const menuItemEnhancedSoundString = joistStrings.menuItem.enhancedSound;
const menuItemFullscreenString = joistStrings.menuItem.fullscreen;
const menuItemGetUpdateString = joistStrings.menuItem.getUpdate;
const menuItemMailInputEventsLogString = joistStrings.menuItem.mailInputEventsLog;
const menuItemOptionsString = joistStrings.menuItem.options;
const menuItemOutputInputEventsLogString = joistStrings.menuItem.outputInputEventsLog;
const menuItemPhetWebsiteString = joistStrings.menuItem.phetWebsite;
const menuItemReportAProblemString = joistStrings.menuItem.reportAProblem;
const menuItemScreenshotString = joistStrings.menuItem.screenshot;
const menuItemSubmitInputEventsLogString = joistStrings.menuItem.submitInputEventsLog;

// constants
const FONT_SIZE = 18;
const MAX_ITEM_WIDTH = 400;

// the supported keys allowed in each itemDescriptor for a MenuItem
const allowedItemDescriptorKeys = [ 'text', 'callback', 'present', 'options' ];

// For disabling features that are incompatible with fuzzing
const fuzzes = phet.chipper.queryParameters.fuzz ||
               phet.chipper.queryParameters.fuzzMouse ||
               phet.chipper.queryParameters.fuzzTouch ||
               phet.chipper.queryParameters.fuzzBoard;

class PhetMenu extends Node {

  /**
   * @param {Sim} sim
   * @param {Tandem} tandem
   * @param {Object} [options]
   */
  constructor( sim, tandem, options ) {

    // Only show certain features for PhET Sims, such as links to our website
    const isPhETBrand = phet.chipper.brand === 'phet';
    const isApp = phet.chipper.isApp;

    options = merge( {

      phetioType: PhetMenu.PhetMenuIO,
      phetioState: false,
      phetioDocumentation: 'This menu is displayed when the PhET button is pressed.',

      visiblePropertyOptions: {
        phetioReadOnly: true
      },

      // pdom, tagname and role for content in the menu
      tagName: 'ul',
      ariaRole: 'menu'
    }, options );

    options.tandem = tandem;

    super();

    // @private (a11y) {Node|null} see setFocusOnCloseNode
    this.focusOnCloseNode = null;

    // AboutDialog is created lazily (so that Sim bounds are valid), then reused.
    // Since AboutDialog is instrumented for PhET-iO, this lazy creation requires use of PhetioCapsule.
    const aboutDialogCapsule = new PhetioCapsule( tandem => {
      const aboutDialog = new AboutDialog( sim.simNameProperty.value, sim.version, sim.credits, sim.locale, tandem );
      aboutDialog.setFocusOnCloseNode( this.focusOnCloseNode );
      return aboutDialog;
    }, [], {
      tandem: tandem.createTandem( 'aboutDialogCapsule' ),
      phetioType: PhetioCapsule.PhetioCapsuleIO( Dialog.DialogIO )
    } );

    // If content was provided, OptionsDialog is created lazily (so that Sim bounds are valid), then reused.
    // Since OptionsDialog is instrumented for PhET-iO, this lazy creation requires use of PhetioCapsule.
    let optionsDialogCapsule = null;
    if ( sim.options.createOptionsDialogContent ) {
      optionsDialogCapsule = new PhetioCapsule( tandem => {
        const optionsDialog = new OptionsDialog( sim.options.createOptionsDialogContent, {
          tandem: tandem
        } );
        optionsDialog.setFocusOnCloseNode( this.focusOnCloseNode );
        return optionsDialog;
      }, [], {
        tandem: tandem.createTandem( 'optionsDialogCapsule' ),
        phetioType: PhetioCapsule.PhetioCapsuleIO( Dialog.DialogIO )
      } );
    }

    // Update dialog is created lazily (so that Sim bounds are valid), then reused.
    let updateDialog = null;

    /*
     * Description of the items in the menu. See Menu Item for a list of properties for each itemDescriptor
     */
    const itemDescriptors = [
      {
        text: menuItemOptionsString,
        present: !!sim.options.createOptionsDialogContent,
        callback: () => optionsDialogCapsule.getElement().show(),
        options: {
          tandem: tandem.createTandem( 'optionsMenuItem' ),
          phetioComponentOptions: {
            visibleProperty: {
              phetioFeatured: true
            }
          },
          phetioDocumentation: 'This menu item shows an options dialog.'
        }
      },
      {
        text: menuItemPhetWebsiteString,
        present: isPhETBrand,
        callback: () => {
          if ( !fuzzes ) {
            // Open locale-specific PhET home page. If there is no website translation for locale, fallback will be handled by server. See joist#97.
            openPopup( 'http://phet.colorado.edu/' + sim.locale );
          }
        }
      },
      {
        text: menuItemOutputInputEventsLogString,
        present: !!sim.options.recordInputEventLog,
        callback: () => {
          // prints the recorded input event log to the console
          console.log( sim.getRecordedInputEventLogString() );
        }
      },
      {
        text: menuItemSubmitInputEventsLogString,
        present: !!sim.options.recordInputEventLog,
        callback: () => {
          // submits a recorded event log to the same-origin server (run scenery/tests/event-logs/server/server.js with Node, from the same directory)
          sim.submitEventLog();
        }
      },
      {
        text: menuItemMailInputEventsLogString,
        present: !!sim.options.recordInputEventLog,
        callback: () => {
          // mailto: link including the body to email
          sim.mailEventLog();
        }
      },
      {
        text: menuItemReportAProblemString,
        present: isPhETBrand && !isApp,
        callback: () => {
          const url = 'http://phet.colorado.edu/files/troubleshooting/' +
                      '?sim=' + encodeURIComponent( sim.simNameProperty.value ) +
                      '&version=' + encodeURIComponent( sim.version + ' ' +
                      ( phet.chipper.buildTimestamp ? phet.chipper.buildTimestamp : '(unbuilt)' ) ) +
                      '&url=' + encodeURIComponent( window.location.href ) +
                      '&dependencies=' + encodeURIComponent( JSON.stringify( {} ) );

          if ( !fuzzes ) {
            openPopup( url );
          }
        }
      },
      {
        text: 'QR code',
        present: phet.chipper.queryParameters.qrCode,
        callback: () => {
          if ( !fuzzes ) {
            openPopup( 'http://api.qrserver.com/v1/create-qr-code/?data=' + encodeURIComponent( window.location.href ) + '&size=220x220&margin=0' );
          }
        }
      },
      {
        text: menuItemGetUpdateString,
        present: updateCheck.areUpdatesChecked,
        callback: () => {
          if ( !updateDialog ) {
            updateDialog = new UpdateDialog( this.focusOnCloseNode );
            updateDialog.setFocusOnCloseNode( this.focusOnCloseNode );
          }
          updateDialog.show();
        },
        options: {
          textFill: new DerivedProperty( [ updateCheck.stateProperty ], function( state ) {
            return state === UpdateState.OUT_OF_DATE ? '#0a0' : '#000';
          } )
        }
      },

      // "Screenshot" Menu item
      {
        text: menuItemScreenshotString,
        present: !platform.ie9 && !isApp, // Not supported by IE9, see https://github.com/phetsims/joist/issues/212
        callback: () => {
          const dataURL = ScreenshotGenerator.generateScreenshot( sim );

          // if we have FileSaver support
          if ( window.Blob && !!new window.Blob() ) {
            // construct a blob out of it
            const requiredPrefix = 'data:image/png;base64,';
            assert && assert( dataURL.slice( 0, requiredPrefix.length ) === requiredPrefix );
            const dataBase64 = dataURL.slice( requiredPrefix.length );
            const byteChars = window.atob( dataBase64 );
            const byteArray = new window.Uint8Array( byteChars.length );
            for ( let i = 0; i < byteArray.length; i++ ) {
              byteArray[ i ] = byteChars.charCodeAt( i ); // need check to make sure this cast doesn't give problems?
            }

            const blob = new window.Blob( [ byteArray ], { type: 'image/png' } );

            // our preferred filename
            const filename = stripEmbeddingMarks( sim.simNameProperty.value ) + ' screenshot.png';

            if ( !fuzzes ) {
              window.saveAs( blob, filename );
            }
          }
          else if ( !fuzzes ) {
            openPopup( dataURL );
          }
        },
        options: {
          tandem: tandem.createTandem( 'screenshotMenuItem' ),
          phetioDocumentation: 'This menu item captures a screenshot from the simulation and saves it to the file system.',
          phetioComponentOptions: {
            visibleProperty: {
              phetioFeatured: true
            }
          },

          // pdom
          handleFocusCallback: () => {
            this.restoreFocus();
          }
        }
      },

      // "Enhanced Sound" menu item
      {
        text: menuItemEnhancedSoundString,
        present: sim.supportsEnhancedSound,
        callback: () => {
          soundManager.enhancedSoundEnabledProperty.set( !soundManager.enhancedSoundEnabledProperty.get() );
        },
        options: {
          checkedProperty: soundManager.enhancedSoundEnabledProperty,
          tandem: tandem.createTandem( 'enhancedSoundMenuItem' ),
          phetioDocumentation: 'This menu item toggles between basic and enhanced sound modes. This will only be ' +
                               'displayed if the simulation supports enhanced sounds.',
          phetioComponentOptions: {
            visibleProperty: {
              phetioFeatured: true
            }
          },

          // pdom
          handleFocusCallback: () => this.restoreFocus()
        }
      },

      // "Full Screen" menu item
      {
        text: menuItemFullscreenString,
        present: FullScreen.isFullScreenEnabled() && !isApp && !fuzzes && !platform.mobileSafari,
        callback: () => {
          FullScreen.toggleFullScreen( sim.display );
        },
        options: {
          checkedProperty: FullScreen.isFullScreenProperty,
          tandem: tandem.createTandem( 'fullScreenMenuItem' ),
          phetioDocumentation: 'This menu item requests full-screen access for the simulation display.',
          phetioComponentOptions: {
            visibleProperty: {
              phetioFeatured: true
            }
          },

          // pdom
          handleFocusCallback: () => this.restoreFocus()
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
          tandem: tandem.createTandem( 'aboutMenuItem' ),
          phetioDocumentation: 'This menu item shows a dialog with information about the simulation.',
          phetioComponentOptions: {
            visibleProperty: {
              phetioFeatured: true
            }
          }
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
    const textNodes = _.map( keepItemDescriptors, item => {
      return new Text( item.present ? item.text : ' ', { // don't count items that will just be ignored.
        font: new PhetFont( FONT_SIZE ),
        maxWidth: MAX_ITEM_WIDTH
      } );
    } );
    const maxTextWidth = _.maxBy( textNodes, node => node.width ).width;
    const maxTextHeight = _.maxBy( textNodes, node => node.height ).height;

    // Create the menu items.
    const unfilteredItems = _.map( keepItemDescriptors, itemDescriptor => {
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
    const items = _.filter( unfilteredItems, item => item.present );

    // @private Some items that aren't present were created just to maintain a consistent PhET-iO API across all
    // runtimes, we can ignore those now.
    this.items = items;
    const separatorWidth = _.maxBy( items, item => item.width ).width;
    const itemHeight = _.maxBy( items, item => item.height ).height;
    const content = new Node();
    let y = 0;
    const ySpacing = 2;
    let separator;
    _.each( items, item => {
      // Don't add a separator for the first item
      if ( item.separatorBefore && items[ 0 ] !== item ) {
        y += ySpacing;
        separator = new Path( Shape.lineSegment( 0, y, separatorWidth, y ), { stroke: 'gray', lineWidth: 1 } );
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

    // @private - whether the PhetMenu is showing
    this.isShowing = false;

    // pdom - add the keydown listener, handling arrow, escape, and tab keys
    // When using the arrow keys, we prevent the virtual cursor from moving in VoiceOver
    const keydownListener = {
      keydown: event => {
        const domEvent = event.domEvent;

        const firstItem = this.items[ 0 ];
        const lastItem = this.items[ this.items.length - 1 ];

        // this attempts to prevents the scren reader's virtual cursor from also moving with the arrow keys
        if ( KeyboardUtils.isArrowKey( domEvent.keyCode ) ) {
          domEvent.preventDefault();
        }

        if ( domEvent.keyCode === KeyboardUtils.KEY_DOWN_ARROW ) {

          // On down arrow, focus next item in the list, or wrap up to the first item if focus is at the end
          const nextFocusable = lastItem.focused ? firstItem : PDOMUtils.getNextFocusable();
          nextFocusable.focus();
        }
        else if ( domEvent.keyCode === KeyboardUtils.KEY_UP_ARROW ) {

          // On up arrow, focus previous item in the list, or wrap back to the last item if focus is on first item
          const previousFocusable = firstItem.focused ? lastItem : PDOMUtils.getPreviousFocusable();
          previousFocusable.focus();
        }
        else if ( domEvent.keyCode === KeyboardUtils.KEY_ESCAPE || domEvent.keyCode === KeyboardUtils.KEY_TAB ) {

          // On escape or tab, close the menu and restore focus to the element that had focus before the menu was opened.
          options.closeCallback();
          this.restoreFocus();
        }

        event.pointer.reserveForKeyboardDrag();
      }
    };
    this.addInputListener( keydownListener );

    // pdom - if the focus goes to something outside of the PhET menu, close it
    const focusListener = focus => {
      if ( focus && !_.includes( focus.trail.nodes, this ) ) {
        this.hide();
      }
    };
    Display.focusProperty.lazyLink( focusListener );

    this.mutate( options );

    // @private
    this.disposePhetMenu = () => {
      this.removeInputListener( keydownListener );
      Display.focusProperty.unlink( focusListener );
    };
  }

  // @public
  show() {
    if ( !this.isShowing ) {

      // make sure that any previously focused elements no longer have focus
      Display.focus = null;

      window.phet.joist.sim.showPopup( this, true );
      this.isShowing = true;
    }
  }

  // @public
  hide() {
    if ( this.isShowing ) {
      this.isShowing = false;
      window.phet.joist.sim.hidePopup( this, true );
    }
  }

  /**
   * @public (joist-internal)
   * @override
   */
  dispose() {
    this.disposePhetMenu();
    _.each( this.items, item => item.dispose() );
    super.dispose();
  }

  /**
   * Sets the Node that receives focus when the menu is closed. If null, focus returns to the element that had focus
   * when the menu was opened.
   * @param {Node|null} node
   * @public
   */
  setFocusOnCloseNode( node ) {
    this.focusOnCloseNode = node;
  }

  /**
   * Restores focus to either focusOnCloseNode, or the element that had focus when the menu was opened.
   * @private
   */
  restoreFocus() {
    const focusNode = this.focusOnCloseNode || Display.focusedNode;
    if ( focusNode ) {
      focusNode.focus();
    }
  }
}

// Creates a comic-book style bubble.
const createBubble = function( width, height ) {

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

PhetMenu.PhetMenuIO = new IOType( 'PhetMenuIO', {
  valueType: PhetMenu,
  documentation: 'The PhET Menu in the bottom right of the screen'
} );

joist.register( 'PhetMenu', PhetMenu );
export default PhetMenu;