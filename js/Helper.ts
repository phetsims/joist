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
import { Color, Display, DragListener, FireListener, FlowBox, Font, GradientStop, GridBox, HBox, IColor, Image, IPaint, LinearGradient, Node, Paint, Path, Pattern, PressListener, RadialGradient, Rectangle, RichText, SceneryEvent, Spacer, Text, TextOptions, Trail, VBox } from '../../scenery/js/imports.js';
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

const round = ( n: number, places: number = 2 ) => Utils.toFixed( n, places );

class PointerAreaType extends EnumerationValue {
  static MOUSE = new PointerAreaType();
  static TOUCH = new PointerAreaType();
  static NONE = new PointerAreaType();

  static enumeration = new Enumeration( PointerAreaType );
}

class Helper {
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

  treeVisibleProperty: Property<boolean>;

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
    // NOTE: Highlight the nodes with input listeners on them!

    // NOTE: PDOM info on left
    // NOTE: PDOM tree
    // NOTE: Scenery drawable tree
    // NOTE: Rename "tree" to "visual tree"

    this.sim = sim;
    this.simDisplay = simDisplay;
    this.activeProperty = new TinyProperty( false );
    this.treeVisibleProperty = new BooleanProperty( false, {
      tandem: Tandem.OPT_OUT
    } );

    this.inputBasedPickingProperty = new BooleanProperty( true, { tandem: Tandem.OPT_OUT } );
    this.useLeafNodeProperty = new BooleanProperty( false, { tandem: Tandem.OPT_OUT } );
    this.pointerAreaTypeProperty = new EnumerationProperty( PointerAreaType.MOUSE, { tandem: Tandem.OPT_OUT } );

    this.pointerPositionProperty = new TinyProperty( Vector2.ZERO );
    this.overInterfaceProperty = new BooleanProperty( false, { tandem: Tandem.OPT_OUT } );

