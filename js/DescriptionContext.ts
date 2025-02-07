// Copyright 2023-2024, University of Colorado Boulder

/**
 * API Context for description plugins.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import CallbackTimer, { CallbackTimerOptions } from '../../axon/js/CallbackTimer.js';
import DerivedProperty from '../../axon/js/DerivedProperty.js';
import Multilink, { UnknownMultilink } from '../../axon/js/Multilink.js';
import TEmitter, { TEmitterListener, TReadOnlyEmitter } from '../../axon/js/TEmitter.js';
import TinyProperty from '../../axon/js/TinyProperty.js';
import TProperty from '../../axon/js/TProperty.js';
import TReadOnlyProperty, { PropertyLazyLinkListener, PropertyLinkListener, PropertyListener } from '../../axon/js/TReadOnlyProperty.js';
import LocalizedString from '../../chipper/js/browser/LocalizedString.js';
import dotRandom from '../../dot/js/dotRandom.js';
import Node, { NodeOptions } from '../../scenery/js/nodes/Node.js';
import DescriptionRegistry from '../../tandem/js/DescriptionRegistry.js';
import PhetioObject from '../../tandem/js/PhetioObject.js';
import Utterance, { UtteranceOptions } from '../../utterance-queue/js/Utterance.js';
import localeProperty, { Locale } from './i18n/localeProperty.js';
import joist from './joist.js';

export type DescriptionStrings = {
  locale: Locale;
};

export type DescriptionLogic = {
  launch( context: DescriptionContext, strings: DescriptionStrings ): void;
  added( tandemID: string, obj: PhetioObject ): void;
  removed( tandemID: string, obj: PhetioObject ): void;
  dispose(): void;
};

export default class DescriptionContext {

  private readonly links: Link[] = [];
  private readonly listens: Listen[] = [];
  private readonly assignments: Assignment[] = [];
  private readonly propertyAssignments: PropertyAssignment[] = [];
  private readonly multilinks: UnknownMultilink[] = [];
  private readonly disposables: { dispose(): void }[] = [];

  public get( tandemID: string ): PhetioObject | null {
    return DescriptionRegistry.map.get( tandemID ) || null;
  }

  public link( property: TReadOnlyProperty<unknown>, listener: PropertyLinkListener<unknown> ): void {
    // TS just... lets us do this?
    property.link( listener );

    this.links.push( new Link( property, listener ) );
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

  public createDerivedProperty( dependencies: TReadOnlyProperty<unknown>[], derivation: ( ...args: unknown[] ) => unknown ): TReadOnlyProperty<unknown> {
    const derivedProperty = DerivedProperty.deriveAny( dependencies, derivation );

    this.disposables.push( derivedProperty );

    return derivedProperty;
  }

  public multilink( dependencies: Readonly<TReadOnlyProperty<unknown>[]>, callback: () => void ): UnknownMultilink {
    const multilink = Multilink.multilinkAny( dependencies, callback );

    this.multilinks.push( multilink );

    return multilink;
  }

  public addListener( emitter: TReadOnlyEmitter<unknown[]>, listener: TEmitterListener<unknown[]> ): void {
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

    // eslint-disable-next-line phet/no-simple-type-checking-assertions
    assert && assert( typeof property === 'string', 'Node property name for the set should be a string' );

    // @ts-expect-error
    node[ property ] = value;
  }

  public propertySet( property: TProperty<unknown>, value: unknown ): void {
    const index = this.propertyAssignments.findIndex( assignment => assignment.property === property );
    if ( index < 0 ) {
      this.propertyAssignments.push( new PropertyAssignment( property, property.value ) );
    }

    property.value = value;
  }

  public createCallbackTimer( options?: CallbackTimerOptions ): CallbackTimer {
    const callbackTimer = new CallbackTimer( options );

    this.disposables.push( callbackTimer );

    return callbackTimer;
  }

  public createUtterance( options?: UtteranceOptions ): Utterance {
    const utterance = new Utterance( options );
    this.disposables.push( utterance );
    return utterance;
  }

  /**
   * Creates a Node through the context.
   *
   * TODO: Consider making the tagName required for this context? See https://github.com/phetsims/joist/issues/941
   */
  public createNode( options?: NodeOptions ): Node {
    const node = new Node( options );
    this.disposables.push( node );
    return node;
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
    while ( this.propertyAssignments.length ) {
      const assignment = this.propertyAssignments.pop()!;

      if ( !assignment.property.isDisposed ) {
        assignment.property.value = assignment.initialValue;
      }
    }
    while ( this.multilinks.length ) {
      const multilink = this.multilinks.pop()!;

      // @ts-expect-error TODO how to support this? https://github.com/phetsims/joist/issues/941
      if ( !multilink.isDisposed ) {
        multilink.dispose();
      }
    }

    // Dispose after disconnecting assignments so that everything is still usable when disconnecting.
    while ( this.disposables.length ) {
      const disposable = this.disposables.pop()!;

      disposable.dispose();
    }
  }

  // What is available and registered
  private static readonly stringsMap = new Map<Locale, DescriptionStrings>();
  private static readonly logicProperty = new TinyProperty<DescriptionLogic | null>( null );
  private static readonly isStartupCompleteProperty = new TinyProperty<boolean>( false );
  private static readonly activeContextProperty = new TinyProperty<DescriptionContext | null>( null );
  private static activeLogic: DescriptionLogic | null = null; // so we can control disposal

  public static startupComplete(): void {
    DescriptionContext.isStartupCompleteProperty.value = true;

    localeProperty.link( () => this.reload() );

    DescriptionRegistry.addedEmitter.addListener( ( tandemID, obj ) => {
      const logic = this.logicProperty.value;
      if ( this.activeContextProperty.value && logic ) {
        logic.added( tandemID, obj );
      }
    } );

    DescriptionRegistry.removedEmitter.addListener( ( tandemID, obj ) => {
      const logic = this.logicProperty.value;
      if ( this.activeContextProperty.value && logic ) {
        logic.removed( tandemID, obj );
      }
    } );
  }

  private static reload(): void {
    // If we haven't started up yet, don't do anything (we'll reload when we start up).
    if ( !this.isStartupCompleteProperty.value ) {
      return;
    }

    if ( DescriptionContext.activeLogic ) {
      DescriptionContext.activeLogic.dispose();
      DescriptionContext.activeLogic = null;
    }

    if ( this.activeContextProperty.value ) {
      this.activeContextProperty.value.dispose();
    }

    const logic = this.logicProperty.value;

    if ( logic === null ) {
      return;
    }

    const fallbackLocales = LocalizedString.getLocaleFallbacks();

    const strings: DescriptionStrings = {} as DescriptionStrings;
    let addedStrings = false;

    // Search in locale fallback order for the best description strings to use. We'll pull out each individual
    // function with fallback.
    for ( let i = fallbackLocales.length - 1; i >= 0; i-- ) {
      const locale = fallbackLocales[ i ];

      if ( DescriptionContext.stringsMap.has( locale ) ) {
        addedStrings = true;

        const localeStrings = DescriptionContext.stringsMap.get( locale )!;
        for ( const key of Object.keys( localeStrings ) ) {
          // @ts-expect-error
          strings[ key ] = localeStrings[ key ];
        }
      }
    }

    if ( !addedStrings ) {
      return;
    }

    this.activeContextProperty.value = new DescriptionContext();
    DescriptionContext.activeLogic = logic;

    logic.launch( this.activeContextProperty.value, strings );
  }

  public static registerStrings( strings: DescriptionStrings ): DescriptionStrings {
    const needsReload = LocalizedString.getLocaleFallbacks().includes( strings.locale );

    DescriptionContext.stringsMap.set( strings.locale, strings );

    if ( needsReload ) {
      DescriptionContext.reload();
    }

    return strings;
  }

  public static registerLogic( logic: DescriptionLogic ): DescriptionLogic {
    DescriptionContext.logicProperty.value = logic;

    DescriptionContext.reload();

    return logic;
  }

  public static async externalLoad( str: string ): Promise<Error | null> {
    const dataURI = `data:text/javascript;base64,${btoa( `${dotRandom.nextDouble()};${str}` )}`;

    try {
      ( await import( dataURI ) ).default();
      return null;
    }
    catch( e ) {
      return new ExternalLoadError( e as Error, dataURI );
    }
  }
}

