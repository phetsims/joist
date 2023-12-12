// Copyright 2015-2023, University of Colorado Boulder

/**
 * Make the package.json contents available to the simulation, so it can access the version, sim name, etc.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import joist from './joist.js';

const packageJSON = ( window.phet && phet.chipper ) ? phet.chipper.packageObject : { name: 'placeholder' };

joist.register( 'packageJSON', packageJSON );

export default packageJSON;