// Copyright 2022, University of Colorado Boulder

/**
 * Stores the ground-truth order of locales used in translation fallback, with the first attempted (highest priority)
 * locale listed first.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import DerivedProperty from '../../axon/js/DerivedProperty.js';
import joist from './joist.js';
import localeProperty from './localeProperty.js';
import fallbackLocalesProperty from './fallbackLocalesProperty.js';

const FALLBACK_LOCALE = 'en';

const localeOrderProperty = new DerivedProperty( [ localeProperty, fallbackLocalesProperty ], ( locale, fallbackLocales ) => {
  const localeOrder = _.uniq( [
    locale,
    ...fallbackLocales
  ] );

  // attempt to fill in language reductions if they are not explicitly included, e.g. 'zh_CN' => 'zh'
  localeOrder.forEach( locale => {
    const shortLocale = locale.slice( 0, 2 );
    if ( locale !== shortLocale && !localeOrder.includes( shortLocale ) ) {
      localeOrder.push( shortLocale );
    }
  } );

  // attempt our guaranteed fallback locale at the very end (if not included)
  if ( !localeOrder.includes( FALLBACK_LOCALE ) ) {
    localeOrder.push( FALLBACK_LOCALE );
  }

  const fallbackIndex = localeOrder.indexOf( FALLBACK_LOCALE );
  assert && assert( fallbackIndex >= 0 );

  // Ignore locales past our fallback
  return localeOrder.slice( 0, fallbackIndex + 1 );
} );

joist.register( 'localeOrderProperty', localeOrderProperty );

export default localeOrderProperty;
