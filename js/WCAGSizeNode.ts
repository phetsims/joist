// Copyright 2025, University of Colorado Boulder

/**
 * A quick-and-dirty Node to show the 24px and 44px squares (and equivalent circles) that would be needed for WCAG
 * compliance.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Circle from '../../scenery/js/nodes/Circle.js';
import Node from '../../scenery/js/nodes/Node.js';
import Rectangle from '../../scenery/js/nodes/Rectangle.js';
import joist from './joist.js';
import type ScreenView from './ScreenView.js';
import Vector2 from '../../dot/js/Vector2.js';
import DragListener from '../../scenery/js/listeners/DragListener.js';

class WCAGSizeNode extends Node {
  public constructor( screenView: ScreenView ) {
    const rectangleA = new Rectangle( 0, 0, 0, 0, { stroke: 'red', lineWidth: 1 } );
    const rectangleB = new Rectangle( 0, 0, 0, 0, { stroke: 'blue', lineWidth: 1 } );
    const circleA = new Circle( 10, { stroke: 'red', lineWidth: 1 } );
    const circleB = new Circle( 10, { stroke: 'blue', lineWidth: 1 } );

    super( {
      children: [
        rectangleA, rectangleB, circleA, circleB
      ],
      cursor: 'pointer',
      x: 200,
      y: 200
    } );
    screenView.transformEmitter.addListener( () => {
      const smallGlobalSize = 24;
      const largeGlobalSize = 44;

      const smallLocalSize = screenView.transform.inverseDeltaX( smallGlobalSize );
      const largeLocalSize = screenView.transform.inverseDeltaX( largeGlobalSize );

      rectangleA.setRect( 0, 0, smallLocalSize, smallLocalSize );
      rectangleB.setRect( 0, 0, largeLocalSize, largeLocalSize );
      circleA.radius = smallLocalSize * Math.sqrt( 2 ) / 2;
      circleB.radius = largeLocalSize * Math.sqrt( 2 ) / 2;

      circleA.center = Vector2.ZERO;
      circleB.center = Vector2.ZERO;
      rectangleA.center = Vector2.ZERO;
      rectangleB.center = Vector2.ZERO;

      this.moveToFront();
    } );

    this.addInputListener( new DragListener( {
      targetNode: this,
      translateNode: true
    } ) );
  }
}

joist.register( 'WCAGSizeNode', WCAGSizeNode );
export default WCAGSizeNode;