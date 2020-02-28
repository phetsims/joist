// Copyright 2013-2020, University of Colorado Boulder

/**
 * Highlight node for navigation bar screen buttons, phet button, etc.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chris Malley (PixelZoom, Inc.)
 */

import inherit from '../../phet-core/js/inherit.js';
import merge from '../../phet-core/js/merge.js';
import HBox from '../../scenery/js/nodes/HBox.js';
import Rectangle from '../../scenery/js/nodes/Rectangle.js';
import Color from '../../scenery/js/util/Color.js';
import LinearGradient from '../../scenery/js/util/LinearGradient.js';
import joist from './joist.js';

/**
 * @param {number} width
 * @param {number} height
 * @param {Object} [options]
 * @constructor
 */
function HighlightNode( width, height, options ) {

  options = merge( {
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

inherit( HBox, HighlightNode );
export default HighlightNode;