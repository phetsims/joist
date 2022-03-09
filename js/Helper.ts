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
import { Color, Display, DragListener, HBox, Node, RichText, SceneryEvent, Trail, VBox } from '../../scenery/js/imports.js';
import Panel from '../../sun/js/Panel.js';
import Tandem from '../../tandem/js/Tandem.js';
import joist from './joist.js';
import Sim from './Sim.js';
import SimDisplay from './SimDisplay.js';
import BooleanProperty from '../../axon/js/BooleanProperty.js';
import Checkbox from '../../sun/js/Checkbox.js';
import ScreenView from './ScreenView.js';
import IProperty from '../../axon/js/IProperty.js';

class Helper {
  private sim: Sim;
  private simDisplay: Display;
  private helperDisplay?: Display;
  activeProperty: IProperty<boolean>;

  constructor( sim: Sim, simDisplay: SimDisplay ) {

    // NOTE: Don't pause the sim, don't use foreign object rasterization (do the smarter instant approach)
    // NOTE: Inspector
    // NOTE: Inform about preserveDrawingBuffer query parameter
    // NOTE: Actually grab/rerender things from WebGL/Canvas, so this works nicely and at a higher resolution
    // NOTE: Figure out FlowBox sizing!
    // NOTE: Highlight the nodes with input listeners on them!

    // Picking:
    // Follow pickability (ignore things without input listeners?)
    //   If following, do we IGNORE what is "under" the input listener?
    //   Ignore inputDisabled?
    //   Mouse areas? Touch areas?

    this.sim = sim;
    this.simDisplay = simDisplay;

    // Whether the helper is visible (active) or not
    this.activeProperty = new TinyProperty( false );

    const screenViewProperty = new TinyProperty<ScreenView | null>( null );

    // Where the current pointer is
    const pointerPositionProperty = new TinyProperty( Vector2.ZERO );

    // ImageData from the sim
    const imageDataProperty = new TinyProperty<ImageData | null>( null );

    const colorProperty = new DerivedProperty( [ pointerPositionProperty, imageDataProperty ], ( position: Vector2, imageData: ImageData | null ) => {
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

    const trailProperty = new DerivedProperty( [ pointerPositionProperty ], ( point: Vector2 ) => {
      return simDisplay.rootNode.hitTest( point, true, false );
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

    const round = ( n: number, places: number = 2 ) => Utils.toFixed( n, places );

    const positionTextProperty = new MappedProperty( pointerPositionProperty, {
      tandem: Tandem.OPT_OUT,
      bidirectional: true,
      map: position => {
        const view = screenViewProperty.value;
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
    const colorTextProperty = new MappedProperty( colorProperty, {
      tandem: Tandem.OPT_OUT,
      bidirectional: true,
      map: colorTextMap
    } );
    const colorText = new RichText( colorTextMap( colorProperty.value ), {
      font: new PhetFont( 12 ),
      textProperty: colorTextProperty
    } );
    colorProperty.link( color => {
      colorText.fill = Color.getLuminance( color ) > 128 ? Color.BLACK : Color.WHITE;
    } );

    const colorBackground = new Panel( colorText, {
      cornerRadius: 0,
      stroke: null,
      fill: colorProperty
    } );

    const fuzzCheckbox = new Checkbox( new RichText( 'Fuzz', { font: new PhetFont( 12 ) } ), fuzzProperty, {
      boxWidth: 14
    } );

    const measuringTapeVisibleCheckbox = new Checkbox( new RichText( 'Measuring Tape', { font: new PhetFont( 12 ) } ), measuringTapeVisibleProperty, {
      boxWidth: 14
    } );

    const trailReadout = new RichText( '', {
      font: new PhetFont( 12 )
    } );
    trailProperty.link( ( trail: Trail | null ) => {
      if ( trail ) {
        trailReadout.text = '<b>Trail:</b><br>' + trail.nodes.slice().reverse().map( node => {
          return node.constructor.name;
        } ).join( '<br>' );
      }
      else {
        trailReadout.text = '';
      }
      trailReadout.visible = !!trail;
    } );

    const helperReadoutContent = new VBox( {
      spacing: 5,
      align: 'left',
      children: [
        positionText,
        colorBackground,
        new HBox( {
          spacing: 10,
          children: [
            fuzzCheckbox,
            measuringTapeVisibleCheckbox
          ]
        } ),
        trailReadout
      ]
    } );
    const helperReadoutPanel = new Panel( helperReadoutContent, {
      fill: 'rgba(255,255,255,0.7)',
      stroke: 'rgba(0,0,0,0.7)',
      cornerRadius: 0
    } );
    helperReadoutPanel.addInputListener( new DragListener( {
      translateNode: true,
      targetNode: helperReadoutPanel
    } ) );
    helperRoot.addChild( helperReadoutPanel );

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
    };

    const frameListener = ( dt: number ) => {
      this.helperDisplay?.updateDisplay();
    };

    this.activeProperty.lazyLink( active => {
      if ( active ) {
        sim.activeProperty.value = false;

        const screen = sim.screenProperty.value;
        // @ts-ignore Screen?
        if ( screen.hasView() ) {
          // @ts-ignore Screen?
          screenViewProperty.value = screen.view;
        }
        else {
          screenViewProperty.value = null;
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
          pointerPositionProperty.value = event.pointer.point;
        };

        this.helperDisplay.addInputListener( {
          move: onLocationEvent,
          down: onLocationEvent,
          up: onLocationEvent
        } );

        if ( screenViewProperty.value ) {
          measuringTapeUnitsProperty.value = {
            name: 'view units',
            multiplier: screenViewProperty.value.getGlobalToLocalMatrix().getScaleVector().x
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
                imageDataProperty.value = context.getImageData( 0, 0, width, height );
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

        sim.activeProperty.value = true;
        imageDataProperty.value = null;
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

export default Helper;