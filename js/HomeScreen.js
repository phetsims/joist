// Copyright 2013, University of Colorado

/**
 * Shows the home screen for a multi-tab simulation, which lets the user see all of the tabs and select one.
 *
 * @author Sam Reid
 */
define( function ( require ) {
  "use strict";

  var Node = require( 'SCENERY/nodes/Node' );
  var HBox = require( 'SCENERY/nodes/HBox' );
  var Text = require( 'SCENERY/nodes/Text' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Layout = require( 'JOIST/Layout' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );

  var HEIGHT = 110;

  function HomeScreen( title, tabs, model ) {
    var homeScreen = this;
    Node.call( this );

    this.backgroundColor = 'black';

    //iPad doesn't support Century Gothic, so fall back to Futura, see http://wordpress.org/support/topic/font-not-working-on-ipad-browser
    this.textLabel = new Text( title, {fontSize: 52, fontFamily: 'Century Gothic, Futura', fill: 'white', y: 140, centerX: 981 / 2} );
    this.phetLabel = new Text( "PhET", {fontSize: 36, fill: 'yellow', top: 5, left: 5} );
    this.addChild( this.textLabel );
    this.addChild( this.phetLabel );

    var index = 0;
    var tabChildren = _.map( tabs, function ( tab ) {
      tab.index = index++;
      var child = new Node( {children: [tab.icon]} );
      child.smallTextLabel = new Text( tab.name, {fontSize: 36, fill: 'gray'} );
      child.largeTextLabel = new Text( tab.name, {fontSize: 52, fill: 'yellow'} );
      homeScreen.addChild( child.smallTextLabel );
      homeScreen.addChild( child.largeTextLabel );
      child.scale( HEIGHT / tab.icon.height );
      child.cursor = 'pointer';
      child.tab = tab;

      //Tap once to select, a second time to start that tab
      child.addInputListener( { down: function () {
        if ( model.tabIndex === tab.index ) {
          model.showHomeScreen = false;
        }
        else {
          model.tabIndex = tab.index;
        }
      }} );
      return child;
    } );

    for ( var i = 0; i < tabChildren.length; i++ ) {
      this.addChild( tabChildren[i] );
    }

    model.link( 'tabIndex', function ( tabIndex ) {
      for ( var i = 0; i < tabChildren.length; i++ ) {
        var child = tabChildren[i];
        child.invalidateBounds();
        var selected = tabIndex === child.tab.index;
        child.selected = selected;
        child.opacity = selected ? 1 : 0.5;
        child.resetTransform();
        child.scale( selected ? HEIGHT / child.tab.icon.height * 2 : HEIGHT / child.tab.icon.height );
      }

      var width = 0;
      for ( var i = 0; i < tabChildren.length; i++ ) {
        var child = tabChildren[i];
        width = width + child.width;
      }
      var spacing = 41 / 1.25;
      width = width + spacing * (tabChildren.length - 1);

      var x = Layout.width / 2 - width / 2;

      for ( var i = 0; i < tabChildren.length; i++ ) {
        var child = tabChildren[i];
        child.x = x;
        child.y = Layout.height / 2 - 111 / 1.25;
        x += child.width + spacing;
        child.largeTextLabel.visible = child.selected;
        child.smallTextLabel.visible = !child.selected;
        var label = child.selected ? child.largeTextLabel : child.smallTextLabel;
        label.top = child.bottom + 20;
        label.x = child.x;
      }
    } );
  }

  inherit( HomeScreen, Node );

  return HomeScreen;
} );