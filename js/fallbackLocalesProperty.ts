// Copyright 2022, University of Colorado Boulder

/**
 * A Property that stores "backup" locales to be used for translations, if the translation of a string is not available
 * in the main locale (determined by localeProperty)
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Property from '../../axon/js/Property.js';
import localeInfoModule from '../../chipper/js/data/localeInfoModule.js';
import Tandem from '../../tandem/js/Tandem.js';
import ArrayIO from '../../tandem/js/types/ArrayIO.js';
import StringIO from '../../tandem/js/types/StringIO.js';
import joist from './joist.js';

const fallbackLocalesProperty = new Property<string[]>( [], {
  tandem: Tandem.GENERAL_MODEL.createTandem( 'fallbackLocalesProperty' ),
  phetioFeatured: true,
  isValidValue: locales => {
    return _.every( locales, locale => !!localeInfoModule[ locale as keyof typeof localeInfoModule ] );
  },
  phetioValueType: ArrayIO( StringIO )
} );

joist.register( 'fallbackLocalesProperty', fallbackLocalesProperty );

export default fallbackLocalesProperty;
