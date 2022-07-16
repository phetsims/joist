// Copyright 2015-2022, University of Colorado Boulder

/**
 * Make the package.json contents available to the simulation, so it can access the version, sim name, etc.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import joist from './joist.js';

const packageString = JSON.stringify( ( window.phet && phet.chipper ) ? phet.chipper.packageObject : { name: 'placeholder' } );

const packageJSON = JSON.parse( packageString );

joist.register( 'packageJSON', packageJSON );

export default packageJSON;