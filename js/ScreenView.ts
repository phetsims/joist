// Copyright 2013-2025, University of Colorado Boulder

/**
 * The view portion of a Screen, specifies the layout strategy for the visual view.
 *
 * For the PDOM view, this type creates  the three organizing elements associated with each screen:
 * - The `ScreenSummaryNode` is introductory description that outlines the screen and sets the scene for the user.
 * - The `PlayAreaNode` holds content that is considered the main interaction and pedagogy to be learned from the screen.
 * - The `ControlAreaNode` houses controls and other content that is secondary to the main interaction. Ideally the user
 *       would encounter this after exploring the PlayAreaNode.
 * The screenSummaryNode instance is not available on the ScreenView, instead content can be added to it via a constructor
 * option or `ScreenView.setScreenSummaryContent`. This is because some accessible descriptions in the screen summary
 * are the same throughout all simulations. The pdomPlayAreaNode and pdomControlAreaNode instances are protected, read-only Nodes
 * that are meant to have their pdomOrder and children set to achieve the proper PDOM structure. Do not set
 * `pdomOrder` directly on the ScreenView, as ScreenView set's its own pdomOrder
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Property from '../../axon/js/Property.js';
import Bounds2 from '../../dot/js/Bounds2.js';
import Matrix3 from '../../dot/js/Matrix3.js';
import optionize from '../../phet-core/js/optionize.js';
import ControlAreaNode from '../../scenery-phet/js/accessibility/nodes/ControlAreaNode.js';
import PlayAreaNode from '../../scenery-phet/js/accessibility/nodes/PlayAreaNode.js';
import ScreenSummaryNode from '../../scenery-phet/js/accessibility/nodes/ScreenSummaryNode.js';
import Node, { type NodeOptions } from '../../scenery/js/nodes/Node.js';
import Tandem from '../../tandem/js/Tandem.js';
import { type SpeakableResolvedResponse } from '../../utterance-queue/js/ResponsePacket.js';
import joist from './joist.js';
import type ScreenSummaryContent from './ScreenSummaryContent.js';
import WCAGSizeNode from './WCAGSizeNode.js';

/*
 * Default width and height for iPad2, iPad3, iPad4 running Safari with default tabs and decorations
 * These bounds were added in Sep 2014 and are based on a screenshot from a non-Retina iPad, in Safari, iOS7.
 * It therefore accounts for the nav bar on the bottom and the space consumed by the browser on the top.
 * As of this writing, this is the resolution being used by PhET's sim designers for their mockups.
 * For more information see https://github.com/phetsims/joist/issues/126
 */
const DEFAULT_LAYOUT_BOUNDS = new Bounds2( 0, 0, 1024, 618 );

type GetLayoutMatrixOptions = {
  verticalAlign?: 'center' | 'bottom';
};

// Documented where the defaults are defined
type SelfOptions = {
  layoutBounds?: Bounds2;
  screenSummaryContent?: ScreenSummaryContent | null;
  includePDOMNodes?: boolean;
};
export type ScreenViewOptions = SelfOptions & NodeOptions;

class ScreenView extends Node {
  public readonly layoutBounds: Bounds2;

  // The visible bounds of the ScreenView in ScreenView coordinates.  This includes top/bottom or left/right margins
  // depending on the aspect ratio of the screen. Clients should not set this value
  public readonly visibleBoundsProperty: Property<Bounds2>;
  private readonly pdomTitleNode: Node;
  protected readonly pdomPlayAreaNode: PlayAreaNode;
  protected readonly pdomControlAreaNode: ControlAreaNode;
  private readonly pdomScreenSummaryNode: ScreenSummaryNode;
  private readonly pdomParentNode: Node;

  // Keep track of the content added to the summary Node, so that if it is set more than once, the previous one can be
  // removed. Supports an ES6 getter/setter for this.
  private _screenSummaryContent: ScreenSummaryContent | null = null;

  public static readonly DEFAULT_LAYOUT_BOUNDS = DEFAULT_LAYOUT_BOUNDS;

