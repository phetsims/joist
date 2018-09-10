// Copyright 2018, University of Colorado Boulder

/**
 * a checkbox that can be used to turn projector mode on and off
 *
 * @author John Blanco
 */
define( require => {
  'use strict';

  // modules
  var BooleanProperty = require( 'AXON/BooleanProperty' );
  var Checkbox = require( 'SUN/Checkbox' );
  var inherit = require( 'PHET_CORE/inherit' );
  var joist = require( 'JOIST/joist' );
  var OptionsDialog = require( 'JOIST/OptionsDialog' );
  var Text = require( 'SCENERY/nodes/Text' );

  // strings
  var projectorModeString = require( 'string!JOIST/projectorMode' );

  // constants
  var MAX_CHECKBOX_TEXT_WIDTH = 350;

  /**
   * @param {Object} [options]
   * @constructor
   */
  function ProjectorModeCheckbox( options ) {

    var self = this;

    options = _.extend( {

      // property that can be used for setting the projector mode, created below if not supplied
      projectorModeEnabledProperty: null
    } );

    // @private {boolean} does this instance own projectorModeEnabledProperty?
    this.ownsProjectorModeEnabledProperty = !options.projectorModeEnabledProperty;

    // @public {BooleanProperty} - projector mode state, create one if not provided
    this.projectorModeEnabledProperty = options.projectorModeEnabledProperty ||
                                        new BooleanProperty( phet.chipper.queryParameters.colorProfile === 'projector' );

    var label = new Text( projectorModeString, {
      font: OptionsDialog.DEFAULT_FONT,
      maxWidth: MAX_CHECKBOX_TEXT_WIDTH
    } );
    Checkbox.call( this, label, this.projectorModeEnabledProperty, options );

    // @private - dispose function
    this.disposeProjectorModeCheckbox = function() {
      if ( self.ownsProjectorModeEnabledProperty ) {
        self.projectorModeEnabledProperty.dispose();
      }
    };
  }

  joist.register( 'ProjectorModeCheckbox', ProjectorModeCheckbox );

  return inherit( Checkbox, ProjectorModeCheckbox, {

    dispose: function() {
      this.disposeProjectorModeCheckbox();
      Checkbox.prototype.dispose.call( this );
    }
  } );
} );