// Copyright 2015-2022, University of Colorado Boulder

/**
 * ScreenIcon is an icon that is suitable for one of the screen-selection buttons on the home screen or navigation bar.
 * By default, the size is optimized for the home screen.
 * To optimize for the navigation bar, use options.size: Screen.MINIMUM_NAVBAR_ICON_SIZE
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import optionize from '../../phet-core/js/optionize.js';
import { IColor, Node, NodeOptions, Rectangle } from '../../scenery/js/imports.js';
import joist from './joist.js';
import Screen from './Screen.js';
import Dimension2 from '../../dot/js/Dimension2.js';

type SelfOptions = {
  size?: Dimension2; // size of the background
  maxIconWidthProportion?: number; // max proportion of the background width occupied by iconNode, (0,1]
  maxIconHeightProportion?: number; // max proportion of the background height occupied by iconNode, (0,1]
  fill?: IColor; // {Color|string} background fill
  stroke?: IColor; // {Color|string} background stroke
};

export type ScreenIconOptions = SelfOptions & NodeOptions;

export default class ScreenIcon extends Node {

  /**
   * @param iconNode
   * @param providedOptions
   */
  constructor( iconNode: Node, providedOptions?: ScreenIconOptions ) {

    const options = optionize<ScreenIconOptions, SelfOptions, NodeOptions>()( {

      // SelfOptions
      size: Screen.MINIMUM_HOME_SCREEN_ICON_SIZE, // {Dimension2} size of the background
      maxIconWidthProportion: 0.85, // max proportion of the background width occupied by iconNode, (0,1]
      maxIconHeightProportion: 0.85, // max proportion of the background height occupied by iconNode, (0,1]
      fill: 'white', // {Color|string} background fill
      stroke: null // {Color|string} background stroke
    }, providedOptions );

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