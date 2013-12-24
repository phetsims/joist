// Copyright 2002-2013, University of Colorado Boulder

/**
 * Shows the about dialog.
 *
 * @author Sam Reid
 */
define( function( require ) {
  'use strict';

  var VBox = require( 'SCENERY/nodes/VBox' );
  var Text = require( 'SCENERY/nodes/Text' );
  var inherit = require( 'PHET_CORE/inherit' );
  var ScreenView = require( 'JOIST/ScreenView' );
  var Panel = require( 'SUN/Panel' );
  var CheckBox = require( 'SUN/CheckBox' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var TextPushButton = require( 'SUN/TextPushButton' );

  // strings
  var showPointersString = require( 'string!JOIST/showPointers' );
  var doneString = require( 'string!JOIST/done' );
  var settingsString = require( 'string!JOIST/title.settings' );

  /**
   * @param {Sim} sim
   * @constructor
   */
  function SettingsDialog( sim ) {
    var settingsDialog = this;

    //Use view, to help center and scale content
    ScreenView.call( this, {renderer: 'svg'} );

    var content = new VBox( { align: 'center', spacing: 50, children: [
      new Text( settingsString, { font: new PhetFont( 16 ) } ),
      new CheckBox( new Text( showPointersString ), sim.showPointersProperty ),
      new TextPushButton( doneString, {
        listener: function() {
            settingsDialog.doneListeners.forEach( function( listener ) {
              listener();
            } );
          }
        } )
    ]} );

    //Show a gray overlay that will help focus on the about dialog, and prevent clicks on the sim while the dialog is up
    this.addChild( new Panel( content, {centerX: this.layoutBounds.centerX, centerY: this.layoutBounds.centerY, xMargin: 20, yMargin: 20 } ) );

    function resize() {
      settingsDialog.layout( $( window ).width(), $( window ).height() );
    }

    //Fit to the window and render the initial scene
    $( window ).resize( resize );
    resize();
    this.doneListeners = [];
  }

  return inherit( ScreenView, SettingsDialog, {
    addDoneListener: function( listener ) {
      this.doneListeners.push( listener );
    }
  } );
} );
