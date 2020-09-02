// Copyright 2020, University of Colorado Boulder

/**
 * IO Type for Screen
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */

import ObjectIO from '../../tandem/js/types/ObjectIO.js';
import ReferenceIO from '../../tandem/js/types/ReferenceIO.js';
import joist from './joist.js';

class ScreenIO extends ReferenceIO( ObjectIO ) {}

ScreenIO.documentation = 'Section of a simulation which has its own model and view.';
ScreenIO.validator = { isValidValue: v => v instanceof phet.joist.Screen };
ScreenIO.typeName = 'ScreenIO';
ObjectIO.validateSubtype( ScreenIO );

joist.register( 'ScreenIO', ScreenIO );
export default ScreenIO;