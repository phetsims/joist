// Copyright 2015-2020, University of Colorado Boulder

/**
 * Displays the credits section in the About dialog
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chris Malley (PixelZoom, Inc.)
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import inherit from '../../phet-core/js/inherit.js';
import merge from '../../phet-core/js/merge.js';
import StringUtils from '../../phetcommon/js/util/StringUtils.js';
import PhetFont from '../../scenery-phet/js/PhetFont.js';
import RichText from '../../scenery/js/nodes/RichText.js';
import Text from '../../scenery/js/nodes/Text.js';
import VBox from '../../scenery/js/nodes/VBox.js';
import VStrut from '../../scenery/js/nodes/VStrut.js';
import joistStrings from './joistStrings.js';
import joist from './joist.js';

const creditsContributorsString = joistStrings.credits.contributors;
const creditsGraphicArtsString = joistStrings.credits.graphicArts;
const creditsLeadDesignString = joistStrings.credits.leadDesign;
const creditsQualityAssuranceString = joistStrings.credits.qualityAssurance;
const creditsSoftwareDevelopmentString = joistStrings.credits.softwareDevelopment;
const creditsSoundDesignString = joistStrings.credits.soundDesign;
const creditsTeamString = joistStrings.credits.team;
const creditsThanksString = joistStrings.credits.thanks;
const creditsTitleString = joistStrings.credits.title;
const creditsTranslationString = joistStrings.credits.translation;

/**
 * Creates node that displays the credits.
 * @param {Object} credits - see implementation herein for supported {string} fields
 * @param {Object} [options]
 * @constructor
 */
function CreditsNode( credits, options ) {

  options = merge( {
    align: 'left',
    spacing: 1,
    maxWidth: 550
  }, options );

  const titleFont = new PhetFont( { size: 14, weight: 'bold' } );
  const font = new PhetFont( 12 );
  const multiLineTextOptions = { font: font, align: 'left', lineWrap: options.maxWidth, tagName: 'p' };
  const children = [];

  // Credits
  children.push( new Text( creditsTitleString, {
    font: titleFont,

    // pdom
    tagName: 'h2',
    innerContent: creditsTitleString
  } ) );

  // Primary lead designer should be listed first, followed by contributing designers in alphabetical order.
  if ( credits.leadDesign ) {
    const designString = StringUtils.format( creditsLeadDesignString, '\u202a' + credits.leadDesign + '\u202c' );
    children.push( new RichText( designString, merge( { innerContent: designString }, multiLineTextOptions ) ) );
  }

  // Primary developer should be listed first, followed by contributing developers in alphabetical order.
  if ( credits.softwareDevelopment ) {
    const developmentString = StringUtils.format( creditsSoftwareDevelopmentString, '\u202a' + credits.softwareDevelopment + '\u202c' );
    children.push( new RichText( developmentString, merge( { innerContent: developmentString }, multiLineTextOptions ) ) );
  }

  // In alphabetical order
  if ( credits.team ) {
    const teamString = StringUtils.format( creditsTeamString, '\u202a' + credits.team + '\u202c' );
    children.push( new RichText( teamString, merge( { innerContent: teamString }, multiLineTextOptions ) ) );
  }

  // In alphabetical order
  if ( credits.contributors ) {
    const contributorsString = StringUtils.format( creditsContributorsString, '\u202a' + credits.contributors + '\u202c' );
    children.push( new RichText( contributorsString, merge( { innerContent: contributorsString }, multiLineTextOptions ) ) );
  }

  // In alphabetical order
  if ( credits.qualityAssurance ) {
    const qualityAssuranceString = StringUtils.format( creditsQualityAssuranceString, '\u202a' + credits.qualityAssurance + '\u202c' );
    children.push( new RichText( qualityAssuranceString, merge( { innerContent: qualityAssuranceString }, multiLineTextOptions ) ) );
  }

  // In alphabetical order
  if ( credits.graphicArts ) {
    const graphicArtsString = StringUtils.format( creditsGraphicArtsString, '\u202a' + credits.graphicArts + '\u202c' );
    children.push( new RichText( graphicArtsString, merge( { innerContent: graphicArtsString }, multiLineTextOptions ) ) );
  }

  // In alphabetical order
  if ( credits.soundDesign ) {
    const soundDesignString = StringUtils.format( creditsSoundDesignString, '\u202a' + credits.soundDesign + '\u202c' );
    children.push( new RichText( soundDesignString, merge( { innerContent: soundDesignString }, multiLineTextOptions ) ) );
  }

  //TODO obtain translation credit from strings file, see https://github.com/phetsims/joist/issues/163
  // Translation
  if ( credits.translation ) {
    if ( children.length > 0 ) { children.push( new VStrut( 10 ) ); }
    children.push( new Text( creditsTranslationString, {
      font: titleFont,
      tagName: 'h2',
      innerContent: creditsTranslationString
    } ) );
    children.push( new RichText( credits.translation, multiLineTextOptions ) );
  }

  // Thanks
  if ( credits.thanks ) {
    if ( children.length > 0 ) { children.push( new VStrut( 10 ) ); }
    children.push( new Text( creditsThanksString, {
      font: titleFont,
      tagName: 'h2',
      innerContent: creditsThanksString
    } ) );

    const thanksText = new RichText( credits.thanks, multiLineTextOptions );
    thanksText.innerContent = credits.thanks;
    children.push( thanksText );
  }

  assert && assert( !options.children, 'this node sets its own children' );
  options.children = children;

  VBox.call( this, options );

  this.disposeCreditsNode = function() {
    children.forEach( function( child ) {
      child.dispose && child.dispose();
    } );
  };
}

joist.register( 'CreditsNode', CreditsNode );

export default inherit( VBox, CreditsNode, {
  dispose: function() {
    this.disposeCreditsNode();
    VBox.prototype.dispose.call( this );
  }
} );