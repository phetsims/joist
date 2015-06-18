// Copyright 2002-2013, University of Colorado Boulder

/**
 * Shows the About dialog.
 *
 * @author Sam Reid
 */
define( function( require ) {
  'use strict';

  // modules
  var HBox = require( 'SCENERY/nodes/HBox' );
  var VBox = require( 'SCENERY/nodes/VBox' );
  var Text = require( 'SCENERY/nodes/Text' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var inherit = require( 'PHET_CORE/inherit' );
  var ButtonListener = require( 'SCENERY/input/ButtonListener' );
  var MultiLineText = require( 'SCENERY_PHET/MultiLineText' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var FontAwesomeNode = require( 'SUN/FontAwesomeNode' );
  var SpinningIndicatorNode = require( 'SCENERY_PHET/SpinningIndicatorNode' );
  var StringUtils = require( 'PHETCOMMON/util/StringUtils' );
  var VStrut = require( 'SCENERY/nodes/VStrut' );
  var Dialog = require( 'JOIST/Dialog' );
  var Timer = require( 'JOIST/Timer' );
  var UpdateCheck = require( 'JOIST/UpdateCheck' );
  var Input = require( 'SCENERY/input/Input' );

  // strings
  var creditsTitleString = require( 'string!JOIST/credits.title' );
  var leadDesignString = require( 'string!JOIST/credits.leadDesign' );
  var softwareDevelopmentString = require( 'string!JOIST/credits.softwareDevelopment' );
  var teamString = require( 'string!JOIST/credits.team' );
  var qualityAssuranceString = require( 'string!JOIST/credits.qualityAssurance' );
  var graphicArtsString = require( 'string!JOIST/credits.graphicArts' );
  var translationTitleString = require( 'string!JOIST/credits.translation' );
  var thanksTitleString = require( 'string!JOIST/credits.thanks' );
  var versionPattern = require( 'string!JOIST/versionPattern' );

  /**
   * @param {string} name - The name of the simulation
   * @param {string} version - The version of the simulation
   * @param {string} credits - The credits for the simulation, or falsy to show no credits
   * @param {Brand} Brand
   * @constructor
   */
  function AboutDialog( name, version, credits, Brand ) {
    var dialog = this;

    var children = [];
    children.push( new Text( name, { font: new PhetFont( 28 ) } ) );
    children.push( new Text( StringUtils.format( versionPattern, version ), { font: new PhetFont( 20 ) } ) );
    if ( phet.chipper.buildTimestamp ) {
      children.push( new Text( phet.chipper.buildTimestamp, { font: new PhetFont( 13 ) } ) );
    }

    if ( UpdateCheck.areUpdatesChecked ) {
      children.push( createUpdateNode( dialog ) );
    }

    children.push( new VStrut( 15 ) );
    children.push( new Text( Brand.name, { font: new PhetFont( 16 ) } ) );
    children.push( new Text( Brand.copyright, { font: new PhetFont( 12 ) } ) );

    if ( credits ) {
      children.push( new VStrut( 15 ) );
      children.push( createCreditsNode( credits ) );
    }

    if ( Brand.links && Brand.links.length ) {
      children.push( new VStrut( 15 ) );
      for ( var i = 0; i < Brand.links.length; i++ ) {
        var link = Brand.links[ i ];
        children.push( createLinkNode( link.text, link.url, new PhetFont( 14 ) ) );
      }
    }

    var content = new VBox( { align: 'left', spacing: 5, children: children } );

    Dialog.call( this, content, {
      modal: true,
      hasCloseButton: false,

      // Focusable so it can be dismissed
      focusable: true
    } );

    // close it on a click
    this.addInputListener( new ButtonListener( {
      fire: dialog.hide.bind( dialog )
    } ) );

    // Close the dialog when escape is pressed, the ButtonListener above will also close it when enter/space pressed
    this.addInputListener( {
      keydown: function( event ) {
        var keyCode = event.domEvent.keyCode;
        if ( keyCode === Input.KEY_ESCAPE ) {
          dialog.hide();
        }
      }
    } );
  }

  /**
   * Creates a hypertext link.
   * @param {string} text the text that's shown to the user
   * @param {string} url clicking the text opens a window/tab to this URL
   * @returns {Node}
   */
  var createLinkNode = function( text, url, font ) {

    var link = new Text( text, {
      font: font,
      fill: 'rgb(27,0,241)', // blue, like a typical hypertext link
      cursor: 'pointer'
    } );

    link.addInputListener( {
      up: function( evt ) {
        evt.handle(); // don't close the dialog
        var newWindow = window.open( url, '_blank' ); // open in a new window/tab
        newWindow.focus();
      }
    } );

    return link;
  };

  /**
   * Creates node that displays the credits.
   * @param {Object} credits see implementation herein for supported {string} fields
   * @returns {Node}
   */
  var createCreditsNode = function( credits ) {

    var titleFont = new PhetFont( { size: 14, weight: 'bold' } );
    var font = new PhetFont( 12 );
    var multiLineTextOptions = { font: font, align: 'left' };
    var children = [];

    // Credits
    children.push( new Text( creditsTitleString, { font: titleFont } ) );
    if ( credits.leadDesign ) { children.push( new MultiLineText( StringUtils.format( leadDesignString, credits.leadDesign ), multiLineTextOptions ) ); }
    if ( credits.softwareDevelopment ) { children.push( new MultiLineText( StringUtils.format( softwareDevelopmentString, credits.softwareDevelopment ), multiLineTextOptions ) ); }
    if ( credits.team ) { children.push( new MultiLineText( StringUtils.format( teamString, credits.team ), multiLineTextOptions ) ); }
    if ( credits.qualityAssurance ) { children.push( new MultiLineText( StringUtils.format( qualityAssuranceString, credits.qualityAssurance ), multiLineTextOptions ) ); }
    if ( credits.graphicArts ) { children.push( new MultiLineText( StringUtils.format( graphicArtsString, credits.graphicArts ), multiLineTextOptions ) ); }

    //TODO see joist#163, translation credit should be obtained from string files
    // Translation
    if ( credits.translation ) {
      if ( children.length > 0 ) { children.push( new VStrut( 10 ) ); }
      children.push( new Text( translationTitleString, { font: titleFont } ) );
      children.push( new MultiLineText( credits.translation, multiLineTextOptions ) );
    }

    // Thanks
    if ( credits.thanks ) {
      if ( children.length > 0 ) { children.push( new VStrut( 10 ) ); }
      children.push( new Text( thanksTitleString, { font: titleFont } ) );
      children.push( new MultiLineText( credits.thanks, multiLineTextOptions ) );
    }

    return new VBox( { align: 'left', spacing: 1, children: children } );
  };

  /**
   * Creates the display for showing simulation version status, and whether updates are recommended.
   * @param {AboutDialog} - The dialog, so we can properly set up the spinning listener.
   * @returns {Node}
   */
  var createUpdateNode = function( dialog ) {
    var updateContainer = new Node();
    var updateTextFont = new PhetFont( 12 );

    // "Checking" state node
    var spinningIndicatorNode = new SpinningIndicatorNode( { indicatorSize: 18 } );
    dialog.spinningIndicatorListener = function( dt ) {
      if ( UpdateCheck.state === 'checking' ) {
        spinningIndicatorNode.step( dt );
      }
    };
    var checkingNode = new HBox( { spacing: 8, left: 0, top: 0, children: [
      spinningIndicatorNode,
      new Text( 'Checking for updates\u2026', { font: updateTextFont } )
    ] } );
    updateContainer.addChild( checkingNode );

    // "Up-to-date" state node
    var upToDateNode = new HBox( { spacing: 8, left: 0, top: 0, children: [
      new Rectangle( 0, 0, 20, 20, 5, 5, { fill: '#5c3', children: [
        new FontAwesomeNode( 'check_without_box', { fill: '#fff', scale: 0.38, centerX: 10, centerY: 10 } )
      ] } ),
      new Text( 'Sim is up to date.', { font: updateTextFont } )
    ] } );
    updateContainer.addChild( upToDateNode );

    // "Out-of-date" state node
    var outOfDateNode = new HBox( { spacing: 8, left: 0, top: 0, cursor: 'pointer', children: [
      new FontAwesomeNode( 'warning_sign', { fill: '#E87600', scale: 0.5 } ), // "safety orange", according to Wikipedia
      createLinkNode( 'New version available', UpdateCheck.updateURL, updateTextFont )
    ] } );
    updateContainer.addChild( outOfDateNode );

    // "Offline" state node
    var offlineNode = new HBox( { spacing: 0, left: 0, top: 0, children: [
      new VStrut( 20 ),
      new Text( 'Sim is offline.', { font: updateTextFont} )
    ] } );
    updateContainer.addChild( offlineNode );

    // Show only the node corresponding the the current state (if any).
    UpdateCheck.stateProperty.link( function( state ) {
      checkingNode.visible = state === 'checking';
      upToDateNode.visible = state === 'up-to-date';
      outOfDateNode.visible = state === 'out-of-date';
      offlineNode.visible = state === 'offline';
    } );

    return updateContainer;
  };

  return inherit( Dialog, AboutDialog, {
    show: function() {
      // Fire off a new update check if we were marked as offline or unchecked before, and we handle updates.
      if ( UpdateCheck.areUpdatesChecked && ( UpdateCheck.state === 'offline' || UpdateCheck.state === 'unchecked' ) ) {
        UpdateCheck.check();
      }

      Dialog.prototype.show.call( this );

      // Hook up our spinner listener when we're shown
      if ( UpdateCheck.areUpdatesChecked ) {
        Timer.addStepListener( this.spinningIndicatorListener );
      }
    },

    hide: function() {
      Dialog.prototype.hide.call( this );

      // Disconnect our spinner listener when we're hidden
      if ( UpdateCheck.areUpdatesChecked ) {
        Timer.removeStepListener( this.spinningIndicatorListener );
      }
    }
  } );
} );
