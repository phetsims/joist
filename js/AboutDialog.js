// Copyright 2002-2013, University of Colorado Boulder

/**
 * Shows the about dialog.
 *
 * @author Sam Reid
 */
define( function( require ) {
  'use strict';

  var Node = require( 'SCENERY/nodes/Node' );
  var VBox = require( 'SCENERY/nodes/VBox' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var Text = require( 'SCENERY/nodes/Text' );
  var inherit = require( 'PHET_CORE/inherit' );
  var MultiLineText = require( 'SCENERY_PHET/MultiLineText' );
  var TabView = require( 'JOIST/TabView' );
  var Panel = require( 'SUN/Panel' );
  var HTMLText = require( 'SCENERY/nodes/HTMLText' );

  // constants
  var SOFTWARE_AGREEMENT_URL = 'http://phet.colorado.edu/about/software-agreement_v7.htm';

  /**
   * @param {Sim} sim
   * @constructor
   */
  function AboutDialog( sim ) {
    var aboutDialog = this;

    //Use view, to help center and scale content
    TabView.call( this, {renderer: 'svg'} );

    var softwareAgreementLink = new HTMLText( '<a href="#" onclick="return false;">Software Agreement</a>', {
      fontSize: 14,
      renderer: 'dom',
      interactive: true // don't prevent default on the events
    } ); //TODO i18n
    softwareAgreementLink.addInputListener( {
      up: function( evt ) {
        evt.handle(); // don't close the dialog
      },
      upImmediate: function( evt ) {
        var aboutDialogWindow = window.open( SOFTWARE_AGREEMENT_URL, '_blank' );
        aboutDialogWindow.focus();
      }
    } );

    var content = new VBox( { align: 'left', spacing: 5, children: [
      new Text( 'PhET Interactive Simulations', {fontSize: 16} ),
      new Text( 'Copyright © 2004-2013 University of Colorado Boulder', {fontSize: 12} ),
      new Text( ' ', {fontSize: 28 } ),
      new Text( sim.name, {fontSize: 28} ),
      new Text( 'version ' + sim.version, {fontSize: 20} ),
      new Text( ' ' ),
      new MultiLineText( sim.credits, { align: 'left', fontSize: 12 } ),
      new Text( ' ' ),
      new MultiLineText( sim.thanks, { align: 'left', fontSize: 12 } ),
      new Text( ' ' ),
      softwareAgreementLink
    ]} );

    //Show a gray overlay that will help focus on the about dialog, and prevent clicks on the sim while the dialog is up
    this.addChild( new Panel( content, {centerX: this.layoutBounds.centerX, centerY: this.layoutBounds.centerY, xMargin: 20, yMargin: 20 } ) );

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
