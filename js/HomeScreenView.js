// Copyright 2002-2013, University of Colorado Boulder

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
  var platform = require( 'PHET_CORE/platform' );
  var ScreenView = require( 'JOIST/ScreenView' );
  var Frame = require( 'JOIST/Frame' );
  var Property = require( 'AXON/Property' );
  var FullScreenButton = require( 'JOIST/FullScreenButton' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var Bounds2 = require( 'DOT/Bounds2' );
  var AdaptedFromPhETText = require( 'JOIST/AdaptedFromPhETText' );
  var Brand = require( 'BRAND/Brand' );
  var Input = require( 'SCENERY/input/Input' );

  // constants
  var HEIGHT = 70; //TODO what is this? is it the height of large icons?
  var TITLE_FONT_FAMILY = 'Century Gothic, Futura';
  var LAYOUT_BOUNDS = new Bounds2( 0, 0, 768, 504 );

  function HomeScreenView( sim, options ) {
    var homeScreenView = this;

    options = _.extend( {
      showSmallHomeScreenIconFrame: false,
      warningNode: null // {Node | null}, to display below the icons as a warning if available
    }, options );

    //Rendering in SVG seems to solve the problem that the home screen consumes 100% disk and crashes, see https://github.com/phetsims/joist/issues/17
    //Also makes it more responsive (and crisper on retina displays)
    //Renderer must be specified here because the node is added directly to the scene (instead of to some other node that already has svg renderer
    ScreenView.call( this, { layoutBounds: LAYOUT_BOUNDS } );

    this.backgroundColor = 'black';

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

      //TODO: Switch to buttonListener, but make sure you test it because on 7/17/2013 there is a problem where
      // ButtonListener won't fire if a node has appeared under the pointer
      largeScreenButton.addInputListener( {
        down: function() {
          var messageIndex = arch && arch.start( 'user', sim.screens[ index ].homeScreenButtonComponentID, 'fired' );
          sim.showHomeScreen = false;
          highlightedScreenIndexProperty.value = -1;
          arch && arch.end( messageIndex );
        }
      } );

      // TODO: Switch to button listener--this will also clean up the keyboard accessibility
      largeScreenButton.addInputListener( {
        keydown: function( event ) {
          var keyCode = event.domEvent.keyCode;
          if ( keyCode === Input.KEY_ENTER || keyCode === Input.KEY_SPACE ) {
            sim.showHomeScreen = false;
            highlightedScreenIndexProperty.value = -1;

            // TODO: A way to automatically move focus
            // TODO: Need a way to provide overview descriptive text.  Perhaps a focusable for the entire screen?
            Input.focusedTrailProperty.value = Input.getAllFocusableTrails()[ 0 ];
          }
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
          sim.screenIndex = index;
        },

        //On the home screen if you touch an inactive screen thumbnail, it grows.  If then without lifting your finger you swipe over
        // to the next thumbnail, that one would grow.
        over: function( event ) {
          if ( event.pointer.isTouch ) {
            sim.screenIndex = index;
          }
        }
      } );

      smallScreenButton.addInputListener( {
        keydown: function( event ) {
          var keyCode = event.domEvent.keyCode;
          if ( keyCode === Input.KEY_ENTER || keyCode === Input.KEY_SPACE ) {
            sim.screenIndex = index;
            sim.showHomeScreen = false;
            highlightedScreenIndexProperty.value = -1;

            // TODO: A way to automatically move focus
            // TODO: Need a way to provide overview descriptive text.  Perhaps a focusable for the entire screen?
            Input.focusedTrailProperty.value = Input.getAllFocusableTrails()[ 0 ];
          }
        }
      } );

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

    //Only show the full screen button on supported platforms
    var showFullScreenButton = !platform.android && !platform.mobileSafari && !platform.ie; // might work on IE11 in the future
    if ( showFullScreenButton && false ) {
      var fullScreenButton = new FullScreenButton();
      this.addChild( new HBox( {
        spacing: 10,
        children: [ fullScreenButton, new PhetButton( sim ) ],
        right: this.layoutBounds.maxX - 5,
        bottom: this.layoutBounds.maxY - 5
      } ) );
    }
    else {
      this.phetButton = new PhetButton( sim, { componentID: 'homeScreen.phetButton' } );
      this.addChild( this.phetButton );
    }

    // if the branding specifies to show "adapted from PhET" in the navbar, show it here
    if ( Brand.adaptedFromPhET === true ) {
      this.adaptedFromText = new AdaptedFromPhETText( new Property( false ) );
      this.addChild( this.adaptedFromText );
    }

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

        if ( this.adaptedFromText ) {
          this.adaptedFromText.updateLayout( 1, this.phetButton );
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