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
  var Path = require( 'SCENERY/nodes/Path' );
  var HBox = require( 'SCENERY/nodes/HBox' );
  var VBox = require( 'SCENERY/nodes/VBox' );
  var Text = require( 'SCENERY/nodes/Text' );
  var FontAwesomeNode = require( 'SUN/FontAwesomeNode' );
  var PanelNode = require( 'SUN/PanelNode' );
  var BoundsNode = require( 'SUN/BoundsNode' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var inherit = require( 'PHET_CORE/inherit' );
  var SimPopupMenu = require( 'JOIST/SimPopupMenu' );
  var Font = require( 'SCENERY/util/Font' );
  var Shape = require( 'KITE/Shape' );
  var LinearGradient = require( 'SCENERY/util/LinearGradient' );

  var createHighlight = function( width, height ) {
    var leftBar = new Path( {shape: Shape.lineSegment( 0, 0, 0, height ), lineWidth: 1, stroke: new LinearGradient( 0, 0, 0, height ).addColorStop( 0, 'black' ).addColorStop( 0.5, 'white' ).addColorStop( 1, 'black' ) } );
    var rightBar = new Path( {shape: Shape.lineSegment( width, 0, width, height ), lineWidth: 1, stroke: new LinearGradient( 0, 0, 0, height ).addColorStop( 0, 'black' ).addColorStop( 0.5, 'white' ).addColorStop( 1, 'black' ) } );
    return new Node( {children: [leftBar, rightBar], visible: false} );
  };

  var createHighlightListener = function( node ) {
    return {//Highlight a button when mousing over it
      over: function( event ) { if ( event.pointer.isMouse ) {node.visible = true;} },
      out: function( event ) { if ( event.pointer.isMouse ) {node.visible = false;} }
    };
  };

  /**
   * Create a nav bar.  Layout assumes all of the tab widths are the same.
   * @param sim
   * @param tabs
   * @param model
   * @constructor
   */
  function NavigationBar( sim, tabs, model ) {
    var navigationBar = this;
    this.tabs = tabs;

    this.navBarHeight = 40;
    this.navBarScale = 1;
    this.navBarWidth = 768;

    Node.call( this, {renderer: 'svg'} );
    this.background = new Rectangle( 0, 0, 0, 0, {fill: 'black'} );
    this.addChild( this.background );

    var fontSize = 36;

    var phetLabel = new Text( "PhET", {fontSize: fontSize, fill: 'yellow'} );
    var optionsButton = new BoundsNode( new FontAwesomeNode( 'reorder', {fill: '#fff'} ), {cursor: 'pointer'} );

    var optionsHighlight = createHighlight( optionsButton.width + 6, optionsButton.height + 5 );
    optionsHighlight.bottom = optionsButton.bottom + 3;
    optionsHighlight.x = -3;
    optionsButton.addChild( optionsHighlight );

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
    optionsButton.addInputListener( { down: optionButtonPressed} );
    optionsButton.addInputListener( createHighlightListener( optionsHighlight ) );

    this.phetLabelAndButton = new HBox( {spacing: 10, children: [phetLabel, optionsButton]} );
    this.addChild( this.phetLabelAndButton );

    this.titleLabel = new Text( sim.name, {fontSize: 18, fill: 'white'} );

    //Create the nodes to be used for the tab icons
    var index = 0;

    var selectedFont = new Font( { size: 10, weight: 'bold'} );
    var normalFont = new Font( { size: 10 } );

    this.addChild( this.titleLabel );

    if ( tabs.length > 1 ) {

      var iconAndTextArray = _.map( tabs, function( tab ) {
        var icon = new Node( {children: [tab.icon], scale: 25 / tab.icon.height} );
        var text = new Text( tab.name, { fill: 'white', visible: true} );

        //Put a panel around it to extend it horizontally so there is some distance from the highlight region to the text and some distance between adjacent texts.
        var textPanel = new PanelNode( text, {
          fill: null,
          stroke: null,
          lineWidth: 1, // width of the background border
          xMargin: 4,
          yMargin: 0,
          cornerRadius: 0, // radius of the rounded corners on the background
          resize: false // dynamically resize when content bounds change?
        } );
        var iconAndText = new VBox( {children: [icon, textPanel]} );
        iconAndText.icon = icon;
        iconAndText.text = text;
        iconAndText.textPanel = textPanel;
        iconAndText.index = index++;
        iconAndText.tab = tab;

        //On initialization and when the tab changes, update the size of the icons and the layout of the icons and text
        model.tabIndexProperty.link( function( tabIndex ) {
          var selected = iconAndText.index === tabIndex;
          iconAndText.text.fill = selected ? 'yellow' : 'white';
          iconAndText.text.font = selected ? selectedFont : normalFont;
          iconAndText.opacity = selected ? 1.0 : 0.5;
        } );

        return iconAndText;
      } );

      //Make all of the icons the same size so they will have equal hit areas and equal spacing
      var maxWidth = _.max( iconAndTextArray,function( iconAndText ) {return iconAndText.width;} ).width;
      var maxHeight = _.max( iconAndTextArray,function( iconAndText ) {return iconAndText.height;} ).height;

      this.buttonArray = iconAndTextArray.map( function( iconAndText ) {
        //Background area for layout and hit region
        var rectangle = new Rectangle( 0, 0, maxWidth, maxHeight );
        var highlight = createHighlight( maxWidth, maxHeight );
        iconAndText.centerX = maxWidth / 2;
        iconAndText.top = 0;
        var button = new Node( {children: [ rectangle, highlight, iconAndText]} );

        //In the nav bar, don't show highlight or cursor pointer when over a tab icon that is already selected
        model.tabIndexProperty.link( function( tabIndex ) { button.cursor = tabIndex === iconAndText.index ? 'default' : 'pointer'; } );

        var pressListener = function() {
          model.tabIndex = iconAndText.index;
          model.showHomeScreen = false;
        };
        button.addInputListener( {
          down: pressListener,

          //Highlight a button when mousing over it
          over: function( event ) {
            if ( event.pointer.isMouse ) {
              highlight.visible = model.tabIndex !== iconAndText.index;
            }
          },
          out: function( event ) {
            if ( event.pointer.isMouse ) {
              highlight.visible = false;
            }
          }
        } );

        button.addPeer( '<input type="button">', {click: pressListener, tabIndex: 99} );
        return  button;
      } );

      //TODO: This spacing is not always necessary, it depends on the relative width
      //TODO:   of the icon vs the text, if all of the buttons have the same dimensions.
      //TODO:   Currently this solves the simple case where all of the text is shorter than all of the icons (like in Build an Atom)
      var maxIconWidth = _.max( iconAndTextArray,function( i ) {return i.icon.width;} ).icon.width;
      var maxButtonWidth = _.max( iconAndTextArray,function( i ) {return i.width;} ).width;

      this.buttonHBox = new HBox( {spacing: maxIconWidth === maxButtonWidth ? 20 : 5, children: this.buttonArray} );
      this.addChild( this.buttonHBox );

      //add the home icon
      this.homeIcon = new BoundsNode( new FontAwesomeNode( 'home', {fill: '#fff'} ), {cursor: 'pointer'} );
      var homeHighlight = createHighlight( this.homeIcon.width + 6, this.homeIcon.height + 5 );
      homeHighlight.bottom = this.homeIcon.bottom + 3;
      homeHighlight.x = -3;
      this.homeIcon.addChild( homeHighlight );
      this.homeIcon.addInputListener( { down: function() { model.showHomeScreen = true; }} );
      this.homeIcon.addInputListener( createHighlightListener( homeHighlight ) );
      this.homeIcon.addPeer( '<input type="button">', {click: function() {model.showHomeScreen = true;}, tabIndex: 100} );
      this.addChild( this.homeIcon );
    }
  }

  inherit( Node, NavigationBar, {relayout: function() {
    var navigationBar = this;
    navigationBar.background.rectHeight = this.navBarHeight;
    navigationBar.background.rectWidth = this.navBarWidth;
    var tabIndex = navigationBar.tabIndex;

    if ( this.buttonHBox ) {
      this.buttonHBox.setScaleMagnitude( navigationBar.navBarScale );
    }

    this.titleLabel.setScaleMagnitude( this.navBarScale );
    this.titleLabel.centerY = this.navBarHeight / 2;
    this.titleLabel.left = 10;

    //Lay out the components from left to right
    if ( this.tabs.length !== 1 ) {

      //put the center right in the middle
      this.buttonHBox.centerX = this.navBarWidth / 2;
      this.buttonHBox.top = 2;

      navigationBar.homeIcon.setScaleMagnitude( this.navBarScale );
      navigationBar.homeIcon.bottom = this.navBarHeight;
      navigationBar.homeIcon.left = navigationBar.buttonHBox.right + 15;
    }
    this.phetLabelAndButton.setScaleMagnitude( this.navBarScale );
    this.phetLabelAndButton.right = this.navBarWidth - 5;
    this.phetLabelAndButton.centerY = this.navBarHeight / 2;
  },
    layout: function( scale, width, height, windowHeight ) {
      this.navBarScale = scale;
      this.navBarWidth = width;
      this.navBarHeight = height;
      this.relayout();
    }} );

  return NavigationBar;
} );
