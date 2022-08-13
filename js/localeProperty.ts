// Copyright 2022, University of Colorado Boulder

/**
 * A universal locale Property that is accessible independently of the running Sim instance.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import StringProperty from '../../axon/js/StringProperty.js';
import Tandem from '../../tandem/js/Tandem.js';
import joist from './joist.js';

const localeProperty = new StringProperty( phet.chipper.locale || 'en', {
  tandem: Tandem.GENERAL_VIEW.createTandem( 'localeProperty' ),
  phetioFeatured: true,
  validValues: Object.keys( phet.chipper.strings )
} );

joist.register( 'localeProperty', localeProperty );

export default localeProperty;
