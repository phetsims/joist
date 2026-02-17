// Copyright 2024-2025, University of Colorado Boulder

/**
 * A Property whose value will change with the "region and culture", and will take a value that can be used with Images.
 *
 * @author Jonathan Olson (PhET Interactive Simulations)
 */

import { DerivedProperty1 } from '../../../axon/js/DerivedProperty.js';
import { type ImageableImage } from '../../../scenery/js/nodes/Imageable.js';
import joist from '../joist.js';
import concreteRegionAndCultureProperty, { type ConcreteRegionAndCulture, concreteRegionAndCultureValues } from './concreteRegionAndCultureProperty.js';

export default class LocalizedImageProperty extends DerivedProperty1<ImageableImage, ConcreteRegionAndCulture> {
  public constructor(
    // The name of the image, for debugging purposes (from the ${repo}-images.json file)
    public readonly imageName: string,

    // Allow optional, so that we can support a subset of regionAndCultures.
    // BUT also require the usa regionAndCulture, so that we can always have a fallback.
    private readonly imageMap: Partial<Record<ConcreteRegionAndCulture, ImageableImage>> & { usa: ImageableImage }
  ) {
    assert && Object.keys( imageMap ).forEach( regionAndCulture => {
      assert && assert( concreteRegionAndCultureValues.includes( regionAndCulture as ConcreteRegionAndCulture ),
        `Unsupported regionAndCulture provided to LocalizedImageProperty: ${regionAndCulture}` );
    } );

    assert && concreteRegionAndCultureValues.forEach( regionAndCulture => {
      assert && assert( regionAndCulture in imageMap, `Missing image for regionAndCulture: ${regionAndCulture}` );
    } );

    super( [ concreteRegionAndCultureProperty ], ( regionAndCulture: ConcreteRegionAndCulture ) => {
      const image = imageMap[ regionAndCulture ]!;
      assert && assert( image );

      return image;
    } );
  }
}

joist.register( 'LocalizedImageProperty', LocalizedImageProperty );