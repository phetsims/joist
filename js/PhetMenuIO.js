// Copyright 2017-2020, University of Colorado Boulder

/**
 * IO Type for PhetMenu
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Andrew Adare (PhET Interactive Simulations)
 */

import IOType from '../../tandem/js/types/IOType.js';
import joist from './joist.js';

const PhetMenuIO = new IOType( 'PhetMenuIO', {
  isValidValue: v => v instanceof phet.joist.PhetMenu,
  documentation: 'The PhET Menu in the bottom right of the screen'
} );

joist.register( 'PhetMenuIO', PhetMenuIO );
export default PhetMenuIO;