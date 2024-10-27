// Copyright 2024, University of Colorado Boulder

/**
 * Parallel DOM content for a screen summary of a ScreenView. This is a screen specific summary that is available
 * for a screen reader.
 *
 * This class offers support for a basic paragraph or multiple paragraphs of content. If you need more
 * complex PDOM content, create your own scenery Nodes and add them as a child of this Node.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import { DisposableOptions } from '../../axon/js/Disposable.js';
import TReadOnlyProperty from '../../axon/js/TReadOnlyProperty.js';
import joist from '../../joist/js/joist.js';
import { Node } from '../../scenery/js/imports.js';

type ScreenSummaryContentOptions = DisposableOptions;

export default class ScreenSummaryContent extends Node {

  // A Node for a single paragraph of content.
  private paragraphNode: Node = new Node( { tagName: 'p' } );

  // A parent Node for multiple paragraphs of content.
  private multiParagraphNode: Node = new Node();

  /**
   * If provided content is a single item, it is added to the PDOM as a single paragraph.
   * If provided content is an array, each item is added as its own paragraph.
   * If content is null, nothing is added.
   */
  public constructor( content: TReadOnlyProperty<string> | TReadOnlyProperty<string>[] | null, providedOptions?: ScreenSummaryContentOptions ) {
    super( providedOptions );

    this.addChild( this.paragraphNode );
    this.addChild( this.multiParagraphNode );

    this.setContent( content );
  }

  /**
   * Sets the content of the ScreenSummaryContent.
   */
  public setContent( content: TReadOnlyProperty<string> | TReadOnlyProperty<string>[] | null ): void {
    if ( content === null ) {
      this.multiParagraphNode.removeAllChildren();
      this.paragraphNode.innerContent = null;
    }
    else if ( Array.isArray( content ) ) {
      this.multiParagraphNode.removeAllChildren();
      content.forEach( contentProperty => {
        this.multiParagraphNode.addChild( new Node( {
          tagName: 'p',
          innerContent: contentProperty
        } ) );
      } );
    }
    else {
      this.paragraphNode.innerContent = content;
    }
  }

  public set content( content: TReadOnlyProperty<string> | TReadOnlyProperty<string>[] | null ) {
    this.setContent( content );
  }
}

joist.register( 'ScreenSummaryContent', ScreenSummaryContent );