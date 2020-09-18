// Copyright 2020, University of Colorado Boulder

/**
 * IO Type for Screen
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */

import IOType from '../../tandem/js/types/IOType.js';
import ReferenceIO from '../../tandem/js/types/ReferenceIO.js';
import joist from './joist.js';

const ScreenIO = new IOType( 'ScreenIO', {
  isValidValue: v => v instanceof phet.joist.Screen,
  supertype: ReferenceIO( IOType.ObjectIO ),
  documentation: 'Section of a simulation which has its own model and view.'
} );

joist.register( 'ScreenIO', ScreenIO );
export default ScreenIO;