// Copyright 2022-2025, University of Colorado Boulder

/**
 * Styling and layout option constants for preference dialog components
 *
 * @author Marla Schulz (PhET Interactive Simulations)
 *
 */

import Dimension2 from '../../../dot/js/Dimension2.js';
import PhetFont from '../../../scenery-phet/js/PhetFont.js';
import Tandem from '../../../tandem/js/Tandem.js';

const CONTROL_LABEL_TITLE_FONT = new PhetFont( { weight: 'bold', size: 16 } );
const DESCRIPTION_FONT = new PhetFont( 16 );

// constants
const TITLE_FONT = new PhetFont( { size: 24, weight: 'bold' } );

const TAB_FONT = new PhetFont( 20 );
const TAB_MAX_WIDTH = 120;
const TAB_OPTIONS = {
  font: TAB_FONT,
  maxWidth: TAB_MAX_WIDTH
};

const CONTENT_FONT = new PhetFont( 16 );
const CONTENT_MAX_WIDTH = 500;
const PANEL_SECTION_CONTENT_OPTIONS = {
  font: CONTENT_FONT,
  maxWidth: CONTENT_MAX_WIDTH
};

const PANEL_SECTION_LABEL_FONT = new PhetFont( { weight: 'bold', size: 16 } );
const PANEL_SECTION_LABEL_MAX_WIDTH = 360;
const PANEL_SECTION_LABEL_OPTIONS = {
  font: PANEL_SECTION_LABEL_FONT,
  maxWidth: PANEL_SECTION_LABEL_MAX_WIDTH
};


const PreferencesDialogConstants = {
  TOGGLE_SWITCH_OPTIONS: {
    size: new Dimension2( 36, 18 ),
    trackFillRight: '#64bd5a',
    trackFillLeft: null, // use ToggleSwitch default
    // enabled:true by default, but disable if fuzzing when supporting voicing
    enabled: !( phet.chipper.isFuzzEnabled() && phet.chipper.queryParameters.supportsVoicing ),

    // voicing
    voicingIgnoreVoicingManagerProperties: true,

    // phet-io
    tandem: Tandem.OPT_OUT // We don't want to instrument components for preferences, https://github.com/phetsims/joist/issues/744#issuecomment-1196028362
  },
  CONTROL_LABEL_OPTIONS: {
    font: CONTROL_LABEL_TITLE_FONT,
    maxWidth: 360
  },
  CONTROL_DESCRIPTION_OPTIONS: {
    font: DESCRIPTION_FONT,
    lineWrap: 'stretch' as const
  },
  TOGGLE_SWITCH_LABEL_OPTIONS: {
    font: DESCRIPTION_FONT
  },

  // Font and options for the text that labels a tab in the dialog.
  TAB_FONT: TAB_FONT,
  TAB_OPTIONS: TAB_OPTIONS,

  // The font for a title of a panel in the dialog.
  TITLE_FONT: TITLE_FONT,

  // The font, max width, and options for most text content in the dialog.
  CONTENT_FONT: CONTENT_FONT,
  CONTENT_MAX_WIDTH: CONTENT_MAX_WIDTH,
  PANEL_SECTION_CONTENT_OPTIONS: PANEL_SECTION_CONTENT_OPTIONS,

  // The font, max width, and options for a label for a section of content in the dialog.
  PANEL_SECTION_LABEL_FONT: PANEL_SECTION_LABEL_FONT,
  PANEL_SECTION_LABEL_MAX_WIDTH: PANEL_SECTION_LABEL_MAX_WIDTH,
  PANEL_SECTION_LABEL_OPTIONS: PANEL_SECTION_LABEL_OPTIONS,

  // Default spacing between unique items in a preferences dialog
  CONTENT_SPACING: 20,

  // Default vertical spacing between grouped items (radio buttons, vertical checkboxes, ...)
  VERTICAL_CONTENT_SPACING: 5,

  // Content or UI component indentation under a PreferencesPanelSection title.
  CONTENT_INDENTATION_SPACING: 15,

  // Default vertical spacing between a label and its collection of contents for a control in the dialog.
  LABEL_CONTENT_SPACING: 10
};

export default PreferencesDialogConstants;