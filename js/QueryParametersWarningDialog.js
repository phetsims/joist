// Copyright 2020, University of Colorado Boulder

/**
 * Message dialog displayed when any public query parameters have invalid values, see https://github.com/phetsims/joist/issues/593
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 * @author Chris Malley (PixelZoom, Inc.)
 */
define( require => {
  'use strict';

  // modules
  const merge = require( 'PHET_CORE/merge' );
  const OopsDialog = require( 'SCENERY_PHET/OopsDialog' );
  const PhetFont = require( 'SCENERY_PHET/PhetFont' );
  const joist = require( 'JOIST/joist' );
  const Text = require( 'SCENERY/nodes/Text' );

  // strings
  const queryParametersWarningDialogInvalidQueryParametersString = require( 'string!JOIST/queryParametersWarningDialog.invalidQueryParameters' );
  const queryParametersWarningDialogOneOrMoreQueryParametersString = require( 'string!JOIST/queryParametersWarningDialog.oneOrMoreQueryParameters' );
  const queryParametersWarningDialogTheSimulationWillStartString = require( 'string!JOIST/queryParametersWarningDialog.theSimulationWillStart' );

  class QueryParametersWarningDialog extends OopsDialog {

    /**
     * @param {Object[]} warnings - see QueryStringMachine.warnings
     * @param {Object} [options]
     */
    constructor( warnings, options ) {

      assert && assert( warnings.length > 0, 'expected 1 or more warnings: ' + warnings.length );

      options = merge( {

        // OopsDialog options
        richTextOptions: {
          font: new PhetFont( 16 )
        },

        // Dialog options
        title: new Text( queryParametersWarningDialogInvalidQueryParametersString, {
          font: new PhetFont( 28 )
        } )

      }, options );

      // add warnings to generic message
      let message = queryParametersWarningDialogOneOrMoreQueryParametersString + '<br><br>';
      warnings.forEach( warning => {
        message += `${warning.key}=${warning.value}<br>`;
      } );
      message += '<br>' + queryParametersWarningDialogTheSimulationWillStartString;

      super( message, options );
    }
  }

  return joist.register( 'QueryParametersWarningDialog', QueryParametersWarningDialog );
} );