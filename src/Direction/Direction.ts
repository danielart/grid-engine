import * as Phaser from "phaser";

const Vector2 = Phaser.Math.Vector2;
type Vector2 = Phaser.Math.Vector2;

export enum Direction {
  NONE = "none",
  LEFT = "left",
  UP_LEFT = "up-left",
  UP = "up",
  UP_RIGHT = "up-right",
  RIGHT = "right",
  DOWN_RIGHT = "down-right",
  DOWN = "down",
  DOWN_LEFT = "down-left",
}

export function getDirections(
  numberOfDirections: NumberOfDirections
): Direction[] {
  const directions = [
    Direction.UP,
    Direction.RIGHT,
    Direction.DOWN,
    Direction.LEFT,
  ];

  const diagonals = [
    Direction.DOWN_LEFT,
    Direction.DOWN_RIGHT,
    Direction.UP_RIGHT,
    Direction.UP_LEFT,
  ];

  if (numberOfDirections === NumberOfDirections.EIGHT) {
    return [...directions, ...diagonals];
  }
  return directions;
}

export function isDiagonal(direction: Direction): boolean {
  const diagonals = [
    Direction.DOWN_LEFT,
    Direction.DOWN_RIGHT,
    Direction.UP_RIGHT,
    Direction.UP_LEFT,
  ];
  return diagonals.includes(direction);
}

export function turnCounterClockwise(direction: Direction): Direction {
  const mapping = {
    [Direction.LEFT]: Direction.DOWN_LEFT,
    [Direction.UP_LEFT]: Direction.LEFT,
    [Direction.UP]: Direction.UP_LEFT,
    [Direction.UP_RIGHT]: Direction.UP,
    [Direction.RIGHT]: Direction.UP_RIGHT,
    [Direction.DOWN_RIGHT]: Direction.RIGHT,
    [Direction.DOWN]: Direction.DOWN_RIGHT,
    [Direction.DOWN_LEFT]: Direction.DOWN,
    [Direction.NONE]: Direction.NONE,
  };
  return mapping[direction];
}

export function directionVector(direction: Direction): Vector2 {
  const directionVectors = {
    [Direction.UP]: Vector2.UP.clone(),
    [Direction.DOWN]: Vector2.DOWN.clone(),
    [Direction.LEFT]: Vector2.LEFT.clone(),
    [Direction.RIGHT]: Vector2.RIGHT.clone(),
    [Direction.NONE]: Vector2.ZERO.clone(),
    [Direction.UP_LEFT]: new Vector2(-1, -1),
    [Direction.UP_RIGHT]: new Vector2(1, -1),
    [Direction.DOWN_RIGHT]: new Vector2(1, 1),
    [Direction.DOWN_LEFT]: new Vector2(-1, 1),
  };
  return directionVectors[direction];
}

export function oppositeDirection(direction: Direction): Direction {
  const oppositeDirections = {
    [Direction.UP]: Direction.DOWN,
    [Direction.DOWN]: Direction.UP,
    [Direction.LEFT]: Direction.RIGHT,
    [Direction.RIGHT]: Direction.LEFT,
    [Direction.NONE]: Direction.NONE,
    [Direction.UP_LEFT]: Direction.DOWN_RIGHT,
    [Direction.UP_RIGHT]: Direction.DOWN_LEFT,
    [Direction.DOWN_RIGHT]: Direction.UP_LEFT,
    [Direction.DOWN_LEFT]: Direction.UP_RIGHT,
  };
  return oppositeDirections[direction];
}

export enum NumberOfDirections {
  FOUR = 4,
  EIGHT = 8,
}
