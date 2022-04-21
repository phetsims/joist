// Copyright 2015-2022, University of Colorado Boulder

/**
 * CreditsNode displays the credits section in the About dialog.
 * See documentation below for conventions related to each credits field.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chris Malley (PixelZoom, Inc.)
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import merge from '../../phet-core/js/merge.js';
import optionize from '../../phet-core/js/optionize.js';
import StringUtils from '../../phetcommon/js/util/StringUtils.js';
import PhetFont from '../../scenery-phet/js/PhetFont.js';
import { VBoxOptions, VoicingRichText } from '../../scenery/js/imports.js';
import { VoicingText } from '../../scenery/js/imports.js';
import { VBox, Node } from '../../scenery/js/imports.js';
import { VStrut } from '../../scenery/js/imports.js';
import joist from './joist.js';
import joistStrings from './joistStrings.js';

const creditsContributorsString = joistStrings.credits.contributors;
const creditsGraphicArtsString = joistStrings.credits.graphicArts;
const creditsLeadDesignString = joistStrings.credits.leadDesign;
const creditsQualityAssuranceString = joistStrings.credits.qualityAssurance;
const creditsSoftwareDevelopmentString = joistStrings.credits.softwareDevelopment;
const creditsSoundDesignString = joistStrings.credits.soundDesign;
const creditsTeamString = joistStrings.credits.team;
const creditsThanksString = joistStrings.credits.thanks;
const creditsTitleString = joistStrings.credits.title;

type SelfOptions = {
  titleFont?: PhetFont;
  textFont?: PhetFont;
};
type CreditsNodeOptions = SelfOptions & VBoxOptions;

// TODO: https://github.com/phetsims/joist/issues/795 For reviewer. The way we typically do credits, like in
//  ratio-and-proportion-main, won't do excess property checking.  I changed Gravity and Orbits main to specify the type.
//  We could also pass the sim options directly to the sim constructor to do excess proprerty checking.  What do you recommend?
// REVIEW: I recommend that all usages change to inline or `const simOptions: SimOptions = { . . . }`.
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

  constructor( credits: CreditsData, options: CreditsNodeOptions ) {

    options = optionize<CreditsNodeOptions, SelfOptions, VBoxOptions>()( {
      titleFont: new PhetFont( { size: 18, weight: 'bold' } ),
      textFont: new PhetFont( 16 ),
      align: 'left',
      spacing: 1,
      maxWidth: 550
    }, options );

    const richTextOptions = {
      font: options.textFont,
      align: 'left',
      lineWrap: options.maxWidth,
      tagName: 'p'
    };

    const children: Node[] = [];

    // Credits
    children.push( new VoicingText( creditsTitleString, {
      font: options.titleFont,

      // pdom
      tagName: 'h2',
      innerContent: creditsTitleString
    } ) );

    // Primary HTML5 designer first, followed by contributing designers (HTML5 and legacy) in alphabetical order.
    if ( credits.leadDesign ) {
      const designString = StringUtils.format( creditsLeadDesignString, `\u202a${credits.leadDesign}\u202c` );
      children.push( new VoicingRichText( designString, merge( { innerContent: designString }, richTextOptions ) ) );
    }

    // Primary HTML5 developer first, followed by contributing developers (HTML5 and legacy) in alphabetical order.
    if ( credits.softwareDevelopment ) {
      const developmentString = StringUtils.format( creditsSoftwareDevelopmentString, `\u202a${credits.softwareDevelopment}\u202c` );
      children.push( new VoicingRichText( developmentString, merge( { innerContent: developmentString }, richTextOptions ) ) );
    }

    // In alphabetical order (includes HTML5 and legacy team members)
    if ( credits.team ) {
      const teamString = StringUtils.format( creditsTeamString, `\u202a${credits.team}\u202c` );
      children.push( new VoicingRichText( teamString, merge( { innerContent: teamString }, richTextOptions ) ) );
    }

    // In alphabetical order (this field is new for HTML5 sims)
    if ( credits.contributors ) {
      const contributorsString = StringUtils.format( creditsContributorsString, `\u202a${credits.contributors}\u202c` );
      children.push( new VoicingRichText( contributorsString, merge( { innerContent: contributorsString }, richTextOptions ) ) );
    }

    // In alphabetical order (this field is new for HTML5 sims)
    if ( credits.qualityAssurance ) {
      const qualityAssuranceString = StringUtils.format( creditsQualityAssuranceString, `\u202a${credits.qualityAssurance}\u202c` );
      children.push( new VoicingRichText( qualityAssuranceString, merge( { innerContent: qualityAssuranceString }, richTextOptions ) ) );
    }

    // In alphabetical order (this field is new for HTML5 sims)
    if ( credits.graphicArts ) {
      const graphicArtsString = StringUtils.format( creditsGraphicArtsString, `\u202a${credits.graphicArts}\u202c` );
      children.push( new VoicingRichText( graphicArtsString, merge( { innerContent: graphicArtsString }, richTextOptions ) ) );
    }

    // In alphabetical order (this field is new for HTML5 sims)
    if ( credits.soundDesign ) {
      const soundDesignString = StringUtils.format( creditsSoundDesignString, `\u202a${credits.soundDesign}\u202c` );
      children.push( new VoicingRichText( soundDesignString, merge( { innerContent: soundDesignString }, richTextOptions ) ) );
    }

    // Thanks
    if ( credits.thanks ) {
      if ( children.length > 0 ) { children.push( new VStrut( 13 ) ); }
      children.push( new VoicingText( creditsThanksString, {
        font: options.titleFont,
        tagName: 'h2',
        innerContent: creditsThanksString
      } ) );

      const thanksText = new VoicingRichText( credits.thanks, richTextOptions );
      thanksText.innerContent = credits.thanks;
      children.push( thanksText );
    }

    assert && assert( !options.children, 'CreditsNode sets children' );
    options.children = children;

    super( options );

    // @private
    this.disposeCreditsNode = () => {
      children.forEach( child => {
        child.dispose && child.dispose();
      } );
    };
  }

  override dispose() {
    this.disposeCreditsNode();
    super.dispose();
  }
}

joist.register( 'CreditsNode', CreditsNode );