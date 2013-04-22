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
  var PlayArea = require( 'JOIST/PlayArea' );
  var PanelNode = require( 'SUN/PanelNode' );

  function AboutDialog() {
    var aboutDialog = this;

    //Use PlayArea to help center and scale content
    PlayArea.call( this );

    function text( string ) { return new Text( string, {fontSize: 24} ) }

    var content = new VBox( {spacing: 10, children: [
      text( 'About Forces and Motion: Basics' ),
      text( 'PhET Interactive Simulations' ),
      text( 'Copyright © 2004-2013 University of Colorado Boulder' ),
      text( 'Version 0.0.0' )
    ]} );

    //Show a gray overlay that will help focus on the about dialog, and prevent clicks on the sim while the dialog is up
    var overlay = new Rectangle( this.layoutBounds.minX - this.layoutBounds.width * 3, this.layoutBounds.minY - this.layoutBounds.height * 3, this.layoutBounds.width * 7, this.layoutBounds.height * 7, {fill: 'black', opacity: 0.5} );
    this.addChild( overlay );
    this.addChild( new PanelNode( content ).mutate( {centerX: this.layoutBounds.centerX, centerY: this.layoutBounds.centerY} ) );

    function resize() {
      aboutDialog.layout( $( window ).width(), $( window ).height() );
    }

    this.addInputListener( {down: function() {
      aboutDialog.detach();
    }} );

    //Fit to the window and render the initial scene
    $( window ).resize( resize );
    resize();
  }

  inherit( AboutDialog, PlayArea );

  return AboutDialog;
} );