// Copyright 2015-2020, University of Colorado Boulder

/**
 * Provides colors for Joist elements.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import DerivedProperty from '../../axon/js/DerivedProperty.js';
import Property from '../../axon/js/Property.js';
import inherit from '../../phet-core/js/inherit.js';
import Color from '../../scenery/js/util/Color.js';
import joist from './joist.js';

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

inherit( Object, LookAndFeel, {

  // @public
  reset: function() {
    this.backgroundColorProperty.reset();
  }
} );

export default LookAndFeel;