// Copyright 2024, University of Colorado Boulder

/**
 * Parallel DOM content for a screen summary of a ScreenView. This is a screen specific summary that is available
 * for a screen reader.
 *
 * This class offers support for basic paragraphs of content. If you need more
 * complex PDOM content (like lists or other tags), create your own scenery Nodes and add them as a child of
 * this Node.
 *
 * Options encourage you to categorize content into descriptions for the "play area", "control area", "current details",
 * which should align with the description design for the simulation.
 *
 * Example usage:
 *   const screenSummaryContent = new ScreenSummaryContent( {
 *     playAreaContent: playAreaDescriptionStringProperty,
 *     controlAreaContent: controlAreaDescriptionStringProperty,
 *     currentDetailsContent: [ firstDescriptionStringProperty, secondDescriptionStringProperty ],
 *     interactionHintContent: interactionHintStringProperty
 *   } );
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import { DisposableOptions } from '../../axon/js/Disposable.js';
import TReadOnlyProperty from '../../axon/js/TReadOnlyProperty.js';
import joist from '../../joist/js/joist.js';
import { Node } from '../../scenery/js/imports.js';

type SectionContent = TReadOnlyProperty<string> | Array<TReadOnlyProperty<string>> | null;

type SelfOptions = {

  // Content that describes the play area of the screen. If provided, a paragraph with "In the play area:" comes before
  // this content.
  playAreaContent?: SectionContent;

  // Content that describes the control area of the screen. If provided, a paragraph with "In the control area:" comes
  // before this content.
  controlAreaContent?: SectionContent;

  // Content that describes the current details of the screen.
  currentDetailsContent?: SectionContent;

  // Any other contnt that is not covered by the above categories. Comes before the interaction hint.
  // NOTE: THis is useful for legacy content that was designed before the above categories were introduced.
  additionalContent?: SectionContent;

  // An interaction hint for the screen.
  interactionHintContent?: SectionContent;
}
type ParentOptions = DisposableOptions;

type ScreenSummaryContentOptions = SelfOptions & ParentOptions;

export default class ScreenSummaryContent extends Node {

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
      accessibleName: 'In the play area:'
    } );
    this.playAreaContentNode = new Node();

    this.inTheControlAreaParagraph = new Node( {
      tagName: 'p',
      accessibleName: 'In the control area:'
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
    this.setOtherContent( options.additionalContent );
  }

  public setPlayAreaContent( content: SectionContent ): void {
    this.playAreaContentNode.children.forEach( child => child.dispose() );
    this.handleLeadingParagraph( content, this.inThePlayAreaParagraph );
    this.playAreaContentNode.children = this.createParagraphNodes( content );
  }

  public setControlAreaContent( content: SectionContent ): void {
    this.controlAreaContentNode.children.forEach( child => child.dispose() );
    this.handleLeadingParagraph( content, this.inTheControlAreaParagraph );
    this.controlAreaContentNode.children = this.createParagraphNodes( content );
  }

  public setCurrentDetailsContent( content: SectionContent ): void {
    this.currentDetailsContentNode.children.forEach( child => child.dispose() );
    this.currentDetailsContentNode.children = this.createParagraphNodes( content );
  }

  public setInteractionHintContent( content: SectionContent ): void {
    this.interactionHintContentNode.children.forEach( child => child.dispose() );
    this.interactionHintContentNode.children = this.createParagraphNodes( content );
  }

  public setOtherContent( content: SectionContent ): void {
    this.additionalContent.children.forEach( child => child.dispose() );
    this.additionalContent.children = this.createParagraphNodes( content );
  }

  /**
   * Some of the content has a leading paragraph that be need to be hidden if there ins't any.
   */
  private handleLeadingParagraph( content: SectionContent, leadingParagraph: Node ): void {
    leadingParagraph.visible = content !== null;
  }

  private createParagraphNodes( content: SectionContent ): Node[] {
    if ( content === null ) {
      return [];
    }
    else {
      if ( Array.isArray( content ) ) {

        // If item is a Node, just add it to the array
        return content.map( item => {
          return this.createNode( item );
        } );
      }
      else {
        return [ this.createNode( content ) ];
      }
    }
  }

  /**
   * @param content
   * @private
   */
  private createNode( item: TReadOnlyProperty<string> ): Node {
    return new Node( { tagName: 'p', innerContent: item } );
  }
}

joist.register( 'ScreenSummaryContent', ScreenSummaryContent );