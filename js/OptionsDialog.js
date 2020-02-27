// Copyright 2014-2019, University of Colorado Boulder

/**
 * Shows an Options dialog that consists of sim-global options.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 * @author Chris Malley (PixelZoom, Inc.)
 */

import inherit from '../../phet-core/js/inherit.js';
import merge from '../../phet-core/js/merge.js';
import PhetFont from '../../scenery-phet/js/PhetFont.js';
import Text from '../../scenery/js/nodes/Text.js';
import Dialog from '../../sun/js/Dialog.js';
import Tandem from '../../tandem/js/Tandem.js';
import joistStrings from './joist-strings.js';
import joist from './joist.js';

const optionsTitleString = joistStrings.options.title;

/**
 * @param {function(tandem:Tandem):Node} createContent - creates the dialog's content
 * @param {Object} [options]
 * @constructor
 */
function OptionsDialog( createContent, options ) {

  options = merge( {

    titleAlign: 'center',
    bottomMargin: 20,
    ySpacing: 20,

    // phet-io
    tandem: Tandem.REQUIRED,
    phetioDynamicElement: true
  }, options );

  assert && assert( !options.title, 'OptionsDialog sets title' );
  options.title = new Text( optionsTitleString, {
    font: new PhetFont( 30 ),
    maxWidth: 400, // determined empirically
    tandem: options.tandem.createTandem( 'title' )
  } );

  const content = createContent( options.tandem.createTandem( 'content' ) );

  Dialog.call( this, content, options );
}

joist.register( 'OptionsDialog', OptionsDialog );

export default inherit( Dialog, OptionsDialog, {}, {
  DEFAULT_FONT: new PhetFont( 15 ),
  DEFAULT_SPACING: 10
} );