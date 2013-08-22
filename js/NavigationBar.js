// Copyright 2002-2013, University of Colorado Boulder

/**
 * The navigation bar at the bottom of the screen.
 * For a single-screen sim, it shows the name of the sim at the left and the PhET Logo and options menu at the right.
 * For a multi-screen sim, it shows icons for all of the other screens, with the screen name at the left and the PhET Logo and options menu at the right.
 *
 * @author Sam Reid
 */
define( function( require ) {
  'use strict';

  var Node = require( 'SCENERY/nodes/Node' );
  var Path = require( 'SCENERY/nodes/Path' );
  var HBox = require( 'SCENERY/nodes/HBox' );
  var VBox = require( 'SCENERY/nodes/VBox' );
  var Text = require( 'SCENERY/nodes/Text' );
  var FontAwesomeNode = require( 'SUN/FontAwesomeNode' );
  var Panel = require( 'SUN/Panel' );
  var HomeButton = require( 'SCENERY_PHET/HomeButton' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var inherit = require( 'PHET_CORE/inherit' );
  var PhetMenu = require( 'JOIST/PhetMenu' );
  var Font = require( 'SCENERY/util/Font' );
  var Shape = require( 'KITE/Shape' );
  var LinearGradient = require( 'SCENERY/util/LinearGradient' );
  var PhetButton = require( 'JOIST/PhetButton' );
  var ButtonListener = require( 'SCENERY/input/ButtonListener' );
  var Highlight = require( 'JOIST/Highlight' );

  /**
   * Create a nav bar.  Layout assumes all of the screen widths are the same.
   * @param {Sim} sim
   * @param {Array<Screen>} screens
   * @param {PropertySet} model see joist.Sim
   * @constructor
   */
  function NavigationBar( sim, screens, model ) {
    this.screens = screens;

    this.navBarHeight = 40;
    this.navBarScale = 1;
    this.navBarWidth = 768;

    Node.call( this, {renderer: 'svg'} );
    this.background = new Rectangle( 0, 0, 0, 0, {fill: 'black'} );
    this.addChild( this.background );

    this.hbox = new PhetButton( sim );
    this.addChild( this.hbox );

    this.titleLabel = new Text( sim.name, {fontSize: 18, fill: 'white'} );

    //Create the nodes to be used for the screen icons
    var index = 0;

    var selectedFont = new Font( { size: 10, weight: 'bold'} );
    var normalFont = new Font( { size: 10 } );

    this.addChild( this.titleLabel );

    if ( screens.length > 1 ) {

      var iconAndTextArray = _.map( screens, function( screen ) {
        var icon = new Node( {children: [screen.icon], scale: 25 / screen.icon.height} );
        var text = new Text( screen.name, { fill: 'white', visible: true} );

        //Put a panel around it to extend it horizontally so there is some distance from the highlight region to the text and some distance between adjacent texts.
        var textPanel = new Panel( text, {
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
        iconAndText.screen = screen;

        //On initialization and when the screen changes, update the size of the icons and the layout of the icons and text
        model.screenIndexProperty.link( function( screenIndex ) {
          var selected = iconAndText.index === screenIndex;
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
        var highlight = Highlight.createHighlight( maxWidth, maxHeight );
        iconAndText.centerX = maxWidth / 2;
        iconAndText.top = 0;
        var button = new Node( {children: [ rectangle, highlight, iconAndText]} );

        //In the nav bar, don't show highlight or cursor pointer when over a screen icon that is already selected
        model.screenIndexProperty.link( function( screenIndex ) { button.cursor = screenIndex === iconAndText.index ? 'default' : 'pointer'; } );

        var pressListener = function() {
          model.screenIndex = iconAndText.index;
          model.showHomeScreen = false;
        };
        button.addInputListener( new ButtonListener( {fire: pressListener} ) );

        //TODO: Move the over/out listener into ButtonListener when it is working better. Currently 'out' is not being fired
        button.addInputListener( {
          //Highlight a button when mousing over it
          over: function( event ) {
            if ( event.pointer.isMouse ) {
              highlight.visible = true;
            }
          },
          out: function( event ) {
            if ( event.pointer.isMouse ) {
              highlight.visible = false;
            }
          }
        } );

        button.addPeer( '<input type="button" aria-label="Switch to the ' + iconAndText.screen.name + ' screen">', {click: pressListener, tabIndex: 99} );
        return  button;
      } );

      //TODO: This spacing is not always necessary, it depends on the relative width
      //TODO:   of the icon vs the text, if all of the buttons have the same dimensions.
      //TODO:   Currently this solves the simple case where all of the text is shorter than all of the icons (like in Build an Atom)
      //TODO: A better strategy may be to use a linear function to space them based on how far it is from the criterion maxTextWidth<=maxIconWidth+2
      //See Joist #28 https://github.com/phetsims/joist/issues/28
      var maxIconWidth = _.max( iconAndTextArray,function( i ) {return i.icon.width;} ).icon.width;
      var maxTextWidth = _.max( iconAndTextArray,function( i ) {return i.text.width;} ).text.width;

      this.buttonHBox = new HBox( {spacing: maxTextWidth <= maxIconWidth + 2 ? 20 : 0, children: this.buttonArray} );
      this.addChild( this.buttonHBox );

      //add the home icon
      this.homeIcon = new HomeButton();
      var homeHighlight = Highlight.createHighlight( this.homeIcon.width + 10, this.homeIcon.height + 5 );
      homeHighlight.bottom = this.homeIcon.bottom + 3;
      homeHighlight.x = -5;
      this.homeIcon.addChild( homeHighlight );

      //Hide the highlight on the home icon if the home icon is pressed
      model.showHomeScreenProperty.link( function( showHomeScreen ) { if ( showHomeScreen ) { homeHighlight.visible = false; } } );
      this.homeIcon.addInputListener( { down: function() { model.showHomeScreen = true; }} );
      this.homeIcon.addInputListener( Highlight.createHighlightListener( homeHighlight ) );
      this.homeIcon.addPeer( '<input type="button" aria-label="Home Screen">', {click: function() {model.showHomeScreen = true;}, tabIndex: 100} );
      this.addChild( this.homeIcon );
    }
  }

  return inherit( Node, NavigationBar, {
    relayout: function() {
      var navigationBar = this;
      navigationBar.background.rectHeight = this.navBarHeight;
      navigationBar.background.rectWidth = this.navBarWidth;
      var screenIndex = navigationBar.screenIndex;

      if ( this.buttonHBox ) {
        this.buttonHBox.setScaleMagnitude( navigationBar.navBarScale );
      }

      this.titleLabel.setScaleMagnitude( this.navBarScale );
      this.titleLabel.centerY = this.navBarHeight / 2;
      this.titleLabel.left = 10;

      //Lay out the components from left to right
      if ( this.screens.length !== 1 ) {

        //put the center right in the middle
        this.buttonHBox.centerX = this.navBarWidth / 2;
        this.buttonHBox.top = 2;

        navigationBar.homeIcon.setScaleMagnitude( this.navBarScale );
        navigationBar.homeIcon.top = 2;
        navigationBar.homeIcon.left = navigationBar.buttonHBox.right + 15;
      }
      this.hbox.setScaleMagnitude( this.navBarScale );
      this.hbox.right = this.navBarWidth - 5;
      this.hbox.centerY = this.navBarHeight / 2;
    },
    layout: function( scale, width, height, windowHeight ) {
      this.navBarScale = scale;
      this.navBarWidth = width;
      this.navBarHeight = height;
      this.relayout();
    }} );
} );