// Copyright 2022, University of Colorado Boulder
/**
 * Some in-simulation utilities designed to help designers and developers
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import animationFrameTimer from '../../axon/js/animationFrameTimer.js';
import DerivedProperty from '../../axon/js/DerivedProperty.js';
import MappedProperty from '../../axon/js/MappedProperty.js';
import TinyProperty from '../../axon/js/TinyProperty.js';
import Bounds2 from '../../dot/js/Bounds2.js';
import Dimension2 from '../../dot/js/Dimension2.js';
import Utils from '../../dot/js/Utils.js';
import Vector2 from '../../dot/js/Vector2.js';
import MeasuringTapeNode from '../../scenery-phet/js/MeasuringTapeNode.js';
import PhetFont from '../../scenery-phet/js/PhetFont.js';
import { CanvasNode, Circle, Color, Display, DOM, DragListener, FireListener, FlowBox, Font, GradientStop, GridBox, HBox, IColor, Image, IPaint, LayoutNode, Line, LinearGradient, mixesHeightSizable, mixesWidthSizable, Node, NodeOptions, NodePattern, Paint, Path, Pattern, PDOMInstance, PressListener, RadialGradient, Rectangle, RichText, SceneryEvent, Spacer, Text, TextOptions, Trail, VBox, WebGLNode } from '../../scenery/js/imports.js';
import Panel from '../../sun/js/Panel.js';
import AquaRadioButtonGroup from '../../sun/js/AquaRadioButtonGroup.js';
import Tandem from '../../tandem/js/Tandem.js';
import joist from './joist.js';
import Sim from './Sim.js';
import SimDisplay from './SimDisplay.js';
import BooleanProperty from '../../axon/js/BooleanProperty.js';
import Checkbox, { CheckboxOptions } from '../../sun/js/Checkbox.js';
import ScreenView from './ScreenView.js';
import IProperty from '../../axon/js/IProperty.js';
import inheritance from '../../phet-core/js/inheritance.js';
import Property from '../../axon/js/Property.js';
import Matrix3 from '../../dot/js/Matrix3.js';
import EnumerationValue from '../../phet-core/js/EnumerationValue.js';
import Enumeration from '../../phet-core/js/Enumeration.js';
import EnumerationProperty from '../../axon/js/EnumerationProperty.js';
import merge from '../../phet-core/js/merge.js';
import { Shape } from '../../kite/js/imports.js';
import RectangularPushButton from '../../sun/js/buttons/RectangularPushButton.js';
import ExpandCollapseButton from '../../sun/js/ExpandCollapseButton.js';
import { default as createObservableArray, ObservableArray } from '../../axon/js/createObservableArray.js';
import optionize from '../../phet-core/js/optionize.js';
import Multilink from '../../axon/js/Multilink.js';

const round = ( n: number, places = 2 ) => Utils.toFixed( n, places );

class PointerAreaType extends EnumerationValue {
  static MOUSE = new PointerAreaType();
  static TOUCH = new PointerAreaType();
  static NONE = new PointerAreaType();

  static enumeration = new Enumeration( PointerAreaType );
}

export default class Helper {
  private sim: Sim;
  private simDisplay: Display;
  private helperDisplay?: Display;

  // Whether we should use the input system for picking, or if we should ignore it (and the flags) for what is visual
  inputBasedPickingProperty: Property<boolean>;

  // Whether we should return the leaf-most Trail (instead of finding the one with input listeners)
  useLeafNodeProperty: Property<boolean>;

  pointerAreaTypeProperty: Property<PointerAreaType>;

  // Whether the helper is visible (active) or not
  activeProperty: IProperty<boolean>;

  visualTreeVisibleProperty: Property<boolean>;
  pdomTreeVisibleProperty: Property<boolean>;
  underPointerVisibleProperty: Property<boolean>;
  toolsVisibleProperty: Property<boolean>;
  pickingVisibleProperty: Property<boolean>;
  previewVisibleProperty: Property<boolean>;
  selectedNodeContentVisibleProperty: Property<boolean>;
  selectedTrailContentVisibleProperty: Property<boolean>;

  // Where the current pointer is
  pointerPositionProperty: IProperty<Vector2>;

  // Whether the pointer is over the UI interface
  overInterfaceProperty: Property<boolean>;

  // If the user has clicked on a Trail and selected it
  selectedTrailProperty: IProperty<Trail | null>;

  // What Trail the user is over in the tree UI
  treeHoverTrailProperty: IProperty<Trail | null>;

  // What Trail the pointer is over right now
  pointerTrailProperty: IProperty<Trail | null>;

  // What Trail to show as a preview (and to highlight) - selection overrides what the pointer is over
  previewTrailProperty: IProperty<Trail | null>;

  // The global shape of what is selected
  previewShapeProperty: IProperty<Shape | null>;

  screenViewProperty: IProperty<ScreenView | null>;

  // ImageData from the sim
  imageDataProperty: IProperty<ImageData | null>;

  // The pixel color under the pointer
  colorProperty: IProperty<Color>;

  constructor( sim: Sim, simDisplay: SimDisplay ) {

    // NOTE: Don't pause the sim, don't use foreign object rasterization (do the smarter instant approach)
    // NOTE: Inform about preserveDrawingBuffer query parameter
    // NOTE: Actually grab/rerender things from WebGL/Canvas, so this works nicely and at a higher resolution
    // NOTE: Scenery drawable tree

    this.sim = sim;
    this.simDisplay = simDisplay;
    this.activeProperty = new TinyProperty( false );
    this.visualTreeVisibleProperty = new BooleanProperty( false, {
      tandem: Tandem.OPT_OUT
    } );
    this.pdomTreeVisibleProperty = new BooleanProperty( false, {
      tandem: Tandem.OPT_OUT
    } );
    this.underPointerVisibleProperty = new BooleanProperty( true, {
      tandem: Tandem.OPT_OUT
    } );
    this.toolsVisibleProperty = new BooleanProperty( true, {
      tandem: Tandem.OPT_OUT
    } );
    this.pickingVisibleProperty = new BooleanProperty( true, {
      tandem: Tandem.OPT_OUT
    } );
    this.previewVisibleProperty = new BooleanProperty( true, {
      tandem: Tandem.OPT_OUT
    } );
    this.selectedNodeContentVisibleProperty = new BooleanProperty( true, {
      tandem: Tandem.OPT_OUT
    } );
    this.selectedTrailContentVisibleProperty = new BooleanProperty( true, {
      tandem: Tandem.OPT_OUT
    } );

    this.inputBasedPickingProperty = new BooleanProperty( true, { tandem: Tandem.OPT_OUT } );
    this.useLeafNodeProperty = new BooleanProperty( false, { tandem: Tandem.OPT_OUT } );
    this.pointerAreaTypeProperty = new EnumerationProperty( PointerAreaType.MOUSE, { tandem: Tandem.OPT_OUT } );

    this.pointerPositionProperty = new TinyProperty( Vector2.ZERO );
    this.overInterfaceProperty = new BooleanProperty( false, { tandem: Tandem.OPT_OUT } );

    this.selectedTrailProperty = new TinyProperty<Trail | null>( null );
    this.treeHoverTrailProperty = new TinyProperty<Trail | null>( null );
    this.pointerTrailProperty = new DerivedProperty( [ this.pointerPositionProperty, this.overInterfaceProperty, this.pointerAreaTypeProperty, this.inputBasedPickingProperty ], ( point, overInterface, pointerAreaType, inputBasedPicking ) => {
      // We're not over something while we're over an interface
      if ( overInterface ) {
        return null;
      }

      if ( !inputBasedPicking ) {
        return visualHitTest( simDisplay.rootNode, point );
      }

      let trail = simDisplay.rootNode.hitTest(
        point,
        pointerAreaType === PointerAreaType.MOUSE,
        pointerAreaType === PointerAreaType.TOUCH
      );

      if ( trail && !this.useLeafNodeProperty.value ) {
        while ( trail.length > 0 && trail.lastNode().inputListeners.length === 0 ) {
          trail.removeDescendant();
        }
        if ( trail.length === 0 ) {
          trail = null;
        }
        else {
          // Repsect TargetNode to be helpful
          const listeners = trail.lastNode().inputListeners;
          const firstListener = listeners[ 0 ];
          if ( firstListener instanceof PressListener && firstListener.targetNode && firstListener.targetNode !== trail.lastNode() && trail.containsNode( firstListener.targetNode ) ) {
            trail = trail.subtrailTo( firstListener.targetNode );
          }
        }
      }

      return trail;
    }, {
      tandem: Tandem.OPT_OUT,
      useDeepEquality: true
    } );
    this.previewTrailProperty = new DerivedProperty( [ this.selectedTrailProperty, this.treeHoverTrailProperty, this.pointerTrailProperty ], ( selected, treeHover, active ) => {
      return selected ? selected : ( treeHover ? treeHover : active );
    } );

    this.previewShapeProperty = new DerivedProperty( [ this.previewTrailProperty, this.inputBasedPickingProperty, this.pointerAreaTypeProperty ], ( previewTrail, inputBasedPicking, pointerAreaType ) => {
      if ( previewTrail ) {
        if ( inputBasedPicking ) {
          return getShape( previewTrail, pointerAreaType === PointerAreaType.MOUSE, pointerAreaType === PointerAreaType.TOUCH );
        }
        else {
          return getShape( previewTrail, false, false );
        }
      }
      else {
        return null;
      }
    } );

    this.screenViewProperty = new TinyProperty<ScreenView | null>( null );

    this.imageDataProperty = new TinyProperty<ImageData | null>( null );

    this.colorProperty = new DerivedProperty( [ this.pointerPositionProperty, this.imageDataProperty ], ( position, imageData ) => {
      if ( !imageData ) {
        return Color.TRANSPARENT;
      }
      const x = Math.floor( position.x / this.simDisplay.width * imageData.width );
      const y = Math.floor( position.y / this.simDisplay.height * imageData.height );

      const index = 4 * ( x + imageData.width * y );

      if ( x < 0 || y < 0 || x > imageData.width || y > imageData.height ) {
        return Color.TRANSPARENT;
      }

      return new Color(
        imageData.data[ index ],
        imageData.data[ index + 1 ],
        imageData.data[ index + 2 ],
        imageData.data[ index + 3 ] / 255
      );
    }, {
      tandem: Tandem.OPT_OUT
    } );

    const fuzzProperty = new BooleanProperty( phet.chipper.queryParameters.fuzz, {
      tandem: Tandem.OPT_OUT
    } );
    fuzzProperty.lazyLink( fuzz => {
      phet.chipper.queryParameters.fuzz = fuzz;
    } );

    const measuringTapeVisibleProperty = new BooleanProperty( false, {
      tandem: Tandem.OPT_OUT
    } );
    const measuringTapeUnitsProperty = new TinyProperty<{ name: string; multiplier: number }>( { name: 'view units', multiplier: 0 } );

    const layoutBoundsProperty = new TinyProperty( Bounds2.NOTHING );

    const helperRoot = new Node( {
      renderer: 'svg'
    } );

    const positionTextProperty = new MappedProperty( this.pointerPositionProperty, {
      tandem: Tandem.OPT_OUT,
      bidirectional: true,
      map: position => {
        const view = this.screenViewProperty.value;
        if ( view ) {
          const viewPosition = view.globalToLocalPoint( position );
          return `global: x: ${round( position.x )}, y: ${round( position.y )}<br>view: x: ${round( viewPosition.x )}, y: ${round( viewPosition.y )}`;
        }
        else {
          return '-';
        }
      }
    } );
    const positionText = new RichText( positionTextProperty.value, {
      font: new PhetFont( 12 ),
      textProperty: positionTextProperty
    } );

    const colorTextMap = ( color: Color ) => {
      return `${color.toHexString()} ${color.toCSS()}`;
    };
    const colorTextProperty = new MappedProperty( this.colorProperty, {
      tandem: Tandem.OPT_OUT,
      bidirectional: true,
      map: colorTextMap
    } );
    const colorText = new RichText( colorTextMap( this.colorProperty.value ), {
      font: new PhetFont( 12 ),
      textProperty: colorTextProperty
    } );
    this.colorProperty.link( color => {
      colorText.fill = Color.getLuminance( color ) > 128 ? Color.BLACK : Color.WHITE;
    } );

    const colorBackground = new Panel( colorText, {
      cornerRadius: 0,
      stroke: null,
      fill: this.colorProperty
    } );

    const previewNode = new Node( {
      visibleProperty: this.previewVisibleProperty
    } );

    const previewBackground = new Rectangle( 0, 0, 200, 200, {
      fill: new NodePattern( new Node( {
        children: [
          new Rectangle( 0, 0, 10, 10, { fill: '#ddd' } ),
          new Rectangle( 10, 10, 10, 10, { fill: '#ddd' } ),
          new Rectangle( 0, 10, 10, 10, { fill: '#fafafa' } ),
          new Rectangle( 10, 0, 10, 10, { fill: '#fafafa' } )
        ]
      } ), 2, 0, 0, 20, 20 ),
      stroke: 'black',
      visibleProperty: this.previewVisibleProperty
    } );

    this.previewTrailProperty.link( trail => {
      previewNode.removeAllChildren();
      if ( trail ) {
        previewNode.addChild( previewBackground );
        const node = trail.lastNode();
        if ( node.bounds.isValid() ) {
          const scale = window.devicePixelRatio * 0.9 * Math.min( previewBackground.selfBounds.width / node.width, previewBackground.selfBounds.height / node.height );
          previewNode.addChild( new Node( {
            scale: scale / window.devicePixelRatio,
            center: previewBackground.center,
            children: [
              node.rasterized( {
                resolution: scale,
                sourceBounds: node.bounds.dilated( node.bounds.width * 0.01 ).roundedOut()
              } )
            ]
          } ) );
        }
      }
    } );

    const selectedNodeContent = new VBox( {
      spacing: 3,
      align: 'left',
      visibleProperty: this.selectedNodeContentVisibleProperty
    } );
    this.previewTrailProperty.link( trail => {
      selectedNodeContent.children = trail ? createInfo( trail ) : [];
    } );

    const fuzzCheckbox = new HelperCheckbox( 'Fuzz', fuzzProperty );
    const measuringTapeVisibleCheckbox = new HelperCheckbox( 'Measuring Tape', measuringTapeVisibleProperty );
    const visualTreeVisibleCheckbox = new HelperCheckbox( 'Visual Tree', this.visualTreeVisibleProperty );
    const pdomTreeVisibleCheckbox = new HelperCheckbox( 'PDOM Tree', this.pdomTreeVisibleProperty );
    const inputBasedPickingCheckbox = new HelperCheckbox( 'Input-based', this.inputBasedPickingProperty );
    const useLeafNodeCheckbox = new HelperCheckbox( 'Use Leaf', this.useLeafNodeProperty, {
      enabledProperty: this.inputBasedPickingProperty
    } );

    const pointerAreaTypeRadioButtonGroup = new AquaRadioButtonGroup<PointerAreaType>( this.pointerAreaTypeProperty, [
      {
        value: PointerAreaType.MOUSE,
        node: new Text( 'Mouse', { fontSize: 12 } )
      },
      {
        value: PointerAreaType.TOUCH,
        node: new Text( 'Touch', { fontSize: 12 } )
      },
      {
        value: PointerAreaType.NONE,
        node: new Text( 'None', { fontSize: 12 } )
      }
    ], {
      orientation: 'horizontal',
      enabledProperty: this.inputBasedPickingProperty,
      radioButtonOptions: {
        xSpacing: 3
      },
      spacing: 10,
      tandem: Tandem.OPT_OUT
    } );

    const selectedTrailContent = new FlowBox( {
      orientation: 'vertical',
      align: 'left',
      visibleProperty: this.selectedTrailContentVisibleProperty
    } );

    this.previewTrailProperty.link( ( trail: Trail | null ) => {
      selectedTrailContent.children = [];

      if ( trail ) {

        trail.nodes.slice().forEach( ( node, index ) => {
          selectedTrailContent.addChild( new RichText( `${index > 0 ? trail.nodes[ index - 1 ].children.indexOf( node ) : '-'} ${node.constructor.name}`, {
            font: new PhetFont( 12 ),
            fill: index === trail.nodes.length - 1 ? 'black' : '#bbb',
            layoutOptions: {
              leftMargin: index * 10
            },
            cursor: 'pointer',
            inputListeners: [ new FireListener( {
              fire: () => {
                this.selectedTrailProperty.value = trail.subtrailTo( node );
                focusSelected();
              },
              tandem: Tandem.OPT_OUT
            } ) ]
          } ) );
        } );
        trail.lastNode().children.forEach( ( node, index ) => {
          selectedTrailContent.addChild( new RichText( `${trail.lastNode().children.indexOf( node )} ${node.constructor.name}`, {
            font: new PhetFont( 12 ),
            fill: '#88f',
            layoutOptions: {
              leftMargin: trail.nodes.length * 10
            },
            cursor: 'pointer',
            inputListeners: [ new FireListener( {
              fire: () => {
                this.selectedTrailProperty.value = trail.copy().addDescendant( node, index );
                focusSelected();
              },
              tandem: Tandem.OPT_OUT
            } ) ]
          } ) );
        } );

        // Visibility check
        if ( !trail.isVisible() ) {
          selectedTrailContent.addChild( new Text( 'invisible', { fill: '#60a', fontSize: 12 } ) );
        }

        if ( trail.getOpacity() !== 1 ) {
          selectedTrailContent.addChild( new Text( `opacity: ${trail.getOpacity()}`, { fill: '#888', fontSize: 12 } ) );
        }

        const hasPickableFalseEquivalent = _.some( trail.nodes, node => {
          return node.pickable === false || node.visible === false;
        } );
        const hasPickableTrueEquivalent = _.some( trail.nodes, node => {
          return node.inputListeners.length > 0 || node.pickable === true;
        } );
        if ( !hasPickableFalseEquivalent && hasPickableTrueEquivalent ) {
          selectedTrailContent.addChild( new Text( 'Hit Tested', { fill: '#f00', fontSize: 12 } ) );
        }

        if ( !trail.getMatrix().isIdentity() ) {
          // Why is this wrapper node needed?
          selectedTrailContent.addChild( new Node( { children: [ new Matrix3Node( trail.getMatrix() ) ] } ) );
        }
      }
    } );

    const visualTreeNode = new TreeNode( this.visualTreeVisibleProperty, this, () => new VisualTreeNode( new Trail( simDisplay.rootNode ), this ) );
    const pdomTreeNode = new TreeNode( this.pdomTreeVisibleProperty, this, () => new PDOMTreeNode( simDisplay._rootPDOMInstance!, this ) );

    const focusSelected = () => {
      visualTreeNode.focusSelected();
      pdomTreeNode.focusSelected();
    };

    const highlightBase = new DerivedProperty( [ this.inputBasedPickingProperty, this.pointerAreaTypeProperty ], ( inputBasedPicking, pointerAreaType ) => {
      if ( inputBasedPicking ) {
        if ( pointerAreaType === PointerAreaType.MOUSE ) {
          return new Color( 0, 0, 255 );
        }
        else if ( pointerAreaType === PointerAreaType.TOUCH ) {
          return new Color( 255, 0, 0 );
        }
        else {
          return new Color( 200, 0, 200 );
        }
      }
      else {
        return new Color( 0, 255, 0 );
      }
    }, { tandem: Tandem.OPT_OUT } );
    const highlightFill = new DerivedProperty( [ highlightBase ], color => color.withAlpha( 0.2 ), { tandem: Tandem.OPT_OUT } );
    const highlightPath = new Path( null, {
      stroke: highlightBase,
      lineDash: [ 2, 2 ],
      fill: highlightFill
    } );
    this.previewShapeProperty.link( shape => {
      highlightPath.shape = shape;
    } );


    // this.inputBasedPickingProperty = new BooleanProperty( true, { tandem: Tandem.OPT_OUT } );
    // this.useLeafNodeProperty = new BooleanProperty( false, { tandem: Tandem.OPT_OUT } );
    // this.pointerAreaTypeProperty = new EnumerationProperty( PointerAreaType.MOUSE, { tandem: Tandem.OPT_OUT } );

    helperRoot.addChild( highlightPath );

    const backgroundNode = new Node();

    backgroundNode.addInputListener( new PressListener( {
      press: () => {
        this.selectedTrailProperty.value = this.pointerTrailProperty.value;
        focusSelected();
      },
      tandem: Tandem.OPT_OUT
    } ) );
    helperRoot.addChild( backgroundNode );

    const underPointerNode = new FlowBox( {
      orientation: 'vertical',
      spacing: 5,
      align: 'left',
      children: [
        positionText,
        colorBackground
      ],
      visibleProperty: this.underPointerVisibleProperty
    } );

    const toolsNode = new VBox( {
      spacing: 3,
      align: 'left',
      children: [
        new HBox( {
          spacing: 10,
          children: [
            fuzzCheckbox,
            measuringTapeVisibleCheckbox
          ]
        } ),
        new HBox( {
          spacing: 10,
          children: [
            visualTreeVisibleCheckbox,
            ...( simDisplay._accessible ? [ pdomTreeVisibleCheckbox ] : [] )
          ]
        } )
      ],
      visibleProperty: this.toolsVisibleProperty
    } );

    const pickingNode = new VBox( {
      spacing: 5,
      align: 'left',
      children: [
        new HBox( {
          spacing: 10,
          children: [
            inputBasedPickingCheckbox,
            useLeafNodeCheckbox
          ]
        } ),
        pointerAreaTypeRadioButtonGroup
      ],
      visibleProperty: this.pickingVisibleProperty
    } );

    const helperReadoutContent = new FlowBox( {
      orientation: 'vertical',
      spacing: 5,
      align: 'left',
      children: [
        createCollapsibleHeaderText( 'Under Pointer', this.underPointerVisibleProperty, underPointerNode, { layoutOptions: { topMargin: 0 } } ),
        underPointerNode,
        createCollapsibleHeaderText( 'Tools', this.toolsVisibleProperty, toolsNode ),
        toolsNode,
        createCollapsibleHeaderText( 'Picking', this.pickingVisibleProperty, pickingNode ),
        pickingNode,
        createCollapsibleHeaderText( 'Preview', this.previewVisibleProperty, previewNode ),
        previewNode,
        createCollapsibleHeaderText( 'Selected Node', this.selectedNodeContentVisibleProperty, selectedNodeContent ),
        selectedNodeContent,
        createCollapsibleHeaderText( 'Selected Trail', this.selectedTrailContentVisibleProperty, selectedTrailContent ),
        selectedTrailContent
      ]
    } );
    const helperReadoutPanel = new Panel( helperReadoutContent, {
      fill: 'rgba(255,255,255,0.85)',
      stroke: 'rgba(0,0,0,0.85)',
      cornerRadius: 0
    } );
    helperReadoutPanel.addInputListener( new DragListener( {
      translateNode: true,
      targetNode: helperReadoutPanel,
      tandem: Tandem.OPT_OUT
    } ) );

    // Allow scrolling to scroll the panel's position
    helperReadoutPanel.addInputListener( {
      wheel: event => {
        const deltaY = event.domEvent!.deltaY;
        const multiplier = 1;
        helperReadoutPanel.y -= deltaY * multiplier;
      }
    } );
    helperRoot.addChild( helperReadoutPanel );

    helperRoot.addChild( visualTreeNode );
    helperRoot.addChild( pdomTreeNode );

    // @ts-ignore MeasuringTapeNode
    const measuringTapeNode = new MeasuringTapeNode( measuringTapeUnitsProperty, measuringTapeVisibleProperty, {
      textBackgroundColor: 'rgba(0,0,0,0.5)'
    } );
    measuringTapeNode.basePositionProperty.value = new Vector2( 100, 300 );
    measuringTapeNode.tipPositionProperty.value = new Vector2( 200, 300 );
    helperRoot.addChild( measuringTapeNode );

    const resizeListener = ( size: Dimension2 ) => {
      this.helperDisplay!.width = size.width;
      this.helperDisplay!.height = size.height;
      layoutBoundsProperty.value = layoutBoundsProperty.value.withMaxX( size.width ).withMaxY( size.height );
      backgroundNode.mouseArea = new Bounds2( 0, 0, size.width, size.height );
      backgroundNode.touchArea = new Bounds2( 0, 0, size.width, size.height );

      visualTreeNode.resize( size );
      pdomTreeNode.resize( size );
    };

    const frameListener = ( dt: number ) => {
      this.overInterfaceProperty.value =
        helperReadoutPanel.bounds.containsPoint( this.pointerPositionProperty.value ) ||
        ( this.visualTreeVisibleProperty.value && visualTreeNode.bounds.containsPoint( this.pointerPositionProperty.value ) ) ||
        ( this.pdomTreeVisibleProperty.value && pdomTreeNode.bounds.containsPoint( this.pointerPositionProperty.value ) );

      this.helperDisplay?.updateDisplay();
    };

    document.addEventListener( 'keyup', ( event: KeyboardEvent ) => {
      if ( event.key === 'Escape' ) {
        this.selectedTrailProperty.value = null;
      }
    } );

    this.activeProperty.lazyLink( active => {
      if ( active ) {
        sim.activeProperty.value = false;

        const screen = sim.screenProperty.value;
        if ( screen.hasView() ) {
          this.screenViewProperty.value = screen.view;
        }
        else {
          this.screenViewProperty.value = null;
        }

        this.helperDisplay = new Display( helperRoot, {
          assumeFullWindow: true
        } );
        this.helperDisplay.initializeEvents();

        sim.dimensionProperty.link( resizeListener );
        animationFrameTimer.addListener( frameListener );

        document.body.appendChild( this.helperDisplay.domElement );
        this.helperDisplay!.domElement.style.zIndex = '10000';

        const onLocationEvent = ( event: SceneryEvent<TouchEvent | PointerEvent | MouseEvent> ) => {
          this.pointerPositionProperty.value = event.pointer.point;
        };

        this.helperDisplay.addInputListener( {
          move: onLocationEvent,
          down: onLocationEvent,
          up: onLocationEvent
        } );

        if ( this.screenViewProperty.value ) {
          measuringTapeUnitsProperty.value = {
            name: 'view units',
            multiplier: this.screenViewProperty.value.getGlobalToLocalMatrix().getScaleVector().x
          };
        }

        this.simDisplay.foreignObjectRasterization( ( dataURI: string | null ) => {
          if ( dataURI ) {
            const image = document.createElement( 'img' );
            image.addEventListener( 'load', () => {
              const width = image.width;
              const height = image.height;

              const canvas = document.createElement( 'canvas' );
              const context = canvas.getContext( '2d' )!;
              canvas.width = width;
              canvas.height = height;
              context.drawImage( image, 0, 0 );

              if ( this.activeProperty.value ) {
                this.imageDataProperty.value = context.getImageData( 0, 0, width, height );
              }
            } );
            image.src = dataURI;
          }
          else {
            console.log( 'Could not load foreign object rasterization' );
          }
        } );
      }
      else {
        sim.dimensionProperty.unlink( resizeListener );
        animationFrameTimer.removeListener( frameListener );

        document.body.removeChild( this.helperDisplay!.domElement );

        this.helperDisplay!.dispose();

        // Unpause the simulation
        sim.activeProperty.value = true;

        // Clear imageData since it won't be accurate when we re-open
        this.imageDataProperty.value = null;

        // Hide the tree when closing, so it starts up quickly
        this.visualTreeVisibleProperty.value = false;
      }
    } );
  }

  // Singleton, lazily created so we don't slow down startup
  static helper?: Helper;

  static initialize( sim: Sim, simDisplay: SimDisplay ): void {
    // Ctrl + shift + H (will open the helper)
    document.addEventListener( 'keydown', ( event: KeyboardEvent ) => {
      if ( event.ctrlKey && event.key === 'H' ) {

        // Lazy creation
        if ( !Helper.helper ) {
          Helper.helper = new Helper( sim, simDisplay );
        }

        Helper.helper.activeProperty.value = !Helper.helper.activeProperty.value;
      }
    } );
  }
}

joist.register( 'Helper', Helper );

class HelperCheckbox extends Checkbox {
  constructor( label: string, property: Property<boolean>, options?: CheckboxOptions ) {
    super( new RichText( label, { font: new PhetFont( 12 ) } ), property, merge( {
      tandem: Tandem.OPT_OUT,
      boxWidth: 14
    }, options ) );
  }
}

// class DraggableDivider extends Rectangle {
//   constructor( preferredBoundsProperty, orientation, initialSeparatorLocation, pushFromMax ) {
//
//     super( {
//       fill: '#666',
//       cursor: orientation === 'horizontal' ? 'w-resize' : 'n-resize'
//     } );
//
//     this.minBoundsProperty = new TinyProperty( new Bounds2( 0, 0, 0, 0 ) );
//     this.maxBoundsProperty = new TinyProperty( new Bounds2( 0, 0, 0, 0 ) );
//
//     this.preferredBoundsProperty = preferredBoundsProperty;
//     this.orientation = orientation;
//     this.primaryCoordinate = orientation === 'horizontal' ? 'x' : 'y';
//     this.secondaryCoordinate = orientation === 'horizontal' ? 'y' : 'x';
//     this.primaryName = orientation === 'horizontal' ? 'width' : 'height';
//     this.secondaryName = orientation === 'horizontal' ? 'height' : 'width';
//     this.primaryRectName = orientation === 'horizontal' ? 'rectWidth' : 'rectHeight';
//     this.secondaryRectName = orientation === 'horizontal' ? 'rectHeight' : 'rectWidth';
//     this.minCoordinate = orientation === 'horizontal' ? 'left' : 'top';
//     this.maxCoordinate = orientation === 'horizontal' ? 'right' : 'bottom';
//     this.centerName = orientation === 'horizontal' ? 'centerX' : 'centerY';
//     this.minimum = 100;
//
//     this.separatorLocation = initialSeparatorLocation;
//
//     this[ this.primaryRectName ] = 2;
//
//     var dragListener = new scenery.DragListener( {
//       drag: event => {
//         this.separatorLocation = dragListener.parentPoint[ this.primaryCoordinate ];
//         this.layout();
//       }
//     } );
//     this.addInputListener( dragListener );
//
//     preferredBoundsProperty.link( ( newPreferredBounds, oldPreferredBounds ) => {
//       if ( pushFromMax && oldPreferredBounds ) {
//         this.separatorLocation += newPreferredBounds[ this.maxCoordinate ] - oldPreferredBounds[ this.maxCoordinate ];
//       }
//       if ( !pushFromMax && oldPreferredBounds ) {
//         this.separatorLocation += newPreferredBounds[ this.minCoordinate ] - oldPreferredBounds[ this.minCoordinate ];
//       }
//       this.layout();
//     } );
//   }
//
//   /**
// //    */
//   layout() {
//     var preferredBounds = this.preferredBoundsProperty.value;
//     var separatorLocation = this.separatorLocation;
//
//     if ( separatorLocation < preferredBounds[ this.minCoordinate ] + this.minimum ) {
//       separatorLocation = preferredBounds[ this.minCoordinate ] + this.minimum;
//     }
//     if ( separatorLocation > preferredBounds[ this.maxCoordinate ] - this.minimum ) {
//       if ( preferredBounds[ this.primaryName ] >= this.minimum * 2 ) {
//         separatorLocation = preferredBounds[ this.maxCoordinate ] - this.minimum;
//       }
//       else {
//         separatorLocation = preferredBounds[ this.minCoordinate ] + preferredBounds[ this.primaryName ] / 2;
//       }
//     }
//
//     this[ this.centerName ] = separatorLocation;
//     this[ this.secondaryCoordinate ] = preferredBounds[ this.secondaryCoordinate ];
//     this[ this.secondaryRectName ] = preferredBounds[ this.secondaryName ];
//
//     if ( this.orientation === 'horizontal' ) {
//       this.mouseArea = this.touchArea = this.localBounds.dilatedX( 5 );
//     }
//     else {
//       this.mouseArea = this.touchArea = this.localBounds.dilatedY( 5 );
//     }
//
//     var minBounds = preferredBounds.copy();
//     var maxBounds = preferredBounds.copy();
//     if ( this.orientation === 'horizontal' ) {
//       minBounds.maxX = separatorLocation - this.width / 2;
//       maxBounds.minX = separatorLocation + this.width / 2;
//     }
//     else {
//       minBounds.maxY = separatorLocation - this.height / 2;
//       maxBounds.minY = separatorLocation + this.height / 2;
//     }
//     this.minBoundsProperty.value = minBounds;
//     this.maxBoundsProperty.value = maxBounds;
//   }
// }

