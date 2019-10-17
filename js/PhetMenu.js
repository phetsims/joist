// Copyright 2013-2019, University of Colorado Boulder

/**
 * The 'PhET' menu, which appears in the bottom-right of the home screen and the navigation bar, with options like
 * "PhET Website", "Settings", etc.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const AboutDialog = require( 'JOIST/AboutDialog' );
  const AccessibilityUtil = require( 'SCENERY/accessibility/AccessibilityUtil' );
  const Brand = require( 'BRAND/Brand' );
  const DerivedProperty = require( 'AXON/DerivedProperty' );
  const Display = require( 'SCENERY/display/Display' );
  const FullScreen = require( 'SCENERY/util/FullScreen' );
  const inherit = require( 'PHET_CORE/inherit' );
  const joist = require( 'JOIST/joist' );
  const KeyboardUtil = require( 'SCENERY/accessibility/KeyboardUtil' );
  const MenuItem = require( 'SUN/MenuItem' );
  const merge = require( 'PHET_CORE/merge' );
  const Node = require( 'SCENERY/nodes/Node' );
  const openPopup = require( 'PHET_CORE/openPopup' );
  const OptionsDialog = require( 'JOIST/OptionsDialog' );
  const Path = require( 'SCENERY/nodes/Path' );
  const PhetFont = require( 'SCENERY_PHET/PhetFont' );
  const PhetMenuIO = require( 'JOIST/PhetMenuIO' );
  const platform = require( 'PHET_CORE/platform' );
  const Rectangle = require( 'SCENERY/nodes/Rectangle' );
  const ScreenshotGenerator = require( 'JOIST/ScreenshotGenerator' );
  const Shape = require( 'KITE/Shape' );
  const soundManager = require( 'TAMBO/soundManager' );
  const StringUtils = require( 'PHETCOMMON/util/StringUtils' );
  const Tandem = require( 'TANDEM/Tandem' );
  const Text = require( 'SCENERY/nodes/Text' );
  const updateCheck = require( 'JOIST/updateCheck' );
  const UpdateDialog = require( 'JOIST/UpdateDialog' );
  const UpdateState = require( 'JOIST/UpdateState' );

  // strings
  const menuItemAboutString = require( 'string!JOIST/menuItem.about' );
  const menuItemEnhancedSoundString = require( 'string!JOIST/menuItem.enhancedSound' );
  const menuItemFullscreenString = require( 'string!JOIST/menuItem.fullscreen' );
  const menuItemGetUpdateString = require( 'string!JOIST/menuItem.getUpdate' );
  const menuItemMailInputEventsLogString = require( 'string!JOIST/menuItem.mailInputEventsLog' );
  const menuItemOptionsString = require( 'string!JOIST/menuItem.options' );
  const menuItemOutputInputEventsLogString = require( 'string!JOIST/menuItem.outputInputEventsLog' );
  const menuItemPhetWebsiteString = require( 'string!JOIST/menuItem.phetWebsite' );
  const menuItemReportAProblemString = require( 'string!JOIST/menuItem.reportAProblem' );
  const menuItemScreenshotString = require( 'string!JOIST/menuItem.screenshot' );
  const menuItemSubmitInputEventsLogString = require( 'string!JOIST/menuItem.submitInputEventsLog' );

  // constants
  const FONT_SIZE = 18;
  const MAX_ITEM_WIDTH = 400;

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
    const isPhETBrand = Brand.id === 'phet';
    const isPhetApp = Brand.isPhetApp;

    options = merge( {

      // For sims that have save/load enabled, show menu items for those.
      showSaveAndLoad: false,

      phetioType: PhetMenuIO,
      phetioState: false,
      phetioDocumentation: 'This menu is displayed when the PhET button is pressed.',

      // a11y, tagname and role for content in the menu
      tagName: 'ul',
      ariaRole: 'menu'
    }, options );

    options.tandem = tandem;

    const self = this;
    Node.call( this );

    // Dialogs that could be constructed by the menu. The menu will create a dialog the
    // first time the item is selected, and they will be reused after that.  Must
    // be created lazily because Dialog requires Sim to have bounds during construction
    let aboutDialog = null;
    let optionsDialog = null;
    let updateDialog = null;

    /*
     * Description of the items in the menu. See Menu Item for a list of properties for each itemDescriptor
     */
    const itemDescriptors = [
      {
        text: menuItemOptionsString,
        present: !!sim.options.createOptionsDialogContent,
        callback: function() {
          if ( !optionsDialog ) {
            optionsDialog = new OptionsDialog( sim.options.createOptionsDialogContent, {

              // TODO: Support instrumented element that is dynamic/lazily created, see https://github.com/phetsims/phet-io/issues/1454
              // tandem: tandem.createTandem( 'optionsDialog' )
              tandem: Tandem.optional
            } );
          }
          optionsDialog.show();
        },
        tandem: tandem.createTandem( 'optionsMenuItem' ),
        phetioDocumentation: 'This menu item shows an options dialog.',
        phetioState: false,

        // a11y
        tagName: 'button',
        focusAfterCallback: true
      },
      {
        text: menuItemPhetWebsiteString,
        present: isPhETBrand,
        callback: function() {
          if ( !fuzzes ) {
            // Open locale-specific PhET home page. If there is no website translation for locale, fallback will be handled by server. See joist#97.
            openPopup( 'http://phet.colorado.edu/' + sim.locale );
          }
        },

        // a11y
        tagName: 'button'
      },
      {
        text: menuItemOutputInputEventsLogString,
        present: !!sim.options.recordInputEventLog,
        callback: function() {
          // prints the recorded input event log to the console
          console.log( sim.getRecordedInputEventLogString() );
        },
        tagName: 'button'
      },
      {
        text: menuItemSubmitInputEventsLogString,
        present: !!sim.options.recordInputEventLog,
        callback: function() {
          // submits a recorded event log to the same-origin server (run scenery/tests/event-logs/server/server.js with Node, from the same directory)
          sim.submitEventLog();
        },
        tagName: 'button'
      },
      {
        text: menuItemMailInputEventsLogString,
        present: !!sim.options.recordInputEventLog,
        callback: function() {
          // mailto: link including the body to email
          sim.mailEventLog();
        },
        tagName: 'button'
      },
      {
        text: menuItemReportAProblemString,
        present: isPhETBrand && !isPhetApp,
        callback: function() {
          const url = 'http://phet.colorado.edu/files/troubleshooting/' +
                    '?sim=' + encodeURIComponent( sim.name ) +
                    '&version=' + encodeURIComponent( sim.version + ' ' +
                    ( phet.chipper.buildTimestamp ? phet.chipper.buildTimestamp : '(require.js)' ) ) +
                    '&url=' + encodeURIComponent( window.location.href ) +
                    '&dependencies=' + encodeURIComponent( JSON.stringify( {} ) );

          if ( !fuzzes ) {
            openPopup( url );
          }
        },
        tagName: 'button'
      },
      {
        text: 'QR code',
        present: phet.chipper.queryParameters.qrCode,
        callback: function() {
          if ( !fuzzes ) {
            openPopup( 'http://api.qrserver.com/v1/create-qr-code/?data=' + encodeURIComponent( window.location.href ) + '&size=220x220&margin=0' );
          }
        },

        // a11y
        tagName: 'button'
      },
      {
        text: menuItemGetUpdateString,
        present: updateCheck.areUpdatesChecked,
        textFill: new DerivedProperty( [ updateCheck.stateProperty ], function( state ) {
          return state === UpdateState.OUT_OF_DATE ? '#0a0' : '#000';
        } ),
        callback: function() {
          if ( !updateDialog ) {
            updateDialog = new UpdateDialog( phetButton );
          }
          updateDialog.show();
        },

        // a11y
        tagName: 'button',
        focusAfterCallback: true
      },

      // "Screenshot" Menu item
      {
        text: menuItemScreenshotString,
        present: !platform.ie9 && !isPhetApp, // Not supported by IE9, see https://github.com/phetsims/joist/issues/212
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
            const filename = StringUtils.stripEmbeddingMarks( sim.name ) + ' screenshot.png';

            if ( !fuzzes ) {
              window.saveAs( blob, filename );
            }
          }
          else if ( !fuzzes ) {
            openPopup( dataURL );
          }
        },
        tandem: tandem.createTandem( 'screenshotMenuItem' ),
        phetioDocumentation: 'This menu item captures a screenshot from the simulation and saves it to the file system.',
        phetioState: false,
        phetioComponentOptions: {
          phetioState: false,
          visibleProperty: {
            phetioFeatured: true
          }
        },
        tagName: 'button'
      },

      // "Enhanced Sound" menu item
      {
        text: menuItemEnhancedSoundString,
        present: sim.supportsEnhancedSound,
        checkedProperty: soundManager.enhancedSoundEnabledProperty,
        callback: function() {
          soundManager.enhancedSoundEnabledProperty.set( !soundManager.enhancedSoundEnabledProperty.get() );
        },
        // TODO: Support instrumented element that is dynamic/lazily created, see https://github.com/phetsims/phet-io/issues/1454
        // tandem: tandem.createTandem( 'enhancedSoundMenuItem' ),
        phetioDocumentation: 'This menu item toggles between basic and enhanced sound modes.',
        phetioState: false,
        tagName: 'button'
      },

      // "Full Screen" menu item
      {
        text: menuItemFullscreenString,
        present: FullScreen.isFullScreenEnabled() && !isPhetApp && !fuzzes && !platform.mobileSafari,
        checkedProperty: FullScreen.isFullScreenProperty,
        callback: function() {
          FullScreen.toggleFullScreen( sim.display );
        },
        // TODO: Support instrumented element that is dynamic/lazily created, see https://github.com/phetsims/phet-io/issues/1454
        // tandem: tandem.createTandem( 'fullScreenMenuItem' ),
        phetioDocumentation: 'This menu item requests full-screen access for the simulation display.',
        phetioState: false,
        phetioComponentOptions: {
          phetioState: false,
          visibleProperty: {
            phetioFeatured: true
          }
        },

        // a11y
        tagName: 'button'
      },

      // About dialog button
      {
        text: menuItemAboutString,
        present: true,
        separatorBefore: isPhETBrand,
        callback: function() {
          if ( !aboutDialog ) {
            aboutDialog = new AboutDialog( sim.name, sim.version, sim.credits, Brand, sim.locale, phetButton );
          }
          aboutDialog.show();
        },
        tandem: tandem.createTandem( 'aboutMenuItem' ),
        phetioDocumentation: 'This menu item shows a dialog with information about the simulation.',
        tagName: 'button',
        focusAfterCallback: true,
        phetioComponentOptions: {
          phetioState: false,
          visibleProperty: {
            phetioFeatured: true
          },
          pickableProperty: {
            phetioFeatured: true
          }
        }
      }
    ];

    // Menu items have uniform size, so compute the max text dimensions.  These are only used for sizing and thus don't
    // need to be tandemized.
    const keepItemDescriptors = _.filter( itemDescriptors, function( itemDescriptor ) {return itemDescriptor.present;} );
    const textNodes = _.map( keepItemDescriptors, function( item ) {
      return new Text( item.text, {
        font: new PhetFont( FONT_SIZE ),
        maxWidth: MAX_ITEM_WIDTH
      } );
    } );
    const maxTextWidth = _.maxBy( textNodes, function( node ) {return node.width;} ).width;
    const maxTextHeight = _.maxBy( textNodes, function( node ) {return node.height;} ).height;

    // Create the menu items.
    const items = this.items = _.map( keepItemDescriptors, function( itemDescriptor ) {

        const menuItemOptions = {
          textFill: itemDescriptor.textFill,
          checkedProperty: itemDescriptor.checkedProperty,
          separatorBefore: itemDescriptor.separatorBefore,
          tagName: itemDescriptor.tagName,
          focusAfterCallback: itemDescriptor.focusAfterCallback,
          tandem: itemDescriptor.tandem,
          phetioDocumentation: itemDescriptor.phetioDocumentation || '',
          phetioReadOnly: itemDescriptor.phetioReadOnly,
          phetioComponentOptions: itemDescriptor.phetioComponentOptions || {},
          phetioState: itemDescriptor.phetioState
        };

        // delete undefined values so that merge options will work correctly
        menuItemOptions.phetioReadOnly === undefined && delete menuItemOptions.phetioReadOnly;
        menuItemOptions.phetioState === undefined && delete menuItemOptions.phetioState;

        // This is needed to support MenuItem as tandemOptional because `{ tandem: undefined}` in options will override default.
        !itemDescriptor.tandem && delete menuItemOptions.tandem;

        return new MenuItem(
          maxTextWidth,
          maxTextHeight,
          options.closeCallback,
          itemDescriptor.text,
          itemDescriptor.callback,
          menuItemOptions
        );
      }
    );

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

    // a11y - add the keydown listener, handling arrow, escape, and tab keys
    // When using the arrow keys, we prevent the virtual cursor from moving in VoiceOver
    const keydownListener = {
      keydown: function( event ) {
        const domEvent = event.domEvent;

        const firstItem = self.items[ 0 ];
        const lastItem = self.items[ self.items.length - 1 ];

        // this attempts to prevents the scren reader's virtual cursor from also moving with the arrow keys
        if ( KeyboardUtil.isArrowKey( domEvent.keyCode ) ) {
          domEvent.preventDefault();
        }

        if ( domEvent.keyCode === KeyboardUtil.KEY_DOWN_ARROW ) {

          // On down arrow, focus next item in the list, or wrap up to the first item if focus is at the end
          const nextFocusable = lastItem.focused ? firstItem : AccessibilityUtil.getNextFocusable();
          nextFocusable.focus();
        }
        else if ( domEvent.keyCode === KeyboardUtil.KEY_UP_ARROW ) {

          // On up arow, focus previous item in the list, or wrap back to the last item if focus is on first item
          const previousFocusable = firstItem.focused ? lastItem : AccessibilityUtil.getPreviousFocusable();
          previousFocusable.focus();
        }
        else if ( domEvent.keyCode === KeyboardUtil.KEY_ESCAPE ) {

          // On escape, close the menu and focus the PhET button
          options.closeCallback();
          phetButton.focus();
        }
        else if ( domEvent.keyCode === KeyboardUtil.KEY_TAB ) {

          // close the menu whenever the user tabs out of it
          options.closeCallback();

          // send focus back to the phet button - the browser should then focus the next/previous focusable
          // element with default 'tab' behavior
          phetButton.focus();
        }
      }
    };
    this.addInputListener( keydownListener );

    // a11y - if the focus goes to something outside of the PhET menu, close it
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

  return PhetMenu;
} );