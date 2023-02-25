// Copyright 2022-2023, University of Colorado Boulder

/**
 * A Property that stores "backup" locales to be used for translations, if the translation of a string is not available
 * in the main locale (determined by localeProperty)
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Property from '../../../axon/js/Property.js';
import localeInfoModule from '../../../chipper/js/data/localeInfoModule.js';
import Tandem from '../../../tandem/js/Tandem.js';
import ArrayIO from '../../../tandem/js/types/ArrayIO.js';
import StringIO from '../../../tandem/js/types/StringIO.js';
import joist from '../joist.js';
import { Locale } from './localeProperty.js';

const fallbackLocalesProperty = new Property<Locale[]>( [], {
  tandem: Tandem.GENERAL_MODEL.createTandem( 'fallbackLocalesProperty' ),
  phetioDocumentation: 'An ordered list of locales to "fall back" on when a translation is missing for the selected ' +
                       'locale, for example: ["es", "de" ]. "en" will always be added to the end of this, because it has ' +
                       'guaranteed full coverage of all translated keys.',
  phetioFeatured: true,
  isValidValue: locales => {
    return _.every( locales, locale => !!localeInfoModule[ locale ] );
  },
  phetioValueType: ArrayIO( StringIO )
} );

joist.register( 'fallbackLocalesProperty', fallbackLocalesProperty );

export default fallbackLocalesProperty;
