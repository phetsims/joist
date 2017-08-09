// Copyright 2015, University of Colorado Boulder

/**
 * Displays the credits section in the About dialog
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chris Malley (PixelZoom, Inc.)
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( function( require ) {
  'use strict';

  // modules
  var VBox = require( 'SCENERY/nodes/VBox' );
  var Text = require( 'SCENERY/nodes/Text' );
  var inherit = require( 'PHET_CORE/inherit' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var MultiLineText = require( 'SCENERY_PHET/MultiLineText' );
  var StringUtils = require( 'PHETCOMMON/util/StringUtils' );
  var VStrut = require( 'SCENERY/nodes/VStrut' );
  var joist = require( 'JOIST/joist' );

  // strings
  var creditsTitleString = require( 'string!JOIST/credits.title' );
  var creditsLeadDesignString = require( 'string!JOIST/credits.leadDesign' );
  var creditsSoftwareDevelopmentString = require( 'string!JOIST/credits.softwareDevelopment' );
  var creditsTeamString = require( 'string!JOIST/credits.team' );
  var creditsContributorsString = require( 'string!JOIST/credits.contributors' );
  var creditsQualityAssuranceString = require( 'string!JOIST/credits.qualityAssurance' );
  var creditsGraphicArtsString = require( 'string!JOIST/credits.graphicArts' );
  var creditsTranslationString = require( 'string!JOIST/credits.translation' );
  var creditsThanksString = require( 'string!JOIST/credits.thanks' );

  /**
   * Creates node that displays the credits.
   * @param {Object} credits - see implementation herein for supported {string} fields
   * @param {Object} [options] - Passed to VBox
   * @constructor
   */
  function CreditsNode( credits, options ) {
    var titleFont = new PhetFont( { size: 14, weight: 'bold' } );
    var font = new PhetFont( 12 );
    var multiLineTextOptions = { font: font, align: 'left' };
    var children = [];

    // Credits
    children.push( new Text( creditsTitleString, {
      font: titleFont,

      // a11y
      tagName: 'h2',
      accessibleLabel: creditsTitleString
    } ) );
    if ( credits.leadDesign ) {
      children.push( new MultiLineText( StringUtils.format( creditsLeadDesignString, '\u202a' + credits.leadDesign + '\u202c' ), multiLineTextOptions ) );
    }
    if ( credits.softwareDevelopment ) {
      children.push( new MultiLineText( StringUtils.format( creditsSoftwareDevelopmentString, '\u202a' + credits.softwareDevelopment + '\u202c' ), multiLineTextOptions ) );
    }
    if ( credits.team ) {
      children.push( new MultiLineText( StringUtils.format( creditsTeamString, '\u202a' + credits.team + '\u202c' ), multiLineTextOptions ) );
    }
    if ( credits.contributors ) {
      children.push( new MultiLineText( StringUtils.format( creditsContributorsString, '\u202a' + credits.contributors + '\u202c' ), multiLineTextOptions ) );
    }
    if ( credits.qualityAssurance ) {
      children.push( new MultiLineText( StringUtils.format( creditsQualityAssuranceString, '\u202a' + credits.qualityAssurance + '\u202c' ), multiLineTextOptions ) );
    }
    if ( credits.graphicArts ) {
      children.push( new MultiLineText( StringUtils.format( creditsGraphicArtsString, '\u202a' + credits.graphicArts + '\u202c' ), multiLineTextOptions ) );
    }

    //TODO obtain translation credit from strings file, see https://github.com/phetsims/joist/issues/163
    // Translation
    if ( credits.translation ) {
      if ( children.length > 0 ) { children.push( new VStrut( 10 ) ); }
      children.push( new Text( creditsTranslationString, {
        font: titleFont,
        tagName: 'h2',
        accessibleLabel: creditsTranslationString
      } ) );
      children.push( new MultiLineText( credits.translation, multiLineTextOptions ) );
    }

    // Thanks
    if ( credits.thanks ) {
      if ( children.length > 0 ) { children.push( new VStrut( 10 ) ); }
      children.push( new Text( creditsThanksString, {
        font: titleFont,
        tagName: 'h2',
        accessibleLabel: creditsThanksString
      } ) );
      children.push( new MultiLineText( credits.thanks, multiLineTextOptions ) );
    }

    VBox.call( this, _.extend( {
      align: 'left',
      spacing: 1,
      children: children
    }, options ) );

    this.disposeCreditsNode = function() {
      children.forEach( function( child ) {
        child.dispose && child.dispose();
      } );
    };
  }

  joist.register( 'CreditsNode', CreditsNode );

  return inherit( VBox, CreditsNode, {
    dispose: function() {
      this.disposeCreditsNode();
      VBox.prototype.dispose.call( this );
    }
  } );
} );