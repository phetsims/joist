// Copyright 2015-2020, University of Colorado Boulder

/**
 * Generate a rasterized screenshot for a simulation using scenery's built-in machinery.
 * Used in phet-io as well as PhetMenu (optionally)
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import inherit from '../../phet-core/js/inherit.js';
import CanvasContextWrapper from '../../scenery/js/util/CanvasContextWrapper.js';
import joist from './joist.js';

/**
 *
 * @constructor
 */
function ScreenshotGenerator() {
}

joist.register( 'ScreenshotGenerator', ScreenshotGenerator );

export default inherit( Object, ScreenshotGenerator, {}, {

  /**
   * Given a sim, generate a screenshot as a data url
   * @param {Sim} sim
   * @param {string} [mimeType] - String for the image mimeType, defaults to 'image/png'
   * @returns {string} dataURL
   * @public
   */
  generateScreenshot: function( sim, mimeType ) {

    // Default to PNG
    mimeType = mimeType || 'image/png';

    // set up our Canvas with the correct background color
    const canvas = document.createElement( 'canvas' );
    canvas.width = sim.display.width;
    canvas.height = sim.display.height;
    const context = canvas.getContext( '2d' );
    context.fillStyle = sim.display.domElement.style.backgroundColor;
    context.fillRect( 0, 0, canvas.width, canvas.height );
    const wrapper = new CanvasContextWrapper( canvas, context );

    sim.rootNode.renderToCanvasSubtree( wrapper );

    // get the data URL in PNG format
    const dataURL = canvas.toDataURL( mimeType );

    return dataURL;
  }
} );