export class ExternalLoadError extends Error {

  public readonly line: number;
  public readonly column: number;

  public constructor( public readonly error: Error, dataURI: string ) {
    // NOTE: this is a guard for the above cast to Error.
    // eslint-disable-next-line phet/no-simple-type-checking-assertions
    assert && assert( error instanceof Error );

    super( error.message );

    let stack = error.stack;
    let line = 0;
    let column = 0;

    if ( stack && stack.includes( dataURI ) ) {
      stack = stack.slice( stack.indexOf( dataURI ) + dataURI.length );

      // Parse the first two numbers out of the stack string. It will look like ":10:15)\n" or ":10:15\n", etc.
      const match = stack.match( /:(\d+):(\d+)/ );
      if ( match ) {
        line = parseInt( match[ 1 ], 10 );
        column = parseInt( match[ 2 ], 10 );
      }
    }

    this.line = line;
    this.column = column;
  }
}

class Link {
  public constructor(
    public readonly property: TReadOnlyProperty<unknown>,
    public readonly listener: PropertyListener<unknown>
  ) {}
}

class Listen {
  public constructor(
    public readonly emitter: TReadOnlyEmitter<unknown[]>,
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

class PropertyAssignment {
  public constructor(
    public readonly property: TProperty<unknown>,
    public readonly initialValue: unknown
  ) {}
}

joist.register( 'DescriptionContext', DescriptionContext );