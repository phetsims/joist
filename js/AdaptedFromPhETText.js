//  Copyright 2002-2014, University of Colorado Boulder

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

  // constants
  // TODO: This next line is causing problems.  When using Futura/bold the text looks the same on homescreen vs navbar
  // TODO: on Chrome.  On Firefox it is very blurry!  Changing font makes it render differently on homescreen vs navbar.
  var font = new PhetFont( { family: 'Futura', size: 9, weight: 'bold' } );

  /**
   *
   * @constructor
   */
  function AdaptedFromPhETText( useInvertedColorsProperty ) {
    var adaptedFromPhetText = this;
    MultiLineText.call( this, 'adapted\nfrom', {
      align: 'right',
      font: font
    } );
    useInvertedColorsProperty.link( function( useInvertedColors ) {
      var fill = useInvertedColors ? 'black' : 'white';
      adaptedFromPhetText.setFill( fill );
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