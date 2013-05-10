// Copyright 2013, University of Colorado

/**
 * Shows the about dialog.
 *
 * @author Sam Reid
 */
define( function( require ) {
  "use strict";

  var Node = require( 'SCENERY/nodes/Node' );
  var VBox = require( 'SCENERY/nodes/VBox' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var Text = require( 'SCENERY/nodes/Text' );
  var inherit = require( 'PHET_CORE/inherit' );
  var TabView = require( 'JOIST/TabView' );
  var PanelNode = require( 'SUN/PanelNode' );

  function AboutDialog() {
    var aboutDialog = this;

    //Use view, to help center and scale content
    TabView.call( this );

    function text( string ) { return new Text( string, {fontSize: 24} ); }

    var content = new VBox( {spacing: 10, children: [
      text( 'About Forces and Motion: Basics' ), //TODO sim name should be a parameter
      text( 'PhET Interactive Simulations' ),
      text( 'Copyright © 2004-2013 University of Colorado Boulder' ),
      text( 'Version 0.0.0.0' )  //TODO version id should be a parameter
    ]} );

    //Show a gray overlay that will help focus on the about dialog, and prevent clicks on the sim while the dialog is up
    this.addChild( new PanelNode( content, {centerX: this.layoutBounds.centerX, centerY: this.layoutBounds.centerY, xMargin: 20, yMargin: 20 } ) );

    function resize() {
      aboutDialog.layout( $( window ).width(), $( window ).height() );
    }

    //Fit to the window and render the initial scene
    $( window ).resize( resize );
    resize();
  }

  inherit( AboutDialog, TabView );

  return AboutDialog;
} );