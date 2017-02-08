// Copyright 2017, University of Colorado Boulder

/**
 *
 * @author - Michael Kauzmann (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  var inherit = require( 'PHET_CORE/inherit' );
  var joist = require( 'JOIST/joist' );

  var Emitter = require( 'AXON/Emitter' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var ButtonListener = require( 'SCENERY/input/ButtonListener' );
  var Tandem = require( 'TANDEM/Tandem' );


  // phet-io modules
  var TBarrierRectangle = require( 'ifphetio!PHET_IO/types/scenery/nodes/TBarrierRectangle' );


  /**
   * @public (joist-internal)
   *
   * Semi-transparent black barrier used to block input events when a dialog
   * (or other popup) is present, and fade out the background.
   *
   * @param x
   * @param y
   * @param width
   * @param height
   * @param cornerXRadius
   * @param cornerYRadius
   * @param modalNodeStack
   * @param options
   * @constructor
   */
  function BarrierRectangle( x, y, width, height, cornerXRadius, cornerYRadius, modalNodeStack, options ) {
    var self = this;


    var tandem = options.tandem;

    // This will be passed up to parents
    options.tandem = tandem.createSupertypeTandem();
    Rectangle.call( this, x, y, width, height, cornerXRadius, cornerYRadius, options );

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


    this.mutate({ tandem: tandem, phetioType: TBarrierRectangle});
  }

  joist.register( 'BarrierRectangle', BarrierRectangle );

  return inherit( Rectangle, BarrierRectangle );
});