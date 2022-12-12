// Copyright 2022, University of Colorado Boulder

/**
 * A universal locale-based Property that is true when text is meant to be laid out left-to-right, and false
 * when the reverse is true (text should be laid out right-to-left).
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import DerivedProperty from '../../../axon/js/DerivedProperty.js';
import localeInfoModule from '../../../chipper/js/data/localeInfoModule.js';
import joist from '../joist.js';
import localeProperty from './localeProperty.js';

const isLeftToRightProperty = new DerivedProperty( [ localeProperty ], locale => {
  return localeInfoModule[ locale ].direction === 'ltr';
} );

joist.register( 'isLeftToRightProperty', isLeftToRightProperty );

export default isLeftToRightProperty;