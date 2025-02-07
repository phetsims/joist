// Copyright 2020-2023, University of Colorado Boulder

/**
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import BasicActionsKeyboardHelpSection from '../../scenery-phet/js/keyboard/help/BasicActionsKeyboardHelpSection.js';
import Node from '../../scenery/js/nodes/Node.js';
import joist from './joist.js';

class HomeScreenKeyboardHelpContent extends Node {
  public constructor() {
    const basicActionsKeyboardHelpSection = new BasicActionsKeyboardHelpSection();
    super( {
      children: [ basicActionsKeyboardHelpSection ]
    } );
  }
}

joist.register( 'HomeScreenKeyboardHelpContent', HomeScreenKeyboardHelpContent );

export default HomeScreenKeyboardHelpContent;