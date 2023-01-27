// Copyright 2022-2023, University of Colorado Boulder

/**
 * DynamicStringTest is a handler for KeyboardEvents. It's used for testing dynamic layout in sims that may not yet
 * have submitted translations, and is enabled via ?stringTest=dynamic. Please see initialize-globals or method
 * handleEvent below for the keys that are handled. See https://github.com/phetsims/chipper/issues/1319 for history.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Marla Schulz (PhET Interactive Simulations)
 * @author Chris Malley (PixelZoom, Inc.)
 */

import { localizedStrings } from '../../chipper/js/getStringModule.js';
import Utils from '../../dot/js/Utils.js';
import joist from './joist.js';

const INITIAL_STRING_FACTOR = 1;
const MAX_STRING_FACTOR = 8; // so that the sim and/or browser doesn't lock up when strings get excessively long
const MIN_STRING_FACTOR = 0.01;
const INITIAL_STRIDE = 0;

// Source of 'random' words
const WORD_SOURCE = 'Sometimes when Hippopotomonstrosesquippedaliophobia want lyrics you turn to Shakespeare like ' +
                    'the following text copied from some work ' +
                    'To be or not to be that is the question ' +
                    'Supercalifragilisticexpeladocious tis nobler in the mind to suffer ' +
                    'The slings and arrows of antidisestablishmentarianism fortune ' +
                    'Or to take Incomprehensibility against a sea of Floccinaucinihilipilification';

export default class DynamicStringTest {

  // How much to increase or decrease the length of the string. Its value must be > 0.
  private stringFactor = INITIAL_STRING_FACTOR;

  // Non-negative integer used to create an index into WORDS.
  private stride = INITIAL_STRIDE;

  // Words of different lengths that can be cycled through by changing stride
  private static readonly WORDS = WORD_SOURCE.split( ' ' );

  /**
   * Handles a KeyboardEvent.
   */
  public handleEvent( event: KeyboardEvent ): void {
    if ( event.code === 'ArrowLeft' ) {
      this.halveStrings();
    }
    else if ( event.code === 'ArrowRight' ) {
      this.doubleStrings();
    }
    else if ( event.code === 'ArrowUp' ) {
      this.setStride( this.stride + 1 );
    }
    else if ( event.code === 'ArrowDown' ) {
      this.setStride( this.stride - 1 );
    }
    else if ( event.code === 'Space' ) {
      this.reset();
    }
  }

  /**
   * Doubles the length of all strings.
   */
  private doubleStrings(): void {
    this.setStringFactor( Math.min( this.stringFactor * 2, MAX_STRING_FACTOR ) );
  }

  /**
   * Halves the length of all strings.
   */
  private halveStrings(): void {
    this.setStringFactor( Math.max( this.stringFactor * 0.5, MIN_STRING_FACTOR ) );
  }

  /**
   * Sets a new stringFactor, and applies that stringFactor to all strings.
   */
  private setStringFactor( stringFactor: number ): void {
    assert && assert( stringFactor > 0, `stringFactor must be > 0: ${stringFactor}` );

    this.stringFactor = stringFactor;
    console.log( `stringFactor = ${this.stringFactor}` );
    applyToAllStrings( this.stringFactor );
  }

  /**
   * Sets a new stride value, and causes strings to be set to values from the WORDS array.
   */
  private setStride( newStride: number ): void {
    assert && assert( Number.isInteger( newStride ), `newStride must be an integer: ${newStride}` );

    const words = DynamicStringTest.WORDS;

    // Handle wraparound.
    if ( newStride > words.length - 1 ) {
      newStride = 0;
    }
    else if ( newStride < 0 ) {
      newStride = words.length - 1;
    }

    this.stride = newStride;
    console.log( `stride = ${this.stride}` );

    // Set each string to a word from WORDS.
    localizedStrings.forEach( ( localizedString, index ) => {
      localizedString.property.value = words[ ( index + this.stride ) % words.length ];
    } );
  }

  /**
   * Resets stride and stringFactor.
   */
  private reset(): void {
    this.setStride( INITIAL_STRIDE );
    this.setStringFactor( INITIAL_STRING_FACTOR ); // reset stringFactor last, so that strings are reset to initial values
  }
}

/**
 * Applies stringFactor to all strings.
 */
function applyToAllStrings( stringFactor: number ): void {
  localizedStrings.forEach( localizedString => {

    // Restore the string to its initial value.
    localizedString.restoreInitialValue( 'en' );

    if ( stringFactor !== 1 ) {

      // Strip out all RTL (U+202A), LTR (U+202B), and PDF (U+202C) characters from string.
      const strippedString = localizedString.property.value.replace( /[\u202A\u202B\u202C]/g, '' );
      localizedString.property.value = applyToString( stringFactor, strippedString );
    }
  } );
}

/**
 * Applies stringFactor to one string.
 */
function applyToString( stringFactor: number, string: string ): string {
  assert && assert( stringFactor > 0, `stringFactor must be > 0: ${stringFactor}` );

  if ( stringFactor > 1 ) {
    return doubleString( string, stringFactor );
  }
  else {

    // Create an array of all placeholders that are present in the string. Each placeholder is a substrings surrounded
    // by 2 sets of curly braces, like '{{value}}'. This will be an empty array if no match is found.
    const placeholders = string.match( /{{(.+?)}}/g ) || [];

    // Remove all placeholders from the string.
    const noPlaceholdersString = string.replace( /{{(.+?)}}/g, '' );

    // Reduce the length of the string.
    const stringLength = Utils.toFixedNumber( noPlaceholdersString.length * stringFactor + 1, 0 );
    const reducedString = noPlaceholdersString.substring( 0, stringLength );

    // Append placeholders to the end of the reduced string. This will add nothing if placeholders is empty.
    return reducedString + placeholders.join( '' );
  }
}

/**
 * Doubles a string n times.
 */
function doubleString( string: string, n: number ): string {
  let growingString = string;
  while ( n > 1 ) {
    growingString += string;
    n -= 1;
  }
  return growingString;
}

joist.register( 'DynamicStringTest', DynamicStringTest );