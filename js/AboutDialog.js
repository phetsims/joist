// Copyright 2013-2015, University of Colorado Boulder

/**
 * Shows the About dialog.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var VBox = require( 'SCENERY/nodes/VBox' );
  var Text = require( 'SCENERY/nodes/Text' );
  var Node = require( 'SCENERY/nodes/Node' );
  var inherit = require( 'PHET_CORE/inherit' );
  var ButtonListener = require( 'SCENERY/input/ButtonListener' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var StringUtils = require( 'PHETCOMMON/util/StringUtils' );
  var VStrut = require( 'SCENERY/nodes/VStrut' );
  var Dialog = require( 'JOIST/Dialog' );
  var Timer = require( 'PHET_CORE/Timer' );
  var CreditsNode = require( 'JOIST/CreditsNode' );
  var UpdateNodes = require( 'JOIST/UpdateNodes' );
  var UpdateCheck = require( 'JOIST/UpdateCheck' );
  var LinkText = require( 'JOIST/LinkText' );
  var SubSupText = require( 'SCENERY_PHET/SubSupText' );
  var MultiLineText = require( 'SCENERY_PHET/MultiLineText' );
  var packageJSON = require( 'JOIST/packageJSON' );
  var joist = require( 'JOIST/joist' );
  var TDialog = require( 'JOIST/TDialog' );

  // strings
  var versionPatternString = require( 'string!JOIST/versionPattern' );

  // Maximum width of elements in the dialog
  var MAX_WIDTH = 550;

  /**
   * @param {string} name - The name of the simulation
   * @param {string} version - The version of the simulation
   * @param {string} credits - The credits for the simulation, or falsy to show no credits
   * @param {Brand} Brand
   * @param {string} locale - The locale string
   * @param {Tandem} tandem
   * @constructor
   */
  function AboutDialog( name, version, credits, Brand, locale, tandem ) {
    var self = this;
    this.aboutDialogTandem = tandem;

    var children = [];
    children.push( new Text( name, {
      font: new PhetFont( 28 ),
      maxWidth: MAX_WIDTH,
      tagName: 'h1',
      accessibleLabel: name
    } ) );

    var versionString = StringUtils.format( versionPatternString, version );
    children.push( new Text( versionString, {
      font: new PhetFont( 20 ),
      maxWidth: MAX_WIDTH,
      tagName: 'p',
      accessibleLabel: versionString
    } ) );
    if ( phet.chipper.buildTimestamp ) {
      children.push( new Text( phet.chipper.buildTimestamp, {
        font: new PhetFont( 13 ),
        maxWidth: MAX_WIDTH,
        tagName: 'p',
        accessibleLabel: phet.chipper.buildTimestamp
      } ) );
    }

    if ( UpdateCheck.areUpdatesChecked ) {
      var positionOptions = { left: 0, top: 0 };
      var checkingNode = UpdateNodes.createCheckingNode( positionOptions );
      var upToDateNode = UpdateNodes.createUpToDateNode( positionOptions );
      var outOfDateNode = UpdateNodes.createOutOfDateAboutNode( positionOptions );
      var offlineNode = UpdateNodes.createOfflineNode( positionOptions );

      // @private - Listener that should be called every frame where we are shown, with {number} dt as a single parameter.
      this.updateStepListener = checkingNode.stepListener;

      // @private - Listener that should be called whenever our update state changes (while we are displayed)
      this.updateVisibilityListener = function( state ) {
        checkingNode.visible = state === 'checking';
        upToDateNode.visible = state === 'up-to-date';
        outOfDateNode.visible = state === 'out-of-date';
        offlineNode.visible = state === 'offline';

        // a11y - make update content visible/invisible for screen readers
        checkingNode.accessibleHidden = !checkingNode.visible;
        upToDateNode.accessibleHidden = !upToDateNode.visible;
        outOfDateNode.accessibleHidden = !outOfDateNode.visible;
        offlineNode.accessibleHidden = !offlineNode.visible;
      };

      children.push( new Node( {
        children: [
          checkingNode,
          upToDateNode,
          outOfDateNode,
          offlineNode
        ],
        maxWidth: MAX_WIDTH
      } ) );
    }

    children.push( new VStrut( 15 ) );

    // Show the brand name, if it exists
    if ( Brand.name ) {
      children.push( new SubSupText( Brand.name, {
        font: new PhetFont( 16 ),
        supScale: 0.5,
        supYOffset: 2,
        maxWidth: MAX_WIDTH,

        // a11y
        tagName: 'h2',
        accessibleLabel: Brand.name
      } ) );
    }

    // Show the brand copyright statement, if it exists
    if ( Brand.copyright ) {
      children.push( new Text( Brand.copyright, {
        font: new PhetFont( 12 ), maxWidth: MAX_WIDTH,

        // a11y
        tagName: 'p',
        accessibleLabel: Brand.copyright
      } ) );
    }

    // Optional additionalLicenseStatement, used in phet-io
    if ( Brand.additionalLicenseStatement ) {
      this.additionalLicenseStatement = new MultiLineText( Brand.additionalLicenseStatement, {
          font: new PhetFont( 10 ),
          fill: 'gray',
          align: 'left',
          maxWidth: MAX_WIDTH,
          tandem: tandem.createTandem( 'additionLicenseStatement' )
        }
      );
      children.push( this.additionalLicenseStatement );
    }

    // Add credits for specific brands
    if ( credits && ( Brand.id === 'phet' || Brand.id === 'phet-io' ) ) {
      children.push( new VStrut( 15 ) );
      this.creditsNode = new CreditsNode( credits, tandem.createTandem( 'creditsNode' ), {
        maxWidth: MAX_WIDTH
      } );
      children.push( this.creditsNode );
    }

    // Show any links identified in the brand
    var links = Brand.getLinks( packageJSON.name, locale );
    if ( links && links.length > 0 ) {
      children.push( new VStrut( 15 ) );
      for ( var i = 0; i < links.length; i++ ) {
        var link = links[ i ];
        children.push( new LinkText( link.text, link.url, {
          font: new PhetFont( 14 ),
          maxWidth: MAX_WIDTH
        } ) );
      }
    }

    var content = new VBox( {
      align: 'left',
      spacing: 5,
      children: children,

      // a11y
      tagName: 'div'
    } );

    Dialog.call( this, content, {
      modal: true,
      hasCloseButton: true,
      tandem: tandem.createSupertypeTandem()
    } );

    // close it on a click
    this.addInputListener( new ButtonListener( {
      fire: self.hide.bind( self )
    } ) );

    tandem.addInstance( this, TDialog);
  }

  joist.register( 'AboutDialog', AboutDialog );

  return inherit( Dialog, AboutDialog, {

    /**
     * Show the dialog
     * @public
     */
    show: function() {
      if ( UpdateCheck.areUpdatesChecked ) {
        UpdateCheck.resetTimeout();

        // Fire off a new update check if we were marked as offline or unchecked before, and we handle updates.
        if ( UpdateCheck.stateProperty.value === 'offline' || UpdateCheck.stateProperty.value === 'unchecked' ) {
          UpdateCheck.check();
        }

        // Hook up our spinner listener when we're shown
        Timer.addStepListener( this.updateStepListener );

        // Hook up our visibility listener
        UpdateCheck.stateProperty.link( this.updateVisibilityListener );
      }

      Dialog.prototype.show.call( this );
    },

    /**
     * Hide the dialog ( basically disposing it because a new one is created is the dialog is opened again )
     * @public
     */
    hide: function() {
      
      // When hidden, this dialog is as good as disposed because it is never shown again
      if ( this.isShowing ) {
        Dialog.prototype.hide.call( this );

        if ( UpdateCheck.areUpdatesChecked ) {
          // Disconnect our visibility listener
          UpdateCheck.stateProperty.unlink( this.updateVisibilityListener );

          // Disconnect our spinner listener when we're hidden
          Timer.removeStepListener( this.updateStepListener );
        }

        // Tandems should be removed at disposal. The 'hide' function is used as dispose for the AboutDialog
        this.aboutDialogTandem.removeInstance( this );
        this.creditsNode && this.creditsNode.dispose();
        this.additionalLicenseStatement && this.additionalLicenseStatement.dispose();
      }
    }
  } );
} );