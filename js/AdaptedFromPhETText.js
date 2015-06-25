// Copyright 2002-2014, University of Colorado Boulder

/**
 * Some simulations that are minor modifications of PhET Simulations can be branded as "adapted from PhET"
 * See https://github.com/phetsims/brand/
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var MultiLineText = require( 'SCENERY_PHET/MultiLineText' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );

  // strings
  var adaptedFromString = require( 'string!JOIST/adaptedFrom' );

  // constants
  // TODO: Issue #245 This next line is causing problems.  When using Futura/bold the text looks the same on homescreen vs navbar
  // TODO: on Chrome.  On Firefox it is very blurry!  Changing font makes it render differently on homescreen vs navbar.
  var FONT = new PhetFont( { family: 'Arial', size: 10, weight: 'bold' } );

  /**
   *
   * @constructor
   */
  function AdaptedFromPhETText( lookAndFeel ) {
    var adaptedFromPhetText = this;
    MultiLineText.call( this, adaptedFromString, {
      align: 'right',
      font: FONT
    } );
    lookAndFeel.navigationBarTextFillProperty.link( function( navigationBarTextFill ) {
      adaptedFromPhetText.setFill( navigationBarTextFill );
    } );
  }

  return inherit( MultiLineText, AdaptedFromPhETText, {
    updateLayout: function( scale, phetButton ) {

      this.setScaleMagnitude( scale );
      this.right = phetButton.left - 5 * scale;
      this.centerY = phetButton.centerY - 1 * scale;
    }
  } );
} );