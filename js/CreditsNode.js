// Copyright 2015-2020, University of Colorado Boulder

/**
 * Displays the credits section in the About dialog
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chris Malley (PixelZoom, Inc.)
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import merge from '../../phet-core/js/merge.js';
import StringUtils from '../../phetcommon/js/util/StringUtils.js';
import PhetFont from '../../scenery-phet/js/PhetFont.js';
import RichText from '../../scenery/js/nodes/RichText.js';
import Text from '../../scenery/js/nodes/Text.js';
import VBox from '../../scenery/js/nodes/VBox.js';
import VStrut from '../../scenery/js/nodes/VStrut.js';
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

class CreditsNode extends VBox {

  /**
   * Creates node that displays the credits.
   * @param {Object} credits - see implementation herein for supported {string} fields
   * @param {Object} [options]
   */
  constructor( credits, options ) {

    options = merge( {
      titleFont: null,
      textFont: null,
      align: 'left',
      spacing: 1,
      maxWidth: 550
    }, options );

    options.titleFont = options.titleFont || new PhetFont( { size: 18, weight: 'bold' } );
    options.textFont = options.textFont || new PhetFont( 16 );

    const richTextOptions = {
      font: options.textFont,
      align: 'left',
      lineWrap: options.maxWidth,
      tagName: 'p'
    };

    const children = [];

    // Credits
    children.push( new Text( creditsTitleString, {
      font: options.titleFont,

      // pdom
      tagName: 'h2',
      innerContent: creditsTitleString
    } ) );

    // Primary lead designer should be listed first, followed by contributing designers in alphabetical order.
    if ( credits.leadDesign ) {
      const designString = StringUtils.format( creditsLeadDesignString, '\u202a' + credits.leadDesign + '\u202c' );
      children.push( new RichText( designString, merge( { innerContent: designString }, richTextOptions ) ) );
    }

    // Primary developer should be listed first, followed by contributing developers in alphabetical order.
    if ( credits.softwareDevelopment ) {
      const developmentString = StringUtils.format( creditsSoftwareDevelopmentString, '\u202a' + credits.softwareDevelopment + '\u202c' );
      children.push( new RichText( developmentString, merge( { innerContent: developmentString }, richTextOptions ) ) );
    }

    // In alphabetical order
    if ( credits.team ) {
      const teamString = StringUtils.format( creditsTeamString, '\u202a' + credits.team + '\u202c' );
      children.push( new RichText( teamString, merge( { innerContent: teamString }, richTextOptions ) ) );
    }

    // In alphabetical order
    if ( credits.contributors ) {
      const contributorsString = StringUtils.format( creditsContributorsString, '\u202a' + credits.contributors + '\u202c' );
      children.push( new RichText( contributorsString, merge( { innerContent: contributorsString }, richTextOptions ) ) );
    }

    // In alphabetical order
    if ( credits.qualityAssurance ) {
      const qualityAssuranceString = StringUtils.format( creditsQualityAssuranceString, '\u202a' + credits.qualityAssurance + '\u202c' );
      children.push( new RichText( qualityAssuranceString, merge( { innerContent: qualityAssuranceString }, richTextOptions ) ) );
    }

    // In alphabetical order
    if ( credits.graphicArts ) {
      const graphicArtsString = StringUtils.format( creditsGraphicArtsString, '\u202a' + credits.graphicArts + '\u202c' );
      children.push( new RichText( graphicArtsString, merge( { innerContent: graphicArtsString }, richTextOptions ) ) );
    }

    // In alphabetical order
    if ( credits.soundDesign ) {
      const soundDesignString = StringUtils.format( creditsSoundDesignString, '\u202a' + credits.soundDesign + '\u202c' );
      children.push( new RichText( soundDesignString, merge( { innerContent: soundDesignString }, richTextOptions ) ) );
    }

    // Thanks
    if ( credits.thanks ) {
      if ( children.length > 0 ) { children.push( new VStrut( 13 ) ); }
      children.push( new Text( creditsThanksString, {
        font: options.titleFont,
        tagName: 'h2',
        innerContent: creditsThanksString
      } ) );

      const thanksText = new RichText( credits.thanks, richTextOptions );
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

  /**
   * @public
   * @override
   */
  dispose() {
    this.disposeCreditsNode();
    super.dispose();
  }
}

joist.register( 'CreditsNode', CreditsNode );
export default CreditsNode;