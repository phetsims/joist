// Copyright 2013-2022, University of Colorado Boulder

/**
 * Decorative frame around the selected node
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Bounds2 from '../../dot/js/Bounds2.js';
import optionize from '../../phet-core/js/optionize.js';
import { LinearGradient, Node, Rectangle, NodeOptions } from '../../scenery/js/imports.js';
import joist from './joist.js';

type SelfOptions = {
  xMargin1?: number;
  yMargin1?: number;
  cornerRadius?: number; // radius of the rounded corners on the background
};
export type FrameOptions = SelfOptions & NodeOptions;

class Frame extends Node {

  private readonly gradient: LinearGradient;
  private readonly highlightRectangle: Rectangle;

  public constructor( content: Node, providedOptions?: FrameOptions ) {

    // default options
    const options = optionize<FrameOptions, SelfOptions, NodeOptions>()( {
      xMargin1: 6,
      yMargin1: 6,
      cornerRadius: 0
    }, providedOptions );

    super();

    const frameWidth = content.width + 2 * options.xMargin1;
    const frameHeight = content.height + 2 * options.yMargin1;

    this.gradient = new LinearGradient( 0, 0, frameWidth, 0 )
      .addColorStop( 0, '#fbff41' )
      .addColorStop( 118 / 800.0, '#fef98b' )
      .addColorStop( 372 / 800.0, '#feff40' )
      .addColorStop( 616 / 800, '#fffccd' )
      .addColorStop( 1, '#fbff41' );

    const rectangle = new Rectangle( 0, 0, frameWidth, frameHeight, options.cornerRadius, options.cornerRadius, {
      stroke: this.gradient,
      lineWidth: 3,
      x: content.x - options.xMargin1,
      y: content.y - options.yMargin1
    } );
    this.addChild( rectangle );

    // Apply options after the layout is done, so that options that use the bounds will work properly.
    this.mutate( options );

    // highlight rectangle is always in the scene graph to make sure the node is positioned properly
    // but only visible when highlighted
    const frameBounds = Bounds2.rect( rectangle.x, rectangle.y, frameWidth, frameHeight );
    this.highlightRectangle = Rectangle.bounds( frameBounds.dilated( 0.75 ), {
      stroke: 'transparent',
      lineWidth: 4.5
    } );
    this.addChild( this.highlightRectangle );
  }

  public setHighlighted( highlighted: boolean ): void {
    this.highlightRectangle.stroke = highlighted ? this.gradient : 'transparent';
  }
}

joist.register( 'Frame', Frame );
export default Frame;