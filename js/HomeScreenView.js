// Copyright 2013-2015, University of Colorado Boulder

/**
 * Shows the home screen for a multi-screen simulation, which lets the user see all of the screens and select one.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var PhetButton = require( 'JOIST/PhetButton' );
  var Node = require( 'SCENERY/nodes/Node' );
  var HBox = require( 'SCENERY/nodes/HBox' );
  var VBox = require( 'SCENERY/nodes/VBox' );
  var Text = require( 'SCENERY/nodes/Text' );
  var Shape = require( 'KITE/Shape' );
  var inherit = require( 'PHET_CORE/inherit' );
  var ScreenView = require( 'JOIST/ScreenView' );
  var Frame = require( 'JOIST/Frame' );
  var Property = require( 'AXON/Property' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var Bounds2 = require( 'DOT/Bounds2' );
  var joist = require( 'JOIST/joist' );
  var AccessiblePeer = require( 'SCENERY/accessibility/AccessiblePeer' );
  var Util = require( 'DOT/Util' );
  var PhetColorScheme = require( 'SCENERY_PHET/PhetColorScheme' );

  // phet-io modules
  var TScreenButton = require( 'ifphetio!PHET_IO/types/joist/TScreenButton' );

  // constants
  var HEIGHT = 70; //TODO what is this? is it the height of large icons?
  var LAYOUT_BOUNDS = new Bounds2( 0, 0, 768, 504 );
  var ICONS_TOP = 170; //TODO workaround for drifting of home screen icons, https://github.com/phetsims/joist/issues/331

  // iPad doesn't support Century Gothic, so fall back to Futura, see http://wordpress.org/support/topic/font-not-working-on-ipad-browser
  var TITLE_FONT_FAMILY = 'Century Gothic, Futura';

  /**
   * @param {Sim} sim
   * @param {Tandem} tandem
   * @param {Object} [options]
   * @constructor
   */
  function HomeScreenView( sim, tandem, options ) {
    var self = this;

    options = _.extend( {
      showSmallHomeScreenIconFrame: false,
      warningNode: null // {Node | null}, to display below the icons as a warning if available
    }, options );

    // Rendering in SVG seems to solve the problem that the home screen consumes 100% disk and crashes, see
    // https://github.com/phetsims/joist/issues/17.  This also makes it more responsive (and crisper on retina
    // displays). The renderer must be specified here because the node is added directly to the scene (instead of to
    // some other node that already has svg renderer).
    ScreenView.call( this, { layoutBounds: LAYOUT_BOUNDS } );

    var title = new Text( sim.name, {
      font: new PhetFont( {
        size: 52,
        family: TITLE_FONT_FAMILY
      } ),
      fill: 'white',
      y: 110
    } );
    this.addChild( title );
    title.scale( Math.min( 1, 0.9 * this.layoutBounds.width / title.width ) );
    title.centerX = this.layoutBounds.centerX;

    // Keep track of which screen is highlighted so the same screen can remain highlighted even if nodes are replaced
    // (say when one grows larger or smaller).
    var highlightedScreenIndexProperty = new Property( -1 );

    var screenChildren = _.map( sim.screens, function( screen ) {

      assert && assert( screen.name, 'name is required for screen ' + sim.screens.indexOf( screen ) );
      assert && assert( screen.homeScreenIcon, 'homeScreenIcon is required for screen ' + screen.name );

      var index = sim.screens.indexOf( screen );

      // Wrap in a Node because we're scaling, and the same icon will be used for smallIconContent, and may be used by
      // the navigation bar.
      var largeIcon = new Node( {
        children: [ screen.homeScreenIcon ],
        scale: HEIGHT / screen.homeScreenIcon.height * 2
      } );
      var frame = new Frame( largeIcon );

      highlightedScreenIndexProperty.link( function( highlightedIndex ) { frame.setHighlighted( highlightedIndex === index ); } );

      var largeIconWithFrame = new Node( { children: [ frame, largeIcon ] } );
      var largeText = new Text( screen.name, { font: new PhetFont( 42 ), fill: PhetColorScheme.PHET_LOGO_YELLOW } );//Color match with the PhET Logo yellow

      //Shrink the text if it goes beyond the edge of the image
      if ( largeText.width > largeIconWithFrame.width ) {
        largeText.scale( largeIconWithFrame.width / largeText.width );
      }

      // 'down' function for the large button, refactored for input listener and accessibility
      var largeButtonDown = function() {
        largeScreenButton.trigger0( 'startedCallbacksForFired' );
        sim.showHomeScreenProperty.value = false;
        highlightedScreenIndexProperty.value = -1;
        largeScreenButton.trigger0( 'endedCallbacksForFired' );
      };
      var largeScreenButton = new VBox( {

        //Don't 40 the VBox or it will shift down when the border becomes thicker
        resize: false,

        cursor: 'pointer',

        children: [
          largeIconWithFrame,
          largeText
        ],
        textDescription: screen.name + ' Screen: Button',
        accessibleContent: {
          createPeer: function( accessibleInstance ) {

            // We want DOM elements to look like this:
            // <input type="button" tabIndex="0" value="screenName" id="largeButton-index">
            var domElement = document.createElement( 'input' );
            domElement.setAttribute( 'type', 'button' );
            domElement.setAttribute( 'value', screen.name );
            domElement.id = 'largeButton-' + index;
            domElement.tabIndex = '0';

            // enter the selected screen on 'click'
            domElement.addEventListener( 'click', function() {
              largeButtonDown();
            } );

            return new AccessiblePeer( accessibleInstance, domElement );

          }
        }
      } );

      // Even though in the user interface the small and large buttons seem like a single UI component that has grown
      // larger, it would be quite a headache to create a composite button for the purposes of tandem, so instead the
      // large and small buttons are registered as separate instances.  See https://github.com/phetsims/phet-io/issues/99
      tandem.createTandem( screen.tandem.tail + 'LargeButton' ).addInstance( largeScreenButton, TScreenButton );

      // TODO: Switch to buttonListener, but make sure you test it because on 7/17/2013 there is a problem where
      // TODO: ButtonListener won't fire if a node has appeared under the pointer
      largeScreenButton.addInputListener( {
        down: function() {
          largeButtonDown();
        }
      } );

      // For 4 screens, scale is 1.0, for 2 screens scale is 1.75, linearly extrapolate/interpolate
      var scale = Util.linear( 2, 4, 1.75, 1.00, sim.screens.length );

      // Show a small (unselected) screen icon.  In some cases (if the icon has a black background), a border may be
      // shown around it as well.  See https://github.com/phetsims/color-vision/issues/49
      // Wrap in a Node because we're scaling, and the same icon will be used for largeIcon, and may be used by the
      // navigation bar.
      var smallIconContent = new Node( {
        opacity: 0.5,
        children: [ screen.homeScreenIcon ],
        scale: scale * HEIGHT / screen.homeScreenIcon.height
      } );

      var smallFrame = new Rectangle( 0, 0, smallIconContent.width, smallIconContent.height, {
        stroke: options.showSmallHomeScreenIconFrame ? '#dddddd' : null,
        lineWidth: 0.7
      } );
      var smallIcon = new Node( { opacity: 0.5, children: [ smallFrame, smallIconContent ] } );

      var smallText = new Text( screen.name, { font: new PhetFont( 18 ), fill: 'gray' } );

      //Shrink the text if it goes beyond the edge of the image
      if ( smallText.width > smallIcon.width ) {
        smallText.scale( smallIcon.width / smallText.width );
      }

      // down function for small button, refactored for accessibility and the input listener
      var smallButtonDown = function() {
        smallScreenButton.trigger0( 'startedCallbacksForFired' );
        sim.screenIndexProperty.value = index;
        smallScreenButton.trigger0( 'endedCallbacksForFired' );
      };
      var smallScreenButton = new VBox( {
        spacing: 3, cursor: 'pointer', children: [
          smallIcon,
          smallText
        ],
        textDescription: screen.name + ' Screen: Button',
        accessibleContent: {
          createPeer: function( accessibleInstance ) {

            // We want DOM elements to look like this:
            // <input type="button" tabindex="0">
            // However, this is trivial: on accessible focus, the small button will immediately become a 'large' button
            var domElement = document.createElement( 'input' );
            domElement.setAttribute( 'type', 'button' );
            domElement.setAttribute( 'value', screen.name );
            domElement.tabIndex = '0';
            domElement.id = 'smallButton-' + index;

            // when the small button receives accessible focus, the thumbnail should grow and focus should be passed to
            // the large button.
            domElement.addEventListener( 'focus', function() {
              smallButtonDown();
              document.getElementById( 'largeButton-' + index ).focus();
            } );
            return new AccessiblePeer( accessibleInstance, domElement );
          }
        }
      } );
      smallScreenButton.mouseArea = smallScreenButton.touchArea = Shape.bounds( smallScreenButton.bounds ); //cover the gap in the vbox
      smallScreenButton.addInputListener( {
        down: function( event ) {
          smallButtonDown();
        },

        // On the home screen if you touch an inactive screen thumbnail, it grows.  If then without lifting your finger
        // you swipe over to the next thumbnail, that one would grow.
        over: function( event ) {
          if ( event.pointer.isTouch ) {
            sim.screenIndexProperty.value = index;
          }
        }
      } );

      tandem.createTandem( screen.tandem.tail + 'SmallButton' ).addInstance( smallScreenButton, TScreenButton );

      var highlightListener = {
        over: function( event ) {
          highlightedScreenIndexProperty.value = index;

          //TODO: use named children instead of child indices?
          smallScreenButton.children[ 0 ].opacity = 1;
          smallScreenButton.children[ 1 ].fill = 'white';
        },
        out: function( event ) {
          highlightedScreenIndexProperty.value = -1;
          smallScreenButton.children[ 0 ].opacity = 0.5;
          smallScreenButton.children[ 1 ].fill = 'gray';
        }
      };
      smallScreenButton.addInputListener( highlightListener );
      largeScreenButton.addInputListener( highlightListener );
      largeScreenButton.mouseArea = largeScreenButton.touchArea = Shape.bounds( largeScreenButton.bounds ); //cover the gap in the vbox

      return { screen: screen, small: smallScreenButton, large: largeScreenButton, index: index };
    } );

    var centerNode = new Node( { y: ICONS_TOP } );
    self.addChild( centerNode );
    var iconHBox = null;
    sim.screenIndexProperty.link( function( screenIndex ) {

      // remove and clean up previous HBox to avoid leaking memory
      if ( iconHBox ) {
        centerNode.removeChild( iconHBox );
        iconHBox.removeAllChildren();
      }

      // Space the icons out more if there are fewer, so they will be spaced nicely.
      // Cannot have only 1 screen because for 1-screen sims there is no home screen.
      var spacing = sim.screens.length === 2 ? 60 :
                    sim.screens.length === 3 ? 60 :
                    33;

      var icons = _.map( screenChildren, function( screenChild ) {return screenChild.index === screenIndex ? screenChild.large : screenChild.small;} );
      iconHBox = new HBox( { spacing: spacing, children: icons, align: 'top', resize: false } );
      centerNode.addChild( iconHBox );

      centerNode.centerX = self.layoutBounds.width / 2;

      // Workaround for #331 which caused the icons to float toward the top of the screen.
      centerNode.top = ICONS_TOP;
    } );

    //TODO move these Properties to LookAndFeel, see https://github.com/phetsims/joist/issues/255
    var homeScreenFillProperty = new Property( 'black' );
    var homeScreenTextFillProperty = new Property( 'white' );

    // @public (joist-internal) - This PhET button is public since our creator (Sim.js) is responsible for positioning
    // this button. See https://github.com/phetsims/joist/issues/304.
    this.phetButton = new PhetButton( sim, homeScreenFillProperty, homeScreenTextFillProperty, tandem.createTandem( 'phetButton' ) );
    this.addChild( this.phetButton );

    if ( options.warningNode ) {
      var warningNode = options.warningNode;

      this.addChild( warningNode );
      warningNode.centerX = this.layoutBounds.centerX;
      warningNode.bottom = this.layoutBounds.maxY - 20;
    }
  }

  joist.register( 'HomeScreenView', HomeScreenView );

  return inherit( ScreenView, HomeScreenView, {},
    // @public - statics
    {
      TITLE_FONT_FAMILY: TITLE_FONT_FAMILY,
      LAYOUT_BOUNDS: LAYOUT_BOUNDS
    }
  );
} );