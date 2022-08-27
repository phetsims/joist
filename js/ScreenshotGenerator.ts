// Copyright 2015-2022, University of Colorado Boulder

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

  private static generateScreenshotAtIncreasedResolution( sim: Sim, scale: number ): HTMLCanvasElement {
    // set up our Canvas with the correct background color
    const canvas = document.createElement( 'canvas' );
    const context = canvas.getContext( '2d' )!;

    assert && assert( context );
    const backingScale = Utils.backingScale( context ) * scale;
    canvas.width = sim.display.width * backingScale;
    canvas.height = sim.display.height * backingScale;

    context.scale( backingScale, backingScale );
    context.fillStyle = sim.display.domElement.style.backgroundColor;
    context.fillRect( 0, 0, canvas.width, canvas.height );
    const wrapper = new CanvasContextWrapper( canvas, context );

    sim.rootNode.renderToCanvasSubtree( wrapper, Matrix3.scaling( backingScale ) );

    return canvas;
  }

  private static renderAtScale( raster: HTMLCanvasElement, scale: number ): HTMLCanvasElement {
    const canvas = document.createElement( 'canvas' );
    const context = canvas.getContext( '2d' )!;

    canvas.width = raster.width * scale;
    canvas.height = raster.height * scale;

    context.scale( scale, scale );
    context.drawImage( raster, 0, 0 );
    return canvas;
  }

  // Default to PNG
  public static generateScreenshot( sim: Sim, mimeType = 'image/png' ): string {
    const res2x = ScreenshotGenerator.generateScreenshotAtIncreasedResolution( sim, 2 );
    const res1x = ScreenshotGenerator.renderAtScale( res2x, 1 / 2 );

    // get the data URL in PNG format
    return res1x.toDataURL( mimeType );
  }
}

joist.register( 'ScreenshotGenerator', ScreenshotGenerator );
export default ScreenshotGenerator;