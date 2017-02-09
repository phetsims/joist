// Copyright 2017, University of Colorado Boulder

/**
 * Semi-transparent black barrier used to block input events when a dialog
 * (or other popup) is present, and fade out the background.
 *
 * @author - Michael Kauzmann (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var joist = require( 'JOIST/joist' );
  var Emitter = require( 'AXON/Emitter' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var ButtonListener = require( 'SCENERY/input/ButtonListener' );

  // phet-io modules
  var TBarrierRectangle = require( 'ifphetio!PHET_IO/types/scenery/nodes/TBarrierRectangle' );

  /**
   * @param x
   * @param y
   * @param width
   * @param height
   * @param {ObservableArray} modalNodeStack - see usage in Sim.js
   * @param {Object} [options]
   * @constructor
   */
  function BarrierRectangle( x, y, width, height, modalNodeStack, options ) {

    options = _.extend( {
      cornerRadius: 0
    }, options );

    var self = this;

    var tandem = options.tandem;

    // This will be passed up to parents
    options.tandem = tandem.createSupertypeTandem();

    //TODO #394 don't pass options to both Rectangle.call and mutate
    Rectangle.call( this, x, y, width, height, options );

    //TODO #394 missing visibility annotations
    this.startedCallbacksForFiredEmitter = new Emitter();
    this.endedCallbacksForFiredEmitter = new Emitter();

    //TODO #394 implement dispose or document why unlink is unnecessary
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

    //TODO #394 don't pass options to both Rectangle.call and mutate
    this.mutate( {
      tandem: tandem, //TODO #394 this is not the tandem that you passed to Rectangle.call, bug?
      phetioType: TBarrierRectangle
    } );
  }

  joist.register( 'BarrierRectangle', BarrierRectangle );

  return inherit( Rectangle, BarrierRectangle );
} );