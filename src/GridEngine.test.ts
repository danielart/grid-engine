import { Subject, of } from "rxjs";
import { take } from "rxjs/operators";
import * as Phaser from "phaser";
import { Direction } from "./Direction/Direction";
import { GridCharacter, PositionChange } from "./GridCharacter/GridCharacter";
const mockSetTilePositon = jest.fn();
const mockMove = jest.fn();
const mockUpdate = jest.fn();
const mockGetTilePos = jest.fn();
const mockAddCharacter = jest.fn();
const mockRemoveCharacter = jest.fn();
const mockTargetMovementRemoveCharacter = jest.fn();
const mockSetSpeed = jest.fn();
const mockSetWalkingAnimationMapping = jest.fn();
const mockRandomMovementUpdate = jest.fn();
const mockTargetMovementUpdate = jest.fn();
const mockTargetMovementAddCharacter = jest.fn();
const mockMovementStarted = jest.fn();
const mockMovementStopped = jest.fn();
const mockDirectionChanged = jest.fn();
const mockPositionChanged = jest.fn();
const mockIsMoving = jest.fn();
const mockFacingDirection = jest.fn();
const mockTurnTowards = jest.fn();
const mockFollowMovement = {
  addCharacter: jest.fn(),
  removeCharacter: jest.fn(),
  update: jest.fn(),
};
const mockGridTileMap = {
  addCharacter: jest.fn(),
  removeCharacter: jest.fn(),
  setCollisionTilePropertyName: jest.fn(),
};
const mockGridTilemapConstructor = jest.fn(function (
  _tilemap,
  _firstLayerAboveChar?
) {
  return mockGridTileMap;
});

const Vector2 = Phaser.Math.Vector2;
type Vector2 = Phaser.Math.Vector2;

expect.extend({
  toBeCharacter(receivedChar: GridCharacter, expectedCharId: string) {
    const pass = receivedChar.getId() == expectedCharId;
    if (pass) {
      return {
        message: () =>
          `expected ${receivedChar.getId()} not to be ${expectedCharId}`,
        pass: true,
      };
    } else {
      return {
        message: () =>
          `expected ${receivedChar.getId()} to be ${expectedCharId}`,
        pass: false,
      };
    }
  },
});

jest.mock("./GridTilemap/GridTilemap", function () {
  return {
    GridTilemap: mockGridTilemapConstructor,
  };
});
jest.mock("./GridCharacter/GridCharacter", function () {
  return {
    GridCharacter: jest.fn((id) => {
      return {
        setTilePosition: mockSetTilePositon,
        move: mockMove,
        update: mockUpdate,
        getId: () => id,
        getTilePos: mockGetTilePos,
        setSpeed: mockSetSpeed,
        setWalkingAnimationMapping: mockSetWalkingAnimationMapping,
        movementStarted: mockMovementStarted,
        movementStopped: mockMovementStopped,
        directionChanged: mockDirectionChanged,
        positionChanged: mockPositionChanged,
        isMoving: mockIsMoving,
        getFacingDirection: mockFacingDirection,
        turnTowards: mockTurnTowards,
      };
    }),
  };
});

jest.mock("./RandomMovement/RandomMovement", () => ({
  RandomMovement: jest.fn(() => ({
    addCharacter: mockAddCharacter,
    removeCharacter: mockRemoveCharacter,
    update: mockRandomMovementUpdate,
  })),
}));

jest.mock("./TargetMovement/TargetMovement", () => ({
  TargetMovement: jest.fn(() => ({
    addCharacter: mockTargetMovementAddCharacter,
    removeCharacter: mockTargetMovementRemoveCharacter,
    update: mockTargetMovementUpdate,
  })),
}));

jest.mock("./FollowMovement/FollowMovement", () => ({
  FollowMovement: jest.fn(function () {
    return mockFollowMovement;
  }),
}));

jest.mock("./GridTilemap/GridTilemap");

import { GridEngine } from "./GridEngine";