type CollapsibleTreeNodeSelfOptions<T> = {
  createChildren?: () => T[];
  spacing?: number;
  indent?: number;
};

type CollapsibleTreeNodeOptions<T> = CollapsibleTreeNodeSelfOptions<T> & NodeOptions;

class CollapsibleTreeNode<T extends CollapsibleTreeNode<any>> extends Node {

  selfNode: Node;
  expandedProperty: IProperty<boolean>;
  childTreeNodes: ObservableArray<T>;
  expandCollapseButton: Node;

  private childContainer: Node;

  constructor( selfNode: Node, providedOptions?: CollapsibleTreeNodeOptions<T> ) {
    const options = optionize<CollapsibleTreeNodeOptions<T>, CollapsibleTreeNodeSelfOptions<T>, NodeOptions>()( {
      createChildren: () => [],
      spacing: 0,
      indent: 5
    }, providedOptions );

    super( {
      excludeInvisibleChildrenFromBounds: true
    } );

    this.selfNode = selfNode;
    this.selfNode.centerY = 0;

    this.expandedProperty = new TinyProperty( true );
    this.childTreeNodes = createObservableArray<T>( {
      elements: options.createChildren()
    } );

    const buttonSize = 12;
    const expandCollapseShape = new Shape()
      .moveToPoint( Vector2.createPolar( buttonSize / 2.5, 3 / 4 * Math.PI ).plusXY( buttonSize / 8, 0 ) )
      .lineTo( buttonSize / 8, 0 )
      .lineToPoint( Vector2.createPolar( buttonSize / 2.5, 5 / 4 * Math.PI ).plusXY( buttonSize / 8, 0 ) );
    this.expandCollapseButton = new Rectangle( -buttonSize / 2, -buttonSize / 2, buttonSize, buttonSize, {
      children: [
        new Path( expandCollapseShape, {
          stroke: '#888',
          lineCap: 'round',
          lineWidth: 1.5
        } )
      ],
      visible: false,
      cursor: 'pointer',
      right: 0
    } );
    this.expandedProperty.link( expanded => {
      this.expandCollapseButton.rotation = expanded ? Math.PI / 2 : 0;
    } );
    this.expandCollapseButton.addInputListener( new FireListener( {
      fire: () => {
        this.expandedProperty.value = !this.expandedProperty.value;
      },
      tandem: Tandem.OPT_OUT
    } ) );

    this.addChild( this.expandCollapseButton );

    this.childContainer = new FlowBox( {
      orientation: 'vertical',
      align: 'left',
      spacing: options.spacing,
      children: this.childTreeNodes,
      x: options.indent,
      y: this.selfNode.bottom + options.spacing,
      visibleProperty: this.expandedProperty
    } );
    this.addChild( this.childContainer );

    this.addChild( selfNode );

    const onChildrenChange = () => {
      this.childContainer.children = this.childTreeNodes;
      this.expandCollapseButton.visible = this.childTreeNodes.length > 0;
    };

    this.childTreeNodes.addItemAddedListener( () => {
      onChildrenChange();
    } );
    this.childTreeNodes.addItemRemovedListener( () => {
      onChildrenChange();
    } );
    onChildrenChange();

    this.mutate( options );
  }

