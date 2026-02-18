// Copyright 2015-2026, University of Colorado Boulder

/**
 * CreditsNode displays the credits section in the About dialog.
 * See documentation below for conventions related to each credits field.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chris Malley (PixelZoom, Inc.)
 * @author Jonathan Olson (PhET Interactive Simulations)
 */

import DerivedProperty from '../../axon/js/DerivedProperty.js';
import type { TReadOnlyProperty } from '../../axon/js/TReadOnlyProperty.js';
import optionize from '../../phet-core/js/optionize.js';
import StringUtils from '../../phetcommon/js/util/StringUtils.js';
import PhetFont from '../../scenery-phet/js/PhetFont.js';
import VoicingRichText from '../../scenery/js/accessibility/voicing/nodes/VoicingRichText.js';
import VoicingText from '../../scenery/js/accessibility/voicing/nodes/VoicingText.js';
import VBox, { type VBoxOptions } from '../../scenery/js/layout/nodes/VBox.js';
import type Node from '../../scenery/js/nodes/Node.js';
import VStrut from '../../scenery/js/nodes/VStrut.js';
import joist from './joist.js';
import JoistFluent from './JoistFluent.js';

type SelfOptions = {
  titleFont?: PhetFont;
  textFont?: PhetFont;
};
type CreditsNodeOptions = SelfOptions & VBoxOptions;

export type CreditsData = {
  leadDesign?: string;
  softwareDevelopment?: string;
  team?: string;
  contributors?: string;
  qualityAssurance?: string;
  graphicArts?: string;
  soundDesign?: string;
  thanks?: string;
};

export default class CreditsNode extends VBox {
  private readonly disposeCreditsNode: () => void;

  public constructor( credits: CreditsData, options: CreditsNodeOptions ) {

    options = optionize<CreditsNodeOptions, SelfOptions, VBoxOptions>()( {
      titleFont: new PhetFont( { size: 18, weight: 'bold' } ),
      textFont: new PhetFont( 16 ),
      align: 'left',
      spacing: 1,
      maxWidth: 550
    }, options );

    const richTextOptions = {
      font: options.textFont,
      align: 'left' as const,
      lineWrap: options.maxWidth,
      tagName: 'p'
    };

    const children: Node[] = [];

    // Credits
    children.push( new VoicingText( JoistFluent.credits.titleStringProperty, {
      font: options.titleFont,

      accessibleHeading: JoistFluent.credits.titleStringProperty,
      accessibleParagraph: null
    } ) );

    const formatStringProperty = ( stringProperty: TReadOnlyProperty<string>, innerString: string ): TReadOnlyProperty<string> => {
      return new DerivedProperty( [ stringProperty ], string => {
        return StringUtils.format( string, `\u202a${innerString}\u202c` );
      } );
    };

    // Primary HTML5 designer first, followed by contributing designers (HTML5 and legacy) in alphabetical order.
    if ( credits.leadDesign ) {
      const designStringProperty = formatStringProperty( JoistFluent.credits.leadDesignStringProperty, credits.leadDesign );
      children.push( new VoicingRichText( designStringProperty, richTextOptions ) );
    }

    // Primary HTML5 developer first, followed by contributing developers (HTML5 and legacy) in alphabetical order.
    if ( credits.softwareDevelopment ) {
      const developmentStringProperty = formatStringProperty( JoistFluent.credits.softwareDevelopmentStringProperty, credits.softwareDevelopment );
      children.push( new VoicingRichText( developmentStringProperty, richTextOptions ) );
    }

    // In alphabetical order (includes HTML5 and legacy team members)
    if ( credits.team ) {
      const teamStringProperty = formatStringProperty( JoistFluent.credits.teamStringProperty, credits.team );
      children.push( new VoicingRichText( teamStringProperty, richTextOptions ) );
    }

    // In alphabetical order (this field is new for HTML5 sims)
    if ( credits.contributors ) {
      const contributorsStringProperty = formatStringProperty( JoistFluent.credits.contributorsStringProperty, credits.contributors );
      children.push( new VoicingRichText( contributorsStringProperty, richTextOptions ) );
    }

    // In alphabetical order (this field is new for HTML5 sims)
    if ( credits.qualityAssurance ) {
      const qualityAssuranceStringProperty = formatStringProperty( JoistFluent.credits.qualityAssuranceStringProperty, credits.qualityAssurance );
      children.push( new VoicingRichText( qualityAssuranceStringProperty, richTextOptions ) );
    }

    // In alphabetical order (this field is new for HTML5 sims)
    if ( credits.graphicArts ) {
      const graphicArtsStringProperty = formatStringProperty( JoistFluent.credits.graphicArtsStringProperty, credits.graphicArts );
      children.push( new VoicingRichText( graphicArtsStringProperty, richTextOptions ) );
    }

    // In alphabetical order (this field is new for HTML5 sims)
    if ( credits.soundDesign ) {
      const soundDesignStringProperty = formatStringProperty( JoistFluent.credits.soundDesignStringProperty, credits.soundDesign );
      children.push( new VoicingRichText( soundDesignStringProperty, richTextOptions ) );
    }

    // Thanks
    if ( credits.thanks ) {
      if ( children.length > 0 ) { children.push( new VStrut( 13 ) ); }
      children.push( new VoicingText( JoistFluent.credits.thanksStringProperty, {
        font: options.titleFont,

        accessibleHeading: JoistFluent.credits.thanksStringProperty,
        accessibleParagraph: null
      } ) );

      const thanksText = new VoicingRichText( credits.thanks, richTextOptions );
      children.push( thanksText );
    }

    assert && assert( !options.children, 'CreditsNode sets children' );
    options.children = children;

    super( options );

    this.disposeCreditsNode = () => {
      children.forEach( child => {
        child.dispose && child.dispose();
      } );
    };
  }

  public override dispose(): void {
    this.disposeCreditsNode();
    super.dispose();
  }
}

joist.register( 'CreditsNode', CreditsNode );