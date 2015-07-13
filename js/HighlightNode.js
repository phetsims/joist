// Copyright 2002-2013, University of Colorado Boulder

/**
 * Highlight node for navigation bar screen buttons, phet button, etc.
 *
 * @author Sam Reid
 * @author Chris Malley (PixelZoom, Inc.)
 */
define( function( require ) {
  'use strict';

  // modules
  var HBox = require( 'SCENERY/nodes/HBox' );
  var inherit = require( 'PHET_CORE/inherit' );
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
      whiteHighlight: true,
      hightlightWidth: 1,
      pickable: false
    }, options );

    //TODO joist#222 innerColor should be options.fill, outerColor should be transparent
    var innerColor = options.whiteHighlight ? 'white' : 'black';
    var outerColor = options.whiteHighlight ? 'black' : 'white';

    var barOptions = {
      fill: new LinearGradient( 0, 0, 0, height ).addColorStop( 0, outerColor ).addColorStop( 0.5, innerColor ).addColorStop( 1, outerColor )
    };
    var leftBar = new Rectangle( 0, 0, options.hightlightWidth, height, barOptions );
    var rightBar = new Rectangle( 0, 0, options.hightlightWidth, height, barOptions );

    options.children = [ leftBar, rightBar ];
    options.spacing = width;
    HBox.call( this, options );
  }

  return inherit( HBox, HighlightNode );
} );
