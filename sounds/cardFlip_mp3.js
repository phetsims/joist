/* eslint-disable */
/* @formatter:off */

import asyncLoader from '../../phet-core/js/asyncLoader.js';
import base64SoundToByteArray from '../../tambo/js/base64SoundToByteArray.js';
import WrappedAudioBuffer from '../../tambo/js/WrappedAudioBuffer.js';
import phetAudioContext from '../../tambo/js/phetAudioContext.js';

const soundURI = 'data:audio/mpeg;base64,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Ak9VmOWhIXESKVktJ2z4qoUibZXEhJVmo54y2pTCpKrkqInxtCMiURCZMUikUkts1JpZqUkLOLbHCI0RE1oSXNz+SbNkLMYykmzS0yFmTUlVCZ6udDBEKnkJlZCQhktiVP8kt2mGpHnoyCiA//u0xFQAFJGA2aSZNKMnNZKxzTAlCSoDGlYIaVGpygYYefKF0UpWkqkrtgp6HRRPZ5axHA+enRVOHHuXIak+k6KgHkM9YJwSlxO+7i7XWv7etVMjdXHJVJA/RPnrxiHQnFtT7Ubs7M81d1qM5hc9lw+EkhHZdLh2oMkqI6XmSVTa388cpVBk+crFS06YfpGtgvy6B6ubzT5iVVCpnL8ZJXz2BGeprtHKHFuQrC0SWDoeSoZnhGAiKi22w9p6SjtQfUMkPvmzPZvfXN6zV52lmQL/9EfSDeEzcSop1UxBTUUzLjk5LjVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//u0xAADwAAAAAAAACAAADSAAAAETEFNRTMuOTkuNVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVMQU1FMy45OS41VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV';
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