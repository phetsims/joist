// Copyright 2022, University of Colorado Boulder

/**
 * A section subtitle for preferences dialog. The section subtitle can, but is not required to
 * include: title, description, and a toggleSwitch
 *
 * @author Marla Schulz (PhET Interactive Simulations)
 *
 */

import Property from '../../../axon/js/Property.js';
import { Node, RichText } from '../../../scenery/js/imports.js';
import joist from '../joist.js';

type SelfOptions = {
  toggleProperty: Property<boolean>;
  titleStringProperty: Property<string>;
  description: RichText;
};

export default class PreferencesSectionSubtitle extends Node {

  public constructor( providedOptions: SelfOptions ) {
   super();
  }
}

joist.register( 'PreferencesSectionSubtitle', PreferencesSectionSubtitle );