// Copyright 2002-2013, University of Colorado Boulder

/**
 * General dialog type
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 * @author Sam Reid
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Shape = require( 'KITE/Shape' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Path = require( 'SCENERY/nodes/Path' );
  var Panel = require( 'SUN/Panel' );
  var RectangularPushButton = require( 'SUN/buttons/RectangularPushButton' );

  /**
   * @constructor
   * @param {Node} content - The content to display inside the dialog (not including the title)
   * @param {object} [options]
   */
  function Dialog( content, options ) {
    options = _.extend( {
      // Dialog-specific options
      modal: false, // {boolean} modal dialogs prevent interaction with the rest of the sim while open
      title: null, // {Node} title to be displayed at top
      titleAlign: 'center', // horizontal alignment of the title: {string} left, right or center
      titleSpacing: 20, // {number} how far the title is placed above the content
      hasCloseButton: true, // whether to put a close 'X' button is upper-right corner

      // {function} which sets the dialog's position in global coordinates. called as
      // layoutStrategy( dialog, simBounds, screenBounds, scale )
      layoutStrategy: Dialog.DEFAULT_LAYOUT_STRATEGY,

      // pass through to Panel options
      cornerRadius: 10, // {number} radius of the dialog's corners
      resize: true, // {boolean} whether to resize if content's size changes
      fill: 'white', // {string|Color}
      stroke: 'black', // {string|Color}
      backgroundPickable: true,
      xMargin: 20,
      yMargin: 20,
      closeButtonMargin: 5 // {number} how far away should the close button be from the panel border
    }, options );

    var dialog = this;

    this.isModal = options.modal;

    var dialogContent = new Node( {
      children: [ content ]
    } );

    if ( options.title ) {
      var titleNode = options.title;

      dialogContent.addChild( titleNode );

      var updateTitlePosition = function() {
        switch( options.titleAlign ) {
          case 'center':
            titleNode.centerX = content.centerX;
            break;
          case 'left':
            titleNode.left = content.left;
            break;
          case 'right':
            titleNode.right = content.right;
            break;
          default:
            throw new Error( 'unknown titleAlign for Dialog: ' + options.titleAlign );
        }
        titleNode.bottom = content.top - options.titleSpacing;
      };

      if ( options.resize ) {
        content.addEventListener( 'bounds', updateTitlePosition );
        titleNode.addEventListener( 'bounds', updateTitlePosition );
      }
      updateTitlePosition();
    }

    Panel.call( this, dialogContent, options );

    if ( options.hasCloseButton ) {
      var crossSize = 10;
      var crossNode = new Path( new Shape().moveTo( 0, 0 ).lineTo( crossSize, crossSize ).moveTo( 0, crossSize ).lineTo( crossSize, 0 ), {
        stroke: '#fff',
        lineWidth: 3
      } );

      var closeButton = new RectangularPushButton( {
        content: crossNode,
        baseColor: '#d00', // TODO: color dependent on scheme?
        xMargin: 5,
        yMargin: 5,
        listener: function() {
          dialog.hide();
        }
      } );
      this.addChild( closeButton );

      var updateClosePosition = function() {
        closeButton.right = dialogContent.right + options.xMargin - options.closeButtonMargin;
        closeButton.top = dialogContent.top - options.xMargin + options.closeButtonMargin;
      };

      if ( options.resize ) {
        dialogContent.addEventListener( 'bounds', updateClosePosition );
        if ( options.title ) {
          options.title.addEventListener( 'bounds', updateClosePosition );
        }
      }
      updateClosePosition();
    }

    var sim = window.phet.joist.sim;

    function updateLayout() {
      options.layoutStrategy( dialog, sim.bounds, sim.screenBounds, sim.scale );
    }

    sim.on( 'resized', updateLayout );
    updateLayout();
  }

  Dialog.DEFAULT_LAYOUT_STRATEGY = function( dialog, simBounds, screenBounds, scale ) {

    // The size is set in the Sim.topLayer, but we need to update the location here
    dialog.center = simBounds.center.times( 1.0 / scale );
  };

  return inherit( Panel, Dialog, {
    show: function() {
      window.phet.joist.sim.showPopup( this, this.isModal );
    },

    hide: function() {
      window.phet.joist.sim.hidePopup( this, this.isModal );
    }
  } );
} );