    this.selectedTrailProperty = new TinyProperty<Trail | null>( null );
    this.treeHoverTrailProperty = new TinyProperty<Trail | null>( null );
    this.pointerTrailProperty = new DerivedProperty( [ this.pointerPositionProperty, this.overInterfaceProperty, this.pointerAreaTypeProperty, this.inputBasedPickingProperty ], ( point: Vector2, overInterface: boolean, pointerAreaType: PointerAreaType, inputBasedPicking: boolean ) => {
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

    this.previewShapeProperty = new DerivedProperty( [ this.previewTrailProperty, this.inputBasedPickingProperty, this.pointerAreaTypeProperty ], ( previewTrail: Trail | null, inputBasedPicking: boolean, pointerAreaType: PointerAreaType ) => {
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

    this.colorProperty = new DerivedProperty( [ this.pointerPositionProperty, this.imageDataProperty ], ( position: Vector2, imageData: ImageData | null ) => {
      if ( !imageData ) {
        return Color.TRANSPARENT;
      }
      const x = Math.floor( position.x / this.simDisplay.width * imageData.width );
      const y = Math.floor( position.y / this.simDisplay.height * imageData.height );

      const index = 4 * ( x + imageData.width * y );

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
    const measuringTapeUnitsProperty = new TinyProperty<{ name: string, multiplier: number }>( { name: 'view units', multiplier: 0 } );

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

    const infoContainer = new VBox( {
      spacing: 3,
      align: 'left'
    } );
    this.previewTrailProperty.link( trail => {
      infoContainer.children = trail ? createInfo( trail ) : [];
    } );

    const fuzzCheckbox = new HelperCheckbox( 'Fuzz', fuzzProperty );
    const measuringTapeVisibleCheckbox = new HelperCheckbox( 'Measuring Tape', measuringTapeVisibleProperty );
    const treeVisibleCheckbox = new HelperCheckbox( 'Tree', this.treeVisibleProperty );
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

    const trailReadout = new FlowBox( {
      orientation: 'vertical',
      align: 'left'
    } );

    this.previewTrailProperty.link( ( trail: Trail | null ) => {
      trailReadout.children = [];

      if ( trail ) {
        // Visibility check
        if ( !trail.isVisible() ) {
          trailReadout.addChild( new Text( 'invisible', { fill: '#60a', fontSize: 12 } ) );
        }

        if ( trail.getOpacity() !== 1 ) {
          trailReadout.addChild( new Text( `opacity: ${trail.getOpacity()}`, { fill: '#888', fontSize: 12 } ) );
        }

        const hasPickableFalseEquivalent = _.some( trail.nodes, node => {
          return node.pickable === false || node.visible === false;
        } );
        const hasPickableTrueEquivalent = _.some( trail.nodes, node => {
          return node.inputListeners.length > 0 || node.pickable === true;
        } );
        if ( !hasPickableFalseEquivalent && hasPickableTrueEquivalent ) {
          trailReadout.addChild( new Text( 'Hit Tested', { fill: '#f00', fontSize: 12 } ) );
        }

        if ( !trail.getMatrix().isIdentity() ) {
          // Why is this wrapper node needed?
          trailReadout.addChild( new Node( { children: [ new Matrix3Node( trail.getMatrix() ) ] } ) );
        }

        trail.nodes.slice().forEach( ( node, index ) => {
          trailReadout.addChild( new RichText( node.constructor.name, {
            font: new PhetFont( 12 ),
            layoutOptions: {
              leftMargin: index * 10
            },
            cursor: 'pointer',
            inputListeners: [ new FireListener( {
              fire: () => {
                this.selectedTrailProperty.value = trail.subtrailTo( node );
                focusSelected();
              }
            } ) ]
          } ) );
        } );
      }
    } );

    const treeBackground = new Rectangle( {
      fill: 'rgba(255,255,255,0.85)',
      stroke: 'black',
      rectWidth: 400,
      visibleProperty: this.treeVisibleProperty,
      pickable: true
    } );
    const treeContainer = new Node();
    treeBackground.addChild( treeContainer );

    const treeMarginX = 8;
    const treeMarginY = 5;
    const constrainTree = () => {
      if ( treeContainer.children[ 0 ].bottom < treeBackground.selfBounds.bottom - treeMarginY ) {
        treeContainer.children[ 0 ].bottom = treeBackground.selfBounds.bottom - treeMarginY;
      }
      if ( treeContainer.children[ 0 ].top > treeBackground.selfBounds.top + treeMarginY ) {
        treeContainer.children[ 0 ].top = treeBackground.selfBounds.top + treeMarginY;
      }
      if ( treeContainer.children[ 0 ].right < treeBackground.selfBounds.right - treeMarginX ) {
        treeContainer.children[ 0 ].right = treeBackground.selfBounds.right - treeMarginX;
      }
      if ( treeContainer.children[ 0 ].left > treeBackground.selfBounds.left + treeMarginX ) {
        treeContainer.children[ 0 ].left = treeBackground.selfBounds.left + treeMarginX;
      }
    };

    treeBackground.addInputListener( new DragListener( {
      targetNode: treeBackground,
      drag: ( event, listener ) => {
        treeBackground.x = treeBackground.x + listener.modelDelta.x;
      }
    } ) );
    treeBackground.addInputListener( {
      wheel: event => {
        const deltaX = event.domEvent!.deltaX;
        const deltaY = event.domEvent!.deltaY;
        const multiplier = 1;
        treeContainer.children[ 0 ].x -= deltaX * multiplier;
        treeContainer.children[ 0 ].y -= deltaY * multiplier;
        constrainTree();
      }
    } );

    const focusTrail = ( trail: Trail ) => {
      const rootTreeNode = treeContainer.children[ 0 ] as TreeNode;
      if ( rootTreeNode ) {
        console.log( 'focus' );
        // const treeNode = rootTreeNode.find( trail );
        // const deltaY = treeNode.localToGlobalPoint( treeNode.selfBackground.center ).y - treeBackground.centerY;
        // rootTreeNode.y -= deltaY;
        // constrainTree();
      }
    };

    const focusPointer = () => {
      if ( this.pointerTrailProperty.value ) {
        focusTrail( this.pointerTrailProperty.value );
      }
    };

    const focusSelected = () => {
      if ( this.selectedTrailProperty.value === null ) { return; }

      focusTrail( this.selectedTrailProperty.value );
    };

    // When there isn't a selected trail, focus whatever our pointer is over
    this.pointerTrailProperty.lazyLink( () => {
      if ( !this.selectedTrailProperty.value ) {
        focusPointer();
      }
    } );

    Property.multilink( [ this.activeProperty, this.treeVisibleProperty ], ( active, treeVisible ) => {
      if ( active && treeVisible ) {
        treeContainer.children = [
          new TreeNode( new Trail( simDisplay.rootNode ), this )
        ];
        constrainTree();
      }
      else {
        treeContainer.children = [];
      }
    } );

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
      }
    } ) );
    helperRoot.addChild( backgroundNode );

    const helperReadoutContent = new FlowBox( {
      orientation: 'vertical',
      spacing: 5,
      align: 'left',
      children: [
        createHeaderText( 'Under Pointer', positionText, { layoutOptions: { topMargin: 0 } } ),
        positionText,
        colorBackground,
        createHeaderText( 'Tools' ),
        new HBox( {
          spacing: 10,
          children: [
            fuzzCheckbox,
            measuringTapeVisibleCheckbox,
            treeVisibleCheckbox
          ]
        } ),
        createHeaderText( 'Picking' ),
        new HBox( {
          spacing: 10,
          children: [
            inputBasedPickingCheckbox,
            useLeafNodeCheckbox
          ]
        } ),
        pointerAreaTypeRadioButtonGroup,
        createHeaderText( 'Selected Node', infoContainer ),
        infoContainer,
        createHeaderText( 'Selected Trail', trailReadout ),
        trailReadout
      ]
    } );
    const helperReadoutPanel = new Panel( helperReadoutContent, {
      fill: 'rgba(255,255,255,0.85)',
      stroke: 'rgba(0,0,0,0.85)',
      cornerRadius: 0
    } );
    helperReadoutPanel.addInputListener( new DragListener( {
      translateNode: true,
      targetNode: helperReadoutPanel
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

    helperRoot.addChild( treeBackground );

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
      treeBackground.rectHeight = size.height;
      treeBackground.right = size.width;
      treeContainer.clipArea = Shape.bounds( treeBackground.localBounds.dilated( 10 ) );
    };

    const frameListener = ( dt: number ) => {
      this.overInterfaceProperty.value = helperReadoutPanel.bounds.containsPoint( this.pointerPositionProperty.value ) || ( this.treeVisibleProperty.value && treeBackground.bounds.containsPoint( this.pointerPositionProperty.value ) );

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
        // @ts-ignore Screen?
        if ( screen.hasView() ) {
          // @ts-ignore Screen?
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
        this.treeVisibleProperty.value = false;
      }
    } );
  }

  // Singleton, lazily created so we don't slow down startup
  static helper?: Helper;

  static initialize( sim: Sim, simDisplay: SimDisplay ) {
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
//    * @public
//    */
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

class TreeNode extends Node {

  node: Node;
  trail: Trail;
  expandedProperty: IProperty<boolean>;

  selfBackground: Rectangle;

  private childTreeNodes: TreeNode[];

  constructor( trail: Trail, helper: Helper ) {
    super();

    const node = trail.lastNode();

    this.node = node;
    this.trail = trail;

    this.expandedProperty = new TinyProperty( true );

    const isVisible = trail.isVisible();

    const selfNode = new HBox( {
      spacing: 5
    } );

    const buttonSize = 12;
    const expandButton = new Rectangle( -buttonSize / 2, -buttonSize / 2, buttonSize, buttonSize, {
      children: [
        new Path( Shape.regularPolygon( 3, buttonSize / 2.5 ), {
          fill: '#444'
        } )
      ],
      visible: false,
      cursor: 'pointer'
    } );
    expandButton.addInputListener( new FireListener( {
      fire: () => {
        this.expandedProperty.value = !this.expandedProperty.value;
      }
    } ) );
    selfNode.addChild( expandButton );

    const TREE_FONT = new Font( { size: 12 } );

    const name = node.constructor.name;
    if ( name ) {
      selfNode.addChild( new Text( name, {
        font: TREE_FONT,
        pickable: false,
        fill: isVisible ? '#000' : '#60a'
      } ) );
    }
    if ( node instanceof Text ) {
      selfNode.addChild( new Text( '"' + node.text + '"', {
        font: TREE_FONT,
        pickable: false,
        fill: '#666'
      } ) );
    }
    this.selfBackground = Rectangle.bounds( selfNode.bounds, {
      children: [ selfNode ],
      cursor: 'pointer',
      fill: new DerivedProperty( [ helper.selectedTrailProperty, helper.pointerTrailProperty ], ( selected, active ) => {
        if ( this.trail === selected ) {
          return 'rgba(0,128,255,0.4)';
        }
        else if ( this.trail === active ) {
          return 'rgba(0,128,255,0.2)';
        }
        else {
          return 'transparent';
        }
      }, {
        tandem: Tandem.OPT_OUT
      } )
    } );
    this.selfBackground.addInputListener( {
      enter: function( event ) {
        helper.treeHoverTrailProperty.value = trail;
      },
      exit: function( event ) {
        helper.treeHoverTrailProperty.value = null;
      }
    } );
    this.selfBackground.addInputListener( new FireListener( {
      fire: function() {
        helper.selectedTrailProperty.value = trail;
      }
    } ) );
    this.addChild( this.selfBackground );

    this.childTreeNodes = node.children.map( ( child, index ) => {
      return new TreeNode( trail.copy().addDescendant( child ), helper );
    } );

    const childrenNode = new VBox( {
      spacing: 0,
      align: 'left',
      children: this.childTreeNodes
    } );

    const column = new Rectangle( {
      rectWidth: 2,
      rectHeight: 5,
      fill: 'rgba(0,0,0,0.1)'
    } );

    const expandedNode = new Node( {
      children: [
        childrenNode
        // column
      ]
    } );

    if ( childrenNode.bounds.isFinite() ) {
      childrenNode.left = selfNode.left + 13;
      childrenNode.top = selfNode.bottom;
      column.centerX = selfNode.left + buttonSize / 2;
      column.top = selfNode.bottom;

      expandButton.visible = true;
      this.addChild( expandedNode );

      this.expandedProperty.link( expanded => {
        expandButton.rotation = expanded ? Math.PI / 2 : 0;
        if ( expanded && !this.hasChild( expandedNode ) ) {
          this.addChild( expandedNode );
        }
        if ( !expanded && this.hasChild( expandedNode ) ) {
          this.removeChild( expandedNode );
        }
      } );

      childrenNode.boundsProperty.lazyLink( () => {
        column.rectHeight = childrenNode.height;
      } );
    }
  }

  expandRecusively() {
    this.expandedProperty.value = true;
    this.childTreeNodes.forEach( treeNode => {
      treeNode.expandRecusively();
    } );
  }

  collapseRecursively() {
    this.expandedProperty.value = false;
    this.childTreeNodes.forEach( treeNode => {
      treeNode.collapseRecursively();
    } );
  }

  find( trail: Trail ): TreeNode {
    if ( trail.equals( this.trail ) ) {
      return this;
    }
    else {
      return _.find( this.childTreeNodes, childTreeNode => {
        return trail.isExtensionOf( childTreeNode.trail, true );
      } )!;
    }
  }
}

const createHeaderText = ( str: string, node?: Node, options?: TextOptions ) => {
  return new Text( str, merge( {
    fontSize: 14,
    fontWeight: 'bold',
    layoutOptions: { topMargin: 5 },
    visibleProperty: node ? new DerivedProperty( [ node.visibleProperty, node.boundsProperty ], ( visible: boolean, bounds: Bounds2 ) => {
      return visible && !bounds.isEmpty();
    } ) : new TinyProperty( true )
  }, options ) );
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
      addRaw( key, new Text( '' + value, { fontSize: 12 } ) );
    }
  };

  const colorSwatch = ( color: Color ): Node => {
    return new HBox( {
      spacing: 4,
      children: [
        new Rectangle( 0, 0, 10, 10, { fill: color, stroke: 'black', lineWidth: 0.5 } ),
        new Text( color.toHexString(), { fontSize: 12 } ),
        new Text( color.toCSS(), { fontSize: 12 } )
      ]
    } );
  };

  const iColorToColor = ( color: IColor ): Color | null => {
    const nonProperty: Color | string | null = ( color instanceof Property || color instanceof TinyProperty ) ? color.value : color;
    return nonProperty === null ? null : Color.toColor( nonProperty );
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
        addRaw( key, new HBox( {
          spacing: 3,
          children: [
            new Text( `LinearGradient ${paint.start} => ${paint.end}`, { fontSize: 12 } ),
            ...paint.stops.map( stopToNode )
          ]
        } ) );
      }
      else if ( paint instanceof RadialGradient ) {
        addRaw( key, new HBox( {
          spacing: 3,
          children: [
            new Text( `RadialGradient ${paint.start} ${paint.startRadius} => ${paint.end} ${paint.endRadius}`, { fontSize: 12 } ),
            ...paint.stops.map( stopToNode )
          ]
        } ) );
      }
      else if ( paint instanceof Pattern ) {
        addRaw( key, new HBox( {
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
  const addBounds2 = ( key: string, bounds: Bounds2 ) => addRaw( key, new RichText( `minX: ${bounds.minX}<br>maxX: ${bounds.maxX}<br>minY: ${bounds.minY}<br>maxY: ${bounds.maxY}<br>`, { font: new PhetFont( 12 ) } ) );

  if ( node instanceof Path || node instanceof Text ) {
    addPaint( 'fill', node.fill );
    addPaint( 'stroke', node.stroke );
  }
  if ( !node.visible ) {
    addSimple( 'visible', node.visible );
  }
  if ( node.opacity !== 1 ) {
    addNumber( 'opacity', node.opacity );
  }
  // addSerial( 'lineDash', serialization.setup.lineDash );
  // addSimple( 'pickable', serialization.options.pickable );
  // addSimple( 'inputEnabled', serialization.options.inputEnabled );
  // addSimple( 'cursor', serialization.options.cursor );
  // addSimple( 'transformBounds', serialization.options.transformBounds );
  // addSimple( 'renderer', serialization.options.renderer );
  // addSimple( 'usesOpacity', serialization.options.usesOpacity );
  // addSimple( 'layerSplit', serialization.options.layerSplit );
  // addSimple( 'cssTransform', serialization.options.cssTransform );
  // addSimple( 'excludeInvisible', serialization.options.excludeInvisible );
  // addSimple( 'webglScale', serialization.options.webglScale );
  // addSimple( 'preventFit', serialization.options.preventFit );
  if ( !node.matrix.isIdentity() ) {
    addMatrix3( 'matrix', node.matrix );
  }
  // addSerial( 'maxWidth', serialization.setup.maxWidth );
  // addSerial( 'maxHeight', serialization.setup.maxHeight );
  // addSerial( 'clipArea', serialization.setup.clipArea );
  // addSerial( 'mouseArea', serialization.setup.mouseArea );
  // addSerial( 'touchArea', serialization.setup.touchArea );
  // addSerial( 'localBounds', serialization.setup.localBounds );
  // if ( serialization.setup.hasInputListeners ) {
  //   addSimple( 'inputListeners', '' );
  // }
  // addSerial( 'path', serialization.setup.path );
  // addSimple( 'width', serialization.setup.width );
  // addSimple( 'height', serialization.setup.height );
  // addSimple( 'imageType', serialization.setup.imageType );

  children.push( new Spacer( 5, 5 ) );

  addBounds2( 'localBounds', node.localBounds );
  addBounds2( 'bounds', node.bounds );

  /*---------------------------------------------------------------------------*
  * Buttons
  *----------------------------------------------------------------------------*/

  // function badButton( label, action ) {
  //   var text = new Text( label, { fontSize: 12 } );
  //   var rect = Rectangle.bounds( text.bounds.dilatedXY( 5, 3 ), {
  //     children: [ text ],
  //     stroke: 'black',
  //     cursor: 'pointer'
  //   } );
  //   rect.addInputListener( new FireListener( {
  //     fire: action
  //   } ) );
  //   return rect;
  // }
  //
  // children.push( new Spacer( 10, 10 ) );
  //
  // children.push( new HBox( {
  //   spacing: 5,
  //   children: [
  //     badButton( 'toggle visibility', function() {
  //       treeNode.node.visible = !treeNode.node.visible;
  //     } ),
  //     badButton( 'sim path', function() {
  //       window.prompt( 'Copy-paste this into a sim:', 'phet.joist.display.rootNode' + treeNode.trail.indices.map( function( index ) {
  //         return '.children[ ' + index + ' ]';
  //       } ).join( '' ) );
  //     } )
  //   ]
  // } ) );

  return children;
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
    if ( node.containsPointSelf( localPoint ) ) {
      return new Trail( node );
    }
  }

  // No hit
  return null;
};

export default Helper;