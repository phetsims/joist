// Copyright 2015-2018, University of Colorado Boulder

/**
 * Provides colors for Joist elements.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var Color = require( 'SCENERY/util/Color' );
  var DerivedProperty = require( 'AXON/DerivedProperty' );
  var inherit = require( 'PHET_CORE/inherit' );
  var joist = require( 'JOIST/joist' );
  var Property = require( 'AXON/Property' );

  /**
   *
   * @constructor
   */
  function LookAndFeel() {

    // @public background color for the currently selected screen, which will be set on the Display as its backgroundColor
    this.backgroundColorProperty = new Property( 'black' );

    // @public (joist-internal) {boolean} - True if the navigation bar background is black
    this.navigationBarDarkProperty = new DerivedProperty( [ this.backgroundColorProperty ],
      function( backgroundColor ) {
        return !!new Color( backgroundColor ).equals( Color.BLACK );
      } );

    // @public (joist-internal) - Navigation bar background fill
    this.navigationBarFillProperty = new DerivedProperty( [ this.navigationBarDarkProperty ],
      function( backgroundDark ) {
        return backgroundDark ? 'white' : 'black';
      } );

    // @public (joist-internal) - Navigation bar text fill
    this.navigationBarTextFillProperty = new DerivedProperty( [ this.navigationBarFillProperty ],
      function( navigationBarFill ) {
        return navigationBarFill === 'black' ? 'white' : 'black';
      } );
  }

  joist.register( 'LookAndFeel', LookAndFeel );

  return inherit( Object, LookAndFeel, {

    // @public
    reset: function() {
      this.backgroundColorProperty.reset();
    }
  } );
} );