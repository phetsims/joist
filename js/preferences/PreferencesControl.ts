// Copyright 2021-2025, University of Colorado Boulder

/**
 * A ToggleSwitch decorated with a visual label and description with layout for each. To be used in the
 * PreferencesDialog.
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

  // if provided, a label Node to the left of the toggle switch control
  labelNode?: Node;

  // horizontal spacing between label for the component and toggle switch IF there is no descriptionNode.
  // If a descriptionNode is provided, layout of the labelNode will be relative to the description.
  labelSpacing?: number;

  // horizontal spacing between the toggle switch and left/right value labels
  valueLabelXSpacing?: number;

  // if provided, a Node under the ToggleSwitch and label that is meant to describe the purpose of the switch
  descriptionNode?: Node;

  // If true, the description cell will stretch to a minimum content width, and the control will be pushed out to align
  // with that width. This makes the control align with other controls in the dialog. Disable if you want the control
  // to always be right aligned with the description.
  allowDescriptionStretch?: boolean;

  // vertical spacing between ToggleSwitch and description Node
  ySpacing?: number;

  controlNode?: Node;

  nestedContent?: Array<Node>;

  headingControl?: boolean;
};

export type PreferencesControlOptions = SelfOptions & GridBoxOptions;

// Layout using GridBox and layoutOptions will accomplish the following when all components are available.
// [[labelNode]]         [[ToggleSwitch]]
// [[descriptionNode                   ]]
class PreferencesControl extends GridBox {
  public constructor( providedOptions?: PreferencesControlOptions ) {
    const options = optionize<PreferencesControlOptions, StrictOmit<SelfOptions, 'labelNode' | 'descriptionNode' | 'controlNode'>, GridBoxOptions>()( {
      headingControl: false,
      labelSpacing: 10,
      allowDescriptionStretch: true,
      valueLabelXSpacing: 8,
      ySpacing: 5,
      nestedContent: [],
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

      // Allows the description to stretch and takes up a minimum width, so that the control aligns with other contents.
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