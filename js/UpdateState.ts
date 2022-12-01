// Copyright 2019-2022, University of Colorado Boulder

/**
 * Enumeration for the various states that can occur during an Update check. See updateCheck.js for main usage.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import Enumeration from '../../phet-core/js/Enumeration.js';
import EnumerationValue from '../../phet-core/js/EnumerationValue.js';
import joist from './joist.js';

export default class UpdateState extends EnumerationValue {

  // Simulation version is equal to or greater than the currently published version.
  public static readonly UP_TO_DATE = new UpdateState();

  // Simulation version is less than currently published version (or equal but has a suffix)
  public static readonly OUT_OF_DATE = new UpdateState();

  // Request to server sent out, has not processed reply yet.
  public static readonly CHECKING = new UpdateState();

  // Last attempt to check failed, most likely offline
  public static readonly OFFLINE = new UpdateState();

  // No attempt as been made to check the version against the latest online.
  public static readonly UNCHECKED = new UpdateState();

  public static readonly enumeration = new Enumeration( UpdateState, {
    phetioDocumentation: 'Describes the states that can occur during an Update check'
  } );
}

joist.register( 'UpdateState', UpdateState );