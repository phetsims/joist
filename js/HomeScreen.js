// Copyright 2002-2013, University of Colorado Boulder

/**
 * Shows the home screen for a multi-screen simulation, which lets the user see all of the screens and select one.
 *
 * @author Sam Reid
 */
define( function( require ) {
  'use strict';

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
  var phetLogo = require( 'image!JOIST/phet-logo-short.svg' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );

  var HEIGHT = 70;

  function HomeScreen( sim ) {
    var homeScreen = this;

    //Rendering in SVG seems to solve the problem that the home screen consumes 100% disk and crashes, see https://github.com/phetsims/joist/issues/17
    //Also makes it more responsive (and crisper on retina displays)
    //Renderer must be specified here because the node is added directly to the scene (instead of to some other node that already has svg renderer
    ScreenView.call( this, {renderer: 'svg'} );

    this.backgroundColor = 'black';

    //iPad doesn't support Century Gothic, so fall back to Futura, see http://wordpress.org/support/topic/font-not-working-on-ipad-browser
    var title = new Text( sim.name, {
      font: new PhetFont( {size: 52, family: 'Century Gothic, Futura' } ),
      fill: 'white',
      y: 110,
      centerX: this.layoutBounds.width / 2} );
    this.addChild( title );

    //Keep track of which screen is highlighted so the same screen can remain highlighted even if nodes are replaced (say when one grows larger or smaller)
    var highlightedIndex = new Property( -1 );

    var screenChildren = _.map( sim.screens, function( screen ) {
      var index = sim.screens.indexOf( screen );
      var largeIcon = new Node( {children: [screen.homeScreenIcon], scale: HEIGHT / screen.homeScreenIcon.height * 2} );
      var frame = new Frame( largeIcon );

      highlightedIndex.link( function( highlightedIndex ) { frame.setHighlighted( highlightedIndex === index ); } );

      var largeIconWithFrame = new Node( {children: [ frame, largeIcon]} );
      var largeText = new Text( screen.name, { font: new PhetFont( 42 ), fill: 'yellow'} );

      //Shrink the text if it goes beyond the edge of the image
      if ( largeText.width > largeIconWithFrame.width ) {
        largeText.scale( largeIconWithFrame.width / largeText.width );
      }
      var large = new VBox( {
        //Don't resize the VBox or it will shift down when the border becomes thicker
        resize: false,

        cursor: 'pointer', children: [
          largeIconWithFrame,
          largeText
        ]} );

      //TODO: Switch to buttonListener, but make sure you test it because on 7/17/2013 there is a problem where ButtonListener won't fire if a node has appeared under the pointer
      large.addInputListener( {
        down: function() {
          sim.simModel.showHomeScreen = false;
          highlightedIndex.value = -1;
        }
      } );

      var smallIcon = new Node( {opacity: 0.5, children: [screen.homeScreenIcon], scale: sim.screens.length === 4 ? HEIGHT / screen.homeScreenIcon.height :
                                                                                         sim.screens.length === 3 ? 1.25 * HEIGHT / screen.homeScreenIcon.height :
                                                                                         sim.screens.length === 2 ? 1.75 * HEIGHT / screen.homeScreenIcon.height :
                                                                                         HEIGHT / screen.homeScreenIcon.height} );
      var smallText = new Text( screen.name, { font: new PhetFont( 18 ), fill: 'gray'} );

      //Shrink the text if it goes beyond the edge of the image
      if ( smallText.width > smallIcon.width ) {
        smallText.scale( smallIcon.width / smallText.width );
      }

      var small = new VBox( {spacing: 3, cursor: 'pointer', children: [
        smallIcon,
        smallText
      ]} );
      small.mouseArea = small.touchArea = Shape.bounds( small.bounds ); //cover the gap in the vbox
      small.addInputListener( {
        down: function() { sim.simModel.screenIndex = index; },

        //On the home screen if you touch an inactive screen thumbnail, it grows.  If then without lifting your finger you swipe over
        // to the next thumbnail, that one would grow.
        over: function( event ) {
          if ( !event.pointer.isMouse ) {
            sim.simModel.screenIndex = index;
          }
        }
      } );

      var highlightListener = {
        over: function( event ) {
          if ( event.pointer.isMouse ) {
            highlightedIndex.value = index;

            //TODO: use named children instead of child indices?
            small.children[0].opacity = 1;
            small.children[1].fill = 'white';
          }
        },
        out: function( event ) {
          if ( event.pointer.isMouse ) {
            highlightedIndex.value = -1;
            small.children[0].opacity = 0.5;
            small.children[1].fill = 'gray';
          }
        }
      };
      small.addInputListener( highlightListener );

      large.addInputListener( highlightListener );
      large.mouseArea = large.touchArea = Shape.bounds( large.bounds ); //cover the gap in the vbox

      //TODO: Add accessibility peers
      //      screenChild.addPeer( '<input type="button" aria-label="' + screenChild.screen.name + '">', {click: function() {
//        var screen = screenChild.screen;
//        if ( sim.simModel.screenIndex === screen.index ) {
//          sim.simModel.showHomeScreen = false;
//        }
//        else {
//          sim.simModel.screenIndex = screen.index;
//        }
//      }} );
//    } );

      return {screen: screen, small: small, large: large, index: index};
    } );

    var center = new Node( {y: 170} );
    homeScreen.addChild( center );
    sim.simModel.screenIndexProperty.link( function( screenIndex ) {

      //Space the icons out more if there are fewer, so they will be spaced nicely
      //Cannot have only 1 screen because for 1-screen sims there is no home screen.
      var spacing = sim.screens.length === 2 ? 60 :
                    sim.screens.length === 3 ? 60 :
                    33;

      var icons = _.map( screenChildren, function( screenChild ) {return screenChild.index === screenIndex ? screenChild.large : screenChild.small;} );
      center.children = [new HBox( {spacing: spacing, children: icons, align: 'top'} )];
      center.centerX = homeScreen.layoutBounds.width / 2;
    } );

    //Only show the full screen button on supported platforms
    var showFullScreenButton = !platform.android && !platform.mobileSafari && !platform.ie; // might work on IE11 in the future
    if ( showFullScreenButton && false ) {
      var fullScreenButton = new FullScreenButton();
      var phetButton = new PhetButton( sim );
      this.addChild( new HBox( {spacing: 10, children: [fullScreenButton, phetButton], right: this.layoutBounds.maxX - 5, bottom: this.layoutBounds.maxY - 5} ) );
    }
    else {
      this.addChild( new PhetButton( sim, false, {
        phetLogo: phetLogo,
        phetLogoScale: 0.4,
        optionsButtonVerticalMargin: 6} ).mutate( {
          right: this.layoutBounds.maxX - 5,
          bottom: this.layoutBounds.maxY - 5
        } ) );
    }
  }

  return inherit( ScreenView, HomeScreen );
} );
