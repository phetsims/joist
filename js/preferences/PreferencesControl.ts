// Copyright 2021-2025, University of Colorado Boulder

/**
 * Provides a layout container with a control that can be decorated with a visual label and description.
 * To be used in the PreferencesDialog. The control is right justified and can be any Node.
 *
 * // Layout using GridBox and layoutOptions will accomplish the following when all components are available.
 * // [[labelNode]]         [[controlNode]]
 * // [[descriptionNode                   ]]
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 * @author Marla Schulz (PhET Interactive Simulations)
 */

import optionize from '../../../phet-core/js/optionize.js';
import type StrictOmit from '../../../phet-core/js/types/StrictOmit.js';
import GridBox, { type GridBoxOptions } from '../../../scenery/js/layout/nodes/GridBox.js';
import type TLayoutOptions from '../../../scenery/js/layout/TLayoutOptions.js';
import type Node from '../../../scenery/js/nodes/Node.js';
import SceneryConstants from '../../../scenery/js/SceneryConstants.js';
import joist from '../joist.js';

type SelfOptions = {

  // If provided, a label Node to the left of the control
  labelNode?: Node;

  // Horizontal spacing between the label for the component and control IF there is no descriptionNode.
  // If a descriptionNode is provided, the layout of the labelNode will be relative to the description.
  labelSpacing?: number;

  // If provided, a Node under the control and label that is meant to describe the purpose of the control
  descriptionNode?: Node;

  // If true, the description cell will stretch to a minimum content width, and the control will be pushed out to align
  // with that width. This makes the control align with other controls in the dialog. Disable if you want the control
  // to always be right aligned with the description.
  allowDescriptionStretch?: boolean;

  // Vertical spacing between ToggleSwitch and description Node
  ySpacing?: number;

  // A UI component that is generally tied to a Property in Preferences. This can allow the user to change an aspect of
  // the sim's behavior or display
  controlNode?: Node;

  // A heading control has different layout requirements. One of which is that the control will not stretch the take
  // the full width of the space given to it.
  headingControl?: boolean;
};

export type PreferencesControlOptions = SelfOptions & GridBoxOptions;

class PreferencesControl extends GridBox {
  public constructor( providedOptions?: PreferencesControlOptions ) {
    const options = optionize<PreferencesControlOptions, StrictOmit<SelfOptions, 'labelNode' | 'descriptionNode' | 'controlNode'>, GridBoxOptions>()( {
      headingControl: false,
      labelSpacing: 10,
      allowDescriptionStretch: true,
      ySpacing: 5,
      grow: 1,
      layoutOptions: {
        stretch: !providedOptions?.headingControl
      }
    }, providedOptions );

    super( options );

    if ( options.controlNode ) {
      assert && assert( options.controlNode.layoutOptions === null, 'PreferencesControl will control layout' );
      this.enabledProperty.link( enabled => {
        options.controlNode!.enabled = enabled;
      } );

      options.controlNode.layoutOptions = {
        row: 0,
        column: 1,
        xAlign: 'right'
      };

      this.addChild( options.controlNode );
    }

    if ( options.labelNode ) {
      assert && assert( options.labelNode.layoutOptions === null, 'PreferencesControl will control layout' );
      options.labelNode.layoutOptions = {
        row: 0,
        column: 0,
        xAlign: 'left',
        rightMargin: options.labelSpacing
      };
      this.addChild( options.labelNode );
    }

    // descriptionNode will be in the second row if a labelNode is provided.
    if ( options.descriptionNode && options.labelNode ) {
      assert && assert( options.descriptionNode.layoutOptions === null, 'PreferencesControl will control layout' );

      const layoutOptions: TLayoutOptions = {
        row: 1,
        column: 0,
        horizontalSpan: 2,
        xAlign: 'left'
      };

      // Allows the description to stretch and takes up a minimum width so that the control aligns with other contents.
      if ( options.allowDescriptionStretch ) {
        layoutOptions.minContentWidth = 480;
        layoutOptions.stretch = true;
      }

      options.descriptionNode.layoutOptions = layoutOptions;
      this.addChild( options.descriptionNode );
    }


    // descriptionNode will be in the first row if labelNode is not provided.
    else if ( options.descriptionNode ) {
      assert && assert( options.descriptionNode.layoutOptions === null, 'PreferencesControl will control layout' );
      options.descriptionNode.layoutOptions = {
        row: 0,
        column: 0,
        xAlign: 'left'
      };
      this.addChild( options.descriptionNode );
    }

    // This component manages disabledOpacity, we don't want it to compound over subcomponents.
    this.disabledOpacity = SceneryConstants.DISABLED_OPACITY;
  }
}

joist.register( 'PreferencesControl', PreferencesControl );
export default PreferencesControl;