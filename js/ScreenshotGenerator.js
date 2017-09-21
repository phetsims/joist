// Copyright 2015-2017, University of Colorado Boulder

/**
 * Generate a rasterized screenshot for a simulation using scenery's built-in machinery.
 * Used in phet-io as well as PhetMenu (optionally)
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var CanvasContextWrapper = require( 'SCENERY/util/CanvasContextWrapper' );
  var inherit = require( 'PHET_CORE/inherit' );
  var joist = require( 'JOIST/joist' );

  /**
   *
   * @constructor
   */
  function ScreenshotGenerator() {
  }

  joist.register( 'ScreenshotGenerator', ScreenshotGenerator );

  return inherit( Object, ScreenshotGenerator, {}, {

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
      var canvas = document.createElement( 'canvas' );
      canvas.width = sim.display.width;
      canvas.height = sim.display.height;
      var context = canvas.getContext( '2d' );
      context.fillStyle = sim.display.domElement.style.backgroundColor;
      context.fillRect( 0, 0, canvas.width, canvas.height );
      var wrapper = new CanvasContextWrapper( canvas, context );

      sim.rootNode.renderToCanvasSubtree( wrapper );

      // get the data URL in PNG format
      var dataURL = canvas.toDataURL( mimeType );

      return dataURL;
    }
  } );
} );