// Copyright 2002-2013, University of Colorado Boulder

/**
 * Shows the home screen for a multi-tab simulation, which lets the user see all of the tabs and select one.
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
  var inherit = require( 'PHET_CORE/inherit' );
  var TabView = require( 'JOIST/TabView' );
  var Frame = require( 'JOIST/Frame' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var Highlight = require( 'JOIST/Highlight' );
  var Property = require( 'AXON/Property' );
  var ButtonListener = require( 'SCENERY/input/ButtonListener' );
  var FullScreenButton = require( 'JOIST/FullScreenButton' );

  var HEIGHT = 70;

  function HomeScreen( sim ) {
    var homeScreen = this;

    //Rendering in SVG seems to solve the problem that the home screen consumes 100% disk and crashes, see https://github.com/phetsims/joist/issues/17
    //Also makes it more responsive (and crisper on retina displays)
    TabView.call( this, {renderer: 'svg'} );

    this.backgroundColor = 'black';

    //iPad doesn't support Century Gothic, so fall back to Futura, see http://wordpress.org/support/topic/font-not-working-on-ipad-browser
    var title = new Text( sim.name, {fontSize: 52, fontFamily: 'Century Gothic, Futura', fill: 'white', y: 110, centerX: this.layoutBounds.width / 2} );
    this.addChild( title );

    //Keep track of which tab is highlighted so the same tab can remain highlighted even if nodes are replaced (say when one grows larger or smaller)
    var highlightedIndex = new Property( -1 );

    var tabChildren = _.map( sim.tabs, function( tab ) {
      var index = sim.tabs.indexOf( tab );
      var largeIcon = new Node( {children: [tab.icon], scale: HEIGHT / tab.icon.height * 2} );
      var largeIconWithFrame = new Node( {children: [new Frame( largeIcon ), largeIcon]} );
      var large = new VBox( {cursor: 'pointer', children: [
        largeIconWithFrame,
        new Text( tab.name, {fontSize: 42, fill: 'yellow'} )
      ]} );

      //TODO: Switch to buttonListener, but make sure you test it because on 7/17/2013 there is a problem where ButtonListener won't fire if a node has appeared under the pointer
      large.addInputListener( {
        down: function() {
          sim.simModel.showHomeScreen = false;
          highlightedIndex.value = -1;
        }
      } );

      var small = new VBox( {spacing: 3, cursor: 'pointer', children: [
        new Node( {opacity: 0.5, children: [tab.icon], scale: sim.tabs.length === 4 ? HEIGHT / tab.icon.height :
                                                              sim.tabs.length === 3 ? 1.25 * HEIGHT / tab.icon.height :
                                                              sim.tabs.length === 2 ? 1.75 * HEIGHT / tab.icon.height :
                                                              HEIGHT / tab.icon.height} ),
        new Text( tab.name, {fontSize: 18, fill: 'gray'} )
      ]} );
      small.mouseArea = small.bounds; //cover the gap in the vbox
      small.addInputListener( {
        down: function() { sim.simModel.tabIndex = index; },

        //On the home screen if you touch an inactive tab thumbnail, it grows.  If then without lifting your finger you swipe over
        // to the next thumbnail, that one would grow.
        over: function( event ) {
          if ( !event.pointer.isMouse ) {
            sim.simModel.tabIndex = index;
          }
        }
      } );

      var smallHighlight = Highlight.createHighlight( small.width + 6, small.height );
      smallHighlight.centerX = small.centerX;
      small.addChild( smallHighlight );
      var highlightListener = {
        over: function( event ) {
          if ( event.pointer.isMouse ) {
            highlightedIndex.value = index;
          }
        },
        out: function( event ) { if ( event.pointer.isMouse ) {highlightedIndex.value = -1;} }
      };
      highlightedIndex.valueEquals( index ).linkAttribute( smallHighlight, 'visible' );
      small.addInputListener( highlightListener );

      var largeHighlight = Highlight.createHighlight( large.width + 8, large.height );
      largeHighlight.centerX = large.centerX;
      highlightedIndex.valueEquals( index ).linkAttribute( largeHighlight, 'visible' );
      large.addChild( largeHighlight );
      large.addInputListener( highlightListener );
      large.mouseArea = large.bounds; //cover the gap in the vbox

      //TODO: Add accessibility peers
      //      tabChild.addPeer( '<input type="button" aria-label="' + tabChild.tab.name + '">', {click: function() {
//        var tab = tabChild.tab;
//        if ( sim.simModel.tabIndex === tab.index ) {
//          sim.simModel.showHomeScreen = false;
//        }
//        else {
//          sim.simModel.tabIndex = tab.index;
//        }
//      }} );
//    } );

      return {tab: tab, small: small, large: large, index: index};
    } );

    var center = new Node( {y: 170} );
    homeScreen.addChild( center );
    sim.simModel.tabIndexProperty.link( function( tabIndex ) {

      //Space the icons out more if there are fewer, so they will be spaced nicely
      //Cannot have only 1 tab because for 1-tab sims there is no home screen.
      var spacing = sim.tabs.length === 2 ? 60 :
                    sim.tabs.length === 3 ? 60 :
                    33;

      var icons = _.map( tabChildren, function( tabChild ) {return tabChild.index === tabIndex ? tabChild.large : tabChild.small;} );
      center.children = [new HBox( {spacing: spacing, children: icons, align: 'top'} )];
      center.centerX = homeScreen.layoutBounds.width / 2;
    } );

    var fullScreenButton = new FullScreenButton();
    var phetButton = new PhetButton( sim );
    this.addChild( new HBox( {spacing: 10, children: [fullScreenButton, phetButton], right: this.layoutBounds.maxX - 5, bottom: this.layoutBounds.maxY - 5} ) );
  }

  inherit( TabView, HomeScreen );

  return HomeScreen;
} );