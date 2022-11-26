// Copyright 2013-2020, University of Colorado Boulder

/**
 * The 'PhET' menu, which appears in the bottom-right of the home screen and the navigation bar, with options like
 * "PhET Website", "Settings", etc.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import DerivedProperty from '../../axon/js/DerivedProperty.js';
import Shape from '../../kite/js/Shape.js';
import inherit from '../../phet-core/js/inherit.js';
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
import DialogIO from '../../sun/js/DialogIO.js';
import MenuItem from '../../sun/js/MenuItem.js';
import soundManager from '../../tambo/js/soundManager.js';
import PhetioCapsule from '../../tandem/js/PhetioCapsule.js';
import PhetioCapsuleIO from '../../tandem/js/PhetioCapsuleIO.js';
import Tandem from '../../tandem/js/Tandem.js';
import AboutDialog from './AboutDialog.js';
import OptionsDialog from './OptionsDialog.js';
import PhetMenuIO from './PhetMenuIO.js';
import ScreenshotGenerator from './ScreenshotGenerator.js';
import UpdateDialog from './UpdateDialog.js';
import UpdateState from './UpdateState.js';
import joist from './joist.js';
import joistStrings from './joistStrings.js';
import updateCheck from './updateCheck.js';

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

/**
 * @param {Sim} sim
 * @param {PhetButton} phetButton - passed directly since sim.navigationBar hasn't yet been assigned
 * @param {Tandem} tandem
 * @param {Object} [options]
 * @constructor
 */