  expand(): void {
    this.expandedProperty.value = true;
  }

  collapse(): void {
    this.expandedProperty.value = false;
  }

  expandRecusively(): void {
    this.expandedProperty.value = true;
    this.childTreeNodes.forEach( treeNode => {
      treeNode.expandRecusively();
    } );
  }

  collapseRecursively(): void {
    this.expandedProperty.value = false;
    this.childTreeNodes.forEach( treeNode => {
      treeNode.collapseRecursively();
    } );
  }
}

class VisualTreeNode extends CollapsibleTreeNode<VisualTreeNode> {

  trail: Trail;

  constructor( trail: Trail, helper: Helper ) {

    const node = trail.lastNode();
    const isVisible = trail.isVisible();

    const TREE_FONT = new Font( { size: 12 } );

    const nameNode = new HBox( { spacing: 5 } );

    const name = node.constructor.name;
    if ( name ) {
      nameNode.addChild( new Text( name, {
        font: TREE_FONT,
        pickable: false,
        fill: isVisible ? '#000' : '#60a'
      } ) );
    }
    if ( node instanceof Text ) {
      nameNode.addChild( new Text( '"' + node.text + '"', {
        font: TREE_FONT,
        pickable: false,
        fill: '#666'
      } ) );
    }

    const selfBackground = Rectangle.bounds( nameNode.bounds, {
      children: [ nameNode ],
      cursor: 'pointer',
      fill: new DerivedProperty( [ helper.selectedTrailProperty, helper.pointerTrailProperty ], ( selected, active ) => {
        if ( selected && trail.equals( selected ) ) {
          return 'rgba(0,128,255,0.4)';
        }
        else if ( active && trail.equals( active ) ) {
          return 'rgba(0,128,255,0.2)';
        }
        else {
          return 'transparent';
        }
      }, {
        tandem: Tandem.OPT_OUT
      } )
    } );

    selfBackground.addInputListener( {
      enter: () => {
        helper.treeHoverTrailProperty.value = trail;
      },
      exit: () => {
        helper.treeHoverTrailProperty.value = null;
      }
    } );
    selfBackground.addInputListener( new FireListener( {
      fire: () => {
        helper.selectedTrailProperty.value = trail;
      },
      tandem: Tandem.OPT_OUT
    } ) );

    super( selfBackground, {
      createChildren: () => trail.lastNode().children.map( child => {
        return new VisualTreeNode( trail.copy().addDescendant( child ), helper );
      } )
    } );

    if ( !node.visible ) {
      this.expandedProperty.value = false;
    }

    this.trail = trail;
  }

