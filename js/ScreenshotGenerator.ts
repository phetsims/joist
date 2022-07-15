// Copyright 2015-2021, University of Colorado Boulder

/**
 * Generate a rasterized screenshot for a simulation using scenery's built-in machinery.
 * Used in phet-io as well as PhetMenu (optionally)
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Matrix3 from '../../dot/js/Matrix3.js';
import { CanvasContextWrapper, Utils } from '../../scenery/js/imports.js';
import joist from './joist.js';
import Sim from './Sim.js';

class ScreenshotGenerator {

  /**
   * Given a sim, generate a screenshot as a data url
   * @param sim
   * @param mimeType - String for the image mimeType, defaults to 'image/png'
   * @returns dataURL
   */
  public static generateScreenshot( sim: Sim, mimeType = 'image/png' ): string {

    // set up our Canvas with the correct background color
    const canvas = document.createElement( 'canvas' );
    const context = canvas.getContext( '2d' )!;

    assert && assert( context );
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