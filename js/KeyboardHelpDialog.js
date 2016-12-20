// Copyright 2014-2015, University of Colorado Boulder

/**
 * Shows a Dialog with content describing keyboard interactions. Brought up by a button
 * in the navigation bar.
 *
 * @author Jesse Greenberg
 */
define( function( require ) {
  'use strict';

  // modules
  var Text = require( 'SCENERY/nodes/Text' );
  var inherit = require( 'PHET_CORE/inherit' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Dialog = require( 'JOIST/Dialog' );
  var joist = require( 'JOIST/joist' );

  // strings
  var hotKeysAndHelpString = 'Hot Keys and Help'; // accessibility content is not translatable yet

  /**
   * Constructor.
   * @param {Node} helpContent - a node containing the sim specific keyboard help content
   * @param {object} options
   * @constructor
   */
  function KeyboardHelpDialog( helpContent, options ) {

    options = _.extend( {
      title: new Text( hotKeysAndHelpString, { font: new PhetFont( { weight: 'bold', size: 20 } ) } ),
      titleAlign: 'center',
      modal: true,
      hasCloseButton: false,
      fill: 'rgb( 214, 237, 249 )'
    }, options );

    Dialog.call( this, helpContent, options );

  }

  joist.register( 'KeyboardHelpDialog', KeyboardHelpDialog );

  return inherit( Dialog, KeyboardHelpDialog );
} );