  find( trail: Trail ): VisualTreeNode | null {
    if ( trail.equals( this.trail ) ) {
      return this;
    }
    else {
      const treeNode = _.find( this.childTreeNodes, childTreeNode => {
        return trail.isExtensionOf( childTreeNode.trail, true );
      } );
      if ( treeNode ) {
        return treeNode.find( trail );
      }
      else {
        return null;
      }
    }
  }
}

class PDOMTreeNode extends CollapsibleTreeNode<PDOMTreeNode> {

  trail: Trail;
  instance: PDOMInstance;

  constructor( instance: PDOMInstance, helper: Helper ) {

    const trail = instance.trail!;
    const isVisible = trail.isPDOMVisible();

    const TREE_FONT = new Font( { size: 12 } );

    const selfNode = new HBox( { spacing: 5 } );

    if ( trail.nodes.length ) {
      const fill = isVisible ? '#000' : '#60a';
      const node = trail.lastNode();

      if ( node.tagName ) {
        selfNode.addChild( new Text( node.tagName, { font: new Font( { size: 12, weight: 'bold' } ), fill: fill } ) );
      }

      if ( node.labelContent ) {
        selfNode.addChild( new Text( node.labelContent, { font: TREE_FONT, fill: '#800' } ) );
      }
      if ( node.innerContent ) {
        selfNode.addChild( new Text( node.innerContent, { font: TREE_FONT, fill: '#080' } ) );
      }
      if ( node.descriptionContent ) {
        selfNode.addChild( new Text( node.descriptionContent, { font: TREE_FONT, fill: '#444' } ) );
      }

      const parentTrail = instance.parent ? instance.parent.trail! : new Trail();
      const name = trail.nodes.slice( parentTrail.nodes.length ).map( node => node.constructor.name ).filter( n => n !== 'Node' ).join( ',' );

      if ( name ) {
        selfNode.addChild( new Text( `(${name})`, { font: TREE_FONT, fill: '#008' } ) );
      }
    }
    else {
      selfNode.addChild( new Text( '(root)', { font: TREE_FONT } ) );
    }

    // Refactor this code out?
    const selfBackground = Rectangle.bounds( selfNode.bounds, {
      children: [
        selfNode
      ],
      cursor: 'pointer',
      fill: new DerivedProperty( [ helper.selectedTrailProperty, helper.pointerTrailProperty ], ( selected, active ) => {
        if ( selected && trail.equals( selected ) ) {
          return 'rgba(0,128,255,0.4)';
        }
        else if ( active && trail.equals( active ) ) {
          return 'rgba(0,128,255,0.2)';
        }
        else {
          return 'transparent';
        }
      }, {
        tandem: Tandem.OPT_OUT
      } )
    } );

    if ( trail.length ) {
      selfBackground.addInputListener( {
        enter: () => {
          helper.treeHoverTrailProperty.value = trail;
        },
        exit: () => {
          helper.treeHoverTrailProperty.value = null;
        }
      } );
      selfBackground.addInputListener( new FireListener( {
        fire: () => {
          helper.selectedTrailProperty.value = trail;
        },
        tandem: Tandem.OPT_OUT
      } ) );
    }

    super( selfBackground, {
      createChildren: () => instance.children.map( ( instance: PDOMInstance ) => new PDOMTreeNode( instance, helper ) )
    } );

    this.instance = instance;
    this.trail = trail;
  }

