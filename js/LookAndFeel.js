// Copyright 2015, University of Colorado Boulder

/**
 * Provides colors for Joist elements.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var PropertySet = require( 'AXON/PropertySet' );
  var Color = require( 'SCENERY/util/Color' );
  var joist = require( 'JOIST/joist' );

  /**
   *
   * @constructor
   */
  function LookAndFeel() {
    PropertySet.call( this, {

      //TODO this is poorly named, should be something like currentScreenBackgroundColor
      // The background color for the currently selected screen, which will be set on the Display as its backgroundColor
      backgroundColor: 'black'
    } );

    // @public (joist-internal) - Navigation bar background fill
    this.addDerivedProperty( 'navigationBarFill', [ 'backgroundColor' ], function( backgroundColor ) {
      var screenIsBlack = !!new Color( backgroundColor ).equals( Color.BLACK );
      return screenIsBlack ? 'white' : 'black';
    } );

    // @public (joist-internal) - Navigation bar text fill
    this.addDerivedProperty( 'navigationBarTextFill', [ 'navigationBarFill' ], function( navigationBarFill ) {
      return navigationBarFill === 'black' ? 'white' : 'black';
    } );
  }

  joist.register( 'LookAndFeel', LookAndFeel );

  return inherit( PropertySet, LookAndFeel );
} );