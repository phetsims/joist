// Copyright 2015-2020, University of Colorado Boulder

/**
 * Generate a rasterized screenshot for a simulation using scenery's built-in machinery.
 * Used in phet-io as well as PhetMenu (optionally)
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Matrix3 from '../../dot/js/Matrix3.js';
import { CanvasContextWrapper } from '../../scenery/js/imports.js';
import { Utils } from '../../scenery/js/imports.js';
import joist from './joist.js';

class ScreenshotGenerator {

  /**
   * Given a sim, generate a screenshot as a data url
   * @param {Sim} sim
   * @param {string} [mimeType] - String for the image mimeType, defaults to 'image/png'
   * @returns {string} dataURL
   * @public
   */
  static generateScreenshot( sim, mimeType ) {

    // Default to PNG
    mimeType = mimeType || 'image/png';

    // set up our Canvas with the correct background color
    const canvas = document.createElement( 'canvas' );
    const context = canvas.getContext( '2d' );

    const backingScale = Utils.backingScale( context );
    canvas.width = sim.display.width * backingScale;
    canvas.height = sim.display.height * backingScale;

    context.scale( backingScale, backingScale );
    context.fillStyle = sim.display.domElement.style.backgroundColor;
    context.fillRect( 0, 0, canvas.width, canvas.height );
    const wrapper = new CanvasContextWrapper( canvas, context );

    sim.rootNode.renderToCanvasSubtree( wrapper, Matrix3.scaling( backingScale ) );

    // get the data URL in PNG format
    return canvas.toDataURL( mimeType );
  }
}

joist.register( 'ScreenshotGenerator', ScreenshotGenerator );
export default ScreenshotGenerator;