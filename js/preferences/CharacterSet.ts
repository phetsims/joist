// Copyright 2022, University of Colorado Boulder

/**
 * A base class for CharacterSets used in representing region and culture preferences
 *
 * @author Marla Schulz (PhET Interactive Simulations)
 *
 */

import { Node } from '../../../scenery/js/imports.js';
import joist from '../joist.js';

export default class CharacterSet {

  // Icon for the UI component that would select this character set
  public readonly icon: Node;

  // Label string for the UI component that will select this character set
  public readonly label: string;

  public constructor( icon: Node, label: string ) {
    this.icon = icon;
    this.label = label;
  }
}

joist.register( 'CharacterSet', CharacterSet );