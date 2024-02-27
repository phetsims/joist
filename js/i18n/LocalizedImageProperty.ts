// Copyright 2022, University of Colorado Boulder

/**
 * A Property whose value will change with the "region and culture", and will take a value that can be used with Images.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import { DerivedProperty1 } from '../../../axon/js/DerivedProperty.js';
import { ImageableImage } from '../../../scenery/js/imports.js';
import joist from '../joist.js';
import regionAndCultureProperty, { availableRegionAndCultures, availableRuntimeRegionAndCultures, RegionAndCulture } from './regionAndCultureProperty.js';

export default class LocalizedImageProperty extends DerivedProperty1<ImageableImage, RegionAndCulture> {
  public constructor(
    // The name of the image, for debugging purposes (from the ${repo}-images.json file)
    public readonly imageName: string,

    // Allow optional, so that we can support a subset of regionAndCultures.
    // BUT also require the usa regionAndCulture, so that we can always have a fallback.
    private readonly imageMap: { [ regionAndCulture in RegionAndCulture ]?: ImageableImage } & { usa: ImageableImage }
  ) {
    assert && Object.keys( imageMap ).forEach( regionAndCulture => {
      assert && assert( availableRegionAndCultures.includes( regionAndCulture as RegionAndCulture ),
        `Invalid regionAndCulture provided to LocalizedImageProperty: ${regionAndCulture}, either fix or update availableRegionAndCultures` );
    } );

    assert && availableRuntimeRegionAndCultures.forEach( regionAndCulture => {
      assert && assert( regionAndCulture in imageMap, `Missing image for regionAndCulture: ${regionAndCulture}` );
    } );

    super( [ regionAndCultureProperty ], ( regionAndCulture: RegionAndCulture ) => {
      const image = imageMap[ regionAndCulture ]!;
      assert && assert( image );

      return image;
    } );
  }
}

joist.register( 'LocalizedImageProperty', LocalizedImageProperty );
