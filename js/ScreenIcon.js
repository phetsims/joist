// Copyright 2015-2021, University of Colorado Boulder

/**
 * An icon suitable for one of the screen-selection buttons on the home screen or navigation bar.
 * By default, the size is optimized for the home screen.
 * To optimize for the navigation bar, use options.size: Screen.MINIMUM_NAVBAR_ICON_SIZE
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import merge from '../../phet-core/js/merge.js';
import { Node } from '../../scenery/js/imports.js';
import { Rectangle } from '../../scenery/js/imports.js';
import joist from './joist.js';
import Screen from './Screen.js';

class ScreenIcon extends Node {

  /**
   * @param {Node} iconNode
   * @param {Object} [options]
   */
  constructor( iconNode, options ) {

    options = merge( {
      size: Screen.MINIMUM_HOME_SCREEN_ICON_SIZE, // {Dimension2} size of the background
      maxIconWidthProportion: 0.85, // max proportion of the background width occupied by iconNode, (0,1]
      maxIconHeightProportion: 0.85, // max proportion of the background height occupied by iconNode, (0,1]
      fill: 'white', // {Color|string} background fill
      stroke: null // {Color|string} background stroke
    }, options );

    assert && assert( options.maxIconWidthProportion > 0 && options.maxIconWidthProportion <= 1 );
    assert && assert( options.maxIconHeightProportion > 0 && options.maxIconHeightProportion <= 1 );

    const background = new Rectangle( 0, 0, options.size.width, options.size.height, {
      fill: options.fill,
      stroke: options.stroke
    } );

    iconNode.setScaleMagnitude( Math.min(
      options.maxIconWidthProportion * background.width / iconNode.width,
      options.maxIconHeightProportion * background.height / iconNode.height
    ) );
    iconNode.center = background.center;
    iconNode.pickable = false;

    assert && assert( !options.children, 'ScreenIcon sets children' );
    options.children = [ background, iconNode ];

    super( options );
  }
}

joist.register( 'ScreenIcon', ScreenIcon );
export default ScreenIcon;