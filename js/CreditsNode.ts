// Copyright 2015-2022, University of Colorado Boulder

/**
 * CreditsNode displays the credits section in the About dialog.
 * See documentation below for conventions related to each credits field.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chris Malley (PixelZoom, Inc.)
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import DerivedProperty from '../../axon/js/DerivedProperty.js';
import TReadOnlyProperty from '../../axon/js/TReadOnlyProperty.js';
import optionize from '../../phet-core/js/optionize.js';
import StringUtils from '../../phetcommon/js/util/StringUtils.js';
import PhetFont from '../../scenery-phet/js/PhetFont.js';
import { Node, VBox, VBoxOptions, VoicingRichText, VoicingText, VStrut } from '../../scenery/js/imports.js';
import joist from './joist.js';
import JoistStrings from './JoistStrings.js';

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
    children.push( new VoicingText( JoistStrings.credits.titleStringProperty, {
      font: options.titleFont,

      // pdom
      tagName: 'h2'
    } ) );

    const formatStringProperty = ( stringProperty: TReadOnlyProperty<string>, innerString: string ): TReadOnlyProperty<string> => {
      return new DerivedProperty( [ stringProperty ], string => {
        return StringUtils.format( string, `\u202a${innerString}\u202c` );
      } );
    };

    // Primary HTML5 designer first, followed by contributing designers (HTML5 and legacy) in alphabetical order.
    if ( credits.leadDesign ) {
      const designString = formatStringProperty( JoistStrings.credits.leadDesignStringProperty, credits.leadDesign );
      children.push( new VoicingRichText( designString, richTextOptions ) );
    }

    // Primary HTML5 developer first, followed by contributing developers (HTML5 and legacy) in alphabetical order.
    if ( credits.softwareDevelopment ) {
      const developmentString = formatStringProperty( JoistStrings.credits.softwareDevelopmentStringProperty, credits.softwareDevelopment );
      children.push( new VoicingRichText( developmentString, richTextOptions ) );
    }

    // In alphabetical order (includes HTML5 and legacy team members)
    if ( credits.team ) {
      const teamString = formatStringProperty( JoistStrings.credits.teamStringProperty, credits.team );
      children.push( new VoicingRichText( teamString, richTextOptions ) );
    }

    // In alphabetical order (this field is new for HTML5 sims)
    if ( credits.contributors ) {
      const contributorsString = formatStringProperty( JoistStrings.credits.contributorsStringProperty, credits.contributors );
      children.push( new VoicingRichText( contributorsString, richTextOptions ) );
    }

    // In alphabetical order (this field is new for HTML5 sims)
    if ( credits.qualityAssurance ) {
      const qualityAssuranceString = formatStringProperty( JoistStrings.credits.qualityAssuranceStringProperty, credits.qualityAssurance );
      children.push( new VoicingRichText( qualityAssuranceString, richTextOptions ) );
    }

    // In alphabetical order (this field is new for HTML5 sims)
    if ( credits.graphicArts ) {
      const graphicArtsString = formatStringProperty( JoistStrings.credits.graphicArtsStringProperty, credits.graphicArts );
      children.push( new VoicingRichText( graphicArtsString, richTextOptions ) );
    }

    // In alphabetical order (this field is new for HTML5 sims)
    if ( credits.soundDesign ) {
      const soundDesignString = formatStringProperty( JoistStrings.credits.soundDesignStringProperty, credits.soundDesign );
      children.push( new VoicingRichText( soundDesignString, richTextOptions ) );
    }

    // Thanks
    if ( credits.thanks ) {
      if ( children.length > 0 ) { children.push( new VStrut( 13 ) ); }
      children.push( new VoicingText( JoistStrings.credits.thanksStringProperty, {
        font: options.titleFont,
        tagName: 'h2'
      } ) );

      const thanksText = new VoicingRichText( credits.thanks, richTextOptions );
      thanksText.innerContent = credits.thanks;
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