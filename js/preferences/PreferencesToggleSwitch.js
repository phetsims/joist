// Copyright 2021, University of Colorado Boulder

/**
 * A ToggleSwitch decorated with a visual label and description with layout for each. To be used in the
 * PreferencesDialog.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import Dimension2 from '../../../dot/js/Dimension2.js';
import merge from '../../../phet-core/js/merge.js';
import Voicing from '../../../scenery/js/accessibility/voicing/Voicing.js';
import Node from '../../../scenery/js/nodes/Node.js';
import ToggleSwitch from '../../../sun/js/ToggleSwitch.js';
import Tandem from '../../../tandem/js/Tandem.js';
import joist from '../joist.js';

class PreferencesToggleSwitch extends Node {

  /**
   * @param {Property} property
   * @param {*} leftValue
   * @param {*} rightValue
   * @param {Object} [options]
   */
  constructor( property, leftValue, rightValue, options ) {
    options = merge( {

      // {null|Node} - if provided, a label Node to the left of the toggle switch
      labelNode: null,

      // {number} - horizontal spacing between label and toggle switch IF there is no descriptionNode.
      // If a descriptionNode is provided, layout of the labelNode will be relative to this.
      labelSpacing: 10,

      // {null|Node} - if provided, a Node under the ToggleSwitch and label that is meant to describe the purpose
      // of the switch
      descriptionNode: null,

      // {number} - vertical spacing between ToggleSwitch and description Node
      descriptionSpacing: 5,

      // {string|null} - Sets both the inner content and the voicing response for the toggle switch on focus.
      // NOTE: Seeing more overlap like this between PDOM and voicing (which is good) but not sure how it will
      // all work yet. This option is the first of its kind.
      a11yLabel: null,

      // {Object} - options passed to the actual ToggleSwitch
      toggleSwitchOptions: {
        size: new Dimension2( 36, 18 ),
        trackFillRight: '#64bd5a'
      },

      // phet-io - opting out of Tandems for now
      tandem: Tandem.OPT_OUT
    }, options );
    assert && assert( options.labelNode === null || options.labelNode instanceof Node, 'labelNode is null or inserted as child' );
    assert && assert( options.descriptionNode === null || options.descriptionNode instanceof Node, 'labelNode is null or inserted as child' );

    if ( options.toggleSwitchOptions ) {
      assert && assert( options.toggleSwitchOptions.voicingIgnoreVoicingManagerProperties === undefined, 'PreferencesToggleSwitch creates object responses with a11yLabel option' );
      assert && assert( options.toggleSwitchOptions.innerContent === undefined, 'PreferencesToggleSwitch creates object response with a11yLabel option' );
    }

    super( options );

    const toggleSwitch = new VoicingToggleSwitch( property, leftValue, rightValue, merge( options.toggleSwitchOptions, {

      // pdom
      innerContent: options.a11yLabel,

      // voicing
      voicingIgnoreVoicingManagerProperties: true,
      voicingNameResponse: options.a11yLabel,

      // tandem - opting out of Tandems for now
      tandem: options.tandem
    } ) );
    this.addChild( toggleSwitch );

    // layout code, dependent on whether label/description are provided
    if ( options.descriptionNode ) {
      this.addChild( options.descriptionNode );
      options.descriptionNode.rightTop = toggleSwitch.rightBottom.plusXY( 0, options.descriptionSpacing );
    }
    if ( options.labelNode ) {
      this.addChild( options.labelNode );

      // if there is a description Node, label is left aligned with it
      if ( options.descriptionNode ) {
        options.labelNode.leftBottom = options.descriptionNode.leftTop.minusXY( 0, options.descriptionSpacing );
      }
      else {
        options.labelNode.rightCenter = toggleSwitch.leftCenter.minusXY( options.labelSpacing, 0 );
      }
    }
  }
}

class VoicingToggleSwitch extends ToggleSwitch {

  /**
   * @param {Property.<*>}property
   * @param {*} leftValue
   * @param {*} rightValue
   * @param {Object} [options]
   * @mixes Voicing
   */
  constructor( property, leftValue, rightValue, options ) {
    super( property, leftValue, rightValue, options );

    // initializeVoicing mutates with only Voicing options, so OK to pass through everything
    this.initializeVoicing( options );
  }
}

Voicing.compose( VoicingToggleSwitch );

joist.register( 'PreferencesToggleSwitch', PreferencesToggleSwitch );
export default PreferencesToggleSwitch;
