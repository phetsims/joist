// Copyright 2013-2020, University of Colorado Boulder

/**
 * AboutDialog displays information about the simulation -- its title, version number, credits, etc.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import stepTimer from '../../axon/js/stepTimer.js';
import StringUtils from '../../phetcommon/js/util/StringUtils.js';
import PhetFont from '../../scenery-phet/js/PhetFont.js';
import PDOMPeer from '../../scenery/js/accessibility/pdom/PDOMPeer.js';
import Node from '../../scenery/js/nodes/Node.js';
import RichText from '../../scenery/js/nodes/RichText.js';
import Text from '../../scenery/js/nodes/Text.js';
import VBox from '../../scenery/js/nodes/VBox.js';
import VStrut from '../../scenery/js/nodes/VStrut.js';
import Dialog from '../../sun/js/Dialog.js';
import CreditsNode from './CreditsNode.js';
import joist from './joist.js';
import joistStrings from './joistStrings.js';
import packageJSON from './packageJSON.js';
import updateCheck from './updateCheck.js';
import UpdateNodes from './UpdateNodes.js';
import UpdateState from './UpdateState.js';

// constants
const MAX_WIDTH = 550; // Maximum width of elements in the dialog
const NOMINAL_FONT_SIZE = 16; // Change this to make everything larger or smaller

class AboutDialog extends Dialog {

  /**
   * @param {string} name - The name of the simulation
   * @param {string} version - The version of the simulation
   * @param {string} credits - The credits for the simulation, or falsy to show no credits
   * @param {string} locale - The locale string
   * @param {Tandem} tandem
   */
  constructor( name, version, credits, locale, tandem ) {

    // Dynamic modules are loaded in simLauncher and accessed through their namespace
    const Brand = phet.brand.Brand;
    assert && assert( Brand, 'Brand should exist by now' );

    let children = [];

    const titleText = new Text( name, {
      font: new PhetFont( 2 * NOMINAL_FONT_SIZE ),
      maxWidth: MAX_WIDTH,
      tagName: 'h1',
      innerContent: name
    } );
    children.push( titleText );

    const versionString = StringUtils.format( joistStrings.versionPattern, version );
    children.push( new Text( versionString, {
      font: new PhetFont( NOMINAL_FONT_SIZE ),
      maxWidth: MAX_WIDTH,
      tagName: 'p',
      innerContent: versionString
    } ) );

    // Built versions will have a build timestamp
    if ( phet.chipper.buildTimestamp ) {
      children.push( new Text( phet.chipper.buildTimestamp, {
        font: new PhetFont( 0.65 * NOMINAL_FONT_SIZE ),
        maxWidth: MAX_WIDTH,
        tagName: 'p',
        innerContent: phet.chipper.buildTimestamp
      } ) );
    }

    let updateStepListener = null;
    let updateVisibilityListener = null;

    // brand=phet versions that are not running in the phet-app will should update status
    if ( updateCheck.areUpdatesChecked ) {

      const positionOptions = { left: 0, top: 0 };
      const checkingNode = UpdateNodes.createCheckingNode( positionOptions );
      const upToDateNode = UpdateNodes.createUpToDateNode( positionOptions );
      const outOfDateNode = UpdateNodes.createOutOfDateAboutNode( positionOptions );
      const offlineNode = UpdateNodes.createOfflineNode( positionOptions );

      // @private - Listener that should be called every frame where we are shown, with {number} dt as a single parameter.
      updateStepListener = checkingNode.stepListener;

      // @private {function(UpdateState)} - Listener that should be called whenever our update state changes (while we are displayed)
      updateVisibilityListener = state => {
        checkingNode.visible = state === UpdateState.CHECKING;
        upToDateNode.visible = state === UpdateState.UP_TO_DATE;
        outOfDateNode.visible = state === UpdateState.OUT_OF_DATE;
        offlineNode.visible = state === UpdateState.OFFLINE;

        // pdom - make update content visible/invisible for screen readers by explicitly removing content
        // from the DOM, necessary because AT will ready hidden content in a Dialog.
        checkingNode.pdomVisible = checkingNode.visible;
        upToDateNode.pdomVisible = upToDateNode.visible;
        outOfDateNode.pdomVisible = outOfDateNode.visible;
        offlineNode.pdomVisible = offlineNode.visible;
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
        font: new PhetFont( NOMINAL_FONT_SIZE ),
        supScale: 0.5,
        supYOffset: 3,
        maxWidth: MAX_WIDTH,

        // pdom
        tagName: 'h2',
        innerContent: Brand.name
      } ) );
    }

    // Show the brand copyright statement, if it exists
    if ( Brand.copyright ) {
      const year = phet.chipper.buildTimestamp ? // defined for built versions
                   phet.chipper.buildTimestamp.split( '-' )[ 0 ] : // e.g. "2017-04-20 19:04:59 UTC" -> "2017"
                   new Date().getFullYear(); // in unbuilt mode

      const copyright = StringUtils.fillIn( Brand.copyright, { year: year } );

      brandChildren.push( new Text( copyright, {
        font: new PhetFont( 0.75 * NOMINAL_FONT_SIZE ),
        maxWidth: MAX_WIDTH,

        // pdom
        tagName: 'p',
        innerContent: copyright
      } ) );
    }

    let additionalLicenseStatement = null;

    // Optional additionalLicenseStatement, used in phet-io
    if ( Brand.additionalLicenseStatement ) {
      additionalLicenseStatement = new RichText( Brand.additionalLicenseStatement, {
          font: new PhetFont( 0.65 * NOMINAL_FONT_SIZE ),
          fill: 'gray',
          align: 'left',
          maxWidth: MAX_WIDTH,

          // pdom
          tagName: 'p',
          innerContent: Brand.additionalLicenseStatement
        }
      );
      brandChildren.push( additionalLicenseStatement );
    }

    if ( brandChildren.length > 0 ) {
      children.push( new VStrut( 15 ) );
      children = children.concat( brandChildren );
    }

    let creditsNode = null;

    // Add credits for specific brands
    if ( credits && ( Brand.id === 'phet' || Brand.id === 'phet-io' ) ) {
      children.push( new VStrut( 15 ) );
      creditsNode = new CreditsNode( credits, {
        titleFont: new PhetFont( { size: NOMINAL_FONT_SIZE, weight: 'bold' } ),
        textFont: new PhetFont( 0.75 * NOMINAL_FONT_SIZE ),
        maxWidth: MAX_WIDTH
      } );
      children.push( creditsNode );
    }

    // must be in this scope for disposal
    const linksChildren = [];

    // Show any links identified in the brand
    const links = Brand.getLinks( packageJSON.name, locale );
    if ( links && links.length > 0 ) {

      linksChildren.push( new VStrut( 15 ) );

      for ( let i = 0; i < links.length; i++ ) {
        const link = links[ i ];

        // If links are allowed, use hyperlinks.  Otherwise just output the URL.  This doesn't need to be internationalized.
        const text = phet.chipper.queryParameters.allowLinks ? `<a href="{{url}}">${link.text}</a>` : `${link.text}: ${link.url}`;

        // This is PhET-iO instrumented because it is a keyboard navigation focusable element.
        linksChildren.push( new RichText( text, {
          links: { url: link.url }, // RichText must fill in URL for link
          font: new PhetFont( NOMINAL_FONT_SIZE ),
          tandem: tandem.createTandem( link.tandemName ),
          phetioReadOnly: true
        } ) );
      }

      // Show the links in a separate VBox so they will have the same MAX_WIDTH and hence the same font size.
      const linksParent = new VBox( {
        spacing: 6,
        align: 'left',
        children: linksChildren, maxWidth: MAX_WIDTH
      } );
      children.push( linksParent );
    }

    const content = new VBox( {
      align: 'left',
      spacing: 6,
      children: children,

      // pdom - accessible container for all AboutDialog content
      tagName: 'div'
    } );

    super( content, {
      xSpacing: 26,
      topMargin: 26,
      bottomMargin: 26,
      leftMargin: 26,
      rightMargin: 26,
      tandem: tandem,
      phetioReadOnly: true, // the AboutDialog should not be settable
      phetioState: true,
      phetioDynamicElement: true
    } );

    // @private
    this.updateStepListener = updateStepListener;

    // @private
    this.updateVisibilityListener = updateVisibilityListener;

    // pdom - set label association so the title is read when focus enters the dialog
    this.addAriaLabelledbyAssociation( {
      thisElementName: PDOMPeer.PRIMARY_SIBLING,
      otherNode: titleText,
      otherElementName: PDOMPeer.PRIMARY_SIBLING
    } );

    // @private - to be called in dispose
    this.disposeAboutDialog = () => {
      creditsNode && creditsNode.dispose();
      additionalLicenseStatement && additionalLicenseStatement.dispose();
      linksChildren.forEach( child => child.dispose && child.dispose() );
    };
  }

  /**
   * Show the dialog
   * @public
   * @override
   */
  show() {
    if ( updateCheck.areUpdatesChecked && !this.isShowingProperty.value ) {
      updateCheck.resetTimeout();

      // Fire off a new update check if we were marked as offline or unchecked before, and we handle updates.
      if ( updateCheck.stateProperty.value === UpdateState.OFFLINE || updateCheck.stateProperty.value === UpdateState.UNCHECKED ) {
        updateCheck.check();
      }

      // Hook up our spinner listener when we're shown
      stepTimer.addListener( this.updateStepListener );

      // Hook up our visibility listener
      updateCheck.stateProperty.link( this.updateVisibilityListener );
    }

    super.show();
  }

  /**
   * Remove listeners that should only be called when the dialog is shown.
   * @public
   * @override
   */
  hide() {
    if ( this.isShowingProperty.value ) {
      super.hide();

      if ( updateCheck.areUpdatesChecked ) {

        // Disconnect our visibility listener
        updateCheck.stateProperty.unlink( this.updateVisibilityListener );

        // Disconnect our spinner listener when we're hidden
        stepTimer.removeListener( this.updateStepListener );
      }
    }
  }

  /**
   * Make eligible for garbage collection.
   * @public
   * @override
   */
  dispose() {
    this.disposeAboutDialog();
    super.dispose();
  }
}

joist.register( 'AboutDialog', AboutDialog );

export default AboutDialog;