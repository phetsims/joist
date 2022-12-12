// Copyright 2013-2022, University of Colorado Boulder

/**
 * AboutDialog displays information about the simulation -- its title, version number, credits, etc.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import DerivedProperty from '../../axon/js/DerivedProperty.js';
import stepTimer from '../../axon/js/stepTimer.js';
import TReadOnlyProperty from '../../axon/js/TReadOnlyProperty.js';
import TBrand from '../../brand/js/TBrand.js';
import optionize, { EmptySelfOptions } from '../../phet-core/js/optionize.js';
import StringUtils from '../../phetcommon/js/util/StringUtils.js';
import PhetFont from '../../scenery-phet/js/PhetFont.js';
import { allowLinksProperty, Node, PDOMPeer, RichText, VBox, VoicingRichText, VoicingText, VStrut } from '../../scenery/js/imports.js';
import Dialog, { DialogOptions } from '../../sun/js/Dialog.js';
import Tandem from '../../tandem/js/Tandem.js';
import CreditsNode, { CreditsData } from './CreditsNode.js';
import { Locale } from './i18n/localeProperty.js';
import joist from './joist.js';
import JoistStrings from './JoistStrings.js';
import packageJSON from './packageJSON.js';
import updateCheck from './updateCheck.js';
import UpdateNodes from './UpdateNodes.js';
import UpdateState from './UpdateState.js';

// constants
const MAX_WIDTH = 550; // Maximum width of elements in the dialog
const NOMINAL_FONT_SIZE = 16; // Change this to make everything larger or smaller

type SelfOptions = EmptySelfOptions;

export type AboutDialogOptions = SelfOptions & DialogOptions;

export default class AboutDialog extends Dialog {

  // Listener that should be called every frame where we are shown, with {number} dt as a single parameter.
  private readonly updateStepListener: ( ( dt: number ) => void ) | null;

  // Listener that should be called whenever our update state changes (while we are displayed)
  private readonly updateVisibilityListener: ( ( state: UpdateState ) => void ) | null;

  private readonly disposeAboutDialog: () => void;

  /**
   * @param nameStringProperty - name of the simulation
   * @param version - version of the simulation
   * @param credits - credits for the simulation
   * @param locale - locale string
   * @param [providedOptions]
   */
  public constructor( nameStringProperty: TReadOnlyProperty<string>, version: string, credits: CreditsData, locale: Locale, providedOptions?: AboutDialogOptions ) {

    const options = optionize<AboutDialogOptions, SelfOptions, DialogOptions>()( {
      xSpacing: 26,
      topMargin: 26,
      bottomMargin: 26,
      leftMargin: 26,
      phetioReadOnly: true, // the AboutDialog should not be settable
      phetioDynamicElement: true,
      tandem: Tandem.REQUIRED
    }, providedOptions );

    // Dynamic modules are loaded in simLauncher and accessed through their namespace
    const Brand: TBrand = phet.brand.Brand;
    assert && assert( Brand, 'Brand should exist by now' );

    let children = [];

    const titleText = new VoicingText( nameStringProperty, {
      font: new PhetFont( 2 * NOMINAL_FONT_SIZE ),
      maxWidth: MAX_WIDTH,
      tagName: 'h1'
    } );
    children.push( titleText );

    const versionStringProperty = new DerivedProperty( [ JoistStrings.versionPatternStringProperty ], versionPattern => {
      return StringUtils.format( versionPattern, version );
    } );
    children.push( new VoicingText( versionStringProperty, {
      font: new PhetFont( NOMINAL_FONT_SIZE ),
      maxWidth: MAX_WIDTH,
      tagName: 'p'
    } ) );

    // Built versions will have a build timestamp
    if ( phet.chipper.buildTimestamp ) {
      children.push( new VoicingText( phet.chipper.buildTimestamp, {
        font: new PhetFont( 0.65 * NOMINAL_FONT_SIZE ),
        maxWidth: MAX_WIDTH,
        tagName: 'p',
        innerContent: phet.chipper.buildTimestamp
      } ) );
    }

    let updateStepListener: ( ( dt: number ) => void ) | null = null;
    let updateVisibilityListener: ( ( state: UpdateState ) => void ) | null = null;
    let updatePanel: Node | null = null;

    // brand=phet versions that are not running in the phet-app should check update status.
    if ( updateCheck.areUpdatesChecked ) {

      const positionOptions = { left: 0, top: 0 };
      const checkingNode = UpdateNodes.createCheckingNode( positionOptions );
      const upToDateNode = UpdateNodes.createUpToDateNode( positionOptions );
      const outOfDateNode = UpdateNodes.createOutOfDateAboutNode( positionOptions );
      const offlineNode = UpdateNodes.createOfflineNode( positionOptions );

      updateStepListener = checkingNode.stepListener;

      updateVisibilityListener = ( state: UpdateState ) => {
        checkingNode.visible = ( state === UpdateState.CHECKING );
        upToDateNode.visible = ( state === UpdateState.UP_TO_DATE );
        outOfDateNode.visible = ( state === UpdateState.OUT_OF_DATE );
        offlineNode.visible = ( state === UpdateState.OFFLINE );

        // pdom - make update content visible/invisible for screen readers by explicitly removing content
        // from the DOM, necessary because AT will ready hidden content in a Dialog.
        checkingNode.pdomVisible = checkingNode.visible;
        upToDateNode.pdomVisible = upToDateNode.visible;
        outOfDateNode.pdomVisible = outOfDateNode.visible;
        offlineNode.pdomVisible = offlineNode.visible;
      };

      updatePanel = new Node( {
        children: [
          checkingNode,
          upToDateNode,
          outOfDateNode,
          offlineNode
        ],
        maxWidth: MAX_WIDTH,
        visibleProperty: allowLinksProperty
      } );

      children.push( updatePanel );
    }

    const brandChildren = [];

    // Show the brand name, if it exists
    if ( Brand.name ) {
      brandChildren.push( new VoicingRichText( Brand.name, {
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

      brandChildren.push( new VoicingText( copyright, {
        font: new PhetFont( 0.75 * NOMINAL_FONT_SIZE ),
        maxWidth: MAX_WIDTH,

        // pdom
        tagName: 'p',
        innerContent: copyright
      } ) );
    }

    let additionalLicenseStatement: Node | null = null;

    // Optional additionalLicenseStatement, used in phet-io
    if ( Brand.additionalLicenseStatement ) {
      additionalLicenseStatement = new VoicingRichText( Brand.additionalLicenseStatement, {
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

    let creditsNode: Node | null = null;

    // Add credits for specific brands
    if ( ( Brand.id === 'phet' || Brand.id === 'phet-io' ) ) {
      children.push( new VStrut( 15 ) );
      creditsNode = new CreditsNode( credits, {
        titleFont: new PhetFont( { size: NOMINAL_FONT_SIZE, weight: 'bold' } ),
        textFont: new PhetFont( 0.75 * NOMINAL_FONT_SIZE ),
        maxWidth: MAX_WIDTH
      } );
      children.push( creditsNode );
    }

    // Show any links identified in the brand
    const linksChildren: Node[] = [];
    const links = Brand.getLinks( packageJSON.name, locale );
    if ( links && links.length > 0 ) {

      linksChildren.push( new VStrut( 15 ) );

      for ( let i = 0; i < links.length; i++ ) {
        const link = links[ i ];

        // If links are allowed, use hyperlinks. Otherwise, just output the URL. This doesn't need to be internationalized.
        const stringProperty = new DerivedProperty( [ allowLinksProperty, link.textStringProperty ], ( allowLinks, linkText ) => {
          return allowLinks ? `<a href="{{url}}">${linkText}</a>` : `${linkText}: ${link.url}`;
        } );

        // This is PhET-iO instrumented because it is a keyboard navigation focusable element.
        linksChildren.push( new RichText( stringProperty, {
          links: { url: link.url }, // RichText must fill in URL for link
          font: new PhetFont( NOMINAL_FONT_SIZE ),
          tandem: options.tandem.createTandem( link.tandemName ),
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

    super( content, options );

    this.updateStepListener = updateStepListener;
    this.updateVisibilityListener = updateVisibilityListener;

    // pdom - set label association so the title is read when focus enters the dialog
    this.addAriaLabelledbyAssociation( {
      thisElementName: PDOMPeer.PRIMARY_SIBLING,
      otherElementName: PDOMPeer.PRIMARY_SIBLING,
      otherNode: titleText
    } );

    this.disposeAboutDialog = () => {
      creditsNode && creditsNode.dispose();
      additionalLicenseStatement && additionalLicenseStatement.dispose();
      linksChildren.forEach( child => child.dispose && child.dispose() );
    };
  }

  /**
   * When the dialog is shown, add update listeners.
   */
  public override show(): void {
    if ( updateCheck.areUpdatesChecked && !this.isShowingProperty.value ) {
      updateCheck.resetTimeout();

      // Fire off a new update check if we were marked as offline or unchecked before, and we handle updates.
      if ( updateCheck.stateProperty.value === UpdateState.OFFLINE || updateCheck.stateProperty.value === UpdateState.UNCHECKED ) {
        updateCheck.check();
      }

      this.updateStepListener && stepTimer.addListener( this.updateStepListener );
      this.updateVisibilityListener && updateCheck.stateProperty.link( this.updateVisibilityListener );
    }

    super.show();
  }

  /**
   * When the dialog is hidden, remove update listeners.
   */
  public override hide(): void {
    if ( this.isShowingProperty.value ) {
      super.hide();

      if ( updateCheck.areUpdatesChecked ) {
        this.updateVisibilityListener && updateCheck.stateProperty.unlink( this.updateVisibilityListener );
        this.updateStepListener && stepTimer.removeListener( this.updateStepListener );
      }
    }
  }

  public override dispose(): void {
    this.disposeAboutDialog();
    super.dispose();
  }
}

joist.register( 'AboutDialog', AboutDialog );