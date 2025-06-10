// Copyright 2024-2025, University of Colorado Boulder

/**
 * Content for the accessible screen summary and VoicingToolbar for a ScreenView.
 *
 * For Interactive Description, this includes content at the top of the page that describes the screen.
 * For Voicing, this includes content that is read to the user when they press the "Overview", "Details", or "Hint" buttons
 * in the VoicingToolbar.
 *
 * For Interactive Description, this class supports basic paragraphs of content. If you need more
 * complex PDOM content (like lists or other tags), create your own scenery Nodes and add them as a children of
 * this Node.
 *
 * Options encourage you to categorize content into descriptions for the "play area", "control area", "current details",
 * which should align with the description and voicing design for the simulation.
 *
 * Example usage:
 *   const screenSummaryContent = new ScreenSummaryContent( {
 *     playAreaContent: playAreaDescriptionStringProperty,
 *     controlAreaContent: controlAreaDescriptionStringProperty,
 *     currentDetailsContent: [ firstDescriptionStringProperty, secondDescriptionStringProperty ],
 *     interactionHintContent: {
 *       node: new Node( { tagName: 'h3', innerContent: interactionHintStringProperty } ),
 *       voicingContent: [ customVoicingStringProperty ]
 *     }
 *   } );
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

// If you need customizable PDOM content (lists, headings, etc.), use this type.
type VoiceableNode = {

  // A Node with customized structure for the accessible PDOM.
  node: Node;

  // The equivalent VoicingContent for the custom Node. Read in order.
  voicingContent?: TReadOnlyProperty<string>[];
};

// If you need the Voicing content to be different from the Interactive Description content, use this type.
type CustomizedVoicingContent = {

  // An array of string Properties for this content that will appear in order in the PDOM.
  descriptionContent: TReadOnlyProperty<string>[];

  // An array of strings for this content that will be read in order by the Voicing feature.
  voicingContent: TReadOnlyProperty<string>[];
};

import DerivedStringProperty from '../../axon/js/DerivedStringProperty.js';
import { type DisposableOptions } from '../../axon/js/Disposable.js';
import TReadOnlyProperty, { isTReadOnlyProperty } from '../../axon/js/TReadOnlyProperty.js';
import joist from '../../joist/js/joist.js';
import affirm from '../../perennial-alias/js/browser-and-node/affirm.js';
import AccessibleListNode from '../../scenery-phet/js/accessibility/AccessibleListNode.js';
import Node from '../../scenery/js/nodes/Node.js';
import JoistStrings from './JoistStrings.js';

export type SectionContent =
  TReadOnlyProperty<string> |
  Array<TReadOnlyProperty<string>> |
  AccessibleListNode |
  VoiceableNode |
  CustomizedVoicingContent |
  null;

type SelfOptions = {

  // Content that describes the play area of the screen. If provided, a paragraph with "In the play area:" comes before
  // this content.
  playAreaContent?: SectionContent;

  // Content that describes the control area of the screen. If provided, a paragraph with "In the control area:" comes
  // before this content.
  controlAreaContent?: SectionContent;

  // Content that describes the current details of the screen.
  currentDetailsContent?: SectionContent;

  // Any other content that is not covered by the above categories. Comes before the interaction hint.
  // NOTE: THis is useful for legacy content that was designed before the above categories were introduced.
  additionalContent?: SectionContent;

  // An interaction hint for the screen.
  interactionHintContent?: SectionContent;
};

// No NodeOptions, and this class sets its children. You can set children if you need to, but not until after construction.
type ParentOptions = DisposableOptions;

export type ScreenSummaryContentOptions = SelfOptions & ParentOptions;

export default class ScreenSummaryContent extends Node {

  // References to the play area and control area content, because they are combined to form the
  // the "combined voicing overview content".
  private _playAreaContent: SectionContent = null;
  private _controlAreaContent: SectionContent = null;

  // References to the combined content for voicing. They will need to be disposed when the content changes.
  private _combinedVoicingOverviewContent: null | TReadOnlyProperty<string> = null;
  private _combinedVoicingCurrentDetailsContent: null | TReadOnlyProperty<string> = null;
  private _combinedVoicingInteractionHintContent: null | TReadOnlyProperty<string> = null;

  private readonly playAreaContentNode: Node;
  private readonly controlAreaContentNode: Node;
  private readonly currentDetailsContentNode: Node;
  private readonly additionalContent: Node;
  private readonly interactionHintContentNode: Node;

  private readonly inThePlayAreaParagraph: Node;
  private readonly inTheControlAreaParagraph: Node;

  public constructor( providedOptions?: ScreenSummaryContentOptions ) {

    const options = _.merge( {
      playAreaContent: null,
      controlAreaContent: null,
      currentDetailsContent: null,
      additionalContent: null,
      interactionHintContent: null
    }, providedOptions );

    super( options );

    this.inThePlayAreaParagraph = new Node( {
      tagName: 'p',
      accessibleName: JoistStrings.a11y.inPlayAreaStringProperty
    } );
    this.playAreaContentNode = new Node();

    this.inTheControlAreaParagraph = new Node( {
      tagName: 'p',
      accessibleName: JoistStrings.a11y.inControlAreaStringProperty
    } );
    this.controlAreaContentNode = new Node();

    this.currentDetailsContentNode = new Node();
    this.interactionHintContentNode = new Node();
    this.additionalContent = new Node();

    this.children = [
      this.inThePlayAreaParagraph,
      this.playAreaContentNode,

      this.inTheControlAreaParagraph,
      this.controlAreaContentNode,

      this.currentDetailsContentNode,
      this.additionalContent,
      this.interactionHintContentNode
    ];

    // Now fill in the content from options.
    this.setPlayAreaContent( options.playAreaContent );
    this.setControlAreaContent( options.controlAreaContent );
    this.setCurrentDetailsContent( options.currentDetailsContent );
    this.setInteractionHintContent( options.interactionHintContent );
    this.setAdditionalContent( options.additionalContent );
  }

  /**
   * Set the content that describes the play area of the screen.
   */
  public setPlayAreaContent( content: SectionContent ): void {
    this._playAreaContent = content;
    this.playAreaContentNode.children.forEach( child => child.dispose() );
    this.handleLeadingParagraph( content, this.inThePlayAreaParagraph );
    this.playAreaContentNode.children = this.createParagraphNodes( content );

    if ( this._combinedVoicingOverviewContent ) {
      this._combinedVoicingOverviewContent.dispose();
    }
    this._combinedVoicingOverviewContent = this.combineContent( content, this._controlAreaContent );
  }

  /**
   * Set the content that describes the control area of the screen.
   * @param content
   */
  public setControlAreaContent( content: SectionContent ): void {
    this._controlAreaContent = content;
    this.controlAreaContentNode.children.forEach( child => child.dispose() );
    this.handleLeadingParagraph( content, this.inTheControlAreaParagraph );
    this.controlAreaContentNode.children = this.createParagraphNodes( content );

    if ( this._combinedVoicingOverviewContent ) {
      this._combinedVoicingOverviewContent.dispose();
    }
    this._combinedVoicingOverviewContent = this.combineContent( this._playAreaContent, content );
  }

  /**
   * Set the content that describes the current details of the screen.
   */
  public setCurrentDetailsContent( content: SectionContent ): void {
    this.currentDetailsContentNode.children.forEach( child => child.dispose() );
    this.currentDetailsContentNode.children = this.createParagraphNodes( content );

    if ( this._combinedVoicingCurrentDetailsContent ) {
      this._combinedVoicingCurrentDetailsContent.dispose();
    }
    this._combinedVoicingCurrentDetailsContent = this.combineContent( content );
  }

  /**
   * Set the content that describes the additional content for the screen. This is content that does not
   * fit into the play area, control area, or current details. This comes after the current details content, and
   * before the interaction hint content.
   */
  public setAdditionalContent( content: SectionContent ): void {
    this.additionalContent.children.forEach( child => child.dispose() );
    this.additionalContent.children = this.createParagraphNodes( content );
  }

  /**
   * Set the content that describes the interaction hint for the screen.
   */
  public setInteractionHintContent( content: SectionContent ): void {
    this.interactionHintContentNode.children.forEach( child => child.dispose() );
    this.interactionHintContentNode.children = this.createParagraphNodes( content );

    if ( this._combinedVoicingInteractionHintContent ) {
      this._combinedVoicingInteractionHintContent.dispose();
    }
    this._combinedVoicingInteractionHintContent = this.combineContent( content );
  }

  /**
   * Returns the value of the combined voicing overview content. This is a string that includes all values for
   * the play area and control area content. It is spoken when the user presses the "Overview" button in the
   * VoicingToolbar.
   *
   * Your ScreenSummaryContent can override this function if you do not want to use the combined content.
   */
  public getVoicingOverviewString(): null | string {
    return this._combinedVoicingOverviewContent?.value || null;
  }

  /**
   * Returns the value of the combined voicing current details content. This is a string that includes all values for
   * the current details content. It is spoken when the user presses the "Details" button in the VoicingToolbar.
   *
   * Your ScreenSummaryContent can override this function if you do not want to use the combined content.
   */
  public getVoicingDetailsString(): null | string {
    return this._combinedVoicingCurrentDetailsContent?.value || null;
  }

  /**
   * Returns the value of the combined voicing interaction hint content. This is a string that includes all values for
   * the interaction hint content. It is spoken when the user presses the "Hint" button in the VoicingToolbar.
   *
   * Your ScreenSummaryContent can override this function if you do not want to use the combined content.
   */
  public getVoicingInteractionHintString(): null | string {
    return this._combinedVoicingInteractionHintContent?.value || null;
  }

  /**
   * Given multiple SectionContent arguments, combine them into a single string for Voicing.
   */
  private combineContent( ...contents: SectionContent[] ): null | TReadOnlyProperty<string> {

    // Filter out any null values from the contents
    const nonNullContents = contents.filter( content => content !== null );

    // Create a combined array of all TReadOnlyProperty<string> from the passed contents.
    const combinedArray: TReadOnlyProperty<string>[] = nonNullContents.flatMap( content => {
      if ( Array.isArray( content ) ) {
        return content;
      }
      else if ( isTReadOnlyProperty( content ) ) {
        return [ content ];
      }
      else if ( 'node' in content || 'voicingContent' in content ) {

        // The content will be VoiceableNode or CustomizedVoicingContent in this case.
        return content.voicingContent || [];
      }
      else {

        // The content must be an AccessibleListNode in this case
        affirm( content instanceof AccessibleListNode, 'Content is expected to be an AccessibleListNode in this case.' );
        return [ content.voicingContentStringProperty ];
      }
    } );

    if ( combinedArray.length > 0 ) {
      return DerivedStringProperty.deriveAny( combinedArray, ( ...strings: string[] ) => {
        return strings.join( ' ' );
      } );
    }
    else {
      return null;
    }
  }

  /**
   * Some of the content has a leading paragraph that be need to be hidden if there ins't any.
   */
  private handleLeadingParagraph( content: SectionContent, leadingParagraph: Node ): void {
    leadingParagraph.visible = content !== null;
  }

  /**
   * Create the necessary Nodes for the provided content.
   */
  private createParagraphNodes( content: SectionContent ): Node[] {
    if ( content === null ) {
      return [];
    }
    else {

      // If the content uses customized Voicing content, we need to get the description content from it.
      const descriptionContent = ( content as CustomizedVoicingContent ).descriptionContent || content;

      if ( Array.isArray( descriptionContent ) ) {

        // If item is a Node, just add it to the array
        return descriptionContent.map( item => {
          return this.createNode( item );
        } );
      }
      else if ( isTReadOnlyProperty( descriptionContent ) ) {
        return [ this.createNode( descriptionContent ) ];
      }
      else if ( 'node' in content ) {

        // content is a VoiceableNode in this case and has a custom Node with all content.
        return [ content.node ];
      }
      else {

        // The descriptionContent must be an AccessibleListNode in this case
        const node = descriptionContent as AccessibleListNode;
        return [ node ];
      }
    }
  }

  /**
   * Create a paragraph Node for an item of content.
   */
  private createNode( item: TReadOnlyProperty<string> ): Node {
    return new Node( { tagName: 'p', innerContent: item } );
  }
}

joist.register( 'ScreenSummaryContent', ScreenSummaryContent );