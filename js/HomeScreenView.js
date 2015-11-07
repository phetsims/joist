// Copyright 2013-2015, University of Colorado Boulder

/**
 * Shows the home screen for a multi-screen simulation, which lets the user see all of the screens and select one.
 *
 * @author Sam Reid
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

  // constants
  var HEIGHT = 70; //TODO what is this? is it the height of large icons?
  var TITLE_FONT_FAMILY = 'Century Gothic, Futura';
  var LAYOUT_BOUNDS = new Bounds2( 0, 0, 768, 504 );

  function HomeScreenView( sim, options ) {
    var homeScreenView = this;

    options = _.extend( {
      showSmallHomeScreenIconFrame: false,
      warningNode: null, // {Node | null}, to display below the icons as a warning if available
      tandem: null
    }, options );

    //Rendering in SVG seems to solve the problem that the home screen consumes 100% disk and crashes, see https://github.com/phetsims/joist/issues/17
    //Also makes it more responsive (and crisper on retina displays)
    //Renderer must be specified here because the node is added directly to the scene (instead of to some other node that already has svg renderer
    ScreenView.call( this, { layoutBounds: LAYOUT_BOUNDS } );

    //iPad doesn't support Century Gothic, so fall back to Futura, see http://wordpress.org/support/topic/font-not-working-on-ipad-browser
    var title = new Text( sim.name, {
      font: new PhetFont( { size: 52, family: TITLE_FONT_FAMILY } ),
      fill: 'white',
      y: 110
    } );
    this.addChild( title );
    title.scale( Math.min( 1, 0.9 * this.layoutBounds.width / title.width ) );
    title.centerX = this.layoutBounds.centerX;

    //Keep track of which screen is highlighted so the same screen can remain highlighted even if nodes are replaced (say when one grows larger or smaller)
    var highlightedScreenIndexProperty = new Property( -1 );

    var screenChildren = _.map( sim.screens, function( screen ) {
      var index = sim.screens.indexOf( screen );
      var largeIcon = new Node( {
        children: [ screen.homeScreenIcon ],
        scale: HEIGHT / screen.homeScreenIcon.height * 2
      } );
      var frame = new Frame( largeIcon );

      highlightedScreenIndexProperty.link( function( highlightedIndex ) { frame.setHighlighted( highlightedIndex === index ); } );

      var largeIconWithFrame = new Node( { children: [ frame, largeIcon ] } );
      var largeText = new Text( screen.name, { font: new PhetFont( 42 ), fill: '#f2e916' } );//Color match with the PhET Logo yellow

      //Shrink the text if it goes beyond the edge of the image
      if ( largeText.width > largeIconWithFrame.width ) {
        largeText.scale( largeIconWithFrame.width / largeText.width );
      }
      var largeScreenButton = new VBox( {

        //Don't 40 the VBox or it will shift down when the border becomes thicker
        resize: false,

        cursor: 'pointer',

        children: [
          largeIconWithFrame,
          largeText
        ],
        focusable: true,
        textDescription: screen.name + ' Screen: Button'
      } );

      // Even though in the user interface, the small and large buttons seem like a single UI component
      // that has grown larger, it would be quite a headache to create a composite button for the purposes of 
      // tandem, so instead the large and small buttons are registered as separate instances.  See https://github.com/phetsims/together/issues/99
      options.tandem && options.tandem.createTandem( screen.tandemScreenName + 'LargeButton' ).addInstance( largeScreenButton );

      // TODO: Switch to buttonListener, but make sure you test it because on 7/17/2013 there is a problem where
      // TODO: ButtonListener won't fire if a node has appeared under the pointer
      largeScreenButton.addInputListener( {
        down: function() {
          largeScreenButton.trigger0( 'startedCallbacksForFired' );
          sim.showHomeScreen = false;
          highlightedScreenIndexProperty.value = -1;
          largeScreenButton.trigger0( 'endedCallbacksForFired' );
        }
      } );

      //Show a small (unselected) screen icon.  In some cases (if the icon has a black background), a border may be shown around it as well.  See https://github.com/phetsims/color-vision/issues/49
      var smallIconContent = new Node( {
        opacity: 0.5,
        children: [ screen.homeScreenIcon ],
        scale: sim.screens.length === 4 ? 1.00 * HEIGHT / screen.homeScreenIcon.height :
               sim.screens.length === 3 ? 1.25 * HEIGHT / screen.homeScreenIcon.height :
               sim.screens.length === 2 ? 1.75 * HEIGHT / screen.homeScreenIcon.height :
               HEIGHT / screen.homeScreenIcon.height
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

      var smallScreenButton = new VBox( {
        spacing: 3, cursor: 'pointer', children: [
          smallIcon,
          smallText
        ],
        focusable: true,
        textDescription: screen.name + ' Screen: Button'
      } );
      smallScreenButton.mouseArea = smallScreenButton.touchArea = Shape.bounds( smallScreenButton.bounds ); //cover the gap in the vbox
      smallScreenButton.addInputListener( {
        down: function( event ) {
          smallScreenButton.trigger0( 'startedCallbacksForFired' );
          sim.screenIndex = index;
          smallScreenButton.trigger0( 'endedCallbacksForFired' );
        },

        //On the home screen if you touch an inactive screen thumbnail, it grows.  If then without lifting your finger you swipe over
        // to the next thumbnail, that one would grow.
        over: function( event ) {
          if ( event.pointer.isTouch ) {
            sim.screenIndex = index;
          }
        }
      } );

      options.tandem && options.tandem.createTandem( screen.tandemScreenName + 'SmallButton' ).addInstance( smallScreenButton );

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

    var center = new Node( { y: 170 } );
    homeScreenView.addChild( center );
    sim.screenIndexProperty.link( function( screenIndex ) {

      //Space the icons out more if there are fewer, so they will be spaced nicely
      //Cannot have only 1 screen because for 1-screen sims there is no home screen.
      var spacing = sim.screens.length === 2 ? 60 :
                    sim.screens.length === 3 ? 60 :
                    33;

      var icons = _.map( screenChildren, function( screenChild ) {return screenChild.index === screenIndex ? screenChild.large : screenChild.small;} );
      center.children = [ new HBox( { spacing: spacing, children: icons, align: 'top', resize: false } ) ];
      center.centerX = homeScreenView.layoutBounds.width / 2;
    } );

    //TODO joist#255 move these fill properties to LookAndFeel, chase down other places that they should be used
    var homeScreenFillProperty = new Property( 'black' );
    var homeScreenTextFillProperty = new Property( 'white' );
    this.phetButton = new PhetButton( sim, homeScreenFillProperty, homeScreenTextFillProperty, {
      tandem: options.tandem ? options.tandem.createTandem( 'phetButton' ) : null
    } );
    this.addChild( this.phetButton );

    if ( options.warningNode ) {
      var warningNode = options.warningNode;

      this.addChild( warningNode );
      warningNode.centerX = this.layoutBounds.centerX;
      warningNode.bottom = this.layoutBounds.maxY - 20;
    }
  }

  return inherit( ScreenView, HomeScreenView, {
      layoutWithScale: function( scale, width, height ) {
        HomeScreenView.prototype.layout.call( this, width, height );

        //Position the phetButton.
        //It is tricky since it is in the coordinate frame of the HomeScreenView (which is a ScreenView, and hence translated and scaled)
        //We want to match its location with the location in the NavigationBar
        this.phetButton.right = (width - PhetButton.HORIZONTAL_INSET) / scale;
        this.phetButton.bottom = (height - PhetButton.VERTICAL_INSET) / scale;

        //Undo the vertical centering done in ScreenView so the button can be positioned globally
        if ( scale === width / this.layoutBounds.width ) {
          this.phetButton.translate( 0, -(height - this.layoutBounds.height * scale) / 2 / scale );
        }

        //Undo the horizontal centering done in ScreenView so the button can be positioned globally
        else if ( scale === height / this.layoutBounds.height ) {
          this.phetButton.translate( -(width - this.layoutBounds.width * scale) / 2 / scale, 0 );
        }
      }
    },

    //statics
    {
      TITLE_FONT_FAMILY: TITLE_FONT_FAMILY,
      LAYOUT_BOUNDS: LAYOUT_BOUNDS
    }
  );
} );