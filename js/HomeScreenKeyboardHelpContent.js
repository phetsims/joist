// Copyright 2020, University of Colorado Boulder

/**
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import GeneralKeyboardHelpSection from '../../scenery-phet/js/keyboard/help/GeneralKeyboardHelpSection.js';
import Node from '../../scenery/js/nodes/Node.js';
import joist from './joist.js';

class HomeScreenKeyboardHelpContent extends Node {

  constructor() {
    super( {
      children: [ new GeneralKeyboardHelpSection() ]
    } );
  }
}

joist.register( 'HomeScreenKeyboardHelpContent', HomeScreenKeyboardHelpContent );

export default HomeScreenKeyboardHelpContent;