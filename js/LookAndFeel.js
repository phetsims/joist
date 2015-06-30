// Copyright 2002-2014, University of Colorado Boulder

/**
 *
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var PropertySet = require( 'AXON/PropertySet' );
  var Color = require( 'SCENERY/util/Color' );

  /**
   *
   * @constructor
   */
  function LookAndFeel() {
    PropertySet.call( this, {

      //TODO Why is this here? Each screen has its own background color. And the default in Screen is 'white'.
      // The background color for the screen, which will be set on the Display as its backgroundColor
      backgroundColor: 'black'
    } );

    // When the simulation screen's background color changes, update the navbar color as well.
    this.addDerivedProperty( 'navigationBarFill', [ 'backgroundColor' ], function( backgroundColor ) {
      var screenIsBlack = !!new Color( backgroundColor ).equals( Color.BLACK );
      return screenIsBlack ? 'white' : 'black';
    } );

    // The color that text should appear in the navigation bar.
    this.addDerivedProperty( 'navigationBarTextFill', [ 'navigationBarFill' ], function( navigationBarFill ) {
      return navigationBarFill === 'black' ? 'white' : 'black';
    } );
  }

  return inherit( PropertySet, LookAndFeel );
} );