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

  /**
   * @param {Sim} sim
   * @constructor
   */
  function AboutDialog( sim ) {
    var aboutDialog = this;

    //Use view, to help center and scale content
    TabView.call( this );

    var content = new VBox( {spacing: 10, children: [
      new Text( sim.name, {fontSize: 28} ),
      new Text( "version " + sim.version, {fontSize: 20} ),
      new Text( 'PhET Interactive Simulations', {fontSize: 18} ),
      new Text( 'Copyright © 2004-2013 University of Colorado Boulder', {fontSize: 14} )
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

  inherit( TabView, AboutDialog );

  return AboutDialog;
} );