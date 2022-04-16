// Copyright 2015-2021, University of Colorado Boulder

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

  // Background color for the currently selected screen, which will be set on the Display as its backgroundColor
  readonly backgroundColorProperty: Property<Color>;

  // (joist-internal) True if the navigation bar background is black
  readonly navigationBarDarkProperty: DerivedProperty<boolean, [ Color ]>;

  // (joist-internal) - Navigation bar background fill
  readonly navigationBarFillProperty: DerivedProperty<Color, [ backgroundDark: boolean ]>;

  // (joist-internal) - Navigation bar text fill
  readonly navigationBarTextFillProperty: DerivedProperty<Color, [ navigationBarFill: Color ]>;

  constructor() {

    this.backgroundColorProperty = new Property<Color>( Color.BLACK );

    this.navigationBarDarkProperty = new DerivedProperty<boolean, [ Color ]>( [ this.backgroundColorProperty ],
      backgroundColor => backgroundColor.equals( Color.BLACK )
    );

    this.navigationBarFillProperty = new DerivedProperty( [ this.navigationBarDarkProperty ],
      backgroundDark => backgroundDark ? Color.WHITE : Color.BLACK
    );

    this.navigationBarTextFillProperty = new DerivedProperty( [ this.navigationBarFillProperty ],
      navigationBarFill => navigationBarFill.equals( Color.BLACK ) ? Color.WHITE : Color.BLACK
    );
  }

  reset(): void {
    this.backgroundColorProperty.reset();
  }
}

joist.register( 'LookAndFeel', LookAndFeel );
export default LookAndFeel;