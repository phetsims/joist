// Copyright 2017, University of Colorado Boulder

/**
 * Enumeration of third parties that PhET supports.  Each third party has its own type that sets up listeners for
 * communication between third party frames and the simulation.
 * 
 * @author Jesse Greenberg
 */
define( function( require ) {
  'use strict';

  var joist = require( 'JOIST/joist' );
  var LegendsOfLearningSupport = require( 'JOIST/thirdPartySupport/LegendsOfLearningSupport' );

  var ThirdPartySupport = {
    legendsOfLearning: LegendsOfLearningSupport
  };

  // verify that enum is immutable, without the runtime penalty in production code
  if ( assert ) { Object.freeze( ThirdPartySupport ); }

  joist.register( 'ThirdPartySupport', ThirdPartySupport );

  return ThirdPartySupport;
} );