// Copyright 2002-2013, University of Colorado Boulder

/**
 * Shows the about dialog.
 *
 * @author Sam Reid
 */
define( function( require ) {
  'use strict';

  // imports
  var Node = require( 'SCENERY/nodes/Node' );
  var VBox = require( 'SCENERY/nodes/VBox' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var Text = require( 'SCENERY/nodes/Text' );
  var inherit = require( 'PHET_CORE/inherit' );
  var MultiLineText = require( 'SCENERY_PHET/MultiLineText' );
  var ScreenView = require( 'JOIST/ScreenView' );
  var Panel = require( 'SUN/Panel' );
  var HTMLText = require( 'SCENERY/nodes/HTMLText' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var StringUtils = require( 'PHETCOMMON/util/StringUtils' );

  // strings
  var phetString = 'PhET Interactive Simulations'; // as in Java sims, do not internationalize
  var copyrightString = 'Copyright © 2004-2013 University of Colorado Boulder'; // as in Java sims, do not internationalize
  var softwareAgreementString = require( 'string!JOIST/softwareAgreement');
  var phetDevelopmentTeamString = require( 'string!JOIST/credits.phetDevelopmentTeam' );
  var leadDesignString = require( 'string!JOIST/credits.leadDesign' );
  var softwareDevelopmentString = require( 'string!JOIST/credits.softwareDevelopment' );
  var designTeamString = require( 'string!JOIST/credits.designTeam' );
  var interviewsString = require( 'string!JOIST/credits.interviews' );
  var translationTitleString = require( 'string!JOIST/credits.translation' );
  var thanksTitleString = require( 'string!JOIST/credits.thanks' );

  // constants
  var SOFTWARE_AGREEMENT_URL = 'http://phet.colorado.edu/about/software-agreement_v7.htm';

  /**
   * @param {Sim} sim
   * @constructor
   */
  function AboutDialog( sim ) {
    var aboutDialog = this;

    //Use view, to help center and scale content
    //Renderer must be specified here because the AboutDialog is added directly to the scene (instead of to some other node that already has svg renderer)
    ScreenView.call( this, {renderer: 'svg'} );

    var softwareAgreementLink = new HTMLText( '<a href="#" onclick="return false;">' + softwareAgreementString + '</a>', {
      font: new PhetFont( 14 ),
      renderer: 'dom',
      interactive: true // don't prevent default on the events
    } );
    softwareAgreementLink.addInputListener( {
      up: function( evt ) {
        evt.handle(); // don't close the dialog
      },
      upImmediate: function( evt ) {
        var aboutDialogWindow = window.open( SOFTWARE_AGREEMENT_URL, '_blank' );
        aboutDialogWindow.focus();
      }
    } );

    var blankLineFont = new PhetFont( 14 );
    var children = [
      new Text( phetString, { font: new PhetFont( 16 ) } ),
      new Text( copyrightString, { font: new PhetFont( 12 ) } ),
      new Text( ' ', { font: blankLineFont } ),
      new Text( sim.name, { font: new PhetFont( 28 ) } ),
      new Text( 'version ' + sim.version, { font: new PhetFont( 20 ) } )
    ];

    if ( sim.credits ) {
      children.push( new Text( ' ', { font: blankLineFont } ) );
      children.push( createCreditsNode( sim.credits ) );
    }

    children.push( new Text( ' ', { font: blankLineFont } ) );
    children.push( softwareAgreementLink );
    
    var content = new VBox( { align: 'left', spacing: 5, children: children } );

    //Show a gray overlay that will help focus on the about dialog, and prevent clicks on the sim while the dialog is up
    this.addChild( new Panel( content, {centerX: this.layoutBounds.centerX, centerY: this.layoutBounds.centerY, xMargin: 20, yMargin: 20 } ) );

    function resize() {
      aboutDialog.layout( $( window ).width(), $( window ).height() );
    }

    //Fit to the window and render the initial scene
    $( window ).resize( resize );
    resize();
  }

  // Creates node that displays the credits.
  var createCreditsNode = function( credits ) {
    var children = [];
    var titleFont = new PhetFont( { size: 14, weight: 'bold' }  );
    var font = new PhetFont( 12 );
    var multiLineTextOptions = { font: font, align: 'left' };
    children.push( new Text( phetDevelopmentTeamString, { font: titleFont } ) );

    if ( credits.leadDesign ) { children.push( new MultiLineText( StringUtils.format( leadDesignString, credits.leadDesign ), multiLineTextOptions ) ); }
    if ( credits.softwareDevelopment ) { children.push( new MultiLineText( StringUtils.format( softwareDevelopmentString, credits.softwareDevelopment ), multiLineTextOptions ) ); }
    if ( credits.designTeam ) { children.push( new MultiLineText( StringUtils.format( designTeamString, credits.designTeam ), multiLineTextOptions ) ); }
    if ( credits.interviews ) { children.push( new MultiLineText( StringUtils.format( interviewsString, credits.interviews ), multiLineTextOptions ) ); }
    if ( credits.translation ) {
      if ( children.length > 0 ) { children.push( new Text( ' ', font ) ); }
      children.push( new Text( translationTitleString, { font: titleFont } ) );
      children.push( new MultiLineText( credits.translation, multiLineTextOptions ) );
    }
    if ( credits.thanks ) {
      if ( children.length > 0 ) { children.push( new Text( ' ', font ) ); }
      children.push( new Text( thanksTitleString, { font: titleFont } ) );
      children.push( new MultiLineText( credits.thanks, multiLineTextOptions ) );
    }
    return new VBox( { align: 'left', spacing: 1, children: children } );
  };

  inherit( ScreenView, AboutDialog );

  return AboutDialog;
} );
