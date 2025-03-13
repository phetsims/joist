// Copyright 2020-2025, University of Colorado Boulder

/**
 * Message dialog displayed when any public query parameters have invalid values, see https://github.com/phetsims/joist/issues/593
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 * @author Chris Malley (PixelZoom, Inc.)
 */

import optionize, { type EmptySelfOptions } from '../../phet-core/js/optionize.js';
import { type Warning } from '../../query-string-machine/js/QueryStringMachineModule.js';
import OopsDialog, { type OopsDialogOptions } from '../../scenery-phet/js/OopsDialog.js';
import PhetFont from '../../scenery-phet/js/PhetFont.js';
import Text from '../../scenery/js/nodes/Text.js';
import Tandem from '../../tandem/js/Tandem.js';
import joist from './joist.js';
import JoistStrings from './JoistStrings.js';

type SelfOptions = EmptySelfOptions;
export type QueryParametersWarningDialogOptions = SelfOptions & OopsDialogOptions;

class QueryParametersWarningDialog extends OopsDialog {

  /**
   * @param warnings - see QueryStringMachine.warnings
   * @param [providedOptions]
   */
  public constructor( warnings: Warning[], providedOptions?: QueryParametersWarningDialogOptions ) {

    assert && assert( warnings.length > 0, `expected 1 or more warnings: ${warnings.length}` );

    const options = optionize<QueryParametersWarningDialogOptions, SelfOptions, OopsDialogOptions>()( {

      // OopsDialogOptions
      richTextOptions: {
        font: new PhetFont( 16 )
      },
      title: new Text( JoistStrings.queryParametersWarningDialog.invalidQueryParametersStringProperty, {
        font: new PhetFont( 28 )
      } ),

      tandem: Tandem.OPT_OUT
    }, providedOptions );

    // add warnings to generic message
    let message = `${JoistStrings.queryParametersWarningDialog.oneOrMoreQueryParametersStringProperty.value}<br><br>`;
    warnings.forEach( warning => {
      message += `${warning.key}=${warning.value}<br>`;
    } );
    message += `<br>${JoistStrings.queryParametersWarningDialog.theSimulationWillStartStringProperty.value}`;

    super( message, options );
  }
}

joist.register( 'QueryParametersWarningDialog', QueryParametersWarningDialog );
export default QueryParametersWarningDialog;