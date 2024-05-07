// Copyright 2022-2024, University of Colorado Boulder

/**
 * Stores the ground-truth order of locales used in translation fallback, with the first attempted (highest priority)
 * locale listed first.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import DerivedProperty from '../../../axon/js/DerivedProperty.js';
import joist from '../joist.js';
import localeProperty from './localeProperty.js';
import fallbackLocalesProperty from './fallbackLocalesProperty.js';

const FALLBACK_LOCALE = 'en';

const localeOrderProperty = new DerivedProperty( [ localeProperty, fallbackLocalesProperty ],
  ( locale, fallbackLocales ) => {

  const localeOrder = [ locale ];

  // Duplicates will be filtered out below
  const potentialFallbackLocales = [
    // custom fallback locales (e.g. from phet-io)
    ...fallbackLocales,

    // standard fallback locales (defined by localeData)
    ...phet.chipper.localeData[ locale ].fallbackLocales || [],

    // always fall back to 'en'
    FALLBACK_LOCALE
  ];

  // Add custom fallback locales (e.g. phet-io) if not already in the order
  for ( let i = 0; i < potentialFallbackLocales.length; i++ ) {
    const fallbackLocale = potentialFallbackLocales[ i ];
    if ( !localeOrder.includes( fallbackLocale ) ) {
      localeOrder.push( fallbackLocale );
    }
  }

  const fallbackIndex = localeOrder.indexOf( FALLBACK_LOCALE );
  assert && assert( fallbackIndex >= 0, `Required local in localeOrderProperty: ${FALLBACK_LOCALE}` );

  // Optimization: Ignore locales past our fallback, because it will include a value for every single key.
  return localeOrder.slice( 0, fallbackIndex + 1 );
} );

joist.register( 'localeOrderProperty', localeOrderProperty );

export default localeOrderProperty;