  find( trail: Trail ): PDOMTreeNode | null {
    if ( trail.equals( this.instance.trail! ) ) {
      return this;
    }
    else {
      const treeNode = _.find( this.childTreeNodes, childTreeNode => {
        return trail.isExtensionOf( childTreeNode.instance.trail!, true );
      } );
      if ( treeNode ) {
        return treeNode.find( trail );
      }
      else {
        return null;
      }
    }
  }
}

class TreeNode<T extends ( VisualTreeNode | PDOMTreeNode )> extends Rectangle {

  treeContainer: Node;
  treeNode?: T;
  helper: Helper;

  constructor( visibleProperty: IProperty<boolean>, helper: Helper, createTreeNode: () => T ) {
    super( {
      fill: 'rgba(255,255,255,0.85)',
      stroke: 'black',
      rectWidth: 400,
      visibleProperty: visibleProperty,
      pickable: true
    } );

    this.helper = helper;

    this.treeContainer = new Node();
    this.addChild( this.treeContainer );

    this.addInputListener( new DragListener( {
      targetNode: this,
      drag: ( event, listener ) => {
        this.x = this.x + listener.modelDelta.x;
      },
      tandem: Tandem.OPT_OUT
    } ) );
    this.addInputListener( {
      wheel: event => {
        const deltaX = event.domEvent!.deltaX;
        const deltaY = event.domEvent!.deltaY;
        const multiplier = 1;
        if ( this.treeNode ) {
          this.treeNode.x -= deltaX * multiplier;
          this.treeNode.y -= deltaY * multiplier;
        }
        this.constrainTree();
      }
    } );

    // When there isn't a selected trail, focus whatever our pointer is over
    helper.pointerTrailProperty.lazyLink( () => {
      if ( !helper.selectedTrailProperty.value ) {
        this.focusPointer();
      }
    } );

    Multilink.multilink( [ helper.activeProperty, visibleProperty ], ( active, treeVisible ) => {
      if ( active && treeVisible ) {
        this.treeNode = createTreeNode();

        // Have the constrain properly position it
        this.treeNode.x = 500;
        this.treeNode.y = 500;

        this.treeContainer.children = [ this.treeNode ];
        this.focusSelected();
        this.constrainTree();
      }
      else {
        this.treeContainer.children = [];
      }
    } );
  }

