// Copyright 2017, University of Colorado Boulder

/**
 * TODO #393 document me
 *
 * @author - Michael Kauzmann (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var joist = require( 'JOIST/joist' );
  var Tandem = require( 'TANDEM/Tandem' );
  var FontAwesomeNode = require( 'SUN/FontAwesomeNode' );
  var Emitter = require( 'AXON/Emitter' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var ButtonListener = require( 'SCENERY/input/ButtonListener' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Text = require( 'SCENERY/nodes/Text' );
  var AccessiblePeer = require( 'SCENERY/accessibility/AccessiblePeer' );

  // phet-io modules
  var TMenuItem = require( 'ifphetio!PHET_IO/types/joist/TMenuItem' );

  // the check mark used for toggle-able menu items
  var CHECK_MARK_NODE = new FontAwesomeNode( 'check_without_box', {
    fill: 'rgba(0,0,0,0.7)',
    scale: 0.4
  } );

  // constants
  var FONT_SIZE = 18;
  var HIGHLIGHT_COLOR = '#a6d2f4';
  var MAX_ITEM_WIDTH = 400;
  var CHECK_PADDING = 2;  // padding between the check and text
  var CHECK_OFFSET = CHECK_MARK_NODE.width + CHECK_PADDING; // offset that includes the check mark's width and padding
  var LEFT_X_MARGIN = 2;
  var RIGHT_X_MARGIN = 5;
  var Y_MARGIN = 3;
  var CORNER_RADIUS = 5;

  //TODO #393 type expressions and documentation for params
  /**
   * @param text
   * @param width
   * @param height
   * @param separatorBefore
   * @param closeCallback
   * @param callback
   * @param checkedProperty
   * @param options
   * @constructor
   */
  function MenuItem( text, width, height, separatorBefore, closeCallback, callback, checkedProperty, options ) {
    
    var self = this;
    
    options = _.extend( {
      tandem: Tandem.tandemRequired(),
      textFill: 'black'
    }, options );

    Node.call( this, {
      cursor: 'pointer',
      textDescription: text + ' Button',
      tandem: options.tandem.createSupertypeTandem()
    } );
    
    var textNode = new Text( text, {
      font: new PhetFont( FONT_SIZE ),
      fill: options.textFill,
      maxWidth: MAX_ITEM_WIDTH
    } );
    
    var highlight = new Rectangle( 0, 0, width + LEFT_X_MARGIN + RIGHT_X_MARGIN + CHECK_OFFSET,
      height + Y_MARGIN + Y_MARGIN, CORNER_RADIUS, CORNER_RADIUS );

    this.addChild( highlight );
    this.addChild( textNode );

    textNode.left = highlight.left + LEFT_X_MARGIN + CHECK_OFFSET; // text is left aligned
    textNode.centerY = highlight.centerY;

    this.startedCallbacksForFiredEmitter = new Emitter();
    this.endedCallbacksForFiredEmitter = new Emitter();

    this.addInputListener( {
      enter: function() { highlight.fill = HIGHLIGHT_COLOR; },
      exit: function() { highlight.fill = null; }
    } );

    var fire = function( event ) {
      self.startedCallbacksForFiredEmitter.emit();
      closeCallback( event );
      callback( event );
      self.endedCallbacksForFiredEmitter.emit();
    };

    this.addInputListener( new ButtonListener( {
      fire: fire
    } ) );

    this.separatorBefore = separatorBefore;

    // if there is a check-mark property, add the check mark and hook up visibility changes
    var checkListener;
    if ( checkedProperty ) {
      var CHECK_MARK_NODEHolder = new Node( {
        children: [ CHECK_MARK_NODE ],
        right: textNode.left - CHECK_PADDING,
        centerY: textNode.centerY
      } );
      checkListener = function( isChecked ) {
        CHECK_MARK_NODEHolder.visible = isChecked;
      };
      checkedProperty.link( checkListener );
      this.addChild( CHECK_MARK_NODEHolder );
    }

    this.dispose = function() {
      if ( checkedProperty ) {
        checkedProperty.unlink( checkListener );
      }
    };

    // accessibility
    this.accessibleContent = {
      id: text,
      createPeer: function( accessibleInstance ) {
        // will look like <input id="menuItemId" value="Phet Button" type="button" tabIndex="0">
        var domElement = document.createElement( 'input' );
        domElement.type = 'button';
        domElement.value = text;
        domElement.tabIndex = '0';
        domElement.className = 'phetMenuItem';

        domElement.addEventListener( 'click', function() {
          // fire the listener
          fire();

          // if a modal dialog has opened, focus it immediately
          var openDialog = document.getElementsByClassName( 'Dialog' )[ 0 ];
          if ( openDialog ) {
            openDialog.focus();
          }
          // otherwise, we have been redirected to a new page so make sure screen view elements and PhET Button are back
          // in tab order.
          else {
            // all screen view elements are injected back into the navigation order.
            var screenViewElements = document.getElementsByClassName( 'ScreenView' );
            _.each( screenViewElements, function( element ) {
              element.hidden = false;
            } );

            // make sure that the phet button is also in the tab order
            document.getElementsByClassName( 'PhetButton' )[ 0 ].hidden = false;
          }
        } );

        return new AccessiblePeer( accessibleInstance, domElement );
      }
    };

    this.mutate( {
      tandem: options.tandem,
      phetioType: TMenuItem
    } );
  }

  joist.register( 'MenuItem', MenuItem );

  return inherit( Node, MenuItem );
} );

