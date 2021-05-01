import { ShortestPathAlgorithm } from "./../ShortestPathAlgorithm";
import * as Phaser from "phaser";
declare const Vector2: typeof Phaser.Math.Vector2;
declare type Vector2 = Phaser.Math.Vector2;
export declare class Bfs implements ShortestPathAlgorithm {
    getShortestPath(startPos: Vector2, targetPos: Vector2, getNeighbours: (pos: Vector2) => Vector2[]): {
        path: Vector2[];
        closestToTarget: Vector2;
    };
    private shortestPathBfs;
    private returnPath;
}
export {};
