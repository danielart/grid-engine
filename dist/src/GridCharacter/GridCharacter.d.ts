import { LayerPosition } from "./../Pathfinding/ShortestPathAlgorithm";
import { NumberOfDirections } from "./../Direction/Direction";
import { Direction } from "../Direction/Direction";
import { GridTilemap, LayerName } from "../GridTilemap/GridTilemap";
import { Subject } from "rxjs";
import { Position } from "../GridEngine";
import { Movement } from "../Movement/Movement";
import { Vector2 } from "../Utils/Vector2/Vector2";
import * as Phaser from "phaser";
export declare type GameObject = Phaser.GameObjects.Container | Phaser.GameObjects.Sprite;
export interface PositionChange {
    exitTile: Position;
    enterTile: Position;
    exitLayer: LayerName;
    enterLayer: LayerName;
}
export interface CharConfig {
    tilemap: GridTilemap;
    speed: number;
    collidesWithTiles: boolean;
    numberOfDirections: NumberOfDirections;
    charLayer?: string;
    collisionGroups?: string[];
    facingDirection?: Direction;
    labels?: string[];
}
export declare class GridCharacter {
    private id;
    protected tilemap: GridTilemap;
    private movementDirection;
    private _tilePos;
    private speed;
    private movementStarted$;
    private movementStopped$;
    private directionChanged$;
    private positionChangeStarted$;
    private positionChangeFinished$;
    private tilePositionSet$;
    private autoMovementSet$;
    private lastMovementImpulse;
    private facingDirection;
    private movement?;
    private collidesWithTilesInternal;
    private collisionGroups;
    private depthChanged$;
    private movementProgress;
    private labels;
    private numberOfDirections;
    constructor(id: string, config: CharConfig);
    getId(): string;
    getSpeed(): number;
    setSpeed(speed: number): void;
    setMovement(movement?: Movement): void;
    getMovement(): Movement | undefined;
    collidesWithTiles(): boolean;
    setTilePosition(tilePosition: LayerPosition): void;
    getTilePos(): LayerPosition;
    getNextTilePos(): LayerPosition;
    move(direction: Direction): void;
    update(delta: number): void;
    getMovementDirection(): Direction;
    isBlockingDirection(direction: Direction): boolean;
    isMoving(): boolean;
    turnTowards(direction: Direction): void;
    getFacingDirection(): Direction;
    getFacingPosition(): Vector2;
    addCollisionGroup(collisionGroup: string): void;
    setCollisionGroups(collisionGroups: string[]): void;
    getCollisionGroups(): string[];
    hasCollisionGroup(collisionGroup: string): boolean;
    removeCollisionGroup(collisionGroup: string): void;
    removeAllCollisionGroups(): void;
    addLabels(labels: string[]): void;
    getLabels(): string[];
    hasLabel(label: string): boolean;
    clearLabels(): void;
    removeLabels(labels: string[]): void;
    getNumberOfDirections(): NumberOfDirections;
    movementStarted(): Subject<Direction>;
    movementStopped(): Subject<Direction>;
    directionChanged(): Subject<Direction>;
    tilePositionSet(): Subject<LayerPosition>;
    positionChangeStarted(): Subject<PositionChange>;
    positionChangeFinished(): Subject<PositionChange>;
    autoMovementSet(): Subject<Movement | undefined>;
    depthChanged(): Subject<LayerPosition>;
    getMovementProgress(): number;
    hasWalkedHalfATile(): boolean;
    private updateCharacterPosition;
    private get tilePos();
    private set tilePos(value);
    private startMoving;
    private tilePosInDirection;
    private shouldContinueMoving;
    private stopMoving;
    private fire;
}
