// Copyright 2022, University of Colorado Boulder

/**
 * Enumeration for the types of Preferences that can appear in the Preferences Dialog.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import Enumeration from '../../../phet-core/js/Enumeration.js';
import EnumerationValue from '../../../phet-core/js/EnumerationValue.js';
import joist from '../joist.js';

export default class PreferencesType extends EnumerationValue {
  public static OVERVIEW = new PreferencesType();
  public static GENERAL = new PreferencesType();
  public static VISUAL = new PreferencesType();
  public static AUDIO = new PreferencesType();
  public static INPUT = new PreferencesType();
  public static LOCALIZATION = new PreferencesType();

  public static enumeration = new Enumeration( PreferencesType );
}

joist.register( 'PreferencesType', PreferencesType );
