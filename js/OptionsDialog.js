// Copyright 2002-2013, University of Colorado Boulder

/**
 * Shows an Options dialog that consists of sim-global options.
 *
 * Options are provided as 'globalOptions' inside a sim's options.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( function( require ) {
  'use strict';

  // modules
  var VBox = require( 'SCENERY/nodes/VBox' );
  var Text = require( 'SCENERY/nodes/Text' );
  var inherit = require( 'PHET_CORE/inherit' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var CheckBox = require( 'SUN/CheckBox' );
  var Dialog = require( 'JOIST/Dialog' );

  // strings
  var optionsTitleString = require( 'string!JOIST/options.title' );

  /**
   * The options should be an array of item objects, which all have item.type. The following types are available:
   *
   * { // 'boolean' will show up as a labeled CheckBox
   *   type: 'boolean',
   *   label: 'Some Option',
   *   property: someBooleanProperty
   * }
   *
   * @param {Array} options
   * @constructor
   */
  function OptionsDialog( options ) {

    var children = [];
    for ( var i = 0; i < options.length; i++ ) {
      var option = options[i];

      switch( option.type ) {
        case 'boolean':
          children.push( new CheckBox( new Text( option.label, { font: new PhetFont( 15 ) } ), option.property, {} ) );
          break;
        default:
          throw new Error( 'unknown option type: ' + option.type );
      }
    }

    var content = new VBox( { align: 'left', spacing: 10, children: children } );

    Dialog.call( this, content, {
      title: new Text( optionsTitleString, { font: new PhetFont( 30 ) } ),
      titleAlign: 'center',
      modal: true,
      hasCloseButton: false
    } );
  }

  inherit( Dialog, OptionsDialog );

  return OptionsDialog;
} );