// Copyright 2020-2022, University of Colorado Boulder

/**
 * Message dialog displayed when any public query parameters have invalid values, see https://github.com/phetsims/joist/issues/593
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 * @author Chris Malley (PixelZoom, Inc.)
 */

import optionize from '../../phet-core/js/optionize.js';
import OopsDialog, { OopsDialogOptions } from '../../scenery-phet/js/OopsDialog.js';
import PhetFont from '../../scenery-phet/js/PhetFont.js';
import { Text } from '../../scenery/js/imports.js';
import joist from './joist.js';
import joistStrings from './joistStrings.js';

const queryParametersWarningDialogInvalidQueryParametersString = joistStrings.queryParametersWarningDialog.invalidQueryParameters;
const queryParametersWarningDialogOneOrMoreQueryParametersString = joistStrings.queryParametersWarningDialog.oneOrMoreQueryParameters;
const queryParametersWarningDialogTheSimulationWillStartString = joistStrings.queryParametersWarningDialog.theSimulationWillStart;

type SelfOptions = {};
export type QueryParametersWarningDialogOptions = SelfOptions & OopsDialogOptions;

class QueryParametersWarningDialog extends OopsDialog {

  /**
   * @param warnings - see QueryStringMachine.warnings
   * @param [providedOptions]
   */
  //TODO https://github.com/phetsims/chipper/issues/1253 QueryStringMachine.warnings needs a type, to replace any here
  public constructor( warnings: any[], providedOptions?: QueryParametersWarningDialogOptions ) {

    assert && assert( warnings.length > 0, `expected 1 or more warnings: ${warnings.length}` );

    const options = optionize<QueryParametersWarningDialogOptions, SelfOptions, OopsDialogOptions>()( {

      // OopsDialogOptions
      richTextOptions: {
        font: new PhetFont( 16 )
      },
      title: new Text( queryParametersWarningDialogInvalidQueryParametersString, {
        font: new PhetFont( 28 )
      } )

    }, providedOptions );

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