// Copyright 2013-2019, University of Colorado Boulder

/**
 * Highlight node for navigation bar screen buttons, phet button, etc.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chris Malley (PixelZoom, Inc.)
 */
define( require => {
  'use strict';

  // modules
  const Color = require( 'SCENERY/util/Color' );
  const HBox = require( 'SCENERY/nodes/HBox' );
  const inherit = require( 'PHET_CORE/inherit' );
  const joist = require( 'JOIST/joist' );
  const LinearGradient = require( 'SCENERY/util/LinearGradient' );
  const Rectangle = require( 'SCENERY/nodes/Rectangle' );

  /**
   * @param {number} width
   * @param {number} height
   * @param {Object} [options]
   * @constructor
   */
  function HighlightNode( width, height, options ) {

    options = _.extend( {
      fill: 'white',
      highlightWidth: 1,
      pickable: false
    }, options );

    const innerColor = options.fill;
    const outerColor = Color.toColor( innerColor ).withAlpha( 0 ); // transparent

    const barOptions = {
      fill: new LinearGradient( 0, 0, 0, height )
        .addColorStop( 0, outerColor )
        .addColorStop( 0.5, innerColor )
        .addColorStop( 1, outerColor )
    };
    const leftBar = new Rectangle( 0, 0, options.highlightWidth, height, barOptions );
    const rightBar = new Rectangle( 0, 0, options.highlightWidth, height, barOptions );

    options.children = [ leftBar, rightBar ];
    options.spacing = width;
    HBox.call( this, options );
  }

  joist.register( 'HighlightNode', HighlightNode );

  return inherit( HBox, HighlightNode );
} );
