// Copyright 2022-2024, University of Colorado Boulder

/**
 * Provides the current locale in the BCP 47 (RFC 5646 https://datatracker.ietf.org/doc/html/rfc5646) format.
 * This is extracted from localeData.json.
 *
 * This can be provided to various browser i18n APIs as a locale.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import DerivedProperty from '../../../axon/js/DerivedProperty.js';
import joist from '../joist.js';
import localeProperty from './localeProperty.js';

const bcp47LocaleProperty = new DerivedProperty( [ localeProperty ], locale => {
  return phet.chipper.localeData[ locale ].bcp47;
} );

joist.register( 'bcp47LocaleProperty', bcp47LocaleProperty );

export default bcp47LocaleProperty;