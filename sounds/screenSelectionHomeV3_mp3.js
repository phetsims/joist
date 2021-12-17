/* eslint-disable */
import asyncLoader from '../../phet-core/js/asyncLoader.js';
import base64SoundToByteArray from '../../tambo/js/base64SoundToByteArray.js';
import WrappedAudioBuffer from '../../tambo/js/WrappedAudioBuffer.js';
import phetAudioContext from '../../tambo/js/phetAudioContext.js';

const soundURI = 'data:audio/mpeg;base64,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';
const soundByteArray = base64SoundToByteArray( phetAudioContext, soundURI );
const unlock = asyncLoader.createLock( soundURI );
const wrappedAudioBuffer = new WrappedAudioBuffer();

// safe way to unlock
let unlocked = false;
const safeUnlock = () => {
  if ( !unlocked ) {
    unlock();
    unlocked = true;
  }
};

const onDecodeSuccess = decodedAudio => {
  if ( wrappedAudioBuffer.audioBufferProperty.value === null ) {
    wrappedAudioBuffer.audioBufferProperty.set( decodedAudio );
    safeUnlock();
  }
};
const onDecodeError = decodeError => {
  console.warn( 'decode of audio data failed, using stubbed sound, error: ' + decodeError );
  wrappedAudioBuffer.audioBufferProperty.set( phetAudioContext.createBuffer( 1, 1, phetAudioContext.sampleRate ) );
  safeUnlock();
};
const decodePromise = phetAudioContext.decodeAudioData( soundByteArray.buffer, onDecodeSuccess, onDecodeError );
if ( decodePromise ) {
  decodePromise
    .then( decodedAudio => {
      if ( wrappedAudioBuffer.audioBufferProperty.value === null ) {
        wrappedAudioBuffer.audioBufferProperty.set( decodedAudio );
        safeUnlock();
      }
    } )
    .catch( e => {
      console.warn( 'promise rejection caught for audio decode, error = ' + e );
      safeUnlock();
    } );
}
export default wrappedAudioBuffer;