  resize( size: Dimension2 ): void {
    this.rectHeight = size.height;
    this.right = size.width;
    this.treeContainer.clipArea = Shape.bounds( this.localBounds.dilated( 10 ) );
  }

  constrainTree(): void {
    const treeMarginX = 8;
    const treeMarginY = 5;

    if ( this.treeNode ) {
      if ( this.treeNode.bottom < this.selfBounds.bottom - treeMarginY ) {
        this.treeNode.bottom = this.selfBounds.bottom - treeMarginY;
      }
      if ( this.treeNode.top > this.selfBounds.top + treeMarginY ) {
        this.treeNode.top = this.selfBounds.top + treeMarginY;
      }
      if ( this.treeNode.right < this.selfBounds.right - treeMarginX ) {
        this.treeNode.right = this.selfBounds.right - treeMarginX;
      }
      if ( this.treeNode.left > this.selfBounds.left + treeMarginX ) {
        this.treeNode.left = this.selfBounds.left + treeMarginX;
      }
    }
  }

  focusTrail( trail: Trail ): void {
    if ( this.treeNode ) {
      const treeNode = this.treeNode.find( trail );
      if ( treeNode ) {
        const deltaY = treeNode.localToGlobalPoint( treeNode.selfNode.center ).y - this.centerY;
        this.treeNode.y -= deltaY;
        this.constrainTree();
      }
    }
  }

  focusPointer(): void {
    if ( this.helper.pointerTrailProperty.value ) {
      this.focusTrail( this.helper.pointerTrailProperty.value );
    }
  }

  focusSelected(): void {
    if ( this.helper.selectedTrailProperty.value === null ) { return; }

    this.focusTrail( this.helper.selectedTrailProperty.value );
  }
}

const createHeaderText = ( str: string, node?: Node, options?: TextOptions ) => {
  return new Text( str, merge( {
    fontSize: 14,
    fontWeight: 'bold',
    visibleProperty: node ? new DerivedProperty( [ node.boundsProperty ], bounds => {
      return !bounds.isEmpty();
    } ) : new TinyProperty( true )
  }, options ) );
};

const createCollapsibleHeaderText = ( str: string, visibleProperty: Property<boolean>, node?: Node, options?: TextOptions ) => {
  const headerText = createHeaderText( str, node, options );
  headerText.addInputListener( new FireListener( {
    fire: () => {
      visibleProperty.value = !visibleProperty.value;
    },
    tandem: Tandem.OPT_OUT
  } ) );
  headerText.cursor = 'pointer';
  return new HBox( {
    spacing: 7,
    children: [
      new ExpandCollapseButton( visibleProperty, { tandem: Tandem.OPT_OUT, sideLength: 14 } ),
      headerText
    ],
    visibleProperty: headerText.visibleProperty
  } );
};

class Matrix3Node extends GridBox {
  constructor( matrix: Matrix3 ) {
    super( {
      xSpacing: 5,
      ySpacing: 0,
      children: [
        new Text( matrix.m00(), { layoutOptions: { x: 0, y: 0 } } ),
        new Text( matrix.m01(), { layoutOptions: { x: 1, y: 0 } } ),
        new Text( matrix.m02(), { layoutOptions: { x: 2, y: 0 } } ),
        new Text( matrix.m10(), { layoutOptions: { x: 0, y: 1 } } ),
        new Text( matrix.m11(), { layoutOptions: { x: 1, y: 1 } } ),
        new Text( matrix.m12(), { layoutOptions: { x: 2, y: 1 } } ),
        new Text( matrix.m20(), { layoutOptions: { x: 0, y: 2 } } ),
        new Text( matrix.m21(), { layoutOptions: { x: 1, y: 2 } } ),
        new Text( matrix.m22(), { layoutOptions: { x: 2, y: 2 } } )
      ]
    } );
  }
}

class ShapeNode extends Path {
  constructor( shape: Shape ) {
    super( shape, {
      maxWidth: 15,
      maxHeight: 15,
      stroke: 'black',
      cursor: 'pointer',
      strokePickable: true
    } );

    this.addInputListener( new FireListener( {
      fire: () => copyToClipboard( shape.getSVGPath() ),
      tandem: Tandem.OPT_OUT
    } ) );
  }
}

class ImageNode extends Image {
  constructor( image: Image ) {
    super( image.getImage(), {
      maxWidth: 15,
      maxHeight: 15
    } );
  }
}

