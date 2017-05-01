// Copyright 2014-2015, University of Colorado Boulder

/**
 * General dialog type
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Shape = require( 'KITE/Shape' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Path = require( 'SCENERY/nodes/Path' );
  var Input = require( 'SCENERY/input/Input' );
  var Panel = require( 'SUN/Panel' );
  var RectangularPushButton = require( 'SUN/buttons/RectangularPushButton' );
  var joist = require( 'JOIST/joist' );
  var JoistA11yStrings = require( 'JOIST/JoistA11yStrings' );
  var AriaHerald = require( 'SCENERY_PHET/accessibility/AriaHerald' );
  var Tandem = require( 'TANDEM/Tandem' );

  var closeString = JoistA11yStrings.closeString;

  /**
   * @param {Node} content - The content to display inside the dialog (not including the title)
   * @param {Object} [options]
   * @constructor
   */
  function Dialog( content, options ) {

    var self = this;
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
      closeButtonBaseColor: '#d00',
      closeButtonMargin: 5, // {number} how far away should the close button be from the panel border
      tandem: Tandem.tandemRequired(),

      // a11y options
      tagName: 'div',
      ariaRole: 'dialog',
      focusOnCloseNode: null // {Node} receives focus on close, if null focus returns to element that had focus on open
    }, options );

    // @private (read-only)
    this.isModal = options.modal;

    // see https://github.com/phetsims/joist/issues/293
    assert && assert( this.isModal, 'Non-modal dialogs not currently supported' );

    // @private - whether the dialog is showing
    this.isShowing = false;

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
        content.on( 'bounds', updateTitlePosition );
        titleNode.on( 'localBounds', updateTitlePosition );
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

      var closeButtonTandem = options.tandem && options.tandem.createTandem( 'closeButton' );
      var closeButton = new RectangularPushButton( {
        content: crossNode,
        baseColor: options.closeButtonBaseColor,
        xMargin: 5,
        yMargin: 5,
        listener: function() { 
          self.hide();
        },
        accessibleFire: function() {
          self.focusActiveElement();
        },
        tandem: closeButtonTandem,

        // a11y options
        tagName: 'button',
        accessibleLabel: closeString
      } );
      this.addChild( closeButton );

      var updateClosePosition = function() {
        closeButton.right = dialogContent.right + options.xMargin - options.closeButtonMargin;
        closeButton.top = dialogContent.top - options.xMargin + options.closeButtonMargin;

        // place the focus highlight, and make it a bit bigger than the 
        closeButton.focusHighlight = Shape.bounds( crossNode.bounds.dilated( 10 ) );
      };

      //TODO memory leak, see https://github.com/phetsims/joist/issues/357
      if ( options.resize ) {
        dialogContent.on( 'bounds', updateClosePosition );
        if ( options.title ) {
          options.title.on( 'bounds', updateClosePosition );
        }
      }
      updateClosePosition();
    }

    var sim = window.phet.joist.sim;

    // @private
    this.updateLayout = function() {
      options.layoutStrategy( self, sim.boundsProperty.value, sim.screenBoundsProperty.value, sim.scaleProperty.value );
    };

    this.updateLayout();

    // @private
    this.sim = sim;

    // a11y - set the order of content for accessibility, title before content
    this.accessibleOrder = [ titleNode, dialogContent ];

    // a11y - set the aria labelledby and describedby relations so that whenever focus enters the dialog, the title
    // and description content are read in full
    content.domElement && this.setAriaDescribedByElement( content.domElement );
    if ( options.title ) {
      options.title.domElement && this.setAriaLabelledByElement( options.title.domElement );
    }

    // @private (a11y) - the active element when the dialog is shown, tracked so that focus can be restored on close
    this.activeElement = options.focusOnCloseNode || null;

    // @private - add the input listeners for accessibility when the dialog is shown
    // the listeners must be added when shown because all listeners are removed
    // when the dialog is hidden
    var escapeListener;
    this.addAccessibleInputListeners = function() {

      // close the dialog when the user presses 'escape'
      escapeListener = this.addAccessibleInputListener( {
        keydown: function( event ) {
          if ( event.keyCode === Input.KEY_ESCAPE ) {
            self.hide();
            self.focusActiveElement();
          }
        }
      } );
    };

    // @private - remove listeners so that the dialog is eligible for garbage collection
    // called every time the dialog is hidden
    this.disposeDialog = function() {
      self.sim.resizedEmitter.removeListener( self.updateLayout );
      self.removeAccessibleInputListener( escapeListener );

      if ( options.hasCloseButton ) {
        closeButtonTandem && closeButtonTandem.removeInstance( closeButton );
      }
    };
  }

  joist.register( 'Dialog', Dialog );

  // @private
  Dialog.DEFAULT_LAYOUT_STRATEGY = function( dialog, simBounds, screenBounds, scale ) {

    // The size is set in the Sim.topLayer, but we need to update the location here
    dialog.center = simBounds.center.times( 1.0 / scale );
  };

  return inherit( Panel, Dialog, {

    // @public
    show: function() {
      if ( !this.isShowing ) {
        window.phet.joist.sim.showPopup( this, this.isModal );
        this.isShowing = true;
        this.sim.resizedEmitter.addListener( this.updateLayout );

        // a11y - add the listeners that will close the dialog on 
        this.addAccessibleInputListeners();

        // a11y - store the currently active element, set before hiding views so that document.activeElement
        // isn't blurred
        this.activeElement = this.activeElement || document.activeElement;

        // a11y - hide all ScreenView content from assistive technology when the dialog is shown
        this.setAccessibleViewsHidden( true );

        // In case the window size has changed since the dialog was hidden, we should try layout out again.
        // See https://github.com/phetsims/joist/issues/362
        this.updateLayout();
      }
    },

    // @public
    hide: function() {
      if ( this.isShowing ) {
        window.phet.joist.sim.hidePopup( this, this.isModal );
        this.isShowing = false;

        // dispose dialog - a new one will be created on show()        
        this.disposeDialog();

        // a11y - when the dialog is hidden, unhide all ScreenView content from assistive technology
        this.setAccessibleViewsHidden( false );
      }
    },

    /**
     * Hide or show all accessible content related to the sim ScreenViews, navigation bar, and alert content.
     * 
     * @param {boolean} hidden
     */
    setAccessibleViewsHidden: function( hidden ) {
      for ( var i = 0; i < this.sim.screens.length; i++ ) {
        this.sim.screens[ i ].view.accessibleHidden = hidden;
      }
      this.sim.navigationBar.accessibleHidden = hidden;

      // workaround for a strange Edge bug where this child of the navigation bar remains hidden,
      // see https://github.com/phetsims/a11y-research/issues/30
      this.sim.navigationBar.keyboardHelpButton.accessibleHidden = hidden;

      // clear the aria-live alert content from the DOM
      AriaHerald.clearAll();
    },

    /**
     * If there is an active element, focus it.  Should almost always be closed after the Dialog has been closed.
     * 
     * @public
     * @a11y
     */
    focusActiveElement: function() {
      this.activeElement && this.activeElement.focus();
    }
  } );
} );