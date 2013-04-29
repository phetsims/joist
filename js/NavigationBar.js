// Copyright 2013, University of Colorado

/**
 * The navigation bar at the bottom of the screen.
 * For a single-tab sim, it shows the name of the sim at the left and the PhET Logo and options menu at the right.
 * For a multi-tab sim, it shows icons for all of the other tabs, with the tab name at the left and the PhET Logo and options menu at the right.
 *
 * @author Sam Reid
 */
define( function( require ) {
  "use strict";

  var Node = require( 'SCENERY/nodes/Node' );
  var HBox = require( 'SCENERY/nodes/HBox' );
  var Text = require( 'SCENERY/nodes/Text' );
  var AccessibilityPeer = require( 'SCENERY/util/AccessibilityPeer' );
  var FontAwesomeNode = require( 'SUN/FontAwesomeNode' );
  var BoundsNode = require( 'SUN/BoundsNode' );
  var Layout = require( 'JOIST/Layout' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var inherit = require( 'PHET_CORE/inherit' );
  var SimPopupMenu = require( 'JOIST/SimPopupMenu' );

  function NavigationBar( sim, tabs, model ) {
    var navigationBar = this;
    Node.call( this, {renderer: 'svg'} );

    //Space between the icons and the bottom of the play area
    var verticalPadding = 2;

    var fontSize = 36;

    //Create the text labels once because in this version of Scenery (4/18/2013) they are expensive to create because they must be accurately sized.
    this.textLabel = new Node();
    var phetLabel = new Text( "PhET", {fontSize: fontSize, fill: 'yellow'} );
    this.addChild( this.textLabel );
    var optionsButton = new BoundsNode( new FontAwesomeNode( 'reorder', {fill: '#fff'} ), {cursor: 'pointer'} );

    //Creating the popup menu dynamically (when needed) causes a temporary black screen on the iPad (perhaps because of canvas accurate text bounds)
    var simPopupMenu = new SimPopupMenu( sim );
    optionsButton.addInputListener( {
                                      // mousedown or touchstart (pointer pressed down over the node)
                                      down: function( event ) {
                                        simPopupMenu.x = navigationBar.navBarWidth - simPopupMenu.width - 2;
                                        simPopupMenu.y = window.innerHeight - simPopupMenu.height - navigationBar.height / 2 + 4;
                                        var overlayScene = sim.createAndAddOverlay( simPopupMenu );
                                        overlayScene.addInputListener( {down: function() {
                                          sim.removeOverlay( overlayScene );
                                        }} );
                                      }
                                    } );

    this.phetLabelAndButton = new HBox( {spacing: 10, children: [phetLabel, optionsButton]} );
    this.addChild( this.phetLabelAndButton );

    //Create the nodes to be used for the tab icons
    var index = 0;
    var tabChildren = _.map( tabs, function( tab ) {
      tab.index = index++;
      var child = new Node( {children: [tab.icon], cursor: 'pointer'} );
      child.tab = tab;
      child.scale( (100 - verticalPadding * 2) / child.tab.icon.height );

      var textLabel = new Text( tab.name, {fontSize: 26, fill: 'black'} );
      var outline = new Rectangle( 0, 0, textLabel.width + 10, textLabel.height + 10, 10, 10, {fill: 'white'} );
      textLabel.centerX = outline.width / 2;
      textLabel.centerY = outline.height / 2;
      outline.addChild( textLabel );

      child.largeTextLabel = outline;
      child.smallTextLabel = new Text( tab.name, {fontSize: 10, fill: 'white', visible: true} );

      child.addInputListener( { down: function() {
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
        this.addChild( tabChildren[i].smallTextLabel );
      }
    }
    else if ( tabs.length == 1 ) {
      this.addChild( tabChildren[0].largeTextLabel );
    }

    //add the home icon
    this.homeIcon = new BoundsNode( new FontAwesomeNode( 'home', {fill: '#fff'} ), {cursor: 'pointer'} );
    console.log( 'b', this.homeIcon.getBounds() );
    this.homeIcon.addInputListener( {down: function() { model.showHomeScreen = true; }} );
    this.homeIcon.accessibilityPeer = new AccessibilityPeer( this.homeIcon, '<input type="button">', {click: function() {model.showHomeScreen = true;}} );
    if ( tabs.length > 1 ) {
      this.addChild( this.homeIcon );
    }

    this.navBarHeight = 40;
    this.navBarScale = 1;
    this.navBarWidth = 768;

    this.relayout = function() {
      var height = this.navBarHeight;
      console.log( height );
      var tabIndex = navigationBar.tabIndex;
      //Update size and opacity of each icon
      var selectedChild = null;
      for ( var i = 0; i < tabChildren.length; i++ ) {
        var child = tabChildren[i];
        child.invalidateBounds();
        var selected = tabIndex === child.tab.index;
        child.selected = selected;
        child.opacity = selected ? 1 : 0.5;
        child.resetTransform();
        var tabScale = selected ? (height - verticalPadding * 2) / child.tab.icon.height : (height - verticalPadding * 2) / child.tab.icon.height * 0.75;
        child.scale( tabScale );
        child.largeTextLabel.visible = selected;
        if ( selected ) {
          selectedChild = child;
        }
        child.smallTextLabel.setScaleMagnitude( this.navBarScale );
      }

      //Compute layout bounds
      var width = 0;
      for ( var i = 0; i < tabChildren.length; i++ ) {
        var child = tabChildren[i];
        width = width + child.width;
      }
      var spacing = 10;
      width = width + spacing * (tabChildren.length - 1);

      selectedChild.largeTextLabel.setScaleMagnitude( this.navBarScale );
      selectedChild.largeTextLabel.centerY = this.navBarHeight / 2;

      //Lay out the components from left to right
      if ( tabs.length == 1 ) {
        selectedChild.largeTextLabel.left = 15;
      }
      else {

        //put the center right in the middle
        var x = this.navBarWidth / 2 - width / 2;
        selectedChild.largeTextLabel.right = x - 25;

        for ( var i = 0; i < tabChildren.length; i++ ) {
          var child = tabChildren[i];
          child.x = x;
          child.y = verticalPadding;
          child.smallTextLabel.visible = (selectedChild !== child);
          if ( child !== selectedChild ) {
            child.smallTextLabel.x = child.x;
            child.smallTextLabel.top = child.bottom - 1;
          }
          x += child.width + spacing;
        }
        navigationBar.homeIcon.setScaleMagnitude( this.navBarScale );
        navigationBar.homeIcon.centerY = this.navBarHeight / 2;
        navigationBar.homeIcon.left = x + 15;
      }
      this.phetLabelAndButton.setScaleMagnitude( this.navBarScale );
      this.phetLabelAndButton.right = this.navBarWidth - 5;
      this.phetLabelAndButton.centerY = this.navBarHeight / 2;
    };

    this.layout = function( scale, width, height ) {
      this.navBarScale = scale;
      this.navBarWidth = width;
      this.navBarHeight = height;
      navigationBar.relayout();
    };

    //On initialization and when the tab changes, update the size of the icons and the layout of the icons and text
    model.link( 'tabIndex', function( tabIndex ) {
      navigationBar.tabIndex = tabIndex;
      navigationBar.relayout();
    } );
  }

  inherit( NavigationBar, Node );

  return NavigationBar;
} );