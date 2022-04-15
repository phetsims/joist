// Copyright 2015-2021, University of Colorado Boulder
// @ts-nocheck
/**
 * Provides colors for Joist elements.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import DerivedProperty from '../../axon/js/DerivedProperty.js';
import Property from '../../axon/js/Property.js';
import { Color } from '../../scenery/js/imports.js';
import joist from './joist.js';

class LookAndFeel {

  constructor() {

    // @public background color for the currently selected screen, which will be set on the Display as its backgroundColor
    this.backgroundColorProperty = new Property( 'black' );

    // @public (joist-internal) {boolean} - True if the navigation bar background is black
    this.navigationBarDarkProperty = new DerivedProperty( [ this.backgroundColorProperty ],
      ( backgroundColor => {
        return !!new Color( backgroundColor ).equals( Color.BLACK );
      } ) );

    // @public (joist-internal) - Navigation bar background fill
    this.navigationBarFillProperty = new DerivedProperty( [ this.navigationBarDarkProperty ],
      ( backgroundDark => {
        return backgroundDark ? 'white' : 'black';
      } ) );

    // @public (joist-internal) - Navigation bar text fill
    this.navigationBarTextFillProperty = new DerivedProperty( [ this.navigationBarFillProperty ],
      ( navigationBarFill => {
        return navigationBarFill === 'black' ? 'white' : 'black';
      } ) );
  }

  // @public
  reset() {
    this.backgroundColorProperty.reset();
  }
}

joist.register( 'LookAndFeel', LookAndFeel );
export default LookAndFeel;