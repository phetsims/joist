// Copyright 2014-2020, University of Colorado Boulder

/**
 * Shows an Options dialog that consists of sim-global options.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 * @author Chris Malley (PixelZoom, Inc.)
 */

import merge from '../../phet-core/js/merge.js';
import PhetFont from '../../scenery-phet/js/PhetFont.js';
import Text from '../../scenery/js/nodes/Text.js';
import Dialog from '../../sun/js/Dialog.js';
import Tandem from '../../tandem/js/Tandem.js';
import joist from './joist.js';
import joistStrings from './joistStrings.js';

class OptionsDialog extends Dialog {

  /**
   * @param {function(tandem:Tandem):Node} createContent - creates the dialog's content
   * @param {Object} [options]
   */
  constructor( createContent, options ) {

    options = merge( {

      titleAlign: 'center',
      bottomMargin: 26,
      ySpacing: 26,

      // phet-io
      tandem: Tandem.REQUIRED,
      phetioDynamicElement: true
    }, options );

    assert && assert( !options.title, 'OptionsDialog sets title' );
    options.title = new Text( joistStrings.options.title, {
      font: new PhetFont( 30 ),
      maxWidth: 400, // determined empirically
      tandem: options.tandem.createTandem( 'title' )
    } );

    const content = createContent( options.tandem.createTandem( 'content' ) );

    super( content, options );

    // @private
    this.disposeOptionsDialog = () => {
      content.dispose();
      options.title.dispose();
    };
  }

  /**
   * @public
   * @override
   */
  dispose() {
    this.disposeOptionsDialog();
    super.dispose();
  }
}

OptionsDialog.DEFAULT_FONT = new PhetFont( 20 );
OptionsDialog.DEFAULT_SPACING = 14;

joist.register( 'OptionsDialog', OptionsDialog );
export default OptionsDialog;