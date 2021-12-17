/* eslint-disable */
import asyncLoader from '../../phet-core/js/asyncLoader.js';
import base64SoundToByteArray from '../../tambo/js/base64SoundToByteArray.js';
import WrappedAudioBuffer from '../../tambo/js/WrappedAudioBuffer.js';
import phetAudioContext from '../../tambo/js/phetAudioContext.js';

const soundURI = 'data:audio/mpeg;base64,//swxAACBbQfAa1vAjjzBGF2uiAGAAAAVtwAAAB7yZwNh6oRieZxJ6ZAiC/ATEjWf4paPzHKWsS3vMPHu8R6o/M8eAnZcHGwD9C4jQ2xTmNgzZHbzxk5zD0HTBEWTHspzBMqDK8KxIF37fd35ff/MUdUL/Ebxn9X8v1v6Fr/qUoAAAAEOAWfACgXUDbgA1LRszBjFcN1Q5A37hmD//syxA4ACgAhKbngkhD9BGDHvgAGGWHvMr8isweRLzBiAgMNQMkxCAAAEEEBgeVczyMNGKtsf6F4Giv/rT/odb3f/NeUfP4tFRANCwGGTlYyyEw/cJjMePwAT7SyQczJUPyKoQwYKqCgmCeiMBgE4FSYDIBVgYCxMAaABwCAANnj7qmgbL//++oAAACT1PNJAHxGinXcyGFGEMY9Mv/7MsQKAAcgGyWu+0Bw1gNkqey8jtZp4mrGBaEuYskFTJir6hjU38h9pGJE1e6j2dP16PZ0+3/r0e0AEfK5YkoDQMIPEstTDOAsMYyMs59DMBoM08VQseAdGGgKwaNoyxP16PIbk+2fs9nT7f//tpoAAAJ72ShtQGa8BoaQQT5hFA5GMcVKdoQoJiOAPgkrOATlQcDhXSQ2qmoydr3/+zLEFoJHJBsnr2GEcMsDZPXfYEaeS3N//s7fTvR/p/SFN8xoeGOEfTDSZ6D6YHbMbFxFJgYAxBqwaRl6p2KP3OOIqcUqvattP9yPq0/6PZv//9MAAAKTiC1xwHUiuHc40mB8CKYCqQx3mymHxcm6GBZP17maxazTein9P+j6m0+3o9llP/9lIOZgrByCHtnZWY4ZiqUpj4uvGhXg//swxCSCBowbJa77gDDRg2Il7+xGuBg9YF4Jpo0hixIXkQQs+iqhVNf1f0r//9v/sd/b/k0AAAAKcFJBzzB8nPiVAZdJYBiuEJnyGdkYSIe5+JIBOnyxgEWjVUbPleFtdPVo//7aPTRZ9bP//pCu9FwMmga40MyCTMMhDE7Fz7dKMIDElBibcARSRyHt9Bnbq/s3pQAAAANVnW6Q//syxDOCRxAfD49rBDCZA2N17vAGCA4OIM4qpYxYOwwIzM5oCgxiAktuxQi1OBF1E6XJqSZp0fRZ+j+zp////SAA0iQCsAHUo9Ia9HYZvsF6GoXAqf9il5jeBrH0jZkRcd+mtIOAlu7GetVcvLMd3/p//9lH/YoAAAXgGg7h7VkfY5r0nAFGMhRQdmDlw/OW+eialAABX+GAANouzf/7MsRIAgZsGxXuvMYw2AReve3ghCHw7VaMOCTf7AkcLBW2GGCSRH8ABzEFogX0VXiamZeIAAAANmlTC4o1mzOAYj1V86QwPjSTpkY95TRZARC/grAwJq4SVhZMQU1FMy45OS41VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/+zLEVwBDmBsIjeeAOI2FXrW9GE5VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//swxHqDxWAq183lZngAADSAAAAEVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV';
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