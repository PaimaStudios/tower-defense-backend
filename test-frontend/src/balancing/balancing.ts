import { coordsToIndex } from '@tower-defense/game-logic/build/processTick';
import type {
  AttackerStructureType,
  DefenderStructureType,
  MatchState,
  TurnAction,
  UpgradeStructureAction,
} from '@tower-defense/utils';

// export type AttackerStructureType = 'macawCrypt' | 'gorillaCrypt' | 'jaguarCrypt';
// export type DefenderStructureType = 'anacondaTower' | 'slothTower' | 'piranhaTower';

export enum GamePlan {
  OneVSOne_All = 'OneVSOne_All',
  OneVSOne_SameLvl1 = 'OneVSOne_SameLvL1',
  TwoLvl1_VS_OneLvl2 = 'TwoLvl1_VS_OneLvl2',
  OneVSOne_SameLvl2 = 'OneVSOne_SameLvL2',
  OneVSOne_SameLvl3 = 'OneVSOne_SameLvL3',
}

class Balancing {
  readonly matchState: MatchState;
  readonly gamePlan: GamePlan;

  constructor(matchState: MatchState, gamePlan: GamePlan) {
    this.matchState = matchState;
    this.gamePlan = gamePlan;
  }

  getTowerAction(attacker: AttackerStructureType, defender: DefenderStructureType): TurnAction[] {
    switch (this.gamePlan) {
      case GamePlan.OneVSOne_SameLvl1:
        return this.oneVSOne_SameLvl1(attacker, defender);
      case GamePlan.OneVSOne_SameLvl2:
        return this.oneVSOne_SameLvl2(attacker, defender);
      case GamePlan.OneVSOne_SameLvl3:
        throw new Error('GamePlan not implemented');
      default:
        throw new Error('GamePlan not implemented / compatible');
    }
  }

  getAllTowerActions(): { [key: string]: TurnAction[] } {
    const attackers: AttackerStructureType[] = ['macawCrypt', 'gorillaCrypt', 'jaguarCrypt'];
    const defenders: DefenderStructureType[] = ['anacondaTower', 'slothTower', 'piranhaTower'];

    const resultMap: { [key: string]: TurnAction[] } = {};

    for (const defender of defenders) {
      for (const attacker of attackers) {
        const result = this.oneVSOne_SameLvl1(attacker, defender);
        const key = `${defender}-${attacker}`;
        resultMap[key] = result;
      }
    }

    return resultMap;
  }

  oneVSOne_SameLvl1(
    attacker: AttackerStructureType,
    defender: DefenderStructureType
  ): TurnAction[] {
    return [this.newDefender(defender), this.newAttacker(attacker)];
  }

  oneVSOne_SameLvl2(
    attacker: AttackerStructureType,
    defender: DefenderStructureType
  ): TurnAction[] {
    return [
      this.newDefender(defender),
      this.newAttacker(attacker),
      this.upgradeDefender(),
      this.upgradeAttacker(),
    ];
  }

  newDefender(type: DefenderStructureType, position = 5): TurnAction {
    return {
      // id: 3
      round: 1,
      action: 'build',
      faction: 'defender',
      coordinates: coordsToIndex({ x: position, y: 7 }, this.matchState.width),
      structure: type,
    };
  }

  newAttacker(type: AttackerStructureType, position = 20): TurnAction {
    return {
      // id: 4
      round: 2,
      action: 'build',
      faction: 'attacker',
      coordinates: coordsToIndex({ x: position, y: 7 }, this.matchState.width),
      structure: type,
    };
  }

  upgradeDefender(id = 3, round = 3): UpgradeStructureAction {
    return {
      id,
      round,
      action: 'upgrade',
      faction: 'defender',
    };
  }

  upgradeAttacker(id = 4, round = 3): UpgradeStructureAction {
    return {
      id,
      round,
      action: 'upgrade',
      faction: 'attacker',
    };
  }
}

export default Balancing;
