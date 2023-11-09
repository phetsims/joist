// Copyright 2023, University of Colorado Boulder

/**
 * RegionAndCultureHeadshotIcon creates a square icon image that is as a visual indicator in the
 * regionAndCultureComboBox to identify the different region and cultures users can choose.
 *
 * @author Marla Schulz (PhET Interactive Simulations)
 *
 */

import joist from '../joist.js';
import { Image, ImageOptions } from '../../../scenery/js/imports.js';
import optionize, { combineOptions } from '../../../phet-core/js/optionize.js';
import { Shape } from '../../../kite/js/imports.js';
import StrictOmit from '../../../phet-core/js/types/StrictOmit.js';


type SelfOptions = {
  yClipAreaStart?: number;
  xClipAreaStart?: number;
  headshotDimension?: number;
};

type RegionAndCultureHeadshotIconOptions = SelfOptions & StrictOmit<ImageOptions, 'clipArea' | 'image'>;

export default class RegionAndCultureHeadshotIcon extends Image {

  public constructor( image: HTMLImageElement, providedOptions: RegionAndCultureHeadshotIconOptions ) {
    const options = optionize<RegionAndCultureHeadshotIconOptions, SelfOptions, ImageOptions>()( {
      yClipAreaStart: 0,
      xClipAreaStart: 0,
      headshotDimension: 40, // based off of a scale factor of 1
      renderer: 'canvas' //this is specifically addressing a Safari clip-area bug. https://github.com/phetsims/center-and-variability/issues/561
    }, providedOptions );

    const clipArea = Shape.rectangle( options.xClipAreaStart, options.yClipAreaStart,
      options.xClipAreaStart + options.headshotDimension, options.yClipAreaStart + options.headshotDimension );

    const imageOptions = combineOptions<ImageOptions>( {
      clipArea: clipArea
    }, options );

    super( image, imageOptions );
  }
}

joist.register( 'RegionAndCultureHeadshotIcon', RegionAndCultureHeadshotIcon );