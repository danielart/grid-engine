import { filter, takeUntil, take } from "rxjs/operators";
import { GridTilemap, LayerName } from "../../GridTilemap/GridTilemap";
import { GridCharacter } from "../../GridCharacter/GridCharacter";
import { TargetMovement } from "../TargetMovement/TargetMovement";
import { Movement, MovementInfo } from "../Movement";
import { Vector2 } from "../../Utils/Vector2/Vector2";
import { Position } from "../../GridEngine";
import { NoPathFoundStrategy } from "../../Pathfinding/NoPathFoundStrategy";

export class FollowMovement implements Movement {
  private targetMovement?: TargetMovement;

  constructor(
    private character: GridCharacter,
    private gridTilemap: GridTilemap,
    private charToFollow: GridCharacter,
    private distance = 0,
    private noPathFoundStrategy: NoPathFoundStrategy = NoPathFoundStrategy.STOP
  ) {
    this.character = character;
    this.updateTarget(
      this.charToFollow.getTilePos().position,
      this.charToFollow.getTilePos().layer
    );
    this.charToFollow
      .positionChangeStarted()
      .pipe(
        takeUntil(
          this.character.autoMovementSet().pipe(
            take(1),
            filter((movement) => movement !== this)
          )
        )
      )
      .subscribe(({ enterTile, enterLayer }) => {
        this.updateTarget(enterTile, enterLayer);
      });
  }

  update(delta: number): void {
    this.targetMovement?.update(delta);
  }

  getInfo(): MovementInfo {
    return {
      type: "Follow",
      config: {
        charToFollow: this.charToFollow.getId(),
        distance: this.distance,
        noPathFoundStrategy: this.noPathFoundStrategy,
      },
    };
  }

  private updateTarget(targetPos: Position, targetLayer: LayerName): void {
    this.targetMovement = new TargetMovement(
      this.character,
      this.gridTilemap,
      {
        position: new Vector2(targetPos),
        layer: targetLayer,
      },
      {
        distance: this.distance + 1,
        config: { noPathFoundStrategy: this.noPathFoundStrategy },
        ignoreBlockedTarget: true,
      }
    );
  }
}
