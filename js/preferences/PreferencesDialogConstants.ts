// Copyright 2022, University of Colorado Boulder

/**
 * Styling and layout option constants for preference dialog components
 *
 * @author Marla Schulz (PhET Interactive Simulations)
 *
 */

import Dimension2 from '../../../dot/js/Dimension2.js';
import PhetFont from '../../../scenery-phet/js/PhetFont.js';
import Tandem from '../../../tandem/js/Tandem.js';

const TITLE_FONT = new PhetFont( { weight: 'bold', size: 16 } );
const DESCRIPTION_FONT = new PhetFont( 16 );


const PreferencesDialogConstants = {
  TOGGLE_SWITCH_OPTIONS: {
    size: new Dimension2( 36, 18 ),
    trackFillRight: '#64bd5a',
    // enabled:true by default, but disable if fuzzing when supporting voicing
    enabled: !( phet.chipper.isFuzzEnabled() && phet.chipper.queryParameters.supportsVoicing ),


    // voicing
    voicingIgnoreVoicingManagerProperties: true,

    // phet-io
    tandem: Tandem.OPT_OUT // We don't want to instrument components for preferences, https://github.com/phetsims/joist/issues/744#issuecomment-1196028362
  },
  CONTROL_LABEL_OPTIONS: {
    font: TITLE_FONT,
    maxWidth: 360
  },
  CONTROL_DESCRIPTION_OPTIONS: {
    font: DESCRIPTION_FONT,
    maxWidth: 500,
    lineWrap: 480
  }

};

export default PreferencesDialogConstants;