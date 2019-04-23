// Copyright 2018, University of Colorado Boulder

/**
 * a checkbox that can be used to turn projector mode on and off
 *
 * @author John Blanco
 */
define( require => {
  'use strict';

  // modules
  const BooleanProperty = require( 'AXON/BooleanProperty' );
  const Checkbox = require( 'SUN/Checkbox' );
  const joist = require( 'JOIST/joist' );
  const OptionsDialog = require( 'JOIST/OptionsDialog' );
  const Tandem = require( 'TANDEM/Tandem' );
  const Text = require( 'SCENERY/nodes/Text' );

  // strings
  const projectorModeString = require( 'string!JOIST/projectorMode' );

  /**
   * @param {Object} [options]
   * @constructor
   */
  class ProjectorModeCheckbox extends Checkbox {

    constructor( options ) {

      options = _.extend( {

        font: OptionsDialog.DEFAULT_FONT,
        maxTextWidth: 350, // empirically determined, works reasonably well for long strings

        // property that can be used for setting the projector mode, created below if not supplied
        projectorModeEnabledProperty: null,

        tandem: Tandem.required
      }, options );

      // Does this instance own projectorModeEnabledProperty?
      const ownsProjectorModeEnabledProperty = !options.projectorModeEnabledProperty;

      // superclass option that the client cannot set
      assert && assert( options.phetioLinkProperty === undefined, 'ProjectorModeCheckbox sets phetioLinkProperty' );
      options = _.extend( {
        phetioLinkProperty: !ownsProjectorModeEnabledProperty
      }, options );

      // @public {BooleanProperty} - projector mode state, create one if not provided
      const projectorModeEnabledProperty = options.projectorModeEnabledProperty ||
                                           new BooleanProperty( phet.chipper.queryParameters.colorProfile === 'projector', {
                                             tandem: options.tandem.createTandem( 'projectorModeEnabledProperty' )
                                           } );

      const label = new Text( projectorModeString, {
        font: options.font,
        maxWidth: options.maxTextWidth
      } );
      super( label, projectorModeEnabledProperty, options );

      // @public {BooleanProperty} - make the projector mode enabled property available to clients
      this.projectorModeEnabledProperty = projectorModeEnabledProperty;

      // @private - dispose function
      this.disposeProjectorModeCheckbox = function() {
        if ( ownsProjectorModeEnabledProperty ) {
          projectorModeEnabledProperty.dispose();
        }
      };
    }

    dispose() {
      this.disposeProjectorModeCheckbox();
      super.dispose();
    }
  }

  return joist.register( 'ProjectorModeCheckbox', ProjectorModeCheckbox );
} );