  public constructor( providedOptions?: ScreenViewOptions ) {

    const options = optionize<ScreenViewOptions, SelfOptions, NodeOptions>()( {

      // {Bounds2} the bounds that are safe to draw in on all supported platforms
      layoutBounds: DEFAULT_LAYOUT_BOUNDS.copy(),

      // Node options
      layerSplit: true, // so we're not in the same layer as the navbar, etc.
      excludeInvisible: true, // so we don't keep invisible screens in the SVG tree

      // phet-io
      tandem: Tandem.REQUIRED,
      visiblePropertyOptions: {
        phetioState: false,
        phetioReadOnly: true
      },

      // pdom options
      containerTagName: 'article',
      tagName: 'div',

      // {Node|null} the Node with screen summary content to be added to the ScreenSummaryNode, and into PDOM above
      // the Play Area. This Node is added as a child to the ScreenSummaryNode.
      screenSummaryContent: null,

      // {boolean} whether or not to add the screen summary, play area, and control area Nodes to the PDOM
      includePDOMNodes: true
    }, providedOptions );

    super( options );

    if ( assert && this.isPhetioInstrumented() ) {
      assert && assert( options.tandem.name === 'view', 'tandem name should be view' );
    }

    // the bounds the confine the layout of the view.
    this.layoutBounds = options.layoutBounds;

    // Initialized to default layout bounds, then updated as soon as layout() is called, which is before the
    // ScreenView is displayed.
    this.visibleBoundsProperty = new Property( options.layoutBounds );

    // This cannot use accessibleHeading, nor be a label of this Node because it must be focusable.
    this.pdomTitleNode = new Node( { tagName: 'h1', focusHighlight: 'invisible' } );

    // add children and set accessible order to these to organize and structure the PDOM.
    // Since the h1 in this view cannot use accessibleHeading, the level is incremented by 2
    // so that these and headings under them have the correct relative level.
    this.pdomPlayAreaNode = new PlayAreaNode( { accessibleHeadingIncrement: 2 } );
    this.pdomControlAreaNode = new ControlAreaNode( { accessibleHeadingIncrement: 2 } );

    // This container has the intro "{{SIM}} is an interactive sim, it changes as you . . ."
    this.pdomScreenSummaryNode = new ScreenSummaryNode();

    // at the Node from options in the same way that can be done at any time
    options.screenSummaryContent && this.setScreenSummaryContent( options.screenSummaryContent );

    // To make sure that the title "h1" is the first, focused item on a screen when that screen is selected, toggle the
    // focusability of the title, and then focus it. See https://github.com/phetsims/ratio-and-proportion/issues/321
    this.visibleProperty.lazyLink( visible => {
      if ( visible ) {
        assert && assert( !this.pdomTitleNode.focusable, 'about to set to be focusable' );
        this.pdomTitleNode.focusable = true;
        this.pdomTitleNode.focus();
      }
      else {
        this.pdomTitleNode.focusable = false;
      }
    } );

    // after initial focus, the titleNode should be removed from the focus order
    this.pdomTitleNode.addInputListener( {
      blur: () => {
        this.pdomTitleNode.focusable = false;
      }
    } );

    this.pdomParentNode = new Node( {

      // order of Nodes for the PDOM that makes most sense for graphical rendering, "Play Area" components
      // on top of "Control Area" components.
      children: options.includePDOMNodes ? [
        this.pdomTitleNode,
        this.pdomScreenSummaryNode,
        this.pdomControlAreaNode,
        this.pdomPlayAreaNode
      ] : [ this.pdomTitleNode ]
    } );
    this.addChild( this.pdomParentNode );

    // pdom - "Play Area" comes before "Control Area" in PDOM
    this.pdomParentNode.pdomOrder = options.includePDOMNodes ? [
      this.pdomTitleNode,
      this.pdomScreenSummaryNode,
      this.pdomPlayAreaNode,
      this.pdomControlAreaNode
    ] : [ this.pdomTitleNode ];

    // If ?wcagSize is provided, add in the draggable visual display of WCAG 24x24 and 44x44 sizes.
    if ( phet.chipper.queryParameters.wcagSize ) {
      this.addChild( new WCAGSizeNode( this ) );
    }
  }

  /**
   * This method should not be called because ScreenView defines child Nodes that organize the PDOM structure of a
   * screen. See this.pdomScreenSummaryNode, this.pdomPlayAreaNode, and this.pdomControlAreaNode and set their accessible
   * order accordingly when adding accessible content to the PDOM for this screen.
   *
   * This makes sure that content will be under those Nodes, which are in the same order for all simulations. This
   * creates a consistent experience for screen reader accessibility.
   */
  public override setPDOMOrder( pdomOrder: Array<Node | null> | null ): void {
    throw new Error( 'Do not set the pdomOrder on ScreenView directly. Order Nodes under the ' +
                     '`pdomScreenSummaryNode, pdomPlayAreaNode, and pdomControlAreaNode instead. ' +
                     'This ensures that sims have a consistent heading structure and content is under those ' +
                     'sections which is important for screen reader accessibility.'
    );
  }

  /**
   * Override to make sure that setting children doesn't blow away Nodes set by ScreenView.
   */
  public override setChildren( children: Node[] ): this {
    Node.prototype.setChildren.call( this, children );

    // mutate may call setChildren before pdomParentNode is constructed
    if ( this.pdomParentNode && !this.hasChild( this.pdomParentNode ) ) {
      this.addChild( this.pdomParentNode );
      this.pdomParentNode.moveToBack();
    }
    return this;
  }

  /**
   * Get the scale to use for laying out the sim components and the navigation bar, so its size will track
   * with the sim size
   * (joist-internal)
   */
  public getLayoutScale( viewBounds: Bounds2 ): number {
    return ScreenView.getLayoutScale( this.layoutBounds, viewBounds );
  }

