// Copyright 2015-2022, University of Colorado Boulder

/**
 * Provides colors for Joist elements.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import DerivedProperty from '../../axon/js/DerivedProperty.js';
import TReadOnlyProperty from '../../axon/js/TReadOnlyProperty.js';
import Property from '../../axon/js/Property.js';
import { Color } from '../../scenery/js/imports.js';
import joist from './joist.js';

class LookAndFeel {

  // Background color for the currently selected screen, which will be set on the Display as its backgroundColor
  public readonly backgroundColorProperty: Property<Color>;

  // (joist-internal) True if the navigation bar background is black
  public readonly navigationBarDarkProperty: TReadOnlyProperty<boolean>;

  // (joist-internal) - Navigation bar background fill
  public readonly navigationBarFillProperty: TReadOnlyProperty<Color>;

  // (joist-internal) - Navigation bar text fill
  public readonly navigationBarTextFillProperty: TReadOnlyProperty<Color>;

  public constructor() {

    this.backgroundColorProperty = new Property<Color>( Color.BLACK );

    this.navigationBarDarkProperty = new DerivedProperty( [ this.backgroundColorProperty ],
      backgroundColor => backgroundColor.equals( Color.BLACK )
    );

    this.navigationBarFillProperty = new DerivedProperty( [ this.navigationBarDarkProperty ],
      backgroundDark => backgroundDark ? Color.WHITE : Color.BLACK
    );

    this.navigationBarTextFillProperty = new DerivedProperty( [ this.navigationBarFillProperty ],
      navigationBarFill => navigationBarFill.equals( Color.BLACK ) ? Color.WHITE : Color.BLACK
    );
  }

  public reset(): void {
    this.backgroundColorProperty.reset();
  }
}

joist.register( 'LookAndFeel', LookAndFeel );
export default LookAndFeel;