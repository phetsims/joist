// Copyright 2018-2021, University of Colorado Boulder

/**
 * ProjectorModeCheckbox is a checkbox used to switch between 'default' and 'projector' color profiles.
 * It is most commonly used in the Options dialog, accessed from the PhET menu in some sims. It wires up to the
 * singleton instance of SCENERY/colorProfileProperty
 *
 * @author John Blanco
 * @author Chris Malley (PixelZoom, Inc.)
 */

import BooleanProperty from '../../axon/js/BooleanProperty.js';
import merge from '../../phet-core/js/merge.js';
import { Text } from '../../scenery/js/imports.js';
import { SceneryConstants } from '../../scenery/js/imports.js';
import { colorProfileProperty } from '../../scenery/js/imports.js';
import Checkbox from '../../sun/js/Checkbox.js';
import Tandem from '../../tandem/js/Tandem.js';
import joist from './joist.js';
import joistStrings from './joistStrings.js';
import OptionsDialog from './OptionsDialog.js';

const projectorModeString = joistStrings.projectorMode;

class ProjectorModeCheckbox extends Checkbox {

  /**
   * @param {Object} [options]
   */
  constructor( options ) {

    options = merge( {

      font: OptionsDialog.DEFAULT_FONT,
      maxTextWidth: 350, // empirically determined, works reasonably well for long strings
      tandem: Tandem.REQUIRED,

      // phet-io
      phetioLinkProperty: false // we will create the `property` tandem here in the subtype
    }, options );

    assert && assert(
    phet.chipper.colorProfiles[ 0 ] !== SceneryConstants.PROJECTOR_COLOR_PROFILE &&
    phet.chipper.colorProfiles.includes( SceneryConstants.PROJECTOR_COLOR_PROFILE ) &&
    phet.chipper.colorProfiles.length === 2 &&
    phet.chipper.colorProfiles[ 0 ] !== phet.chipper.colorProfiles[ 1 ],
      'ProjectorModeCheckbox requires sims that support the projector color profile and one other color profile' );

    // Identify the non-projector color profile that this checkbox sets.
    const otherColorProfile = phet.chipper.colorProfiles.find( colorProfile => colorProfile !== SceneryConstants.PROJECTOR_COLOR_PROFILE );

    const labelNode = new Text( projectorModeString, {
      font: options.font,
      maxWidth: options.maxTextWidth
    } );

    // Internal adapter Property, to map between the string value needed by colorProfileProperty
    // and the boolean value needed by superclass Checkbox.
    const projectorModeEnabledProperty = new BooleanProperty( colorProfileProperty.value === SceneryConstants.PROJECTOR_COLOR_PROFILE, {
      tandem: options.tandem.createTandem( 'property' )
    } );
    projectorModeEnabledProperty.link( isProjectorMode => {
      colorProfileProperty.value = ( isProjectorMode ? SceneryConstants.PROJECTOR_COLOR_PROFILE : otherColorProfile );
    } );

    const profileNameListener = profileName => {
      projectorModeEnabledProperty.value = ( profileName === SceneryConstants.PROJECTOR_COLOR_PROFILE );
    };
    colorProfileProperty.link( profileNameListener );

    super( projectorModeEnabledProperty, labelNode, options );

    // @private - dispose function
    this.disposeProjectorModeCheckbox = function() {
      colorProfileProperty.unlink( profileNameListener );
      projectorModeEnabledProperty.dispose();
    };
  }

  /**
   * @public
   * @override
   */
  dispose() {
    this.disposeProjectorModeCheckbox();
    super.dispose();
  }
}

joist.register( 'ProjectorModeCheckbox', ProjectorModeCheckbox );
export default ProjectorModeCheckbox;