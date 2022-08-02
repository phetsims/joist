// Copyright 2013-2022, University of Colorado Boulder

/**
 * Highlight node for navigation bar screen buttons, phet button, etc.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chris Malley (PixelZoom, Inc.)
 */

import optionize from '../../phet-core/js/optionize.js';
import { Color, HBox, HBoxOptions, TColor, LinearGradient, Rectangle } from '../../scenery/js/imports.js';
import joist from './joist.js';

type SelfOptions = {
  highlightWidth?: number;
  fill?: TColor;
};
type HighlightNodeOptions = SelfOptions & HBoxOptions;

class HighlightNode extends HBox {

  /**
   * @param width - can be mutated with the `spacing` property.
   * @param height
   * @param [providedOptions]
   */
  public constructor( width: number, height: number, providedOptions?: HighlightNodeOptions ) {

    const options = optionize<HighlightNodeOptions, SelfOptions, HBoxOptions>()( {
      fill: 'white',
      highlightWidth: 1,
      pickable: false
    }, providedOptions );

    assert && assert( options.spacing === undefined, 'HighlightNode sets spacing' );
    options.spacing = width;

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

    assert && assert( !options.children, 'HighlightNode sets children' );
    options.children = [ leftBar, rightBar ];

    super( options );
  }
}

joist.register( 'HighlightNode', HighlightNode );
export default HighlightNode;