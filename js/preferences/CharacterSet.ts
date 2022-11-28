// Copyright 2022, University of Colorado Boulder

/**
 * A base class for CharacterSets used in representing region and culture preferences
 *
 * @author Marla Schulz (PhET Interactive Simulations)
 *
 */

import { Image } from '../../../scenery/js/imports.js';

type CharacterImageSet = {
  characterImage?: Image;
  headshotImage: Image;
  leftImage?: Image;
  rightImage?: Image;
};

export default class CharacterSet {

  public readonly imageSets: Array<CharacterImageSet>;

  public constructor() {
    this.imageSets = [];
  }
}