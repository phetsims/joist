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
  var VBox = require( 'SCENERY/nodes/VBox' );
  var Text = require( 'SCENERY/nodes/Text' );
  var FontAwesomeNode = require( 'SUN/FontAwesomeNode' );
  var BoundsNode = require( 'SUN/BoundsNode' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var inherit = require( 'PHET_CORE/inherit' );
  var SimPopupMenu = require( 'JOIST/SimPopupMenu' );

  function NavigationBar( sim, tabs, model ) {
    var navigationBar = this;

    this.navBarHeight = 40;
    this.navBarScale = 1;
    this.navBarWidth = 768;

    Node.call( this, {renderer: 'svg'} );
    this.background = new Rectangle( 0, 0, 0, 0, {fill: 'black'} );
    this.addChild( this.background );

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
    var optionButtonPressed = function() {
      simPopupMenu.x = navigationBar.navBarWidth - simPopupMenu.width - 2;
      simPopupMenu.y = window.innerHeight - simPopupMenu.height - navigationBar.height / 2 + 4;
      var overlayScene = sim.createAndAddOverlay( simPopupMenu );
      overlayScene.addInputListener( {down: function() {
        sim.removeOverlay( overlayScene );
      }} );
    };

    // mousedown or touchstart (pointer pressed down over the node)
    optionsButton.addPeer( '<input type="button">', {click: optionButtonPressed, tabIndex: 101} );
    optionsButton.addInputListener( { down: optionButtonPressed } );

    this.phetLabelAndButton = new HBox( {spacing: 10, children: [phetLabel, optionsButton]} );
    this.addChild( this.phetLabelAndButton );

    var titleLabel = new Text( sim.name, {fontSize: 18, fill: 'white'} );

    //Create the nodes to be used for the tab icons
    var index = 0;
    var iconAndTextArray = _.map( tabs, function( tab ) {
      var icon = new Node( {children: [tab.icon], scale: 25 / tab.icon.height} );
      var text = new Text( tab.name, {fontSize: 10, fill: 'white', visible: true} );

      var listener = function() {
        model.tabIndex = tab.index;
        model.showHomeScreen = false;
      };
      icon.addPeer( '<input type="button">', {click: listener, tabIndex: 99} );

      var iconAndText = new VBox( {children: [icon, text], cursor: 'pointer'} );
      iconAndText.icon = icon;
      iconAndText.text = text;
      iconAndText.index = index++;
      iconAndText.tab = tab;
      iconAndText.addInputListener( { down: listener} );

      //On initialization and when the tab changes, update the size of the icons and the layout of the icons and text
      model.tabIndexProperty.link( function( tabIndex ) {
        var selected = iconAndText.index === tabIndex;
        iconAndText.text.fill = selected ? 'yellow' : 'white';
        iconAndText.opacity = selected ? 1.0 : 0.5;
      } );

      return iconAndText;
    } );

    //Add everything to the scene

    if ( tabs.length > 1 ) {
      for ( var i = 0; i < iconAndTextArray.length; i++ ) {
        this.addChild( iconAndTextArray[i] );
      }
    }
    this.addChild( titleLabel );

    //add the home icon
    this.homeIcon = new BoundsNode( new FontAwesomeNode( 'home', {fill: '#fff'} ), {cursor: 'pointer'} );
    this.homeIcon.addInputListener( {down: function() { model.showHomeScreen = true; }} );
    this.homeIcon.addPeer( '<input type="button">', {click: function() {model.showHomeScreen = true;}, tabIndex: 100} );
    if ( tabs.length > 1 ) {
      this.addChild( this.homeIcon );
    }

    this.relayout = function() {
      navigationBar.background.rectHeight = this.navBarHeight;
      navigationBar.background.rectWidth = this.navBarWidth;
      var tabIndex = navigationBar.tabIndex;

      //Update size and opacity of each icon
      var iconAndText = null;
      for ( var i = 0; i < iconAndTextArray.length; i++ ) {
        iconAndText = iconAndTextArray[i];
        iconAndText.invalidateBounds();
        iconAndText.setScaleMagnitude( this.navBarScale );
      }

      //Compute layout bounds
      var width = 0;
      for ( i = 0; i < iconAndTextArray.length; i++ ) {
        width = width + iconAndTextArray[i].width;
      }
      var spacing = 30;
      width = width + spacing * (iconAndTextArray.length - 1);

      titleLabel.setScaleMagnitude( this.navBarScale );
      titleLabel.centerY = this.navBarHeight / 2;
      titleLabel.left = 10;

      //Lay out the components from left to right
      //TODO: Icons should be spaced equally
      if ( tabs.length !== 1 ) {

        //put the center right in the middle
        var x = this.navBarWidth / 2 - width / 2;

        for ( i = 0; i < iconAndTextArray.length; i++ ) {
          iconAndText = iconAndTextArray[i];
          iconAndText.x = x;
          iconAndText.y = verticalPadding;
          x += iconAndText.width + spacing;
        }
        navigationBar.homeIcon.setScaleMagnitude( this.navBarScale );
        navigationBar.homeIcon.centerY = this.navBarHeight / 2;
        navigationBar.homeIcon.left = x + 15;
      }
      this.phetLabelAndButton.setScaleMagnitude( this.navBarScale );
      this.phetLabelAndButton.right = this.navBarWidth - 5;
      this.phetLabelAndButton.centerY = this.navBarHeight / 2;
    };

    this.layout = function( scale, width, height, windowHeight ) {
      this.navBarScale = scale;
      this.navBarWidth = width;
      this.navBarHeight = height;
      this.relayout();
    };
  }

  inherit( Node, NavigationBar );

  return NavigationBar;
} );
