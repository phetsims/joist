// Copyright 2017-2019, University of Colorado Boulder

/**
 * IO type for PhetMenu
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Andrew Adare (PhET Interactive Simulations)
 */

import ObjectIO from '../../tandem/js/types/ObjectIO.js';
import joist from './joist.js';

class PhetMenuIO extends ObjectIO {}

PhetMenuIO.documentation = 'The PhET Menu in the bottom right of the screen';
PhetMenuIO.validator = { isValidValue: v => v instanceof phet.joist.PhetMenu };
PhetMenuIO.typeName = 'PhetMenuIO';
ObjectIO.validateSubtype( PhetMenuIO );

joist.register( 'PhetMenuIO', PhetMenuIO );
export default PhetMenuIO;