// Copyright 2013, University of Colorado

/**
 * The navigation bar at the bottom of the screen.
 * For a single-tab sim, it shows the name of the sim at the left and the PhET Logo and options menu at the right.
 * For a multi-tab sim, it shows icons for all of the other tabs, with the tab name at the left and the PhET Logo and options menu at the right.
 *
 * @author Sam Reid
 */
define( function ( require ) {
  "use strict";

  var Node = require( 'SCENERY/nodes/Node' );
  var HBox = require( 'SCENERY/nodes/HBox' );
  var Text = require( 'SCENERY/nodes/Text' );
  var FontAwesomeNode = require( 'SUN/FontAwesomeNode' );
  var BoundsNode = require( 'SUN/BoundsNode' );
  var Layout = require( 'JOIST/Layout' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var inherit = require( 'PHET_CORE/inherit' );
  var SimPopupMenu = require( 'JOIST/SimPopupMenu' );

  function NavigationBar( tabs, model ) {
    var navigationBar = this;
    Node.call( this );

    //Space between the icons and the bottom of the play area
    var verticalPadding = 2;

    //Vertical height of the nav bar
    var height = Layout.navBarHeight;

    var fontSize = 36;

    var background = new Rectangle( -Layout.width, 0, Layout.width * 3, height, {fill: 'black'} );
    this.addChild( background );

    //Create the text labels once because in this version of Scenery (4/18/2013) they are expensive to create because they must be accurately sized.
    this.textLabel = new Node();
    var phetLabel = new Text( "PhET", {fontSize: fontSize, fill: 'yellow'} );
    this.addChild( this.textLabel );
    var optionsButton = new BoundsNode( new FontAwesomeNode( 'reorder', {fill: '#fff'} ), {cursor: 'pointer'} );

    //Creating the popup menu dynamically (when needed) causes a temporary black screen on the iPad (perhaps because of canvas accurate text bounds)
    var simPopupMenu = new SimPopupMenu();
    optionsButton.addInputListener( {
                                      // mousedown or touchstart (pointer pressed down over the node)
                                      down: function ( event ) {
                                        var optionsButtonBounds = navigationBar.parents[0].boundsOf( optionsButton );
                                        var overlay = new Rectangle( -1000, -1000, 3000, 3000, {fill: 'black', opacity: 0.5} );
                                        var listener = { down: function () {
                                          overlay.detach();
                                          simPopupMenu.detach();
                                        } };
                                        overlay.addInputListener( listener );
                                        simPopupMenu.addInputListener( listener );

                                        simPopupMenu.right = optionsButtonBounds.maxX;
                                        simPopupMenu.bottom = optionsButtonBounds.minY;
                                        console.log( "rb", simPopupMenu.right, simPopupMenu.bottom );
                                        navigationBar.parents[0].addChild( overlay );
                                        navigationBar.parents[0].addChild( simPopupMenu );
                                      }
                                    } );

    this.addChild( new HBox( {spacing: 10, children: [phetLabel, optionsButton]} ).mutate( {right: Layout.width - 5, centerY: height / 2} ) );

    //Create the nodes to be used for the tab icons
    var index = 0;
    var tabChildren = _.map( tabs, function ( tab ) {
      tab.index = index++;
      var child = new Node( {children: [tab.icon], cursor: 'pointer'} );
      child.tab = tab;
      child.scale( (height - verticalPadding * 2) / child.tab.icon.height );

      var textLabel = new Text( tab.name, {fontSize: 32, fill: 'black'} );
      var outline = new Rectangle( 0, 0, textLabel.width + 10, textLabel.height + 10, 10, 10, {fill: 'white'} );
      textLabel.centerX = outline.width / 2;
      textLabel.centerY = outline.height / 2;
      outline.addChild( textLabel );

      child.largeTextLabel = outline;
      child.addInputListener( { down: function () {
        model.tabIndex = tab.index;
        model.showHomeScreen = false;
      }} );
      return child;
    } );

    //Add everything to the scene

    if ( tabs.length > 1 ) {
      for ( var i = 0; i < tabChildren.length; i++ ) {
        this.addChild( tabChildren[i] );
        this.addChild( tabChildren[i].largeTextLabel );
      }
    }
    else if ( tabs.length == 1 ) {
      this.addChild( tabChildren[0].largeTextLabel );
    }

    //add the home icon
    this.homeIcon = new BoundsNode( new FontAwesomeNode( 'home', {fill: '#fff'} ), {cursor: 'pointer'} ).mutate( {centerY: height / 2 } );
    this.homeIcon.addInputListener( {down: function () { model.showHomeScreen = true; }} );
    if ( tabs.length > 1 ) {
      this.addChild( this.homeIcon );
    }

    //On initialization and when the tab changes, update the size of the icons and the layout of the icons and text
    model.link( 'tabIndex', function ( tabIndex ) {

      //Update size and opacity of each icon
      var selectedChild = null;
      for ( var i = 0; i < tabChildren.length; i++ ) {
        var child = tabChildren[i];
        child.invalidateBounds();
        var selected = tabIndex === child.tab.index;
        child.selected = selected;
        child.opacity = selected ? 1 : 0.5;
        child.resetTransform();
        child.scale( selected ? (height - verticalPadding * 2) / child.tab.icon.height : (height - verticalPadding * 2) / child.tab.icon.height * 0.75 );
        child.largeTextLabel.visible = selected;
        if ( selected ) {
          selectedChild = child;
        }
      }

      //Compute layout bounds
      var width = 0;
      for ( var i = 0; i < tabChildren.length; i++ ) {
        var child = tabChildren[i];
        width = width + child.width;
      }
      var spacing = 10;
      width = width + spacing * (tabChildren.length - 1);

      //Lay out the components from left to right
      if ( tabs.length == 1 ) {
        selectedChild.largeTextLabel.left = 15;
      }
      else {
        var x = Layout.width / 2 - width / 2;
        selectedChild.largeTextLabel.right = x - 25;
        selectedChild.largeTextLabel.top = 0;
        for ( var i = 0; i < tabChildren.length; i++ ) {
          var child = tabChildren[i];
          child.x = x;
          child.y = verticalPadding;
          x += child.width + spacing;
        }
        navigationBar.homeIcon.left = x + 15;
      }
    } );
  }

  inherit( NavigationBar, Node );

  return NavigationBar;
} );