  /**
   * Default layout function uses the layoutWidth and layoutHeight to scale the content (based on whichever is more limiting: width or height)
   * and centers the content in the screen vertically and horizontally
   * This function can be replaced by subclasses that wish to perform their own custom layout.
   * @param viewBounds - desired bounds for the view
   * (joist-internal)
   */
  public layout( viewBounds: Bounds2, layoutMatrixOptions?: GetLayoutMatrixOptions ): void {
    this.matrix = ScreenView.getLayoutMatrix( this.layoutBounds, viewBounds, layoutMatrixOptions );
    this.visibleBoundsProperty.value = this.parentToLocalBounds( viewBounds );
  }

  public get screenSummaryContent(): ScreenSummaryContent | null {
    return this._screenSummaryContent;
  }

  public set screenSummaryContent( node: ScreenSummaryContent | null ) {
    this.setScreenSummaryContent( node );
  }

  /**
   * Set the screen summary Node for the PDOM of this Screen View. Prefer passing in a screen summary Node via
   * constructor options, but this method can be used directly when necessary.
   */
  public setScreenSummaryContent( node: ScreenSummaryContent | null ): void {
    assert && assert( node !== this._screenSummaryContent, 'this is already the screen summary Node content' );

    this._screenSummaryContent && this.pdomScreenSummaryNode.removeChild( this._screenSummaryContent );

    this._screenSummaryContent = node;

    if ( node ) {
      this.pdomScreenSummaryNode.addChild( node );
    }
  }

  /**
   * Set the screen summary Node intro string
   * (joist-internal)
   */
  public setScreenSummaryIntroAndTitle( simName: string, screenDisplayName: string | null, simTitle: string, isMultiScreen: boolean ): void {
    // TODO: Should use PatternStringProperty, see https://github.com/phetsims/joist/issues/885
    this.pdomScreenSummaryNode.setIntroString( simName, screenDisplayName, isMultiScreen );
    this.pdomTitleNode.accessibleName = simTitle;
  }

  /**
   * Create the alert content for this ScreenView when the Voicing feature is enabled and the "Overview" button
   * is pressed.
   * The default uses content from the ScreenSummaryContent. You can override this function if you require different behavior.
   */
  public getVoicingOverviewContent(): SpeakableResolvedResponse {
    if ( this._screenSummaryContent ) {
      return this._screenSummaryContent.getVoicingOverviewString();
    }
    return null;
  }

  /**
   * Create the alert content for this ScreenView when the Voicing feature is enabled and the "Details" button is
   * pressed.
   * The default uses content from the ScreenSummaryContent. You can override this function if you require different behavior.
   */
  public getVoicingDetailsContent(): SpeakableResolvedResponse {
    if ( this._screenSummaryContent ) {
      return this._screenSummaryContent.getVoicingDetailsString();
    }
    return null;
  }

  /**
   * Create the alert content for this ScreenView when the Voicing feature is enabled and the "Hint" button is pressed.
   * The default uses content from the ScreenSummaryContent. You can override this function if you require different behavior.
   */
  public getVoicingHintContent(): SpeakableResolvedResponse {
    if ( this._screenSummaryContent ) {
      return this._screenSummaryContent.getVoicingInteractionHintString();
    }
    return null;
  }

  /**
   * Interrupts all input listeners that are attached to either this node, or a descendant node.
   *
   * Overridden here so we can interrupt all of the listeners in the Display, see
   * https://github.com/phetsims/scenery/issues/1582.
   */
  public override interruptSubtreeInput(): this {
    window.phet?.joist?.display?.interruptOtherPointers();

    return super.interruptSubtreeInput();
  }

  /**
   * Get the scale to use for laying out the sim components and the navigation bar, so its size will track
   * with the sim size
   */
  public static getLayoutScale( layoutBounds: Bounds2, viewBounds: Bounds2 ): number {
    return Math.min( viewBounds.width / layoutBounds.width, viewBounds.height / layoutBounds.height );
  }

  public static getLayoutMatrix( layoutBounds: Bounds2, viewBounds: Bounds2, providedOptions?: GetLayoutMatrixOptions ): Matrix3 {

    const options = optionize<GetLayoutMatrixOptions>()( {
      verticalAlign: 'center' // 'center' or 'bottom'
    }, providedOptions );

    const width = viewBounds.width;
    const height = viewBounds.height;
    const scale = ScreenView.getLayoutScale( layoutBounds, viewBounds );

    let dx = 0;
    let dy = 0;

    if ( scale === width / layoutBounds.width ) {

      // vertically float to bottom
      dy = ( height / scale - layoutBounds.height );

      // center vertically
      if ( options.verticalAlign === 'center' ) {
        dy /= 2;
      }
    }
    else if ( scale === height / layoutBounds.height ) {

      // center horizontally
      dx = ( width / scale - layoutBounds.width ) / 2;
    }

    return Matrix3.rowMajor(
      scale, 0, dx * scale + viewBounds.left,
      0, scale, dy * scale + viewBounds.top,
      0, 0, 1
    );
  }

  // Noops for consistent API
  public step( dt: number ): void {
    // See subclass for implementation
  }
}

joist.register( 'ScreenView', ScreenView );
export default ScreenView;