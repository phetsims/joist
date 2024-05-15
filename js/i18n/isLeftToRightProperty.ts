// Copyright 2022, University of Colorado Boulder

/**
 * A universal locale-based Property that is true when text is meant to be laid out left-to-right, and false
 * when the reverse is true (text should be laid out right-to-left).
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import DerivedProperty from '../../../axon/js/DerivedProperty.js';
import joist from '../joist.js';
import localeProperty from './localeProperty.js';

const isLeftToRightProperty = new DerivedProperty( [ localeProperty ], locale => {
  // @ts-ignore keyof localeInfoModule not helping here.
  return phet.chipper.localeData[ locale ].direction === 'ltr';
} );

joist.register( 'isLeftToRightProperty', isLeftToRightProperty );

export default isLeftToRightProperty;
