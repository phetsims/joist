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
  var MenuItem = require( 'JOIST/MenuItem' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var FullScreen = require( 'JOIST/FullScreen' );
  var Brand = require( 'BRAND/Brand' );
  var ScreenshotGenerator = require( 'JOIST/ScreenshotGenerator' );
  var UpdateCheck = require( 'JOIST/UpdateCheck' );
  var AccessiblePeer = require( 'SCENERY/accessibility/AccessiblePeer' );
  var joist = require( 'JOIST/joist' );
  var StringUtils = require( 'PHETCOMMON/util/StringUtils' );
  var DerivedProperty = require( 'AXON/DerivedProperty' );

  // phet-io modules
  var TPhetMenu = require( 'ifphetio!PHET_IO/types/joist/TPhetMenu' );

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
     * Description of the items in the menu. Each descriptor has these properties:
     * {string} text - the item's text
     * {boolean} present - whether the item should be added to the menu
     * {function} callback - called when the item fires
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
        tandem: tandem.createTandem( 'optionsButton' )
      },
      {
        text: menuItemPhetWebsiteString,
        tandem: tandem.createTandem( 'phetWebsiteButton' ),
        present: isPhETBrand,
        callback: function() {
          if ( !fuzzMouse ) {
            // Open locale-specific PhET home page. If there is no website translation for locale, fallback will be handled by server. See joist#97.
            var phetWindow = window.open( 'http://phet.colorado.edu/' + sim.locale, '_blank' );
            phetWindow.focus();
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
        tandem: tandem.createTandem( 'reportAProblemButton' )
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
        tandem: tandem.createTandem( 'qrCode' )
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
        tandem: tandem.createTandem( 'getUpdate' )
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
        tandem: tandem.createTandem( 'screenshotMenuItem' )
      },
      {
        text: menuItemFullscreenString,
        present: FullScreen.isFullScreenEnabled() && !isPhetApp && !fuzzMouse,
        checkedProperty: FullScreen.isFullScreenProperty,
        callback: function() {
          FullScreen.toggleFullScreen( sim );
        },
        tandem: tandem.createTandem( 'fullScreenButton' )
      },

      //About dialog button
      {
        text: menuItemAboutString,
        present: true,
        separatorBefore: isPhETBrand,
        callback: function() {
          new AboutDialog( sim.name, sim.version, sim.credits, Brand, sim.locale, tandem.createTandem( 'aboutDialog' ) ).show();
        },
        tandem: tandem.createTandem( 'aboutButton' )
      }
    ];

    // Menu items have uniform size, so compute the max text dimensions.
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
        itemDescriptor.text,
        maxTextWidth,
        maxTextHeight,
        itemDescriptor.separatorBefore,
        options.closeCallback,
        itemDescriptor.callback,
        itemDescriptor.checkedProperty, {
          tandem: itemDescriptor.tandem,
          textFill: itemDescriptor.textFill
        } );
    } );
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

    // @public (accessibility)
    this.accessibleContent = {
      createPeer: function( accessibleInstance ) {
        /*
         * Element of the parallel DOM should look like:
         */
        var domElement = document.createElement( 'div' );
        domElement.className = 'PhetMenu';
        domElement.tabIndex = '-1';

        // keydown event will bubble down to menu items
        domElement.addEventListener( 'keydown', function( event ) {
          if ( event.keyCode === 27 ) {
            self.exitMenu();
          }
        } );

        self.dispose();

        return new AccessiblePeer( accessibleInstance, domElement );

      }
    };

    // @private (PhetButton.js) - whether the PhetMenu is showing
    this.isShowing = false;

    tandem.addInstance( this, TPhetMenu );
    this.disposePhetMenu = function() {
      tandem.removeInstance( self );
    };
  }

  joist.register( 'PhetMenu', PhetMenu );

  inherit( Node, PhetMenu, {

    /**
     * Close the menu from a keystroke
     * @public (accessibility)
     */
    exitMenu: function() {

      // all screen view elements are injected back into the navigation order.
      var screenViewElements = document.getElementsByClassName( 'screenView' );
      _.each( screenViewElements, function( element ) {
        element.hidden = false;
      } );

      // make sure that the phet button is also in the tab order.
      document.getElementsByClassName( 'PhetButton' )[ 0 ].hidden = false;

      // hide the menu
      this.hide();
    },

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
    }
  } );

  return PhetMenu;
} );