const createInfo = ( trail: Trail ): Node[] => {
  const children = [];
  const node = trail.lastNode();

  const types = inheritance( node.constructor ).map( type => type.name ).filter( name => {
    return name && name !== 'Object';
  } );
  const reducedTypes = types.indexOf( 'Node' ) >= 0 ? types.slice( 0, types.indexOf( 'Node' ) ) : types;

  if ( reducedTypes.length > 0 ) {
    children.push( new RichText( reducedTypes.map( ( str: string, i: number ) => {
      return i === 0 ? `<b>${str}</b>` : `<br>&nbsp;${_.repeat( '  ', i )}extends ${str}`;
    } ).join( '' ), { font: new PhetFont( 12 ) } ) );
  }

  const addRaw = ( key: string, valueNode: Node ) => {
    children.push( new HBox( {
      spacing: 0,
      align: 'top',
      children: [
        new Text( key + ': ', { fontSize: 12 } ),
        valueNode
      ]
    } ) );
  };

  const addSimple = ( key: string, value: any ) => {
    if ( value !== undefined ) {
      addRaw( key, new RichText( '' + value, {
        lineWrap: 400,
        font: new PhetFont( 12 ),
        cursor: 'pointer',
        inputListeners: [
          new FireListener( {
            fire: () => copyToClipboard( '' + value ),
            tandem: Tandem.OPT_OUT
          } )
        ]
      } ) );
    }
  };

  const colorSwatch = ( color: Color ): Node => {
    return new HBox( {
      spacing: 4,
      children: [
        new Rectangle( 0, 0, 10, 10, { fill: color, stroke: 'black', lineWidth: 0.5 } ),
        new Text( color.toHexString(), { fontSize: 12 } ),
        new Text( color.toCSS(), { fontSize: 12 } )
      ],
      cursor: 'pointer',
      inputListeners: [
        new FireListener( {
          fire: () => copyToClipboard( color.toHexString() ),
          tandem: Tandem.OPT_OUT
        } )
      ]
    } );
  };

  const addColor = ( key: string, color: IColor ) => {
    const result = iColorToColor( color );
    if ( result !== null ) {
      addRaw( key, colorSwatch( result ) );
    }
  };
  const addPaint = ( key: string, paint: IPaint ) => {
    const stopToNode = ( stop: GradientStop ): Node => {
      return new HBox( {
        spacing: 3,
        children: [
          new Text( stop.ratio, { fontSize: 12 } ),
          colorSwatch( iColorToColor( stop.color ) || Color.TRANSPARENT )
        ]
      } );
    };

    if ( paint instanceof Paint ) {
      if ( paint instanceof LinearGradient ) {
        addRaw( key, new VBox( {
          align: 'left',
          spacing: 3,
          children: [
            new Text( `LinearGradient (${paint.start.x},${paint.start.y}) => (${paint.end.x},${paint.end.y})`, { fontSize: 12 } ),
            ...paint.stops.map( stopToNode )
          ]
        } ) );
      }
      else if ( paint instanceof RadialGradient ) {
        addRaw( key, new VBox( {
          align: 'left',
          spacing: 3,
          children: [
            new Text( `RadialGradient (${paint.start.x},${paint.start.y}) ${paint.startRadius} => (${paint.end.x},${paint.end.y}) ${paint.endRadius}`, { fontSize: 12 } ),
            ...paint.stops.map( stopToNode )
          ]
        } ) );
      }
      else if ( paint instanceof Pattern ) {
        addRaw( key, new VBox( {
          align: 'left',
          spacing: 3,
          children: [
            new Text( 'Pattern', { fontSize: 12 } ),
            new Image( paint.image, { maxWidth: 10, maxHeight: 10 } )
          ]
        } ) );
      }
    }
    else {
      addColor( key, paint );
    }
  };

  const addNumber = ( key: string, number: number ) => addSimple( key, number );
  const addMatrix3 = ( key: string, matrix: Matrix3 ) => addRaw( key, new Matrix3Node( matrix ) );
  const addBounds2 = ( key: string, bounds: Bounds2 ) => {
    if ( bounds.equals( Bounds2.NOTHING ) ) {
      // DO nothing
    }
    else if ( bounds.equals( Bounds2.EVERYTHING ) ) {
      addSimple( key, 'everything' );
    }
    else {
      addRaw( key, new RichText( `x: [${bounds.minX}, ${bounds.maxX}]<br>y: [${bounds.minY}, ${bounds.maxY}]`, { font: new PhetFont( 12 ) } ) );
    }
  };
  const addShape = ( key: string, shape: Shape ) => addRaw( key, new ShapeNode( shape ) );
  const addImage = ( key: string, image: Image ) => addRaw( key, new ImageNode( image ) );

  if ( node.tandem.supplied ) {
    addSimple( 'tandem', node.tandem.phetioID.split( '.' ).join( ' ' ) );
  }

  if ( node instanceof DOM ) {
    addSimple( 'element', node.element.constructor.name );
  }

  if ( mixesWidthSizable( node ) ) {
    !node.widthSizable && addSimple( 'widthSizable', node.widthSizable );
    node.preferredWidth !== null && addSimple( 'preferredWidth', node.preferredWidth );
    node.preferredWidth !== node.localPreferredWidth && addSimple( 'localPreferredWidth', node.localPreferredWidth );
    node.minimumWidth !== null && addSimple( 'minimumWidth', node.minimumWidth );
    node.minimumWidth !== node.localMinimumWidth && addSimple( 'localMinimumWidth', node.localMinimumWidth );
  }

  if ( mixesHeightSizable( node ) ) {
    !node.heightSizable && addSimple( 'heightSizable', node.heightSizable );
    node.preferredHeight !== null && addSimple( 'preferredHeight', node.preferredHeight );
    node.preferredHeight !== node.localPreferredHeight && addSimple( 'localPreferredHeight', node.localPreferredHeight );
    node.minimumHeight !== null && addSimple( 'minimumHeight', node.minimumHeight );
    node.minimumHeight !== node.localMinimumHeight && addSimple( 'localMinimumHeight', node.localMinimumHeight );
  }

  if ( node.layoutOptions ) {
    addSimple( 'layoutOptions', JSON.stringify( node.layoutOptions, null, 2 ) );
  }

  if ( node instanceof LayoutNode ) {
    !node.resize && addSimple( 'resize', node.resize );
    !node.layoutOrigin.equals( Vector2.ZERO ) && addSimple( 'layoutOrigin', node.layoutOrigin );
  }

  if ( node instanceof FlowBox ) {
    addSimple( 'orientation', node.orientation );
    addSimple( 'align', node.align );
    node.spacing && addSimple( 'spacing', node.spacing );
    node.lineSpacing && addSimple( 'lineSpacing', node.lineSpacing );
    addSimple( 'justify', node.justify );
    node.justifyLines && addSimple( 'justifyLines', node.justifyLines );
    node.wrap && addSimple( 'wrap', node.wrap );
    node.stretch && addSimple( 'stretch', node.stretch );
    node.grow && addSimple( 'grow', node.grow );
    node.leftMargin && addSimple( 'leftMargin', node.leftMargin );
    node.rightMargin && addSimple( 'rightMargin', node.rightMargin );
    node.topMargin && addSimple( 'topMargin', node.topMargin );
    node.bottomMargin && addSimple( 'bottomMargin', node.bottomMargin );
    node.minContentWidth !== null && addSimple( 'minContentWidth', node.minContentWidth );
    node.minContentHeight !== null && addSimple( 'minContentHeight', node.minContentHeight );
    node.maxContentWidth !== null && addSimple( 'maxContentWidth', node.maxContentWidth );
    node.maxContentHeight !== null && addSimple( 'maxContentHeight', node.maxContentHeight );
  }

  if ( node instanceof GridBox ) {
    addSimple( 'xAlign', node.xAlign );
    addSimple( 'yAlign', node.yAlign );
    node.xSpacing && addSimple( 'xSpacing', node.xSpacing );
    node.ySpacing && addSimple( 'ySpacing', node.ySpacing );
    node.xStretch && addSimple( 'xStretch', node.xStretch );
    node.yStretch && addSimple( 'yStretch', node.yStretch );
    node.xGrow && addSimple( 'xGrow', node.xGrow );
    node.yGrow && addSimple( 'yGrow', node.yGrow );
    node.leftMargin && addSimple( 'leftMargin', node.leftMargin );
    node.rightMargin && addSimple( 'rightMargin', node.rightMargin );
    node.topMargin && addSimple( 'topMargin', node.topMargin );
    node.bottomMargin && addSimple( 'bottomMargin', node.bottomMargin );
    node.minContentWidth !== null && addSimple( 'minContentWidth', node.minContentWidth );
    node.minContentHeight !== null && addSimple( 'minContentHeight', node.minContentHeight );
    node.maxContentWidth !== null && addSimple( 'maxContentWidth', node.maxContentWidth );
    node.maxContentHeight !== null && addSimple( 'maxContentHeight', node.maxContentHeight );
  }

  if ( node instanceof Rectangle ) {
    addBounds2( 'rectBounds', node.rectBounds );
    if ( node.cornerXRadius || node.cornerYRadius ) {
      if ( node.cornerXRadius === node.cornerYRadius ) {
        addSimple( 'cornerRadius', node.cornerRadius );
      }
      else {
        addSimple( 'cornerXRadius', node.cornerXRadius );
        addSimple( 'cornerYRadius', node.cornerYRadius );
      }
    }
  }

  if ( node instanceof Line ) {
    addSimple( 'x1', node.x1 );
    addSimple( 'y1', node.y1 );
    addSimple( 'x2', node.x2 );
    addSimple( 'y2', node.y2 );
  }

  if ( node instanceof Circle ) {
    addSimple( 'radius', node.radius );
  }

  if ( node instanceof Text ) {
    addSimple( 'text', node.text );
    addSimple( 'font', node.font );
    if ( node.boundsMethod !== 'hybrid' ) {
      addSimple( 'boundsMethod', node.boundsMethod );
    }
  }

  if ( node instanceof RichText ) {
    addSimple( 'text', node.text );
    addSimple( 'font', node.font instanceof Font ? node.font.getFont() : node.font );
    addPaint( 'fill', node.fill );
    addPaint( 'stroke', node.stroke );
    if ( node.boundsMethod !== 'hybrid' ) {
      addSimple( 'boundsMethod', node.boundsMethod );
    }
    if ( node.lineWrap !== null ) {
      addSimple( 'lineWrap', node.lineWrap );
    }
  }

  if ( node instanceof Image ) {
    addImage( 'image', node );
    addSimple( 'imageWidth', node.imageWidth );
    addSimple( 'imageHeight', node.imageHeight );
    if ( node.imageOpacity !== 1 ) {
      addSimple( 'imageOpacity', node.imageOpacity );
    }
    if ( node.imageBounds ) {
      addBounds2( 'imageBounds', node.imageBounds );
    }
    if ( node.initialWidth ) {
      addSimple( 'initialWidth', node.initialWidth );
    }
    if ( node.initialHeight ) {
      addSimple( 'initialHeight', node.initialHeight );
    }
    if ( node.hitTestPixels ) {
      addSimple( 'hitTestPixels', node.hitTestPixels );
    }
  }

  if ( node instanceof CanvasNode || node instanceof WebGLNode ) {
    addBounds2( 'canvasBounds', node.canvasBounds );
  }

  if ( node instanceof Path ) {
    if ( node.shape ) {
      addShape( 'shape', node.shape );
    }
    if ( node.boundsMethod !== 'accurate' ) {
      addSimple( 'boundsMethod', node.boundsMethod );
    }
  }

  if ( node instanceof Path || node instanceof Text ) {
    addPaint( 'fill', node.fill );
    addPaint( 'stroke', node.stroke );
    if ( node.lineDash.length ) {
      addSimple( 'lineDash', node.lineDash );
    }
    if ( !node.fillPickable ) {
      addSimple( 'fillPickable', node.fillPickable );
    }
    if ( node.strokePickable ) {
      addSimple( 'strokePickable', node.strokePickable );
    }
    if ( node.lineWidth !== 1 ) {
      addSimple( 'lineWidth', node.lineWidth );
    }
    if ( node.lineCap !== 'butt' ) {
      addSimple( 'lineCap', node.lineCap );
    }
    if ( node.lineJoin !== 'miter' ) {
      addSimple( 'lineJoin', node.lineJoin );
    }
    if ( node.lineDashOffset !== 0 ) {
      addSimple( 'lineDashOffset', node.lineDashOffset );
    }
    if ( node.miterLimit !== 10 ) {
      addSimple( 'miterLimit', node.miterLimit );
    }
  }

  if ( node.tagName ) {
    addSimple( 'tagName', node.tagName );
  }
  if ( node.accessibleName ) {
    addSimple( 'accessibleName', node.accessibleName );
  }
  if ( node.helpText ) {
    addSimple( 'helpText', node.helpText );
  }
  if ( node.pdomHeading ) {
    addSimple( 'pdomHeading', node.pdomHeading );
  }
  if ( node.containerTagName ) {
    addSimple( 'containerTagName', node.containerTagName );
  }
  if ( node.containerAriaRole ) {
    addSimple( 'containerAriaRole', node.containerAriaRole );
  }
  if ( node.innerContent ) {
    addSimple( 'innerContent', node.innerContent );
  }
  if ( node.inputType ) {
    addSimple( 'inputType', node.inputType );
  }
  if ( node.inputValue ) {
    addSimple( 'inputValue', node.inputValue );
  }
  if ( node.pdomNamespace ) {
    addSimple( 'pdomNamespace', node.pdomNamespace );
  }
  if ( node.ariaLabel ) {
    addSimple( 'ariaLabel', node.ariaLabel );
  }
  if ( node.ariaRole ) {
    addSimple( 'ariaRole', node.ariaRole );
  }
  if ( node.ariaValueText ) {
    addSimple( 'ariaValueText', node.ariaValueText );
  }
  if ( node.labelTagName ) {
    addSimple( 'labelTagName', node.labelTagName );
  }
  if ( node.labelContent ) {
    addSimple( 'labelContent', node.labelContent );
  }
  if ( node.appendLabel ) {
    addSimple( 'appendLabel', node.appendLabel );
  }
  if ( node.descriptionTagName ) {
    addSimple( 'descriptionTagName', node.descriptionTagName );
  }
  if ( node.descriptionContent ) {
    addSimple( 'descriptionContent', node.descriptionContent );
  }
  if ( node.appendDescription ) {
    addSimple( 'appendDescription', node.appendDescription );
  }
  if ( !node.pdomVisible ) {
    addSimple( 'pdomVisible', node.pdomVisible );
  }
  if ( node.pdomOrder ) {
    addSimple( 'pdomOrder', node.pdomOrder.map( node => node === null ? 'null' : node.constructor.name ) );
  }

  if ( !node.visible ) {
    addSimple( 'visible', node.visible );
  }
  if ( node.opacity !== 1 ) {
    addNumber( 'opacity', node.opacity );
  }
  if ( node.pickable !== null ) {
    addSimple( 'pickable', node.pickable );
  }
  if ( !node.enabled ) {
    addSimple( 'enabled', node.enabled );
  }
  if ( !node.inputEnabled ) {
    addSimple( 'inputEnabled', node.inputEnabled );
  }
  if ( node.cursor !== null ) {
    addSimple( 'cursor', node.cursor );
  }
  if ( node.transformBounds ) {
    addSimple( 'transformBounds', node.transformBounds );
  }
  if ( node.renderer ) {
    addSimple( 'renderer', node.renderer );
  }
  if ( node.usesOpacity ) {
    addSimple( 'usesOpacity', node.usesOpacity );
  }
  if ( node.layerSplit ) {
    addSimple( 'layerSplit', node.layerSplit );
  }
  if ( node.cssTransform ) {
    addSimple( 'cssTransform', node.cssTransform );
  }
  if ( node.excludeInvisible ) {
    addSimple( 'excludeInvisible', node.excludeInvisible );
  }
  if ( node.preventFit ) {
    addSimple( 'preventFit', node.preventFit );
  }
  if ( node.webglScale !== null ) {
    addSimple( 'webglScale', node.webglScale );
  }
  if ( !node.matrix.isIdentity() ) {
    addMatrix3( 'matrix', node.matrix );
  }
  if ( node.maxWidth !== null ) {
    addSimple( 'maxWidth', node.maxWidth );
  }
  if ( node.maxHeight !== null ) {
    addSimple( 'maxHeight', node.maxHeight );
  }
  if ( node.clipArea !== null ) {
    addShape( 'clipArea', node.clipArea );
  }
  if ( node.mouseArea !== null ) {
    if ( node.mouseArea instanceof Bounds2 ) {
      addBounds2( 'mouseArea', node.mouseArea );
    }
    else {
      addShape( 'mouseArea', node.mouseArea );
    }
  }
  if ( node.touchArea !== null ) {
    if ( node.touchArea instanceof Bounds2 ) {
      addBounds2( 'touchArea', node.touchArea );
    }
    else {
      addShape( 'touchArea', node.touchArea );
    }
  }
  if ( node.inputListeners.length ) {
    addSimple( 'inputListeners', node.inputListeners.map( listener => listener.constructor.name ).join( ', ' ) );
  }

  children.push( new Spacer( 5, 5 ) );

  addBounds2( 'localBounds', node.localBounds );
  if ( node.localBoundsOverridden ) {
    addSimple( 'localBoundsOverridden', node.localBoundsOverridden );
  }
  addBounds2( 'bounds', node.bounds );

  children.push( new RectangularPushButton( {
    content: new Text( 'Copy Path', { fontSize: 12 } ),
    listener: () => copyToClipboard( 'phet.joist.display.rootNode' + trail.indices.map( index => {
      return `.children[ ${index} ]`;
    } ).join( '' ) ),
    tandem: Tandem.OPT_OUT
  } ) );

  return children;
};

