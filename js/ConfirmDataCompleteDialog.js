//  Copyright 2002-2014, University of Colorado Boulder

/**
 * Shows the "Are You Sure" dialog, which shows "yes/no" button to confirm whether the user has completed using the sim
 * and ready to submit data.
 *
 * TODO: Use the new Joist dialog infrastructure
 *
 * @author Sam Reid
 */
define( function( require ) {
  'use strict';

  // modules
  var VBox = require( 'SCENERY/nodes/VBox' );
  var HBox = require( 'SCENERY/nodes/HBox' );
  var Text = require( 'SCENERY/nodes/Text' );
  var inherit = require( 'PHET_CORE/inherit' );
  var ScreenView = require( 'JOIST/ScreenView' );
  var Panel = require( 'SUN/Panel' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var VStrut = require( 'SUN/VStrut' );
  var TextPushButton = require( 'SUN/buttons/TextPushButton' );

  /**
   * @param {object} options
   * @constructor
   */
  function ConfirmDataCompleteDialog( options ) {
    var confirmDataCompleteDialog = this;

    //Use view, to help center and scale content
    //Renderer must be specified here because the ConfirmDataCompleteDialog is added directly to the scene (instead of to some other node that already has svg renderer)
    ScreenView.call( this, { renderer: 'svg' } );

    var yesButton = new TextPushButton( 'yes' );

    //Put listener in immediate callback so it will work on ipads.
    yesButton.addInputListener( {
      upImmediate: function() {

        arch && arch.trigger( 'done.yesButtonPressed' );

        var url = options.doneButtonURL + ( options.doneButtonURL.indexOf( '?' ) >= 0 ? '&' : '?' ) + 'studentId=' + encodeURIComponent( phet.phetcommon.getQueryParameter( 'studentId' ) );
        window.location.href = url;
      }
    } );
    var children = [
      new Text( "Are you sure?", { font: new PhetFont( 16 ) } ),
      new VStrut( 15 ),
      new HBox( { spacing: 15, children: [ yesButton, new TextPushButton( 'no' ) ] } )
    ];

    var content = new VBox( { align: 'left', spacing: 5, children: children } );

    //Show a gray overlay that will help focus on the about dialog, and prevent clicks on the sim while the dialog is up
    this.addChild( new Panel( content, {
      centerX: this.layoutBounds.centerX,
      centerY: this.layoutBounds.centerY,
      xMargin: 20,
      yMargin: 20
    } ) );

    function resize() {
      confirmDataCompleteDialog.layout( $( window ).width(), $( window ).height() );
    }

    //Fit to the window and render the initial scene
    $( window ).resize( resize );
    resize();
  }

  return inherit( ScreenView, ConfirmDataCompleteDialog );
} );