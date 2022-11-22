// Copyright 2021-2022, University of Colorado Boulder

/**
 * A ToggleSwitch decorated with a visual label and description with layout for each. To be used in the
 * PreferencesDialog.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 * @author Marla Schulz (PhET Interactive Simulations)
 */

import optionize from '../../../phet-core/js/optionize.js';
import { GridBox, Node, NodeOptions, SceneryConstants } from '../../../scenery/js/imports.js';
import joist from '../joist.js';

// This ToggleSwitch is not

type SelfOptions = {

  // if provided, a label Node to the left of the toggle switch control
  labelNode?: null | Node;

  // horizontal spacing between label for the component and toggle switch IF there is no descriptionNode.
  // If a descriptionNode is provided, layout of the labelNode will be relative to the description.
  // If there is a leftValueLabel it will be the horizontal spacing between the labelNode and the leftValueLabel.
  labelSpacing?: number;

  // if provided, a label to the left and right of the switch describing the state values
  leftValueLabel?: null | Node;
  rightValueLabel?: null | Node;

  // horizontal spacing between the toggle switch and left/right value labels
  valueLabelXSpacing?: 8;

  // if provided, a Node under the ToggleSwitch and label that is meant to describe the purpose of the switch
  descriptionNode?: null | Node;

  // vertical spacing between ToggleSwitch and description Node
  descriptionSpacing?: 5;

  controlNode?: null | Node;

  nestedContent?: Array<Node>;
};

export type PreferencesToggleSwitchOptions = SelfOptions & NodeOptions;

class PreferencesControl extends Node {
  private readonly disposePreferencesToggleSwitch: () => void;

  public constructor( providedOptions?: PreferencesToggleSwitchOptions ) {
    const options = optionize<PreferencesToggleSwitchOptions, SelfOptions, NodeOptions>()( {
      labelNode: null,
      labelSpacing: 10,
      leftValueLabel: null,
      rightValueLabel: null,
      valueLabelXSpacing: 8,
      descriptionNode: null,
      descriptionSpacing: 5,
      controlNode: null,
      nestedContent: []
    }, providedOptions );

    super( options );

    // This component manages disabledOpacity, we don't want it to compound over subcomponents.
    this.disabledOpacity = SceneryConstants.DISABLED_OPACITY;

    // Layout using GridBox and layoutOptions will accomplish the following when all components are available.
    // [[labelNode]]         [[ToggleSwitch]]
    // [[descriptionNode                   ]]
    const gridBox = new GridBox( {
      ySpacing: options.descriptionSpacing
    } );
    this.addChild( gridBox );

    if ( options.controlNode ) {
      assert && assert( options.controlNode.layoutOptions === null, 'PreferencesToggleSwitch will control layout' );
      this.enabledProperty.link( enabled => {
        options.controlNode!.enabled = enabled;
      } );

      options.controlNode.layoutOptions = {
        row: 0,
        column: 1,
        xAlign: 'right'
      };

      gridBox.addChild( options.controlNode );
    }

    if ( options.labelNode ) {
      assert && assert( options.labelNode.layoutOptions === null, 'PreferencesToggleSwitch will control layout' );
      options.labelNode.layoutOptions = {
        row: 0,
        column: 0,
        xAlign: 'left',
        rightMargin: options.labelSpacing
      };
      gridBox.addChild( options.labelNode );
    }

    // descriptionNode will be in the second row if a labelNode is provided.
    if ( options.descriptionNode && options.labelNode ) {
      assert && assert( options.descriptionNode.layoutOptions === null, 'PreferencesToggleSwitch will control layout' );
      options.descriptionNode.layoutOptions = {
        row: 1,
        column: 0,
        horizontalSpan: 2,
        xAlign: 'left'
      };
      gridBox.addChild( options.descriptionNode );
    }


    // descriptionNode will be in the first row if labelNode is not provided.
    else if ( options.descriptionNode ) {
      assert && assert( options.descriptionNode.layoutOptions === null, 'PreferencesToggleSwitch will control layout' );
      options.descriptionNode.layoutOptions = {
        row: 0,
        column: 0,
        xAlign: 'left'
      };
      gridBox.addChild( options.descriptionNode );
    }

    this.disposePreferencesToggleSwitch = () => {
      options.controlNode && options.controlNode.dispose();
      gridBox.dispose();
    };
  }

  public override dispose(): void {
    this.disposePreferencesToggleSwitch();
    super.dispose();
  }
}

joist.register( 'PreferencesControl', PreferencesControl );
export default PreferencesControl;
