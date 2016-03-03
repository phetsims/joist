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
  var SettingsDialog = require( 'JOIST/SettingsDialog' );
  var UpdateDialog = require( 'JOIST/UpdateDialog' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var ButtonListener = require( 'SCENERY/input/ButtonListener' );
  var Plane = require( 'SCENERY/nodes/Plane' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var FullScreen = require( 'JOIST/FullScreen' );
  var Brand = require( 'BRAND/Brand' );
  var FontAwesomeNode = require( 'SUN/FontAwesomeNode' );
  var ScreenshotGenerator = require( 'JOIST/ScreenshotGenerator' );
  var UpdateCheck = require( 'JOIST/UpdateCheck' );
  var AccessiblePeer = require( 'SCENERY/accessibility/AccessiblePeer' );
  var joist = require( 'JOIST/joist' );

  // strings
  var menuItemOptionsString = require( 'string!JOIST/menuItem.options' );
  var menuItemAboutString = require( 'string!JOIST/menuItem.about' );
  var menuItemMailInputEventsLogString = require( 'string!JOIST/menuItem.mailInputEventsLog' );
  var menuItemOutputInputEventsLogString = require( 'string!JOIST/menuItem.outputInputEventsLog' );
  var menuItemPhetWebsiteString = require( 'string!JOIST/menuItem.phetWebsite' );
  var menuItemReportAProblemString = require( 'string!JOIST/menuItem.reportAProblem' );
  var menuItemScreenshotString = require( 'string!JOIST/menuItem.screenshot' );
  var menuItemFullscreenString = require( 'string!JOIST/menuItem.fullscreen' );
  var menuItemSettingsString = require( 'string!JOIST/menuItem.settings' );
  var menuItemGetUpdateString = require( 'string!JOIST/menuItem.getUpdate' );
  var menuItemSubmitInputEventsLogString = require( 'string!JOIST/menuItem.submitInputEventsLog' );

  // constants
  var FONT_SIZE = 18;
  var HIGHLIGHT_COLOR = '#a6d2f4';
  var MAX_ITEM_WIDTH = 400;

  // the checkmark used for toggle-able menu items
  var checkNode = new FontAwesomeNode( 'check_without_box', {
    fill: 'rgba(0,0,0,0.7)',
    scale: 0.4
  } );

  // Creates a menu item that highlights and fires.
  var createMenuItem = function( text, width, height, separatorBefore, closeCallback, callback, checkedProperty, options ) {
    options = _.extend( {
      tandem: null,
      color: '#000'
    }, options );
    // padding between the check and text
    var CHECK_PADDING = 2;
    // offset that includes the checkmark's width and its padding
    var CHECK_OFFSET = checkNode.width + CHECK_PADDING;

    var LEFT_X_MARGIN = 2;
    var RIGHT_X_MARGIN = 5;

    var Y_MARGIN = 3;
    var CORNER_RADIUS = 5;

    var textNode = new Text( text, { font: new PhetFont( FONT_SIZE ), fill: options.color, maxWidth: MAX_ITEM_WIDTH } );
    var highlight = new Rectangle( 0, 0, width + LEFT_X_MARGIN + RIGHT_X_MARGIN + CHECK_OFFSET, height + Y_MARGIN + Y_MARGIN, CORNER_RADIUS, CORNER_RADIUS );

    var menuItem = new Node( {
      cursor: 'pointer',
      focusable: true,
      textDescription: text + ' Button'
    } );
    menuItem.addChild( highlight );
    menuItem.addChild( textNode );

    textNode.left = highlight.left + LEFT_X_MARGIN + CHECK_OFFSET; // text is left aligned
    textNode.centerY = highlight.centerY;

    menuItem.addInputListener( {
      enter: function() { highlight.fill = HIGHLIGHT_COLOR; },
      exit: function() { highlight.fill = null; }
    } );
    var fire = function( event ) {
      menuItem.trigger0( 'startedCallbacksForFired' );
      closeCallback( event );
      callback( event );
      menuItem.trigger0( 'endedCallbacksForFired' );
    };
    menuItem.addInputListener( new ButtonListener( {
      fire: fire
    } ) );

    menuItem.separatorBefore = separatorBefore;

    // if there is a check-mark property, add the check mark and hook up visibility changes
    var checkListener;
    if ( checkedProperty ) {
      var checkNodeHolder = new Node( {
        children: [ checkNode ],
        right: textNode.left - CHECK_PADDING,
        centerY: textNode.centerY
      } );
      checkListener = function( isChecked ) {
        checkNodeHolder.visible = isChecked;
      };
      checkedProperty.link( checkListener );
      menuItem.addChild( checkNodeHolder );
    }

    menuItem.dispose = function() {
      if ( checkedProperty ) {
        checkedProperty.unlink( checkListener );
      }
      options.tandem && options.tandem.removeInstance( menuItem );
    };

    options.tandem && options.tandem.addInstance( menuItem );

    // accessibility
    menuItem.accessibleContent = {
      id: text,
      createPeer: function( accessibleInstance ) {
        // will look like <input id="menuItemId" value="Phet Button" type="button" tabIndex="0">
        var domElement = document.createElement( 'input' );
        domElement.type = 'button';
        domElement.value = text;
        domElement.tabIndex = '0';
        domElement.className = 'phetMenuItem';

        domElement.addEventListener( 'click', function() {
          // fire the listener
          fire();

          // if a modal dialog has opened, focus it immediately
          var openDialog = document.getElementsByClassName( 'Dialog' )[ 0 ];
          if ( openDialog ) {
            openDialog.focus();
          }
          // otherwise, we have been redirected to a new page so make sure screen view elements and PhET Button are back
          // in tab order.
          else {
            // all screen view elements are injected back into the navigation order.
            var screenViewElements = document.getElementsByClassName( 'ScreenView' );
            _.each( screenViewElements, function( element ) {
              element.hidden = false;
            } );

            // make sure that the phet button is also in the tab order
            document.getElementsByClassName( 'PhetButton' )[ 0 ].hidden = false;
          }
        } );

        return new AccessiblePeer( accessibleInstance, domElement );
      }
    };

    return menuItem;
  };

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

  function PhetMenu( sim, options ) {

    //Only show certain features for PhET Sims, such as links to our website
    var isPhETBrand = Brand.id === 'phet';

    options = _.extend( {

      //For sims that have save/load enabled, show menu items for those.
      showSaveAndLoad: false,

      tandem: null

    }, options );

    var thisMenu = this;
    Node.call( thisMenu );

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
          new OptionsDialog( sim.options.optionsNode ).show();
        }
      },
      {
        text: menuItemPhetWebsiteString,
        tandem: options.tandem && options.tandem.createTandem( 'phetWebsiteButton' ),
        present: isPhETBrand,
        callback: function() {
          // Open locale-specific PhET home page. If there is no website translation for locale, fallback will be handled by server. See joist#97.
          var phetWindow = window.open( 'http://phet.colorado.edu/' + sim.locale, '_blank' );
          phetWindow.focus();
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
        text: menuItemSettingsString,
        present: false,
        callback: function() {
          var settingsDialog = new SettingsDialog( sim.showPointersProperty );

          // TODO: This is broken.  Should probably use new Dialog infrastruture
          var plane = new Plane( { fill: 'black', opacity: 0.3 } );
          sim.addChild( plane );
          sim.addChild( settingsDialog );
          settingsDialog.addDoneListener( function() {
            plane.detach();
            settingsDialog.detach();
          } );
        }
      },
      {
        text: menuItemReportAProblemString,
        present: isPhETBrand,
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
          var reportWindow = window.open( url, '_blank' );
          reportWindow.focus();
        },
        tandem: options.tandem && options.tandem.createTandem( 'reportAProblemButton' )
      },
      {
        text: 'QR code',
        present: phet.chipper.getQueryParameter( 'qrCode' ),
        callback: function() {
          var win = window.open( 'http://api.qrserver.com/v1/create-qr-code/?data=' + encodeURIComponent( window.location.href ) + '&size=220x220&margin=0', '_blank' );
          win.focus();
        },
        tandem: options.tandem && options.tandem.createTandem( 'qrCode' )
      },
      {
        text: menuItemGetUpdateString,
        present: UpdateCheck.areUpdatesChecked,
        color: UpdateCheck.state === 'out-of-date' ? '#0a0' : '#000',
        callback: function() {
          new UpdateDialog().show();
        },
        tandem: options.tandem && options.tandem.createTandem( 'getUpdate' )
      },

      // "Screenshot" Menu item
      {
        text: menuItemScreenshotString,
        present: phet.chipper.getQueryParameter( 'screenshot' ) && !platform.ie9, // TODO is this going to be implemented for IE9? see issue #212
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
            var filename = sim.name + ' screenshot.png';

            window.saveAs( blob, filename );
          }
          else {
            window.open( dataURL, '_blank', '' );
          }
        }
      },
      {
        text: menuItemFullscreenString,
        present: FullScreen.isFullScreenEnabled(),
        checkedProperty: FullScreen.isFullScreenProperty,
        callback: function() {
          FullScreen.toggleFullScreen( sim );
        },
        tandem: options.tandem && options.tandem.createTandem( 'fullScreenButton' )
      },

      //About dialog button
      {
        text: menuItemAboutString,
        present: true,
        separatorBefore: isPhETBrand,
        callback: function() {
          new AboutDialog( sim.name, sim.version, sim.credits, Brand, sim.locale ).show();
        },
        tandem: options.tandem && options.tandem.createTandem( 'aboutButton' )
      }
    ];

    // Menu items have uniform size, so compute the max text dimensions.
    var keepItemDescriptors = _.filter( itemDescriptors, function( itemDescriptor ) {return itemDescriptor.present;} );
    var textNodes = _.map( keepItemDescriptors, function( item ) {return new Text( item.text, { font: new PhetFont( FONT_SIZE ), maxWidth: MAX_ITEM_WIDTH } );} );
    var maxTextWidth = _.max( textNodes, function( node ) {return node.width;} ).width;
    var maxTextHeight = _.max( textNodes, function( node ) {return node.height;} ).height;

    // Create the menu items.
    var items = this.items = _.map( keepItemDescriptors, function( itemDescriptor ) {
      return createMenuItem(
        itemDescriptor.text,
        maxTextWidth,
        maxTextHeight,
        itemDescriptor.separatorBefore,
        options.closeCallback,
        itemDescriptor.callback,
        itemDescriptor.checkedProperty, {
          tandem: itemDescriptor.tandem,
          color: itemDescriptor.color
        } );
    } );
    var separatorWidth = _.max( items, function( item ) {return item.width;} ).width;
    var itemHeight = _.max( items, function( item ) {return item.height;} ).height;
    var content = new Node();
    var y = 0;
    var ySpacing = 2;
    var separator;
    _.each( items, function( item ) {
      if ( item.separatorBefore ) {
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

    thisMenu.addChild( bubble );
    thisMenu.addChild( content );
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

        // TODO: hopefully, this event should bubble down to menu items.
        domElement.addEventListener( 'keydown', function( event ) {
          if ( event.keyCode === 27 ) {
            thisMenu.exitMenu();
          }
        } );

        thisMenu.dispose();

        return new AccessiblePeer( accessibleInstance, domElement );

      }
    };

    // @private (PhetButton.js) - whether the PhetMenu is showing
    this.isShowing = false;

    options.tandem && options.tandem.addInstance( this );
    this.disposePhetMenu = function() {
      options.tandem && options.tandem.removeInstance( this );
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
        this.dispose();
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