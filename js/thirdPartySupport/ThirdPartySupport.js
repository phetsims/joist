// Copyright 2017-2019, University of Colorado Boulder

/**
 * Enumeration of third parties that PhET supports.  Each third party has its own type that sets up listeners for
 * communication between third party frames and the simulation.
 * 
 * @author Jesse Greenberg
 */
define( require => {
  'use strict';

  const joist = require( 'JOIST/joist' );
  const LegendsOfLearningSupport = require( 'JOIST/thirdPartySupport/LegendsOfLearningSupport' );

  const ThirdPartySupport = {
    legendsOfLearning: LegendsOfLearningSupport
  };

  // verify that enum is immutable, without the runtime penalty in production code
  if ( assert ) { Object.freeze( ThirdPartySupport ); }

  joist.register( 'ThirdPartySupport', ThirdPartySupport );

  return ThirdPartySupport;
} );