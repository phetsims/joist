// Copyright 2015, University of Colorado Boulder

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
   * @param {Property.<Color|string>} fillProperty
   * @param {Object} options
   * @constructor
   */
  function AdaptedFromText( fillProperty, options ) {

    options = _.extend( {
      align: 'right',
      font: FONT,
      maxWidth: 60
    }, options );

    MultiLineText.call( this, adaptedFromString, options );

    // Synchronize the text fill with the given fill property
    fillProperty.linkAttribute( this, 'fill' );
  }

  return inherit( MultiLineText, AdaptedFromText );
} );