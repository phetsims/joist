// Copyright 2013-2019, University of Colorado Boulder

/**
 * Shows the About dialog.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var AccessiblePeer = require( 'SCENERY/accessibility/AccessiblePeer' );
  var CreditsNode = require( 'JOIST/CreditsNode' );
  var Dialog = require( 'SUN/Dialog' );
  var inherit = require( 'PHET_CORE/inherit' );
  var joist = require( 'JOIST/joist' );
  var Node = require( 'SCENERY/nodes/Node' );
  var packageJSON = require( 'JOIST/packageJSON' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var RichText = require( 'SCENERY/nodes/RichText' );
  var StringUtils = require( 'PHETCOMMON/util/StringUtils' );
  var Text = require( 'SCENERY/nodes/Text' );
  var timer = require( 'AXON/timer' );
  var UpdateCheck = require( 'JOIST/UpdateCheck' );
  var UpdateNodes = require( 'JOIST/UpdateNodes' );
  var VBox = require( 'SCENERY/nodes/VBox' );
  var VStrut = require( 'SCENERY/nodes/VStrut' );

  // strings
  var versionPatternString = require( 'string!JOIST/versionPattern' );

  // Maximum width of elements in the dialog
  var MAX_WIDTH = 550;

  // distance from the top of the about dialog to the dev bounds
  // same as the distance from the bottom of the about dialog to the top of the navigation bar.
  var EXTERNAL_MARGIN = 12;

  /**
   * @param {string} name - The name of the simulation
   * @param {string} version - The version of the simulation
   * @param {string} credits - The credits for the simulation, or falsy to show no credits
   * @param {Brand} Brand
   * @param {string} locale - The locale string
   * @param {Node} phetButton - The PhET button in the navigation bar, receives focus when this dialog is closed
   * @param {Tandem} tandem
   * @constructor
   */
  function AboutDialog( name, version, credits, Brand, locale, phetButton, tandem ) {
    var children = [];

    var titleText = new Text( name, {
      font: new PhetFont( 28 ),
      maxWidth: MAX_WIDTH,
      tagName: 'h1',
      innerContent: name
    } );
    children.push( titleText );

    var versionString = StringUtils.format( versionPatternString, version );
    children.push( new Text( versionString, {
      font: new PhetFont( 20 ),
      maxWidth: MAX_WIDTH,
      tagName: 'p',
      innerContent: versionString
    } ) );

    if ( phet.chipper.buildTimestamp ) {
      children.push( new Text( phet.chipper.buildTimestamp, {
        font: new PhetFont( 13 ),
        maxWidth: MAX_WIDTH,
        tagName: 'p',
        innerContent: phet.chipper.buildTimestamp
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

        // a11y - make update content visible/invisible for screen readers by explicitly removing content
        // from the DOM, necessary because AT will ready hidden content in a Dialog.
        checkingNode.accessibleContentDisplayed = checkingNode.visible;
        upToDateNode.accessibleContentDisplayed = upToDateNode.visible;
        outOfDateNode.accessibleContentDisplayed = outOfDateNode.visible;
        offlineNode.accessibleContentDisplayed = offlineNode.visible;
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

    var brandChildren = [];

    // Show the brand name, if it exists
    if ( Brand.name ) {
      brandChildren.push( new RichText( Brand.name, {
        font: new PhetFont( 16 ),
        supScale: 0.5,
        supYOffset: 2,
        maxWidth: MAX_WIDTH,

        // a11y
        tagName: 'h2',
        innerContent: Brand.name
      } ) );
    }

    // Show the brand copyright statement, if it exists
    if ( Brand.copyright ) {
      var year = phet.chipper.buildTimestamp ? // defined for built versions
                 phet.chipper.buildTimestamp.split( '-' )[ 0 ] : // e.g. "2017-04-20 19:04:59 UTC" -> "2017"
                 new Date().getFullYear(); // in requirejs mode

      var copyright = StringUtils.fillIn( Brand.copyright, { year: year } );

      brandChildren.push( new Text( copyright, {
        font: new PhetFont( 12 ), maxWidth: MAX_WIDTH,

        // a11y
        tagName: 'p',
        innerContent: copyright
      } ) );
    }

    // Optional additionalLicenseStatement, used in phet-io
    if ( Brand.additionalLicenseStatement ) {
      this.additionalLicenseStatement = new RichText( Brand.additionalLicenseStatement, {
          font: new PhetFont( 10 ),
          fill: 'gray',
          align: 'left',
          maxWidth: MAX_WIDTH,

          // a11y
          tagName: 'p',
          innerContent: Brand.additionalLicenseStatement
        }
      );
      brandChildren.push( this.additionalLicenseStatement );
    }

    if ( brandChildren.length > 0 ) {
      children.push( new VStrut( 15 ) );
      children = children.concat( brandChildren );
    }

    // Add credits for specific brands
    if ( credits && ( Brand.id === 'phet' || Brand.id === 'phet-io' ) ) {
      children.push( new VStrut( 15 ) );
      this.creditsNode = new CreditsNode( credits, {
        maxWidth: MAX_WIDTH
      } );
      children.push( this.creditsNode );
    }

    // Show any links identified in the brand
    var links = Brand.getLinks( packageJSON.name, locale );
    if ( links && links.length > 0 ) {
      children.push( new VStrut( 15 ) );

      var linksGroupTandem = tandem.createGroupTandem( 'link' );
      for ( var i = 0; i < links.length; i++ ) {
        var link = links[ i ];
        children.push( new RichText( '<a href="{{url}}">' + link.text + '</a>', {
          links: { url: link.url }, // RichText must fill in URL for link
          font: new PhetFont( 14 ),
          maxWidth: MAX_WIDTH,
          tandem: linksGroupTandem.createNextTandem(),
          phetioReadOnly: true, // the AboutDialog should not be settable
          phetioState: false
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
      focusOnCloseNode: phetButton,
      tandem: tandem,
      phetioReadOnly: true, // the AboutDialog should not be settable
      phetioState: false,
      xSpacing: 20,
      topMargin: 20,
      bottomMargin: 20,
      leftMargin: 20,
      rightMargin: 20,

      // This value was determined empirically and is suitable independent of the ScreenView.layoutBounds.  Scale the
      // entire AboutDialog as a robust solution in case parts outside of the content resize in future versions. Note
      // the layer containing the AboutDialog is already scaled based on the aspect ratio of the window. At a scale of
      // 1.0, the amount of vertical space is 504 and the amount of space above the navigation bar is 464 because the
      // navigation bar takes 40px at that scale.  Please see Sim.resizedAction for more details.
      maxHeight: 464 - EXTERNAL_MARGIN * 2,

      // Center in the screenBounds (doesn't include the navigation bar)
      layoutStrategy: function( dialog, simBounds, screenBounds, scale ) {
        dialog.center = screenBounds.center.times( 1.0 / scale );
      }
    } );

    // a11y - set label association so the title is read when focus enters the dialog
    this.addAriaLabelledbyAssociation( {
      thisElementName: AccessiblePeer.PRIMARY_SIBLING,
      otherNode: titleText,
      otherElementName: AccessiblePeer.PRIMARY_SIBLING
    } );

    // @private - to be called in dispose
    this.disposeAboutDialog = function() {
      this.creditsNode && this.creditsNode.dispose();
      this.additionalLicenseStatement && this.additionalLicenseStatement.dispose();
    };
  }

  joist.register( 'AboutDialog', AboutDialog );

  return inherit( Dialog, AboutDialog, {

    /**
     * Show the dialog
     * @public
     * @override
     */
    show: function() {
      if ( UpdateCheck.areUpdatesChecked && !this.isShowingProperty.value ) {
        UpdateCheck.resetTimeout();

        // Fire off a new update check if we were marked as offline or unchecked before, and we handle updates.
        if ( UpdateCheck.stateProperty.value === 'offline' || UpdateCheck.stateProperty.value === 'unchecked' ) {
          UpdateCheck.check();
        }

        // Hook up our spinner listener when we're shown
        timer.addListener( this.updateStepListener );

        // Hook up our visibility listener
        UpdateCheck.stateProperty.link( this.updateVisibilityListener );
      }

      Dialog.prototype.show.call( this );
    },

    /**
     * Remove listeners that should only be called when the dialog is shown.
     * @public
     * @override
     */
    hide: function() {
      if ( this.isShowingProperty.value ) {
        Dialog.prototype.hide.call( this );

        if ( UpdateCheck.areUpdatesChecked ) {

          // Disconnect our visibility listener
          UpdateCheck.stateProperty.unlink( this.updateVisibilityListener );

          // Disconnect our spinner listener when we're hidden
          timer.removeListener( this.updateStepListener );
        }
      }
    },

    /**
     * Make eligible for garbage collection.
     * @public
     * @override
     */
    dispose: function() {
      this.disposeAboutDialog();
      Dialog.prototype.dispose.call( this );
    }
  } );
} );