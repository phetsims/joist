// Copyright 2021-2022, University of Colorado Boulder

/**
 * A ToggleSwitch decorated with a visual label and description with layout for each. To be used in the
 * PreferencesDialog.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import Dimension2 from '../../../dot/js/Dimension2.js';
import merge from '../../../phet-core/js/merge.js';
import { Node } from '../../../scenery/js/imports.js';
import ToggleSwitch from '../../../sun/js/ToggleSwitch.js';
import Tandem from '../../../tandem/js/Tandem.js';
import Utterance from '../../../utterance-queue/js/Utterance.js';
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

      // {null|Node} - if provided, a label Node to the left of the toggle switch control
      labelNode: null,

      // {number} - horizontal spacing between label for the component and toggle switch IF there is no descriptionNode.
      // If a descriptionNode is provided, layout of the labelNode will be relative to the description.
      // If there is a leftValueLabel it will be the horizontal spacing between the labelNode and the leftValueLabel.
      labelSpacing: 10,

      // {null|Node} - if provided, a label to the left and right of the switch describing the state values
      leftValueLabel: null,
      rightValueLabel: null,

      // {number} - horizontal spacing between the toggle switch and left/right value labels
      valueLabelXSpacing: 8,

      // {null|Node} - if provided, a Node under the ToggleSwitch and label that is meant to describe the purpose
      // of the switch
      descriptionNode: null,

      // {number} - vertical spacing between ToggleSwitch and description Node
      descriptionSpacing: 5,

      // {string|null} - Sets both the inner content and the voicing response for the toggle switch on focus.
      // NOTE: Seeing more overlap like this between PDOM and voicing (which is good) but not sure how it will
      // all work yet. This option is the first of its kind.
      a11yLabel: null,

      // a11y
      // {IAlertable|null} - If provided, these responses will be spoken to describe the change in simulation context
      // for both Voicing and Interactive Description features when the value changes to either leftValue or
      // rightValue.
      leftValueContextResponse: null,
      rightValueContextResponse: null,

      // {Object} - options passed to the actual ToggleSwitch
      toggleSwitchOptions: {
        size: new Dimension2( 36, 18 ),
        trackFillRight: '#64bd5a'
      },

      // phet-io
      tandem: Tandem.REQUIRED
    }, options );
    assert && assert( options.labelNode === null || options.labelNode instanceof Node, 'labelNode is null or inserted as child' );
    assert && assert( options.descriptionNode === null || options.descriptionNode instanceof Node, 'labelNode is null or inserted as child' );

    if ( options.toggleSwitchOptions ) {
      assert && assert( options.toggleSwitchOptions.voicingIgnoreVoicingManagerProperties === undefined, 'PreferencesToggleSwitch creates object responses with a11yLabel option' );
      assert && assert( options.toggleSwitchOptions.innerContent === undefined, 'PreferencesToggleSwitch creates object response with a11yLabel option' );
    }

    super( options );

    const toggleSwitch = new ToggleSwitch( property, leftValue, rightValue, merge( options.toggleSwitchOptions, {

      // enabled:true by default, but disable if fuzzing when supporting voicing
      enabled: !( phet.chipper.isFuzzEnabled() && phet.chipper.queryParameters.supportsVoicing ),

      // pdom
      innerContent: options.a11yLabel,

      // voicing
      voicingIgnoreVoicingManagerProperties: true,
      voicingNameResponse: options.a11yLabel,

      // tandem
      tandem: options.tandem.createTandem( 'toggleSwitch' )
    } ) );

    if ( options.leftValueLabel ) {
      options.leftValueLabel.right = toggleSwitch.left - options.valueLabelXSpacing;
      options.leftValueLabel.centerY = toggleSwitch.centerY;
      toggleSwitch.addChild( options.leftValueLabel );
    }
    if ( options.rightValueLabel ) {
      options.rightValueLabel.left = toggleSwitch.right + options.valueLabelXSpacing;
      options.rightValueLabel.centerY = toggleSwitch.centerY;
      toggleSwitch.addChild( options.rightValueLabel );
    }

    // a11y - Describe the change in value if context responses were provided in options. Listener needs to be
    // removed on dispose.
    const valueListener = value => {
      const alert = value === rightValue ? options.rightValueContextResponse : options.leftValueContextResponse;

      if ( alert ) {
        this.alertDescriptionUtterance( alert );
        toggleSwitch.voicingSpeakResponse( {
          contextResponse: Utterance.alertableToText( alert )
        } );
      }
    };
    property.lazyLink( valueListener );

    this.addChild( toggleSwitch );
    options.descriptionNode && this.addChild( options.descriptionNode );
    options.labelNode && this.addChild( options.labelNode );

    // layout code, dependent on which components are available
    if ( options.descriptionNode && options.labelNode ) {

      options.descriptionNode.leftTop = options.labelNode.leftBottom.plusXY( 0, options.descriptionSpacing );
      toggleSwitch.centerY = options.labelNode.centerY;

      if ( options.descriptionNode.right - options.labelNode.right < toggleSwitch.width + options.labelSpacing ) {

        // right-aligning the toggleSwitch with the description would result in the toggleSwitch and label overlapping,
        // put the toggleSwitch to the right of the label
        toggleSwitch.left = options.labelNode.right + options.labelSpacing;
      }
      else {

        // the description extends far enough to the right of the label that the toggleSwitch should be right-aligned
        // with it
        toggleSwitch.right = options.descriptionNode.right;
      }
    }
    else if ( options.descriptionNode ) {

      // only a description node, right align with the toggle switch
      options.descriptionNode.rightTop = toggleSwitch.rightBottom.plusXY( 0, options.descriptionSpacing );
    }
    else if ( options.labelNode ) {

      // only a label node, it goes to the left of the toggleSwitch
      options.labelNode.rightCenter = toggleSwitch.leftCenter.minusXY( options.labelSpacing, 0 );
    }

    // @private
    this.disposePreferencesToggleSwitch = () => {
      property.unlink( valueListener );
      toggleSwitch.dispose();
    };
  }

  /**
   * @public
   */
  dispose() {
    this.disposePreferencesToggleSwitch();
    super.dispose();
  }
}

joist.register( 'PreferencesToggleSwitch', PreferencesToggleSwitch );
export default PreferencesToggleSwitch;