function PhetMenu( sim, phetButton, tandem, options ) {

  // Only show certain features for PhET Sims, such as links to our website
  const isPhETBrand = phet.chipper.brand === 'phet';
  const isApp = phet.chipper.isApp;

  options = merge( {

    phetioType: PhetMenuIO,
    phetioState: false,
    phetioDocumentation: 'This menu is displayed when the PhET button is pressed.',

    visiblePropertyOptions: {
      // TODO: Shouldn't it be read-only instead of uninstrumented? See https://github.com/phetsims/scenery/issues/1046
      tandem: Tandem.OPT_OUT,
      phetioReadOnly: true
    },

    // pdom, tagname and role for content in the menu
    tagName: 'ul',
    ariaRole: 'menu'
  }, options );

  options.tandem = tandem;

  const self = this;
  Node.call( this );

  const aboutDialogCapsule = new PhetioCapsule( tandem => {
    return new AboutDialog( sim.simNameProperty.value, sim.version, sim.credits, sim.locale, phetButton, tandem );
  }, [], {
    tandem: tandem.createTandem( 'aboutDialogCapsule' ),
    phetioType: PhetioCapsuleIO( DialogIO )
  } );

  // only create the singleton if there is options dialog content
  let optionsDialogCapsule = null;
  if ( sim.options.createOptionsDialogContent ) {
    optionsDialogCapsule = new PhetioCapsule( tandem => {
      return new OptionsDialog( sim.options.createOptionsDialogContent, {
        tandem: tandem
      } );
    }, [], {
      tandem: tandem.createTandem( 'optionsDialogCapsule' ),
      phetioType: PhetioCapsuleIO( DialogIO )
    } );
  }

  // Dialogs that could be constructed by the menu. The menu will create a dialog the
  // first time the item is selected, and they will be reused after that.  Must
  // be created lazily because Dialog requires Sim to have bounds during construction
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
      callback: function() {
        if ( !fuzzes ) {
          // Open locale-specific PhET home page. If there is no website translation for locale, fallback will be handled by server. See joist#97.
          openPopup( 'http://phet.colorado.edu/' + sim.locale );
        }
      }
    },
    {
      text: menuItemOutputInputEventsLogString,
      present: !!sim.options.recordInputEventLog,
      callback: function() {
        // prints the recorded input event log to the console
        console.log( sim.getRecordedInputEventLogString() );
      }
    },
    {
      text: menuItemSubmitInputEventsLogString,
      present: !!sim.options.recordInputEventLog,
      callback: function() {
        // submits a recorded event log to the same-origin server (run scenery/tests/event-logs/server/server.js with Node, from the same directory)
        sim.submitEventLog();
      }
    },
    {
      text: menuItemMailInputEventsLogString,
      present: !!sim.options.recordInputEventLog,
      callback: function() {
        // mailto: link including the body to email
        sim.mailEventLog();
      }
    },
    {
      text: menuItemReportAProblemString,
      present: isPhETBrand && !isApp,
      callback: function() {
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
      callback: function() {
        if ( !fuzzes ) {
          openPopup( 'http://api.qrserver.com/v1/create-qr-code/?data=' + encodeURIComponent( window.location.href ) + '&size=220x220&margin=0' );
        }
      }
    },
    {
      text: menuItemGetUpdateString,
      present: updateCheck.areUpdatesChecked,
      callback: function() {
        if ( !updateDialog ) {
          updateDialog = new UpdateDialog( phetButton );
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
      callback: function() {
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
          openPopup( dataURL, true );
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
          phetButton.focus();
        }
      }
    },

    // "Enhanced Sound" menu item
    {
      text: menuItemEnhancedSoundString,
      present: sim.supportsEnhancedSound,
      callback: function() {
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
        handleFocusCallback: () => {
          phetButton.focus();
        }
      }
    },

    // "Full Screen" menu item
    {
      text: menuItemFullscreenString,
      present: FullScreen.isFullScreenEnabled() && !isApp && !fuzzes && !platform.mobileSafari,
      callback: function() {
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
        handleFocusCallback: () => {
          phetButton.focus();
        }
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
  const textNodes = _.map( keepItemDescriptors, function( item ) {
    return new Text( item.present ? item.text : ' ', { // don't count items that will just be ignored.
      font: new PhetFont( FONT_SIZE ),
      maxWidth: MAX_ITEM_WIDTH
    } );
  } );
  const maxTextWidth = _.maxBy( textNodes, function( node ) {return node.width;} ).width;
  const maxTextHeight = _.maxBy( textNodes, function( node ) {return node.height;} ).height;

  // Create the menu items.
  const unfilteredItems = _.map( keepItemDescriptors, function( itemDescriptor ) {
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

  // Some items that aren't present were created just to maintain a consistent PhET-iO API across all runtimes, we
  // can ignore those now.
  this.items = items;
  const separatorWidth = _.maxBy( items, function( item ) {return item.width;} ).width;
  const itemHeight = _.maxBy( items, function( item ) {return item.height;} ).height;
  const content = new Node();
  let y = 0;
  const ySpacing = 2;
  let separator;
  _.each( items, function( item ) {
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
    keydown: function( event ) {
      const domEvent = event.domEvent;

      const firstItem = self.items[ 0 ];
      const lastItem = self.items[ self.items.length - 1 ];

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

        // On up arow, focus previous item in the list, or wrap back to the last item if focus is on first item
        const previousFocusable = firstItem.focused ? lastItem : PDOMUtils.getPreviousFocusable();
        previousFocusable.focus();
      }
      else if ( domEvent.keyCode === KeyboardUtils.KEY_ESCAPE ) {

        // On escape, close the menu and focus the PhET button
        options.closeCallback();
        phetButton.focus();
      }
      else if ( domEvent.keyCode === KeyboardUtils.KEY_TAB ) {

        // close the menu whenever the user tabs out of it
        options.closeCallback();

        // send focus back to the phet button - the browser should then focus the next/previous focusable
        // element with default 'tab' behavior
        phetButton.focus();
      }
    }
  };
  this.addInputListener( keydownListener );

  // pdom - if the focus goes to something outside of the PhET menu, close it
  const focusListener = function( focus ) {
    if ( focus && !_.includes( focus.trail.nodes, self ) ) {
      self.hide();
    }
  };
  Display.focusProperty.lazyLink( focusListener );

  this.mutate( options );

  this.disposePhetMenu = function() {
    self.removeInputListener( keydownListener );
    Display.focusProperty.unlink( focusListener );
  };
}

joist.register( 'PhetMenu', PhetMenu );

inherit( Node, PhetMenu, {

  // @public
  show: function() {
    if ( !this.isShowing ) {

      // make sure that any previously focused elements no longer have focus
      Display.focus = null;

      window.phet.joist.sim.showPopup( this, true );
      this.isShowing = true;
    }
  },

  // @public
  hide: function() {
    if ( this.isShowing ) {
      this.isShowing = false;
      window.phet.joist.sim.hidePopup( this, true );
    }
  },

  // @public (joist-internal)
  dispose: function() {
    this.disposePhetMenu();
    _.each( this.items, function( item ) {
      item.dispose();
    } );
    Node.prototype.dispose.call( this );
  }
} );

export default PhetMenu;