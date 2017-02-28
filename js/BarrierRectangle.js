// Copyright 2017, University of Colorado Boulder

/**
 * Semi-transparent black barrier used to block input events when a dialog (or other popup) is present, and fade out
 * the background.
 *
 * @author - Michael Kauzmann (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var joist = require( 'JOIST/joist' );
  var Emitter = require( 'AXON/Emitter' );
  var Plane = require( 'SCENERY/nodes/Plane' );
  var ButtonListener = require( 'SCENERY/input/ButtonListener' );
  var Tandem = require( 'TANDEM/Tandem');

  // phet-io modules
  var TBarrierRectangle = require( 'ifphetio!PHET_IO/types/scenery/nodes/TBarrierRectangle' );

  /**
   * @param {ObservableArray} modalNodeStack - see usage in Sim.js
   * @param {Object} [options]
   * @constructor
   */
  function BarrierRectangle( modalNodeStack, options ) {
    var self = this;

    options = _.extend( {
        tandem: Tandem.tandemRequired(),
        phetioType: TBarrierRectangle
      },
      options
    );

    Plane.call( this);

    // @private
    this.startedCallbacksForFiredEmitter = new Emitter();
    this.endedCallbacksForFiredEmitter = new Emitter();

    modalNodeStack.lengthProperty.link( function( numBarriers ) {
      self.visible = numBarriers > 0;
    } );

    this.addInputListener( new ButtonListener( {
      fire: function( event ) {
        self.startedCallbacksForFiredEmitter.emit();
        assert && assert( modalNodeStack.length > 0 );
        modalNodeStack.get( modalNodeStack.length - 1 ).hide();
        self.endedCallbacksForFiredEmitter.emit();
      }
    } ) );

    this.disposeBarrierRectangle = function() {
      modalNodeStack.lengthProperty.unlink();
    };

    this.mutate( options );
  }

  joist.register( 'BarrierRectangle', BarrierRectangle );

  return inherit( Plane, BarrierRectangle, {
    dispose: function() {
      this.disposeBarrierRectangle();
      Plane.prototype.dispose.call( this );
    }
  } );
} );