const iColorToColor = ( color: IColor ): Color | null => {
  const nonProperty: Color | string | null = ( color instanceof Property || color instanceof TinyProperty ) ? color.value : color;
  return nonProperty === null ? null : Color.toColor( nonProperty );
};

const isPaintNonTransparent = ( paint: IPaint ): boolean => {
  if ( paint instanceof Paint ) {
    return true;
  }
  else {
    const color = iColorToColor( paint );
    return !!color && color.alpha > 0;
  }
};

// Missing optimizations on bounds on purpose, so we hit visual changes
const visualHitTest = ( node: Node, point: Vector2 ): Trail | null => {
  if ( !node.visible ) {
    return null;
  }
  const localPoint = node._transform.getInverse().timesVector2( point );

  const clipArea = node.clipArea;
  if ( clipArea !== null && !clipArea.containsPoint( localPoint ) ) {
    return null;
  }

  for ( let i = node._children.length - 1; i >= 0; i-- ) {
    const child = node._children[ i ];

    const childHit = visualHitTest( child, localPoint );

    if ( childHit ) {
      return childHit.addAncestor( node, i );
    }
  }

  // Didn't hit our children, so check ourself as a last resort. Check our selfBounds first, so we can potentially
  // avoid hit-testing the actual object (which may be more expensive).
  if ( node.selfBounds.containsPoint( localPoint ) ) {

    // Ignore those transparent paths...
    if ( node instanceof Path && node.hasShape() ) {
      if ( isPaintNonTransparent( node.fill ) && node.getShape()!.containsPoint( localPoint ) ) {
        return new Trail( node );
      }
      if ( isPaintNonTransparent( node.stroke ) && node.getStrokedShape()!.containsPoint( localPoint ) ) {
        return new Trail( node );
      }
    }
    else if ( node.containsPointSelf( localPoint ) ) {
      return new Trail( node );
    }
  }

  // No hit
  return null;
};

const copyToClipboard = ( str: string ) => {
  navigator.clipboard?.writeText( str );
};

const getLocalShape = ( node: Node, useMouse: boolean, useTouch: boolean ): Shape => {
  let shape = Shape.union( [
    ...( ( useMouse && node.mouseArea ) ? [ node.mouseArea instanceof Shape ? node.mouseArea : Shape.bounds( node.mouseArea ) ] : [] ),
    ...( ( useTouch && node.touchArea ) ? [ node.touchArea instanceof Shape ? node.touchArea : Shape.bounds( node.touchArea ) ] : [] ),
    node.getSelfShape(),

    ...node.children.filter( child => {
      return child.visible && child.pickable !== false;
    } ).map( child => getLocalShape( child, useMouse, useTouch ).transformed( child.matrix ) )
  ].filter( shape => shape.bounds.isValid() ) );

  if ( node.hasClipArea() ) {
    shape = shape.shapeIntersection( node.clipArea! );
  }
  return shape;
};

const getShape = ( trail: Trail, useMouse: boolean, useTouch: boolean ): Shape => {
  let shape = getLocalShape( trail.lastNode(), useMouse, useTouch );

  for ( let i = trail.nodes.length - 1; i >= 0; i-- ) {
    const node = trail.nodes[ i ];

    if ( node.hasClipArea() ) {
      shape = shape.shapeIntersection( node.clipArea! );
    }
    shape = shape.transformed( node.matrix );
  }

  return shape;
};
