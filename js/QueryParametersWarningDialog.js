// Copyright 2020, University of Colorado Boulder

/**
 * Message dialog displayed when any public query parameters have invalid values, see https://github.com/phetsims/joist/issues/593
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 * @author Chris Malley (PixelZoom, Inc.)
 */

import merge from '../../phet-core/js/merge.js';
import OopsDialog from '../../scenery-phet/js/OopsDialog.js';
import PhetFont from '../../scenery-phet/js/PhetFont.js';
import Text from '../../scenery/js/nodes/Text.js';
import Tandem from '../../tandem/js/Tandem.js';
import joist from './joist.js';
import joistStrings from './joistStrings.js';

const queryParametersWarningDialogInvalidQueryParametersString = joistStrings.queryParametersWarningDialog.invalidQueryParameters;
const queryParametersWarningDialogOneOrMoreQueryParametersString = joistStrings.queryParametersWarningDialog.oneOrMoreQueryParameters;
const queryParametersWarningDialogTheSimulationWillStartString = joistStrings.queryParametersWarningDialog.theSimulationWillStart;

class QueryParametersWarningDialog extends OopsDialog {

  /**
   * @param {Object[]} warnings - see QueryStringMachine.warnings
   * @param {Object} [options]
   */
  constructor( warnings, options ) {

    assert && assert( warnings.length > 0, `expected 1 or more warnings: ${warnings.length}` );

    options = merge( {

      // OopsDialog options
      richTextOptions: {
        font: new PhetFont( 16 )
      },

      // Dialog options
      title: new Text( queryParametersWarningDialogInvalidQueryParametersString, {
        font: new PhetFont( 28 )
      } ),
      tandem: Tandem.OPT_OUT
    }, options );

    // add warnings to generic message
    let message = `${queryParametersWarningDialogOneOrMoreQueryParametersString}<br><br>`;
    warnings.forEach( warning => {
      message += `${warning.key}=${warning.value}<br>`;
    } );
    message += `<br>${queryParametersWarningDialogTheSimulationWillStartString}`;

    super( message, options );
  }
}

joist.register( 'QueryParametersWarningDialog', QueryParametersWarningDialog );
export default QueryParametersWarningDialog;