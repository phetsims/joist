// Copyright 2013-2020, University of Colorado Boulder

/**
 * Shows the About dialog.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import timer from '../../axon/js/timer.js';
import inherit from '../../phet-core/js/inherit.js';
import StringUtils from '../../phetcommon/js/util/StringUtils.js';
import PhetFont from '../../scenery-phet/js/PhetFont.js';
import AccessiblePeer from '../../scenery/js/accessibility/pdom/AccessiblePeer.js';
import Node from '../../scenery/js/nodes/Node.js';
import RichText from '../../scenery/js/nodes/RichText.js';
import Text from '../../scenery/js/nodes/Text.js';
import VBox from '../../scenery/js/nodes/VBox.js';
import VStrut from '../../scenery/js/nodes/VStrut.js';
import Dialog from '../../sun/js/Dialog.js';
import CreditsNode from './CreditsNode.js';
import joistStrings from './joistStrings.js';
import joist from './joist.js';
import packageJSON from './packageJSON.js';
import updateCheck from './updateCheck.js';
import UpdateNodes from './UpdateNodes.js';
import UpdateState from './UpdateState.js';

const versionPatternString = joistStrings.versionPattern;

// Maximum width of elements in the dialog
const MAX_WIDTH = 550;

/**
 * @param {string} name - The name of the simulation
 * @param {string} version - The version of the simulation
 * @param {string} credits - The credits for the simulation, or falsy to show no credits
 * @param {string} locale - The locale string
 * @param {Node} phetButton - The PhET button in the navigation bar, receives focus when this dialog is closed
 * @param {Tandem} tandem
 * @constructor
 */
function AboutDialog( name, version, credits, locale, phetButton, tandem ) {

  // Dynamic modules are loaded in SimLauncher and accessed through their namespace
  const Brand = phet.brand.Brand;
  assert && assert( Brand, 'Brand should exist by now' );

  let children = [];

  const titleText = new Text( name, {
    font: new PhetFont( 28 ),
    maxWidth: MAX_WIDTH,
    tagName: 'h1',
    innerContent: name
  } );
  children.push( titleText );

  const versionString = StringUtils.format( versionPatternString, version );
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

  if ( updateCheck.areUpdatesChecked ) {
    const positionOptions = { left: 0, top: 0 };
    const checkingNode = UpdateNodes.createCheckingNode( positionOptions );
    const upToDateNode = UpdateNodes.createUpToDateNode( positionOptions );
    const outOfDateNode = UpdateNodes.createOutOfDateAboutNode( positionOptions );
    const offlineNode = UpdateNodes.createOfflineNode( positionOptions );

    // @private - Listener that should be called every frame where we are shown, with {number} dt as a single parameter.
    this.updateStepListener = checkingNode.stepListener;

    // @private {function(UpdateState)} - Listener that should be called whenever our update state changes (while we are displayed)
    this.updateVisibilityListener = function( state ) {
      checkingNode.visible = state === UpdateState.CHECKING;
      upToDateNode.visible = state === UpdateState.UP_TO_DATE;
      outOfDateNode.visible = state === UpdateState.OUT_OF_DATE;
      offlineNode.visible = state === UpdateState.OFFLINE;

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

  const brandChildren = [];

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
    const year = phet.chipper.buildTimestamp ? // defined for built versions
                 phet.chipper.buildTimestamp.split( '-' )[ 0 ] : // e.g. "2017-04-20 19:04:59 UTC" -> "2017"
                 new Date().getFullYear(); // in requirejs mode

    const copyright = StringUtils.fillIn( Brand.copyright, { year: year } );

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
  const links = Brand.getLinks( packageJSON.name, locale );
  if ( links && links.length > 0 ) {

    const linksChildren = [];
    linksChildren.push( new VStrut( 15 ) );

    for ( let i = 0; i < links.length; i++ ) {
      const link = links[ i ];

      // If links are allowed, use hyperlinks.  Otherwise just output the URL.  This doesn't need to be internationalized.
      const text = phet.chipper.queryParameters.allowLinks ? '<a href="{{url}}">' + link.text + '</a>' : link.text + ': ' + link.url;

      // This is PhET-iO instrumented because it is a keyboard navigation focusable element.
      linksChildren.push( new RichText( text, {
        links: { url: link.url }, // RichText must fill in URL for link
        font: new PhetFont( 14 ),
        tandem: tandem.createTandem( link.tandemName ),
        phetioReadOnly: true
      } ) );
    }

    // Show the links in a separate VBox so they will have the same MAX_WIDTH and hence the same font size.
    const linksParent = new VBox( {
      spacing: 5,
      align: 'left',
      children: linksChildren, maxWidth: MAX_WIDTH
    } );
    children.push( linksParent );
  }

  const content = new VBox( {
    align: 'left',
    spacing: 5,
    children: children,

    // a11y - accessible container for all AboutDialog content
    tagName: 'div'
  } );

  Dialog.call( this, content, {
    focusOnCloseNode: phetButton,
    xSpacing: 20,
    topMargin: 20,
    bottomMargin: 20,
    leftMargin: 20,
    rightMargin: 20,
    tandem: tandem,
    phetioReadOnly: true, // the AboutDialog should not be settable
    phetioState: false,
    phetioDynamicElement: true
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

export default inherit( Dialog, AboutDialog, {

  /**
   * Show the dialog
   * @public
   * @override
   */
  show: function() {
    if ( updateCheck.areUpdatesChecked && !this.isShowingProperty.value ) {
      updateCheck.resetTimeout();

      // Fire off a new update check if we were marked as offline or unchecked before, and we handle updates.
      if ( updateCheck.stateProperty.value === UpdateState.OFFLINE || updateCheck.stateProperty.value === UpdateState.UNCHECKED ) {
        updateCheck.check();
      }

      // Hook up our spinner listener when we're shown
      timer.addListener( this.updateStepListener );

      // Hook up our visibility listener
      updateCheck.stateProperty.link( this.updateVisibilityListener );
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

      if ( updateCheck.areUpdatesChecked ) {

        // Disconnect our visibility listener
        updateCheck.stateProperty.unlink( this.updateVisibilityListener );

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