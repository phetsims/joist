// Copyright 2015-2018, University of Colorado Boulder

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
  var inherit = require( 'PHET_CORE/inherit' );
  var joist = require( 'JOIST/joist' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var RichText = require( 'SCENERY/nodes/RichText' );
  var StringUtils = require( 'PHETCOMMON/util/StringUtils' );
  var Text = require( 'SCENERY/nodes/Text' );
  var VBox = require( 'SCENERY/nodes/VBox' );
  var VStrut = require( 'SCENERY/nodes/VStrut' );

  // strings
  var creditsContributorsString = require( 'string!JOIST/credits.contributors' );
  var creditsGraphicArtsString = require( 'string!JOIST/credits.graphicArts' );
  var creditsLeadDesignString = require( 'string!JOIST/credits.leadDesign' );
  var creditsQualityAssuranceString = require( 'string!JOIST/credits.qualityAssurance' );
  var creditsSoftwareDevelopmentString = require( 'string!JOIST/credits.softwareDevelopment' );
  var creditsSoundDesignString = require( 'string!JOIST/credits.soundDesign' );
  var creditsTeamString = require( 'string!JOIST/credits.team' );
  var creditsThanksString = require( 'string!JOIST/credits.thanks' );
  var creditsTitleString = require( 'string!JOIST/credits.title' );
  var creditsTranslationString = require( 'string!JOIST/credits.translation' );

  /**
   * Creates node that displays the credits.
   * @param {Object} credits - see implementation herein for supported {string} fields
   * @param {Object} [options]
   * @constructor
   */
  function CreditsNode( credits, options ) {

    options = _.extend( {
      align: 'left',
      spacing: 1,
      maxWidth: 550
    }, options );

    var titleFont = new PhetFont( { size: 14, weight: 'bold' } );
    var font = new PhetFont( 12 );
    var multiLineTextOptions = { font: font, align: 'left', lineWrap: options.maxWidth, tagName: 'p' };
    var children = [];

    // Credits
    children.push( new Text( creditsTitleString, {
      font: titleFont,

      // a11y
      tagName: 'h2',
      innerContent: creditsTitleString
    } ) );

    // Primary lead designer should be listed first, followed by contributing designers in alphabetical order.
    if ( credits.leadDesign ) {
      var designString =  StringUtils.format( creditsLeadDesignString, '\u202a' + credits.leadDesign + '\u202c' );
      children.push( new RichText( designString, _.extend( { innerContent: designString }, multiLineTextOptions ) ) );
    }

    // Primary developer should be listed first, followed by contributing developers in alphabetical order.
    if ( credits.softwareDevelopment ) {
      var developmentString = StringUtils.format( creditsSoftwareDevelopmentString, '\u202a' + credits.softwareDevelopment + '\u202c' );
      children.push( new RichText( developmentString, _.extend( { innerContent: developmentString }, multiLineTextOptions ) ) );
    }

    // In alphabetical order
    if ( credits.team ) {
      var teamString = StringUtils.format( creditsTeamString, '\u202a' + credits.team + '\u202c' );
      children.push( new RichText( teamString, _.extend( { innerContent: teamString }, multiLineTextOptions ) ) );
    }

    // In alphabetical order
    if ( credits.contributors ) {
      var contributorsString = StringUtils.format( creditsContributorsString, '\u202a' + credits.contributors + '\u202c' );
      children.push( new RichText( contributorsString, _.extend( { innerContent: contributorsString }, multiLineTextOptions ) ) );
    }

    // In alphabetical order
    if ( credits.qualityAssurance ) {
      var qualityAssuranceString = StringUtils.format( creditsQualityAssuranceString, '\u202a' + credits.qualityAssurance + '\u202c' );
      children.push( new RichText( qualityAssuranceString, _.extend( { innerContent: qualityAssuranceString }, multiLineTextOptions ) ) );
    }

    // In alphabetical order
    if ( credits.graphicArts ) {
      var graphicArtsString = StringUtils.format( creditsGraphicArtsString, '\u202a' + credits.graphicArts + '\u202c' );
      children.push( new RichText( graphicArtsString, _.extend( { innerContent: graphicArtsString }, multiLineTextOptions ) ) );
    }

    // In alphabetical order
    if ( credits.soundDesign ) {
      var soundDesignString = StringUtils.format( creditsSoundDesignString, '\u202a' + credits.soundDesign + '\u202c' );
      children.push( new RichText( soundDesignString, _.extend( { innerContent: soundDesignString }, multiLineTextOptions ) ) );
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

      var thanksText = new RichText( credits.thanks, multiLineTextOptions );
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

  return inherit( VBox, CreditsNode, {
    dispose: function() {
      this.disposeCreditsNode();
      VBox.prototype.dispose.call( this );
    }
  } );
} );