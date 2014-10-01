// Copyright 2002-2013, University of Colorado Boulder

/**
 * The 'PhET' menu, which appears in the bottom-right of the home screen and the navigation bar, with options like "PhET Website", "Settings", etc.
 *
 * @author Sam Reid
 */
define( function( require ) {
  'use strict';

  // modules
  var Node = require( 'SCENERY/nodes/Node' );
  var Shape = require( 'KITE/Shape' );
  var Path = require( 'SCENERY/nodes/Path' );
  var Text = require( 'SCENERY/nodes/Text' );
  var inherit = require( 'PHET_CORE/inherit' );
  var AboutDialog = require( 'JOIST/AboutDialog' );
  var SettingsDialog = require( 'JOIST/SettingsDialog' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var ButtonListener = require( 'SCENERY/input/ButtonListener' );
  var Plane = require( 'SCENERY/nodes/Plane' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var SimJSON = require( 'JOIST/SimJSON' );
  var ScreenshotGenerator = require( 'JOIST/util/ScreenshotGenerator' );
  var Image = require( 'SCENERY/nodes/Image' );
  var Brand = require( 'BRAND/Brand' );

  // strings
  var aboutString = require( 'string!JOIST/menuItem.about' );
  var mailInputEventsLogString = require( 'string!JOIST/menuItem.mailInputEventsLog' );
  var outputInputEventsLogString = require( 'string!JOIST/menuItem.outputInputEventsLog' );
  var phetWebsiteString = require( 'string!JOIST/menuItem.phetWebsite' );
  var reportAProblemString = require( 'string!JOIST/menuItem.reportAProblem' );
  var settingsString = require( 'string!JOIST/menuItem.settings' );
  var submitInputEventsLogString = require( 'string!JOIST/menuItem.submitInputEventsLog' );

  // constants
  var FONT_SIZE = 18;
  var HIGHLIGHT_COLOR = '#a6d2f4';

  // Creates a menu item that highlights and fires.
  var createMenuItem = function( text, width, height, separatorBefore, callback, immediateCallback ) {

    var X_MARGIN = 5;
    var Y_MARGIN = 3;
    var CORNER_RADIUS = 5;

    var textNode = new Text( text, { font: new PhetFont( FONT_SIZE ) } );
    var highlight = new Rectangle( 0, 0, width + X_MARGIN + X_MARGIN, height + Y_MARGIN + Y_MARGIN, CORNER_RADIUS, CORNER_RADIUS );

    var menuItem = new Node( { cursor: 'pointer' } );
    menuItem.addChild( highlight );
    menuItem.addChild( textNode );

    textNode.left = highlight.left + X_MARGIN; // text is left aligned
    textNode.centerY = highlight.centerY;

    menuItem.addInputListener( {
      enter: function() { highlight.fill = HIGHLIGHT_COLOR; },
      exit: function() { highlight.fill = null; },
      upImmediate: function() { immediateCallback && immediateCallback(); }
    } );
    menuItem.addInputListener( new ButtonListener( {fire: callback } ) );

    menuItem.separatorBefore = separatorBefore;

    return menuItem;
  };

  // Creates a comic-book style bubble.
  var createBubble = function( width, height ) {

    var rectangle = new Rectangle( 0, 0, width, height, 8, 8, {fill: 'white', lineWidth: 1, stroke: 'black'} );

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
    bubble.addChild( new Path( tail, {fill: 'white'} ) );
    bubble.addChild( new Path( tailOutline, {stroke: 'black', lineWidth: 1} ) );

    return bubble;
  };

  //TODO: The popup menu should scale with the size of the screen
  function PhetMenu( sim, options ) {

    //Only show certain features for PhET Sims, such as links to our website
    //Note: this string below must stay in sync with the Brand.name or phet features will be dropped
    var isPhETBrand = Brand.name === 'PhET Interactive Simulations';

    options = _.extend( {

      //For sims that have save/load enabled, show menu items for those.
      showSaveAndLoad: false
    }, options );

    var thisMenu = this;
    Node.call( thisMenu, {renderer: 'svg'} );

    var showAboutDialog = function( aboutDialog ) {
      var plane = new Plane( {fill: 'black', opacity: 0.3, renderer: 'svg'} );//Renderer must be specified here because the plane is added directly to the scene (instead of to some other node that already has svg renderer)
      sim.addChild( plane );
      sim.addChild( aboutDialog );
      var aboutDialogListener = {up: function() {
        aboutDialog.removeInputListener( aboutDialogListener );
        plane.addInputListener( aboutDialogListener );
        aboutDialog.detach();
        plane.detach();
      }};
      aboutDialog.addInputListener( aboutDialogListener );
      plane.addInputListener( aboutDialogListener );
    };

    /*
     * Description of the items in the menu. Each descriptor has these properties:
     * {string} text - the item's text
     * {boolean} present - whether the item should be added to the menu
     * {function} callback - called when the item fires
     */
    var itemDescriptors = [
      {
        text: phetWebsiteString,
        present: isPhETBrand,
        callback: function() {
        },
        immediateCallback: function() {
          var phetWindow = window.open( 'http://phet.colorado.edu', '_blank' );
          phetWindow.focus();
        } },
      {
        text: outputInputEventsLogString,
        present: !!sim.options.recordInputEventLog,
        callback: function() {
          // prints the recorded input event log to the console
          console.log( sim.getRecordedInputEventLogString() );
        }},
      {
        text: submitInputEventsLogString,
        present: !!sim.options.recordInputEventLog,
        callback: function() {
          // submits a recorded event log to the same-origin server (run scenery/tests/event-logs/server/server.js with Node, from the same directory)
          sim.submitEventLog();
        }},
      {
        text: mailInputEventsLogString,
        present: !!sim.options.recordInputEventLog,
        callback: function() {
        },
        immediateCallback: function() {
          // mailto: link including the body to email
          sim.mailEventLog();
        }},
      {
        text: settingsString,
        present: false,
        callback: function() {
          var settingsDialog = new SettingsDialog( sim );
          var plane = new Plane( {fill: 'black', opacity: 0.3, renderer: 'svg'} );
          sim.addChild( plane );
          sim.addChild( settingsDialog );
          settingsDialog.addDoneListener( function() {
            plane.detach();
            settingsDialog.detach();
          } );
        }
      },
      {
        text: reportAProblemString,
        present: isPhETBrand,
        callback: function() {},
        immediateCallback: function() {
          var url = 'http://phet.colorado.edu/files/troubleshooting/' +
                    '?sim=' + encodeURIComponent( sim.name ) +
                    '&version=' + encodeURIComponent( sim.version ) +
                    '&url=' + encodeURIComponent( window.location.href );
          var reportWindow = window.open( url, '_blank' );
          reportWindow.focus();
        } },
      {

        //One way to allow the user to "save" the state is with a URL.
        //TODO: This does not preserve other query parameters, it probably should
        text: 'Navigate to Save URL',
        present: options.showSaveAndLoad,
        callback: function() {
          var state = sim.getState();

          //See http://stackoverflow.com/questions/5817505/is-there-any-method-to-get-url-without-query-string-in-java-script
          var url = [location.protocol, '//', location.host, location.pathname].join( '' ) + '?state=' + encodeURIComponent( JSON.stringify( state, SimJSON.replacer ) );
          window.location.href = url;
        }
      },

      //Feasibility test for capturing screen shots as images
      {
        text: 'Screen shot',
        present: options.showSaveAndLoad,
        callback: function() {
          var node = sim.screens[sim.simModel.screenIndex].view;
          new ScreenshotGenerator().generateScreenshot( node, function( canvas ) {
            node.addChild( new Image( canvas, {left: 0, top: 0, scale: 0.25} ) );
          } );
        }
      },
      {
        text: aboutString,
        present: isPhETBrand,
        separatorBefore: true,
        callback: function() { showAboutDialog( new AboutDialog( sim, Brand ) ); }
      },

      //About dialog for non-phet sims
      {
        text: aboutString,
        present: !isPhETBrand,
        separatorBefore: false,
        callback: function() {
          showAboutDialog( new AboutDialog( sim, Brand ) );
        }
      }
    ];

    // Menu items have uniform size, so compute the max text dimensions.
    var keepItemDescriptors = _.filter( itemDescriptors, function( itemDescriptor ) {return itemDescriptor.present;} );
    var textNodes = _.map( keepItemDescriptors, function( item ) {return new Text( item.text, {font: new PhetFont( FONT_SIZE )} );} );
    var maxTextWidth = _.max( textNodes, function( node ) {return node.width;} ).width;
    var maxTextHeight = _.max( textNodes, function( node ) {return node.height;} ).height;

    // Create the menu items.
    var items = _.map( keepItemDescriptors, function( itemDescriptor ) {
      return createMenuItem( itemDescriptor.text, maxTextWidth, maxTextHeight, itemDescriptor.separatorBefore, itemDescriptor.callback, itemDescriptor.immediateCallback );
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
        separator = new Path( Shape.lineSegment( 0, y, separatorWidth, y ), {stroke: 'gray', lineWidth: 1} );
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

    thisMenu.mutate( options );
  }

  inherit( Node, PhetMenu );

  return PhetMenu;
} );