describe("GridEngine", () => {
  let gridEngine: GridEngine;
  let sceneMock;
  let pluginManagerMock;
  let tileMapMock;
  let playerSpriteMock;

  afterEach(() => {
    jest.clearAllMocks();
  });

  beforeEach(() => {
    // hacky way of avoiding errors in Plugin Initialization because Phaser
    // is not mockable by jest
    sceneMock = { sys: { events: { once: jest.fn(), on: jest.fn() } } };
    pluginManagerMock = {};
    tileMapMock = {
      layers: [
        {
          tilemapLayer: { scale: 2, setDepth: jest.fn() },
        },
      ],
      tileWidth: 16,
      tileHeight: 16,
      orientation: `${Phaser.Tilemaps.Orientation.ORTHOGONAL}`,
    };
    playerSpriteMock = {};
    mockTargetMovementUpdate.mockReset();
    mockRandomMovementUpdate.mockReset();
    mockRemoveCharacter.mockReset();
    mockTargetMovementRemoveCharacter.mockReset();
    mockUpdate.mockReset();
    mockFollowMovement.addCharacter.mockReset();
    mockFollowMovement.removeCharacter.mockReset();
    mockFollowMovement.update.mockReset();
    mockMovementStarted.mockReset().mockReturnValue(of());
    mockMovementStopped.mockReset().mockReturnValue(of());
    mockDirectionChanged.mockReset().mockReturnValue(of());
    mockPositionChanged.mockReset().mockReturnValue(of());
  });

  it("should boot", () => {
    gridEngine = new GridEngine(sceneMock, pluginManagerMock);
    gridEngine.boot();
    expect(sceneMock.sys.events.on).toHaveBeenCalledWith(
      "update",
      gridEngine.update,
      gridEngine
    );
  });

  it("should init tilemap", () => {
    gridEngine = new GridEngine(sceneMock, pluginManagerMock);
    gridEngine.create(tileMapMock, {
      characters: [
        {
          id: "player",
          sprite: playerSpriteMock,
          walkingAnimationMapping: 3,
        },
      ],
      collisionTilePropertyName: "custom_collision_prop",
    });
    expect(mockGridTilemapConstructor).toHaveBeenCalledWith(tileMapMock);
    expect(mockGridTileMap.setCollisionTilePropertyName).toHaveBeenCalledWith(
      "custom_collision_prop"
    );
  });

  it("should init tilemap with deprecated firstLayerAboveChar", () => {
    console.warn = jest.fn();
    gridEngine = new GridEngine(sceneMock, pluginManagerMock);
    gridEngine.create(tileMapMock, {
      characters: [
        {
          id: "player",
          sprite: playerSpriteMock,
          walkingAnimationMapping: 3,
        },
      ],
      firstLayerAboveChar: 3,
    });
    expect(mockGridTilemapConstructor).toHaveBeenCalledWith(tileMapMock, 3);
    expect(console.warn).toHaveBeenCalledWith(
      "GridEngine: Config property `firstLayerAboveChar` is deprecated. Use a property `alwaysTop` on the tilemap layers instead."
    );
  });

  it("should init player", () => {
    const containerMock = {};
    gridEngine = new GridEngine(sceneMock, pluginManagerMock);
    gridEngine.create(tileMapMock, {
      characters: [
        {
          id: "player",
          sprite: playerSpriteMock,
          container: <any>containerMock,
        },
      ],
      firstLayerAboveChar: 3,
    });
    expect(GridCharacter).toHaveBeenCalledWith("player", {
      sprite: playerSpriteMock,
      tilemap: mockGridTileMap,
      tileSize: new Vector2(32, 32),
      isometric: false,
      speed: 4,
      walkingAnimationEnabled: true,
      container: containerMock,
      offsetX: undefined,
      offsetY: undefined,
    });
    expect(mockSetTilePositon).toHaveBeenCalledWith(
      new Phaser.Math.Vector2(0, 0)
    );
    expect(mockTurnTowards).not.toHaveBeenCalled();
  });

  it("should init isometric player", () => {
    tileMapMock.orientation = `${Phaser.Tilemaps.Orientation.ISOMETRIC}`;
    gridEngine = new GridEngine(sceneMock, pluginManagerMock);
    gridEngine.create(tileMapMock, {
      characters: [
        {
          id: "player",
          sprite: playerSpriteMock,
        },
      ],
    });
    expect(GridCharacter).toHaveBeenCalledWith(
      "player",
      expect.objectContaining({
        isometric: true,
      })
    );
  });

  it("should init player with facingDirection", () => {
    const containerMock = {};
    gridEngine = new GridEngine(sceneMock, pluginManagerMock);
    gridEngine.create(tileMapMock, {
      characters: [
        {
          id: "player",
          sprite: playerSpriteMock,
          container: <any>containerMock,
          facingDirection: Direction.LEFT,
        },
      ],
      firstLayerAboveChar: 3,
    });
    expect(mockTurnTowards).toHaveBeenCalledWith(Direction.LEFT);
  });

  it("should still support deprecated characterIndex property", () => {
    console.warn = jest.fn();
    gridEngine = new GridEngine(sceneMock, pluginManagerMock);
    gridEngine.create(tileMapMock, {
      characters: [
        {
          id: "player",
          sprite: playerSpriteMock,
          characterIndex: 2,
        },
      ],
      firstLayerAboveChar: 3,
    });
    expect(GridCharacter).toHaveBeenCalledWith("player", {
      sprite: playerSpriteMock,
      tilemap: mockGridTileMap,
      tileSize: new Vector2(32, 32),
      isometric: false,
      speed: 4,
      walkingAnimationMapping: 2,
      walkingAnimationEnabled: true,
    });
    expect(mockSetTilePositon).toHaveBeenCalledWith(
      new Phaser.Math.Vector2(0, 0)
    );

    expect(console.warn).toHaveBeenCalledWith(
      "GridEngine: CharacterConfig property `characterIndex` is deprecated. Use `walkingAnimtionMapping` instead."
    );
  });

  it("should prefer walkingAnimationMapping over charIndex", () => {
    gridEngine = new GridEngine(sceneMock, pluginManagerMock);
    gridEngine.create(tileMapMock, {
      characters: [
        {
          id: "player",
          sprite: playerSpriteMock,
          characterIndex: 2,
          walkingAnimationMapping: 3,
        },
      ],
      firstLayerAboveChar: 3,
    });
    expect(GridCharacter).toHaveBeenCalledWith("player", {
      sprite: playerSpriteMock,
      tilemap: mockGridTileMap,
      tileSize: new Vector2(32, 32),
      isometric: false,
      speed: 4,
      walkingAnimationMapping: 3,
      walkingAnimationEnabled: true,
    });
    expect(mockSetTilePositon).toHaveBeenCalledWith(
      new Phaser.Math.Vector2(0, 0)
    );
  });

  it("should init player without walking animation", () => {
    gridEngine = new GridEngine(sceneMock, pluginManagerMock);
    gridEngine.create(tileMapMock, {
      characters: [
        {
          id: "player",
          sprite: playerSpriteMock,
          walkingAnimationMapping: 3,
          walkingAnimationEnabled: false,
        },
      ],
      firstLayerAboveChar: 3,
    });
    expect(GridCharacter).toHaveBeenCalledWith("player", {
      sprite: playerSpriteMock,
      tileSize: new Vector2(32, 32),
      isometric: false,
      tilemap: mockGridTileMap,
      speed: 4,
      walkingAnimationMapping: 3,
      walkingAnimationEnabled: false,
    });
    expect(mockSetTilePositon).toHaveBeenCalledWith(
      new Phaser.Math.Vector2(0, 0)
    );
  });

  it("should init player with animation mapping", () => {
    const walkingAnimationMapping = {
      up: {
        leftFoot: 0,
        standing: 1,
        rightFoot: 2,
      },
      down: {
        leftFoot: 36,
        standing: 37,
        rightFoot: 38,
      },
      left: {
        leftFoot: 12,
        standing: 13,
        rightFoot: 14,
      },
      right: {
        leftFoot: 24,
        standing: 25,
        rightFoot: 26,
      },
    };
    gridEngine = new GridEngine(sceneMock, pluginManagerMock);
    gridEngine.create(tileMapMock, {
      characters: [
        {
          id: "player",
          sprite: playerSpriteMock,
          walkingAnimationMapping,
        },
      ],
      firstLayerAboveChar: 3,
    });
    expect(GridCharacter).toHaveBeenCalledWith("player", {
      sprite: playerSpriteMock,
      tileSize: new Vector2(32, 32),
      isometric: false,
      tilemap: mockGridTileMap,
      speed: 4,
      walkingAnimationMapping,
      walkingAnimationEnabled: true,
    });
    expect(mockSetTilePositon).toHaveBeenCalledWith(
      new Phaser.Math.Vector2(0, 0)
    );
  });

  it("should use config startPosition", () => {
    gridEngine = new GridEngine(sceneMock, pluginManagerMock);
    gridEngine.create(tileMapMock, {
      characters: [
        {
          id: "player",
          sprite: playerSpriteMock,
          walkingAnimationMapping: 3,
          startPosition: new Phaser.Math.Vector2(3, 4),
        },
      ],
      firstLayerAboveChar: 3,
    });
    expect(mockSetTilePositon).toHaveBeenCalledWith(
      new Phaser.Math.Vector2(3, 4)
    );
  });

  it("should use config speed", () => {
    gridEngine = new GridEngine(sceneMock, pluginManagerMock);
    gridEngine.create(tileMapMock, {
      characters: [
        {
          id: "player",
          sprite: playerSpriteMock,
          walkingAnimationMapping: 3,
          speed: 2,
        },
      ],
      firstLayerAboveChar: 3,
    });
    expect(GridCharacter).toHaveBeenCalledWith("player", {
      sprite: playerSpriteMock,
      tileSize: new Vector2(32, 32),
      isometric: false,
      tilemap: mockGridTileMap,
      speed: 2,
      walkingAnimationMapping: 3,
      walkingAnimationEnabled: true,
    });
  });

  it("should use config offset", () => {
    const offsetX = 5;
    const offsetY = 6;
    gridEngine = new GridEngine(sceneMock, pluginManagerMock);
    gridEngine.create(tileMapMock, {
      characters: [
        {
          id: "player",
          sprite: playerSpriteMock,
          walkingAnimationMapping: 3,
          offsetX,
          offsetY,
        },
      ],
    });
    expect(GridCharacter).toHaveBeenCalledWith("player", {
      sprite: playerSpriteMock,
      tileSize: new Vector2(32, 32),
      isometric: false,
      tilemap: mockGridTileMap,
      speed: 4,
      walkingAnimationMapping: 3,
      walkingAnimationEnabled: true,
      offsetX,
      offsetY,
    });
  });

  it("should move player left", () => {
    gridEngine = new GridEngine(sceneMock, pluginManagerMock);
    gridEngine.create(tileMapMock, {
      characters: [
        {
          id: "player",
          sprite: playerSpriteMock,
          walkingAnimationMapping: 3,
        },
      ],
      firstLayerAboveChar: 3,
    });

    gridEngine.moveLeft("player");

    expect(mockMove).toHaveBeenCalledWith(Direction.LEFT);
  });

  it("should move player right", () => {
    gridEngine = new GridEngine(sceneMock, pluginManagerMock);
    gridEngine.create(tileMapMock, {
      characters: [
        {
          id: "player",
          sprite: playerSpriteMock,
          walkingAnimationMapping: 3,
        },
      ],
      firstLayerAboveChar: 3,
    });

    gridEngine.moveRight("player");

    expect(mockMove).toHaveBeenCalledWith(Direction.RIGHT);
  });

  it("should move player up", () => {
    gridEngine = new GridEngine(sceneMock, pluginManagerMock);
    gridEngine.create(tileMapMock, {
      characters: [
        {
          id: "player",
          sprite: playerSpriteMock,
          walkingAnimationMapping: 3,
        },
      ],
      firstLayerAboveChar: 3,
    });

    gridEngine.moveUp("player");

    expect(mockMove).toHaveBeenCalledWith(Direction.UP);
  });

  it("should move player down", () => {
    gridEngine = new GridEngine(sceneMock, pluginManagerMock);
    gridEngine.create(tileMapMock, {
      characters: [
        {
          id: "player",
          sprite: playerSpriteMock,
          walkingAnimationMapping: 3,
        },
      ],
      firstLayerAboveChar: 3,
    });

    gridEngine.moveDown("player");

    expect(mockMove).toHaveBeenCalledWith(Direction.DOWN);
  });

  it("should update", () => {
    gridEngine = new GridEngine(sceneMock, pluginManagerMock);
    gridEngine.create(tileMapMock, {
      characters: [
        {
          id: "player",
          sprite: playerSpriteMock,
          walkingAnimationMapping: 3,
        },
      ],
      firstLayerAboveChar: 3,
    });

    gridEngine.update(123, 456);

    expect(mockRandomMovementUpdate).toHaveBeenCalledWith(456);
    expect(mockTargetMovementUpdate).toHaveBeenCalled();
    expect(mockFollowMovement.update).toHaveBeenCalled();
    expect(mockUpdate).toHaveBeenCalledWith(456);
  });

  it("should get tile position", () => {
    gridEngine = new GridEngine(sceneMock, pluginManagerMock);
    gridEngine.create(tileMapMock, {
      characters: [
        {
          id: "player",
          sprite: playerSpriteMock,
          walkingAnimationMapping: 3,
        },
      ],
      firstLayerAboveChar: 3,
    });
    mockGetTilePos.mockReturnValue(new Phaser.Math.Vector2(3, 4));

    expect(gridEngine.getPosition("player")).toEqual(
      new Phaser.Math.Vector2(3, 4)
    );
  });

  it("should move randomly", () => {
    gridEngine = new GridEngine(sceneMock, pluginManagerMock);
    gridEngine.create(tileMapMock, {
      characters: [
        {
          id: "player",
          sprite: playerSpriteMock,
          walkingAnimationMapping: 3,
        },
      ],
      firstLayerAboveChar: 3,
    });
    gridEngine.moveRandomly("player", 123, 3);
    expect(mockAddCharacter).toHaveBeenCalledWith(expect.anything(), 123, 3);
  });

  it("should move to coordinates", () => {
    gridEngine = new GridEngine(sceneMock, pluginManagerMock);
    gridEngine.create(tileMapMock, {
      characters: [
        {
          id: "player",
          sprite: playerSpriteMock,
          walkingAnimationMapping: 3,
        },
      ],
      firstLayerAboveChar: 3,
    });
    const targetVec = new Phaser.Math.Vector2(3, 4);
    gridEngine.moveTo("player", targetVec);
    expect(mockTargetMovementAddCharacter).toHaveBeenCalledWith(
      expect.anything(),
      targetVec,
      0,
      false
    );

    gridEngine.moveTo("player", targetVec, true);
    expect(mockTargetMovementAddCharacter).toHaveBeenCalledWith(
      expect.anything(),
      targetVec,
      0,
      true
    );
  });

  it("should stop moving randomly", () => {
    gridEngine = new GridEngine(sceneMock, pluginManagerMock);
    gridEngine.create(tileMapMock, {
      characters: [
        {
          id: "player",
          sprite: playerSpriteMock,
          walkingAnimationMapping: 3,
        },
      ],
      firstLayerAboveChar: 3,
    });
    gridEngine.stopMovingRandomly("player");
    expect(mockRemoveCharacter).toHaveBeenCalled();
  });

  it("should set speed", () => {
    gridEngine = new GridEngine(sceneMock, pluginManagerMock);
    gridEngine.create(tileMapMock, {
      characters: [
        {
          id: "player",
          sprite: playerSpriteMock,
          walkingAnimationMapping: 3,
        },
      ],
      firstLayerAboveChar: 3,
    });
    gridEngine.setSpeed("player", 2);
    expect(mockSetSpeed).toHaveBeenCalledWith(2);
  });

  it("should not call update before create", () => {
    gridEngine = new GridEngine(sceneMock, pluginManagerMock);
    gridEngine.update(123, 456);
    expect(mockRandomMovementUpdate).not.toHaveBeenCalled();
    expect(mockTargetMovementUpdate).not.toHaveBeenCalled();
  });

  it("should add chars on the go", () => {
    gridEngine = new GridEngine(sceneMock, pluginManagerMock);
    gridEngine.create(tileMapMock, {
      characters: [],
      firstLayerAboveChar: 3,
    });
    gridEngine.addCharacter({
      id: "player",
      sprite: playerSpriteMock,
      walkingAnimationMapping: 3,
    });
    gridEngine.update(123, 456);
    expect(mockUpdate).toHaveBeenCalledTimes(1);
  });

  it("should remove chars on the go", () => {
    gridEngine = new GridEngine(sceneMock, pluginManagerMock);
    gridEngine.create(tileMapMock, {
      characters: [
        {
          id: "player",
          sprite: playerSpriteMock,
          walkingAnimationMapping: 3,
        },
      ],
      firstLayerAboveChar: 3,
    });
    gridEngine.removeCharacter("player");
    gridEngine.update(123, 456);
    expect(mockRemoveCharacter).toHaveBeenCalledWith("player");
    expect(mockTargetMovementRemoveCharacter).toHaveBeenCalledWith("player");
    expect(mockFollowMovement.removeCharacter).toHaveBeenCalledWith("player");
    expect(mockGridTileMap.removeCharacter).toHaveBeenCalledWith("player");
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("should remove all chars", () => {
    gridEngine = new GridEngine(sceneMock, pluginManagerMock);
    gridEngine.create(tileMapMock, {
      characters: [
        {
          id: "player",
          sprite: playerSpriteMock,
          walkingAnimationMapping: 3,
        },
        {
          id: "player2",
          sprite: playerSpriteMock,
          walkingAnimationMapping: 3,
        },
      ],
    });
    gridEngine.removeAllCharacters();
    gridEngine.update(123, 456);
    expect(mockRemoveCharacter).toHaveBeenCalledWith("player");
    expect(mockTargetMovementRemoveCharacter).toHaveBeenCalledWith("player");
    expect(mockFollowMovement.removeCharacter).toHaveBeenCalledWith("player");
    expect(mockGridTileMap.removeCharacter).toHaveBeenCalledWith("player");
    expect(mockRemoveCharacter).toHaveBeenCalledWith("player2");
    expect(mockTargetMovementRemoveCharacter).toHaveBeenCalledWith("player2");
    expect(mockFollowMovement.removeCharacter).toHaveBeenCalledWith("player2");
    expect(mockGridTileMap.removeCharacter).toHaveBeenCalledWith("player2");
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("should get all chars", () => {
    gridEngine = new GridEngine(sceneMock, pluginManagerMock);
    gridEngine.create(tileMapMock, {
      characters: [
        {
          id: "player",
          sprite: playerSpriteMock,
          walkingAnimationMapping: 3,
        },
        {
          id: "player2",
          sprite: playerSpriteMock,
          walkingAnimationMapping: 3,
        },
      ],
    });
    const chars = gridEngine.getAllCharacters();
    expect(chars).toEqual(["player", "player2"]);
  });

  it("should check if char is registered", () => {
    gridEngine = new GridEngine(sceneMock, pluginManagerMock);
    gridEngine.create(tileMapMock, {
      characters: [
        {
          id: "player",
          sprite: playerSpriteMock,
          walkingAnimationMapping: 3,
        },
      ],
      firstLayerAboveChar: 3,
    });
    gridEngine.addCharacter({
      id: "player2",
      sprite: playerSpriteMock,
      walkingAnimationMapping: 3,
    });
    expect(gridEngine.hasCharacter("player")).toBe(true);
    expect(gridEngine.hasCharacter("player2")).toBe(true);
    expect(gridEngine.hasCharacter("unknownCharId")).toBe(false);
  });

  it("should follow a char", () => {
    gridEngine = new GridEngine(sceneMock, pluginManagerMock);
    gridEngine.create(tileMapMock, {
      characters: [
        {
          id: "player",
          sprite: playerSpriteMock,
          walkingAnimationMapping: 3,
        },
        {
          id: "player2",
          sprite: playerSpriteMock,
          walkingAnimationMapping: 3,
        },
      ],
      firstLayerAboveChar: 3,
    });
    gridEngine.follow("player", "player2", 7, true);
    expect(mockFollowMovement.addCharacter).toHaveBeenCalledWith(
      // @ts-ignore
      expect.toBeCharacter("player"),
      // @ts-ignore
      expect.toBeCharacter("player2"),
      7,
      true
    );
  });

  it("should follow a char with default distance", () => {
    gridEngine = new GridEngine(sceneMock, pluginManagerMock);
    gridEngine.create(tileMapMock, {
      characters: [
        {
          id: "player",
          sprite: playerSpriteMock,
          walkingAnimationMapping: 3,
        },
        {
          id: "player2",
          sprite: playerSpriteMock,
          walkingAnimationMapping: 3,
        },
      ],
      firstLayerAboveChar: 3,
    });
    gridEngine.follow("player", "player2");
    expect(mockFollowMovement.addCharacter).toHaveBeenCalledWith(
      // @ts-ignore
      expect.toBeCharacter("player"),
      // @ts-ignore
      expect.toBeCharacter("player2"),
      0,
      false
    );
  });

  it("should stop following", () => {
    gridEngine = new GridEngine(sceneMock, pluginManagerMock);
    gridEngine.create(tileMapMock, {
      characters: [
        {
          id: "player",
          sprite: playerSpriteMock,
          walkingAnimationMapping: 3,
        },
        {
          id: "player2",
          sprite: playerSpriteMock,
          walkingAnimationMapping: 3,
        },
      ],
      firstLayerAboveChar: 3,
    });
    gridEngine.stopFollowing("player");
    expect(mockFollowMovement.removeCharacter).toHaveBeenCalledWith("player");
  });

  it("should set walkingAnimationMapping", () => {
    gridEngine = new GridEngine(sceneMock, pluginManagerMock);
    gridEngine.create(tileMapMock, {
      characters: [
        {
          id: "player",
          sprite: playerSpriteMock,
          walkingAnimationMapping: 3,
        },
      ],
      firstLayerAboveChar: 3,
    });
    const mockMapping = {
      up: {
        leftFoot: 0,
        standing: 1,
        rightFoot: 2,
      },
      right: {
        leftFoot: 3,
        standing: 4,
        rightFoot: 5,
      },
      down: {
        leftFoot: 6,
        standing: 7,
        rightFoot: 8,
      },
      left: {
        leftFoot: 9,
        standing: 10,
        rightFoot: 11,
      },
    };
    gridEngine.setWalkingAnimationMapping("player", mockMapping);
    expect(mockSetWalkingAnimationMapping).toHaveBeenCalledWith(mockMapping);
  });

  it("should delegate isMoving", () => {
    gridEngine = new GridEngine(sceneMock, pluginManagerMock);
    gridEngine.create(tileMapMock, {
      characters: [
        {
          id: "player",
          sprite: playerSpriteMock,
          walkingAnimationMapping: 3,
        },
      ],
    });

    mockIsMoving.mockReturnValue(true);
    let isMoving = gridEngine.isMoving("player");
    expect(isMoving).toEqual(true);
    mockIsMoving.mockReturnValue(false);
    isMoving = gridEngine.isMoving("player");
    expect(isMoving).toEqual(false);
  });

  it("should delegate getFacingDirection", () => {
    gridEngine = new GridEngine(sceneMock, pluginManagerMock);
    gridEngine.create(tileMapMock, {
      characters: [
        {
          id: "player",
          sprite: playerSpriteMock,
          walkingAnimationMapping: 3,
        },
      ],
    });

    mockFacingDirection.mockReturnValue(Direction.LEFT);
    const facingDirection = gridEngine.getFacingDirection("player");
    expect(facingDirection).toEqual(Direction.LEFT);
  });

  it("should delegate turnTowards", () => {
    gridEngine = new GridEngine(sceneMock, pluginManagerMock);
    gridEngine.create(tileMapMock, {
      characters: [
        {
          id: "player",
          sprite: playerSpriteMock,
          walkingAnimationMapping: 3,
        },
      ],
    });

    gridEngine.turnTowards("player", Direction.RIGHT);
    expect(mockTurnTowards).toHaveBeenCalledWith(Direction.RIGHT);
  });

  describe("Observables", () => {
    it("should get chars movementStarted observable", async () => {
      const mockSubject = new Subject<Direction>();
      mockMovementStarted.mockReturnValue(mockSubject);
      gridEngine = new GridEngine(sceneMock, pluginManagerMock);
      gridEngine.create(tileMapMock, {
        characters: [
          {
            id: "player",
            sprite: playerSpriteMock,
            walkingAnimationMapping: 3,
          },
        ],
        firstLayerAboveChar: 3,
      });

      const prom = gridEngine.movementStarted().pipe(take(1)).toPromise();

      mockSubject.next(Direction.LEFT);
      const res = await prom;
      expect(res).toEqual(["player", Direction.LEFT]);
    });

    it("should unsubscribe from movementStarted if char removed", async () => {
      const mockSubject = new Subject<Direction>();
      mockMovementStarted.mockReturnValue(mockSubject);
      gridEngine = new GridEngine(sceneMock, pluginManagerMock);
      gridEngine.create(tileMapMock, {
        characters: [
          {
            id: "player",
            sprite: playerSpriteMock,
            walkingAnimationMapping: 3,
          },
        ],
        firstLayerAboveChar: 3,
      });

      gridEngine.removeCharacter("player");
      const nextMock = jest.fn();

      gridEngine.movementStarted().subscribe({
        complete: jest.fn(),
        next: nextMock,
      });

      mockSubject.next(Direction.LEFT);
      expect(nextMock).not.toHaveBeenCalled();
    });

    it("should get chars movementStopped observable", async () => {
      const mockSubject = new Subject<Direction>();
      mockMovementStopped.mockReturnValue(mockSubject);
      gridEngine = new GridEngine(sceneMock, pluginManagerMock);
      gridEngine.create(tileMapMock, {
        characters: [
          {
            id: "player",
            sprite: playerSpriteMock,
            walkingAnimationMapping: 3,
          },
        ],
        firstLayerAboveChar: 3,
      });

      const prom = gridEngine.movementStopped().pipe(take(1)).toPromise();

      mockSubject.next(Direction.LEFT);
      const res = await prom;
      expect(res).toEqual(["player", Direction.LEFT]);
    });

    it("should unsubscribe from movementStopped if char removed", async () => {
      const mockSubject = new Subject<Direction>();
      mockMovementStopped.mockReturnValue(mockSubject);
      gridEngine = new GridEngine(sceneMock, pluginManagerMock);
      gridEngine.create(tileMapMock, {
        characters: [
          {
            id: "player",
            sprite: playerSpriteMock,
            walkingAnimationMapping: 3,
          },
        ],
        firstLayerAboveChar: 3,
      });

      gridEngine.removeCharacter("player");
      const nextMock = jest.fn();

      gridEngine.movementStopped().subscribe({
        complete: jest.fn(),
        next: nextMock,
      });

      mockSubject.next(Direction.LEFT);
      expect(nextMock).not.toHaveBeenCalled();
    });

    it("should get chars directionChanged observable", async () => {
      const mockSubject = new Subject<Direction>();
      mockDirectionChanged.mockReturnValue(mockSubject);
      gridEngine = new GridEngine(sceneMock, pluginManagerMock);
      gridEngine.create(tileMapMock, {
        characters: [
          {
            id: "player",
            sprite: playerSpriteMock,
            walkingAnimationMapping: 3,
          },
        ],
        firstLayerAboveChar: 3,
      });

      const prom = gridEngine.directionChanged().pipe(take(1)).toPromise();

      mockSubject.next(Direction.LEFT);
      const res = await prom;
      expect(res).toEqual(["player", Direction.LEFT]);
    });

    it("should unsubscribe from directionChanged if char removed", async () => {
      const mockSubject = new Subject<Direction>();
      mockDirectionChanged.mockReturnValue(mockSubject);
      gridEngine = new GridEngine(sceneMock, pluginManagerMock);
      gridEngine.create(tileMapMock, {
        characters: [
          {
            id: "player",
            sprite: playerSpriteMock,
            walkingAnimationMapping: 3,
          },
        ],
        firstLayerAboveChar: 3,
      });

      gridEngine.removeCharacter("player");
      const nextMock = jest.fn();

      gridEngine.directionChanged().subscribe({
        complete: jest.fn(),
        next: nextMock,
      });

      mockSubject.next(Direction.LEFT);
      expect(nextMock).not.toHaveBeenCalled();
    });

    it("should get chars positionChanged observable", async () => {
      const mockSubject = new Subject<PositionChange>();
      mockPositionChanged.mockReturnValue(mockSubject);
      gridEngine = new GridEngine(sceneMock, pluginManagerMock);
      gridEngine.create(tileMapMock, {
        characters: [
          {
            id: "player",
            sprite: playerSpriteMock,
            walkingAnimationMapping: 3,
          },
        ],
      });

      const prom = gridEngine.positionChanged().pipe(take(1)).toPromise();

      const exitTile = new Phaser.Math.Vector2(1, 2);
      const enterTile = new Phaser.Math.Vector2(2, 2);

      mockSubject.next({
        exitTile,
        enterTile,
      });
      const res = await prom;
      expect(res).toEqual({ charId: "player", exitTile, enterTile });
    });

    it("should unsubscribe from positionChanged if char removed", async () => {
      const mockSubject = new Subject<PositionChange>();
      mockDirectionChanged.mockReturnValue(mockSubject);
      gridEngine = new GridEngine(sceneMock, pluginManagerMock);
      gridEngine.create(tileMapMock, {
        characters: [
          {
            id: "player",
            sprite: playerSpriteMock,
            walkingAnimationMapping: 3,
          },
        ],
      });

      gridEngine.removeCharacter("player");
      const nextMock = jest.fn();

      gridEngine.directionChanged().subscribe({
        complete: jest.fn(),
        next: nextMock,
      });

      const exitTile = new Phaser.Math.Vector2(1, 2);
      const enterTile = new Phaser.Math.Vector2(2, 2);

      mockSubject.next({ exitTile, enterTile });
      expect(nextMock).not.toHaveBeenCalled();
    });
  });

  describe("Error Handling unknown char id", () => {
    beforeEach(() => {
      gridEngine = new GridEngine(sceneMock, pluginManagerMock);
      gridEngine.create(tileMapMock, {
        characters: [
          {
            id: "player",
            sprite: playerSpriteMock,
            walkingAnimationMapping: 3,
          },
        ],
        firstLayerAboveChar: 3,
      });
    });

    it("should throw error if getPosition is invoked", () => {
      expect(() => gridEngine.getPosition("unknownCharId")).toThrow(
        "Character unknown"
      );
    });

    it("should throw error if moveLeft is invoked", () => {
      expect(() => gridEngine.moveLeft("unknownCharId")).toThrow(
        "Character unknown"
      );
    });

    it("should throw error if moveRight is invoked", () => {
      expect(() => gridEngine.moveRight("unknownCharId")).toThrow(
        "Character unknown"
      );
    });

    it("should throw error if moveUp is invoked", () => {
      expect(() => gridEngine.moveUp("unknownCharId")).toThrow(
        "Character unknown"
      );
    });

    it("should throw error if moveDown is invoked", () => {
      expect(() => gridEngine.moveDown("unknownCharId")).toThrow(
        "Character unknown"
      );
    });

    it("should throw error if moveRandomly is invoked", () => {
      expect(() => gridEngine.moveRandomly("unknownCharId")).toThrow(
        "Character unknown"
      );
    });

    it("should throw error if stopMovingRandomly is invoked", () => {
      expect(() => gridEngine.stopMovingRandomly("unknownCharId")).toThrow(
        "Character unknown"
      );
    });

    it("should throw error if setSpeed is invoked", () => {
      expect(() => gridEngine.setSpeed("unknownCharId", 4)).toThrow(
        "Character unknown"
      );
    });

    it("should throw error if moveTo is invoked", () => {
      expect(() =>
        gridEngine.moveTo("unknownCharId", new Phaser.Math.Vector2(3, 4))
      ).toThrow("Character unknown");
    });

    it("should throw error if removeCharacter is invoked", () => {
      expect(() => gridEngine.removeCharacter("unknownCharId")).toThrow(
        "Character unknown"
      );
    });

    it("should throw error if follow is invoked", () => {
      expect(() => gridEngine.follow("unknownCharId", "player")).toThrow(
        "Character unknown"
      );
      expect(() => gridEngine.follow("player", "unknownCharId")).toThrow(
        "Character unknown"
      );
      expect(() => gridEngine.follow("unknownCharId", "unknownCharId")).toThrow(
        "Character unknown"
      );
    });

    it("should throw error if stopFollowing is invoked", () => {
      expect(() => gridEngine.stopFollowing("unknownCharId")).toThrow(
        "Character unknown"
      );
    });

    it("should throw error if setWalkingAnimationMapping is invoked", () => {
      expect(() =>
        gridEngine.setWalkingAnimationMapping("unknownCharId", <any>{})
      ).toThrow("Character unknown");
    });

    it("should throw error if isMoving is invoked", () => {
      expect(() => gridEngine.isMoving("unknownCharId")).toThrow(
        "Character unknown"
      );
    });

    it("should throw error if getFacingDirectiion is invoked", () => {
      expect(() => gridEngine.getFacingDirection("unknownCharId")).toThrow(
        "Character unknown"
      );
    });

    it("should throw error if turnTowards is invoked", () => {
      expect(() =>
        gridEngine.turnTowards("unknownCharId", Direction.LEFT)
      ).toThrow("Character unknown");
    });
  });

  describe("invokation of methods if not created properly", () => {
    beforeEach(() => {
      gridEngine = new GridEngine(sceneMock, pluginManagerMock);
    });

    it("should throw error if getPosition is invoked", () => {
      expect(() => gridEngine.getPosition("someCharId")).toThrow(
        "Plugin not initialized"
      );
    });

    it("should throw error if moveLeft is invoked", () => {
      expect(() => gridEngine.moveLeft("someCharId")).toThrow(
        "Plugin not initialized"
      );
    });

    it("should throw error if moveRight is invoked", () => {
      expect(() => gridEngine.moveRight("someCharId")).toThrow(
        "Plugin not initialized"
      );
    });

    it("should throw error if moveUp is invoked", () => {
      expect(() => gridEngine.moveUp("someCharId")).toThrow(
        "Plugin not initialized"
      );
    });

    it("should throw error if moveDown is invoked", () => {
      expect(() => gridEngine.moveDown("someCharId")).toThrow(
        "Plugin not initialized"
      );
    });

    it("should throw error if moveRandomly is invoked", () => {
      expect(() => gridEngine.moveRandomly("someCharId")).toThrow(
        "Plugin not initialized"
      );
    });

    it("should throw error if moveTo is invoked", () => {
      expect(() =>
        gridEngine.moveTo("someCharId", new Phaser.Math.Vector2(2, 3))
      ).toThrow("Plugin not initialized");
    });

    it("should throw error if stopMovingRandomly is invoked", () => {
      expect(() => gridEngine.stopMovingRandomly("someCharId")).toThrow(
        "Plugin not initialized"
      );
    });

    it("should throw error if setSpeed is invoked", () => {
      expect(() => gridEngine.setSpeed("someCharId", 3)).toThrow(
        "Plugin not initialized"
      );
    });

    it("should throw error if addCharacter is invoked", () => {
      expect(() =>
        gridEngine.addCharacter({
          id: "player",
          sprite: playerSpriteMock,
          walkingAnimationMapping: 3,
        })
      ).toThrow("Plugin not initialized");
    });

    it("should throw error if hasCharacter is invoked", () => {
      expect(() => gridEngine.hasCharacter("someCharId")).toThrow(
        "Plugin not initialized"
      );
    });

    it("should throw error if removeCharacter is invoked", () => {
      expect(() => gridEngine.removeCharacter("someCharId")).toThrow(
        "Plugin not initialized"
      );
    });

    it("should throw error if follow is invoked", () => {
      expect(() => gridEngine.follow("someCharId", "someOtherCharId")).toThrow(
        "Plugin not initialized"
      );
    });

    it("should throw error if stopFollowing is invoked", () => {
      expect(() => gridEngine.stopFollowing("someCharId")).toThrow(
        "Plugin not initialized"
      );
    });

    it("should throw error if setWalkingAnimationMapping is invoked", () => {
      expect(() =>
        gridEngine.setWalkingAnimationMapping("someCharId", <any>{})
      ).toThrow("Plugin not initialized");
    });

    it("should throw error if isMoving is invoked", () => {
      expect(() => gridEngine.isMoving("someCharId")).toThrow(
        "Plugin not initialized"
      );
    });

    it("should throw error if getFacingDirection is invoked", () => {
      expect(() => gridEngine.getFacingDirection("someCharId")).toThrow(
        "Plugin not initialized"
      );
    });

    it("should throw error if turnTowards is invoked", () => {
      expect(() =>
        gridEngine.turnTowards("someCharId", Direction.LEFT)
      ).toThrow("Plugin not initialized");
    });

    it("should throw error if removeAllCharacters is invoked", () => {
      expect(() => gridEngine.removeAllCharacters()).toThrow(
        "Plugin not initialized"
      );
    });

    it("should throw error if getAllCharacters is invoked", () => {
      expect(() => gridEngine.getAllCharacters()).toThrow(
        "Plugin not initialized"
      );
    });
  });
});