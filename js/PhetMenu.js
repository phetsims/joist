// Copyright 2013-2015, University of Colorado Boulder

/**
 * The 'PhET' menu, which appears in the bottom-right of the home screen and the navigation bar, with options like
 * "PhET Website", "Settings", etc.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var platform = require( 'PHET_CORE/platform' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Shape = require( 'KITE/Shape' );
  var Path = require( 'SCENERY/nodes/Path' );
  var Text = require( 'SCENERY/nodes/Text' );
  var inherit = require( 'PHET_CORE/inherit' );
  var AboutDialog = require( 'JOIST/AboutDialog' );
  var OptionsDialog = require( 'JOIST/OptionsDialog' );
  var UpdateDialog = require( 'JOIST/UpdateDialog' );
  var MenuItem = require( 'SUN/MenuItem' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var FullScreen = require( 'JOIST/FullScreen' );
  var Brand = require( 'BRAND/Brand' );
  var ScreenshotGenerator = require( 'JOIST/ScreenshotGenerator' );
  var UpdateCheck = require( 'JOIST/UpdateCheck' );
  var joist = require( 'JOIST/joist' );
  var StringUtils = require( 'PHETCOMMON/util/StringUtils' );
  var DerivedProperty = require( 'AXON/DerivedProperty' );
  var Input = require( 'SCENERY/input/Input' );
  var Display = require( 'SCENERY/display/Display' );
  var AccessibilityUtil = require( 'SCENERY/accessibility/AccessibilityUtil' );
  var TPhetMenu = require( 'JOIST/TPhetMenu' );

  // strings
  var menuItemOptionsString = require( 'string!JOIST/menuItem.options' );
  var menuItemAboutString = require( 'string!JOIST/menuItem.about' );
  var menuItemMailInputEventsLogString = require( 'string!JOIST/menuItem.mailInputEventsLog' );
  var menuItemOutputInputEventsLogString = require( 'string!JOIST/menuItem.outputInputEventsLog' );
  var menuItemPhetWebsiteString = require( 'string!JOIST/menuItem.phetWebsite' );
  var menuItemReportAProblemString = require( 'string!JOIST/menuItem.reportAProblem' );
  var menuItemScreenshotString = require( 'string!JOIST/menuItem.screenshot' );
  var menuItemFullscreenString = require( 'string!JOIST/menuItem.fullscreen' );
  var menuItemGetUpdateString = require( 'string!JOIST/menuItem.getUpdate' );
  var menuItemSubmitInputEventsLogString = require( 'string!JOIST/menuItem.submitInputEventsLog' );

  // constants
  var FONT_SIZE = 18;
  var MAX_ITEM_WIDTH = 400;

  // For disabling features that are incompatible with fuzzMouse
  var fuzzMouse = phet.chipper.queryParameters.fuzzMouse;

  // Creates a comic-book style bubble.
  var createBubble = function( width, height ) {

    var rectangle = new Rectangle( 0, 0, width, height, 8, 8, { fill: 'white', lineWidth: 1, stroke: 'black' } );

    var tail = new Shape();
    tail.moveTo( width - 20, height - 2 );
    tail.lineToRelative( 0, 20 );
    tail.lineToRelative( -20, -20 );
    tail.close();

    var tailOutline = new Shape();
    tailOutline.moveTo( width - 20, height );
    tailOutline.lineToRelative( 0, 20 - 2 );
    tailOutline.lineToRelative( -18, -18 );

    var bubble = new Node();
    bubble.addChild( rectangle );
    bubble.addChild( new Path( tail, { fill: 'white' } ) );
    bubble.addChild( new Path( tailOutline, { stroke: 'black', lineWidth: 1 } ) );

    return bubble;
  };

  /**
   * @param {Sim} sim
   * @param {Tandem} tandem
   * @param {Object} [options]
   * @constructor
   */
  function PhetMenu( sim, tandem, options ) {

    //Only show certain features for PhET Sims, such as links to our website
    var isPhETBrand = Brand.id === 'phet';
    var isPhetApp = Brand.isPhetApp;

    options = _.extend( {

      //For sims that have save/load enabled, show menu items for those.
      showSaveAndLoad: false

    }, options );

    var self = this;
    Node.call( self );

    // Define optionsDialog outside callbacks to avoid recreating
    var optionsDialog = null;

    /*
     * Description of the items in the menu. See Menu Item for a list of properties for each itemDescriptor
     */
    var itemDescriptors = [
      {
        text: menuItemOptionsString,
        present: !!sim.options.optionsNode,
        callback: function() {

          if ( !optionsDialog ) {
            optionsDialog = new OptionsDialog( sim.options.optionsNode, {
              tandem: tandem.createTandem( 'optionsDialog' )
            } );
          }

          optionsDialog.show();
        },
        tandem: tandem.createTandem( 'optionsMenuItem' ),

        // a11y
        tagName: 'button',
        focusAfterCallback: true
      },
      {
        text: menuItemPhetWebsiteString,
        tandem: tandem.createTandem( 'phetWebsiteMenuItem' ),
        present: isPhETBrand,
        callback: function() {
          if ( !fuzzMouse ) {
            // Open locale-specific PhET home page. If there is no website translation for locale, fallback will be handled by server. See joist#97.
            var phetWindow = window.open( 'http://phet.colorado.edu/' + sim.locale, '_blank' );
            phetWindow.focus();
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
          // Create a smaller version of our dependencies to send, due to the URL length issues.
          // See https://github.com/phetsims/joist/issues/249.
          var dependenciesCopy = phet.chipper.dependencies ? JSON.parse( JSON.stringify( phet.chipper.dependencies ) ) : {};
          delete dependenciesCopy.comment;
          for ( var key in dependenciesCopy ) {
            if ( dependenciesCopy[ key ].sha ) {
              dependenciesCopy[ key ].sha = dependenciesCopy[ key ].sha.substring( 0, 8 );
            }
          }

          var url = 'http://phet.colorado.edu/files/troubleshooting/' +
                    '?sim=' + encodeURIComponent( sim.name ) +
                    '&version=' + encodeURIComponent( sim.version + ' ' +
                    ( phet.chipper.buildTimestamp ? phet.chipper.buildTimestamp : '(require.js)' ) ) +
                    '&url=' + encodeURIComponent( window.location.href ) +
                    '&dependencies=' + encodeURIComponent( JSON.stringify( dependenciesCopy ) );

          if ( !fuzzMouse ) {
            var reportWindow = window.open( url, '_blank' );
            reportWindow.focus();
          }
        },
        tandem: tandem.createTandem( 'reportAProblemMenuItem' ),
        tagName: 'button'
      },
      {
        text: 'QR code',
        present: phet.chipper.queryParameters.qrCode,
        callback: function() {
          if ( !fuzzMouse ) {
            var win = window.open( 'http://api.qrserver.com/v1/create-qr-code/?data=' + encodeURIComponent( window.location.href ) + '&size=220x220&margin=0', '_blank' );
            win.focus();
          }
        },
        tandem: tandem.createTandem( 'qrCodeMenuItem' ),

        // a11y
        tagName: 'button'
      },
      {
        text: menuItemGetUpdateString,
        present: UpdateCheck.areUpdatesChecked,
        textFill: new DerivedProperty( [ UpdateCheck.stateProperty ], function( state ) {
          return state === 'out-of-date' ? '#0a0' : '#000';
        } ),
        callback: function() {
          new UpdateDialog().show();
        },
        tandem: tandem.createTandem( 'getUpdateMenuItem' ),

        // a11y
        tagName: 'button',
        focusAfterCallback: true
      },

      // "Screenshot" Menu item
      {
        text: menuItemScreenshotString,
        present: !platform.ie9 && !isPhetApp, // Not supported by IE9, see https://github.com/phetsims/joist/issues/212
        callback: function() {
          var dataURL = ScreenshotGenerator.generateScreenshot( sim );

          // if we have FileSaver support
          if ( window.Blob && !!new window.Blob() ) {
            // construct a blob out of it
            var requiredPrefix = 'data:image/png;base64,';
            assert && assert( dataURL.slice( 0, requiredPrefix.length ) === requiredPrefix );
            var dataBase64 = dataURL.slice( requiredPrefix.length );
            var byteChars = window.atob( dataBase64 );
            var byteArray = new window.Uint8Array( byteChars.length );
            for ( var i = 0; i < byteArray.length; i++ ) {
              byteArray[ i ] = byteChars.charCodeAt( i ); // need check to make sure this cast doesn't give problems?
            }

            var blob = new window.Blob( [ byteArray ], { type: 'image/png' } );

            // our preferred filename
            var filename = StringUtils.stripEmbeddingMarks( sim.name ) + ' screenshot.png';

            if ( !fuzzMouse ) {
              window.saveAs( blob, filename );
            }
          }
          else if ( !fuzzMouse ) {
            window.open( dataURL, '_blank', '' );
          }
        },
        tandem: tandem.createTandem( 'screenshotMenuItem' ),
        tagName: 'button'
      },
      {
        text: menuItemFullscreenString,
        present: FullScreen.isFullScreenEnabled() && !isPhetApp && !fuzzMouse,
        checkedProperty: FullScreen.isFullScreenProperty,
        callback: function() {
          FullScreen.toggleFullScreen( sim );
        },
        tandem: tandem.createTandem( 'fullScreenMenuItem' ),
        tagName: 'button'
      },

      //About dialog button
      {
        text: menuItemAboutString,
        present: true,
        separatorBefore: isPhETBrand,
        callback: function() {
          new AboutDialog( sim.name, sim.version, sim.credits, Brand, sim.locale, tandem.createTandem( 'aboutDialog' ) ).show();
        },
        tandem: tandem.createTandem( 'aboutMenuItem' ),
        tagName: 'button',
        focusAfterCallback: true
      }
    ];

    // Menu items have uniform size, so compute the max text dimensions.  These are only used for sizing and thus don't
    // need to be tandemized.
    var keepItemDescriptors = _.filter( itemDescriptors, function( itemDescriptor ) {return itemDescriptor.present;} );
    var textNodes = _.map( keepItemDescriptors, function( item ) {
      return new Text( item.text, {
        font: new PhetFont( FONT_SIZE ),
        maxWidth: MAX_ITEM_WIDTH
      } );
    } );
    var maxTextWidth = _.maxBy( textNodes, function( node ) {return node.width;} ).width;
    var maxTextHeight = _.maxBy( textNodes, function( node ) {return node.height;} ).height;

    // Create the menu items.
    var items = this.items = _.map( keepItemDescriptors, function( itemDescriptor ) {

        return new MenuItem(
          maxTextWidth,
          maxTextHeight,
          options.closeCallback,
          itemDescriptor.text,
          itemDescriptor.callback,
          {
            textFill: itemDescriptor.textFill,
            checkedProperty: itemDescriptor.checkedProperty,
            separatorBefore: itemDescriptor.separatorBefore,
            tandem: itemDescriptor.tandem,
            tagName: itemDescriptor.tagName,
            focusAfterCallback: itemDescriptor.focusAfterCallback
          }
        );
      }
    );

    var separatorWidth = _.maxBy( items, function( item ) {return item.width;} ).width;
    var itemHeight = _.maxBy( items, function( item ) {return item.height;} ).height;
    var content = new Node();
    var y = 0;
    var ySpacing = 2;
    var separator;
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
    var X_MARGIN = 5;
    var Y_MARGIN = 5;
    var bubble = createBubble( content.width + X_MARGIN + X_MARGIN, content.height + Y_MARGIN + Y_MARGIN );

    self.addChild( bubble );
    self.addChild( content );
    content.left = X_MARGIN;
    content.top = Y_MARGIN;

    // @private (PhetButton.js) - whether the PhetMenu is showing
    this.isShowing = false;

    // a11y, tagname and role for content in the menu
    this.tagName = 'ul';
    this.ariaRole = 'menu';

    // a11y - add the keydown listener, handling arrow, escape, and tab keys
    // When using the arrow keys, we prevent the virtual cursor from moving in VoiceOver
    var keydownListener = this.addAccessibleInputListener( {
      keydown: function( event ) {
        var firstItem = self.items[ 0 ];
        var lastItem = self.items[ self.items.length - 1 ];

        if ( event.keyCode === Input.KEY_DOWN_ARROW ) {
          event.preventDefault();

          // On down arrow, focus next item in the list, or wrap up to the first item if focus is at the end
          var nextFocusable = lastItem.focussed ? firstItem : AccessibilityUtil.getNextFocusable();
          nextFocusable.focus();
        }
        else if ( event.keyCode === Input.KEY_UP_ARROW ) {
          event.preventDefault();

          // On up arow, focus previous item in the list, or wrap back to the last item if focus is on first item
          var previousFocusable = firstItem.focussed ? lastItem : AccessibilityUtil.getPreviousFocusable();
          previousFocusable.focus();
        }
        else if ( event.keyCode === Input.KEY_ESCAPE ) {

          // On escape, close the menu and focus the PhET button
          options.closeCallback();
          sim.navigationBar.phetButton.focus();
        }
        else if ( event.keyCode === Input.KEY_TAB ) {

          // close the menu whenever the user tabs out of it
          options.closeCallback();

          // send focus back to the phet button - the browser should then focus the next/previous focusable
          // element with default 'tab' behavior
          sim.navigationBar.phetButton.focus();
        }
      }
    } );

    // a11y - if the focus goes to something outside of the PhET menu, close it
    var focusListener = function( focus ) {
      if ( focus && !_.includes( focus.trail.nodes, self ) ) {
        self.hide();
      }
    };
    Display.focusProperty.lazyLink( focusListener );

    tandem.addInstance( this, TPhetMenu );
    this.disposePhetMenu = function() {
      tandem.removeInstance( self );
      self.removeAccessibleInputListener( keydownListener );
      Display.focusProperty.unlink( focusListener );
    };
  }

  joist.register( 'PhetMenu', PhetMenu );

  inherit( Node, PhetMenu, {

    // @public
    show: function() {
      if ( !this.isShowing ) {
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