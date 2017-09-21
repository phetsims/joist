// Copyright 2013-2017, University of Colorado Boulder

/**
 * Highlight node for navigation bar screen buttons, phet button, etc.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chris Malley (PixelZoom, Inc.)
 */
define( function( require ) {
  'use strict';

  // modules
  var Color = require( 'SCENERY/util/Color' );
  var HBox = require( 'SCENERY/nodes/HBox' );
  var inherit = require( 'PHET_CORE/inherit' );
  var joist = require( 'JOIST/joist' );
  var LinearGradient = require( 'SCENERY/util/LinearGradient' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );

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

    var innerColor = options.fill;
    var outerColor = Color.toColor( innerColor ).withAlpha( 0 ); // transparent

    var barOptions = {
      fill: new LinearGradient( 0, 0, 0, height )
        .addColorStop( 0, outerColor )
        .addColorStop( 0.5, innerColor )
        .addColorStop( 1, outerColor )
    };
    var leftBar = new Rectangle( 0, 0, options.highlightWidth, height, barOptions );
    var rightBar = new Rectangle( 0, 0, options.highlightWidth, height, barOptions );

    options.children = [ leftBar, rightBar ];
    options.spacing = width;
    HBox.call( this, options );
  }

  joist.register( 'HighlightNode', HighlightNode );

  return inherit( HBox, HighlightNode );
} );
