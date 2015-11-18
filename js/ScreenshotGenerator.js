// Copyright 2015, University of Colorado Boulder

/**
 * Generate a rasterized screenshot for a simulation using scenery's built-in machinery.
 * Used in together as well as PhetMenu (optionally)
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var CanvasContextWrapper = require( 'SCENERY/util/CanvasContextWrapper' );
  var joist = require( 'JOIST/joist' );

  /**
   *
   * @constructor
   */
  function ScreenshotGenerator() {
  }

  joist.register( 'ScreenshotGenerator', ScreenshotGenerator );

  return inherit( Object, ScreenshotGenerator, {}, {

    // @public - Given a sim, generate a screenshot as a data url
    generateScreenshot: function( sim ) {

      // set up our Canvas with the correct background color
      var canvas = document.createElement( 'canvas' );
      canvas.width = sim.display.width;
      canvas.height = sim.display.height;
      var context = canvas.getContext( '2d' );
      context.fillStyle = sim.display.domElement.style.backgroundColor;
      context.fillRect( 0, 0, canvas.width, canvas.height );
      var wrapper = new CanvasContextWrapper( canvas, context );

      // only render the desired parts to the Canvas (i.e. not the overlay and menu that are visible)
      if ( sim.showHomeScreen ) {
        sim.homeScreen.view.renderToCanvasSubtree( wrapper, sim.homeScreen.view.getLocalToGlobalMatrix() );
      }
      else {
        var view = sim.screens[ sim.screenIndex ].view;
        var navbar = sim.navigationBar;

        view.renderToCanvasSubtree( wrapper, view.getLocalToGlobalMatrix() );
        navbar.renderToCanvasSubtree( wrapper, navbar.getLocalToGlobalMatrix() );
      }

      // get the data URL in PNG format
      var dataURL = canvas.toDataURL( [ 'image/png' ] );

      return dataURL;
    }
  } );
} );