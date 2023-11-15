// Copyright 2023, University of Colorado Boulder

/**
 * API Context for description plugins.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import { Node } from '../../scenery/js/imports.js';
import joist from './joist.js';
import PhetioObject from '../../tandem/js/PhetioObject.js';
import DescriptionRegistry from '../../tandem/js/DescriptionRegistry.js';
import TReadOnlyProperty, { PropertyLazyLinkListener } from '../../axon/js/TReadOnlyProperty.js';
import TEmitter, { TEmitterListener } from '../../axon/js/TEmitter.js';

export default class DescriptionContext {

  private readonly links: Link[] = [];
  private readonly listens: Listen[] = [];
  private readonly assignments: Assignment[] = [];

  public getOptional( tandemID: string ): PhetioObject | null {
    return DescriptionRegistry.map.get( tandemID ) || null;
  }

  public get( tandemID: string ): PhetioObject {
    const obj = this.getOptional( tandemID );

    assert && assert( obj !== null );

    return obj!;
  }

  public lazyLink( property: TReadOnlyProperty<unknown>, listener: PropertyLazyLinkListener<unknown> ): void {
    // TS just... lets us do this?
    property.lazyLink( listener );

    this.links.push( new Link( property, listener ) );
  }

  public unlink( property: TReadOnlyProperty<unknown>, listener: PropertyLazyLinkListener<unknown> ): void {
    property.unlink( listener );

    const index = this.links.findIndex( link => link.property === property && link.listener === listener );

    assert && assert( index >= 0 );

    this.links.splice( index, 1 );
  }

  public addListener( emitter: TEmitter<unknown[]>, listener: TEmitterListener<unknown[]> ): void {
    emitter.addListener( listener );

    this.listens.push( new Listen( emitter, listener ) );
  }

  public removeListener( emitter: TEmitter<unknown[]>, listener: TEmitterListener<unknown[]> ): void {
    emitter.removeListener( listener );

    const index = this.listens.findIndex( listen => listen.emitter === emitter && listen.listener === listener );

    assert && assert( index >= 0 );

    this.listens.splice( index, 1 );
  }

  public nodeSet( node: Node, property: keyof Node, value: unknown ): void {
    const index = this.assignments.findIndex( assignment => assignment.target === node && assignment.property === property );
    if ( index < 0 ) {
      this.assignments.push( new Assignment( node, property, node[ property ] ) );
    }

    // @ts-expect-error
    node[ property ] = value;
  }

  public dispose(): void {
    // NOTE: can links/listens be tied to a tandem/object? So that if we "remove" the object, we will assume it's disposed?

    while ( this.links.length ) {
      const link = this.links.pop()!;

      if ( !link.property.isDisposed ) {
        link.property.unlink( link.listener );
      }
    }
    while ( this.listens.length ) {
      const listen = this.listens.pop()!;

      // @ts-expect-error
      if ( !listen.emitter.isDisposed ) {
        listen.emitter.removeListener( listen.listener );
      }
    }
    while ( this.assignments.length ) {
      const assignment = this.assignments.pop()!;

      if ( !assignment.target.isDisposed ) {
        // @ts-expect-error
        assignment.target[ assignment.property ] = assignment.initialValue;
      }
    }
  }
}

class Link {
  public constructor(
    public readonly property: TReadOnlyProperty<unknown>,
    public readonly listener: PropertyLazyLinkListener<unknown>
  ) {}
}

class Listen {
  public constructor(
    public readonly emitter: TEmitter<unknown[]>,
    public readonly listener: TEmitterListener<unknown[]>
  ) {}
}

class Assignment {
  public constructor(
    public readonly target: Node,
    public readonly property: keyof Node,
    public readonly initialValue: string
  ) {}
}

joist.register( 'DescriptionContext', DescriptionContext );
