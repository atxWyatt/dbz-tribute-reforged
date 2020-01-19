import { AdvancedSaga } from "./AdvancedSaga";
import { Saga } from "./BaseSaga";
import { SagaHelper } from "../SagaHelper";
import { Constants } from "Common/Constants";

export class BrolyDBZMovieSaga1 extends AdvancedSaga implements Saga {
  name: string = '[Movie] Broly - The Legendary Super Saiyan';

  protected broly: unit | undefined;
  protected isLSS: boolean;
  protected auraLSS: effect;

  constructor() {
    super();
    this.sagaDelay = 30;
    this.isLSS = false;
    this.auraLSS = GetLastCreatedEffectBJ();
  }

  spawnSagaUnits(): void {
    super.spawnSagaUnits();
    SagaHelper.showMessagesChanceOfJoke(
      [
        "Broly the Legendary Super Saiyan has arrived on Earth.",
      ],
    );

    this.addHeroListToSaga(["Broly DBZ 1"], true);

    this.broly = this.bosses.get("Broly DBZ 1");

    for (const [name, boss] of this.bosses) {
      SetUnitAcquireRange(boss, 4000);
    }

    this.ping();
    this.addActionRewardStats(this);
  }

  update(t: number): void {
    super.update(t);
    if (
      this.broly &&
      !this.isLSS && 
      SagaHelper.checkUnitHp(this.broly, 0.75, true, false, true)  
    ) { 
      SagaHelper.showMessagesChanceOfJoke(
        [
          "|cffffcc00Broly|r: Kakarot!",
        ],
      );
      this.isLSS = true;
      SetUnitScale(this.broly, 2.0, 2.0, 2.0);
      SetHeroLevel(this.broly, GetHeroLevel(this.broly) + 13, true);
      SetHeroStr(this.broly, Math.floor(GetHeroStr(this.broly, true) * 1.2 + 1000), true);
      SetHeroAgi(this.broly, Math.floor(GetHeroAgi(this.broly, true) + 200), true);
      this.auraLSS = AddSpecialEffectTarget(
        "AuraDarkGreen.mdl",
        this.broly,
        "origin", 
      );
      DestroyEffect(
        AddSpecialEffectTarget(
          "Abilities\\Spells\\Human\\Thunderclap\\ThunderClapCaster.mdl",
          this.broly, 
          "origin", 
        )
      );
    }
  }

  canStart(): boolean {
    return true;
  }

  canComplete(): boolean {
    if (this.bosses.size > 0) {
      return SagaHelper.areAllBossesDead(this.bosses);
    }
    return false;
  }

  start(): void {
    super.start();
    this.spawnWhenDelayFinished();
  }

  spawnWhenDelayFinished(): void {
    if (this.sagaDelay <= 0) {
      this.spawnSagaUnits();
    } else {
      TimerStart(this.sagaDelayTimer, this.sagaDelay, false, ()=> {
        this.spawnSagaUnits();
        DestroyTimer(GetExpiredTimer());
      });
    }
  }

  complete(): void {
    super.complete();
    DestroyEffect(this.auraLSS);
  }
}

export class BrolyDBZMovieSaga2 extends AdvancedSaga implements Saga {
  name: string = '[Movie] Broly -  Second Coming';

  protected broly: unit | undefined;
  protected isLSS: boolean;
  protected auraLSS: effect;

  constructor() {
    super();
    this.sagaDelay = 60;
    this.isLSS = false;
    this.auraLSS = GetLastCreatedEffectBJ();
  }

  spawnSagaUnits(): void {
    super.spawnSagaUnits();
    SagaHelper.showMessagesChanceOfJoke(
      [
        "Broly has unthawed from the ice and returned for vengeance!",
      ],
      [
        "|cffffcc00Frozen Broly|r: 'ice to meet you.",
      ],
    );

    this.addHeroListToSaga(["Broly DBZ 2"], true);
    
    this.broly = this.bosses.get("Broly DBZ 2");

    for (const [name, boss] of this.bosses) {
      SetUnitAcquireRange(boss, 4000);
    }

    this.ping();
    this.addActionRewardStats(this);
  }

  update(t: number): void {
    super.update(t);
    if (
      this.broly &&
      !this.isLSS && 
      SagaHelper.checkUnitHp(this.broly, 0.75, true, false, true)  
    ) { 
      SagaHelper.showMessagesChanceOfJoke(
        [
          "|cffffcc00Broly|r: Kakarot!?",
        ],
      );
      this.isLSS = true;
      SetUnitScale(this.broly, 2.0, 2.0, 2.0);
      SetHeroLevel(this.broly, GetHeroLevel(this.broly) + 15, true);
      SetHeroStr(this.broly, Math.floor(GetHeroStr(this.broly, true) * 2 + 500), true);
      SetHeroAgi(this.broly, Math.floor(GetHeroAgi(this.broly, true) + 100), true);
      this.auraLSS = AddSpecialEffectTarget(
        "AuraDarkGreen.mdl",
        this.broly,
        "origin", 
      );
      DestroyEffect(
        AddSpecialEffectTarget(
          "Abilities\\Spells\\Human\\Thunderclap\\ThunderClapCaster.mdl",
          this.broly, 
          "origin", 
        )
      );
    }
  }

  canStart(): boolean {
    return true;
  }

  canComplete(): boolean {
    if (this.bosses.size > 0) {
      return SagaHelper.areAllBossesDead(this.bosses);
    }
    return false;
  }

  start(): void {
    super.start();
    this.spawnWhenDelayFinished();
  }

  spawnWhenDelayFinished(): void {
    if (this.sagaDelay <= 0) {
      this.spawnSagaUnits();
    } else {
      TimerStart(this.sagaDelayTimer, this.sagaDelay, false, ()=> {
        this.spawnSagaUnits();
        DestroyTimer(GetExpiredTimer());
      });
    }
  }

  complete(): void {
    super.complete();
    DestroyEffect(this.auraLSS);
  }
}

export class BioBrolySaga extends AdvancedSaga implements Saga {
  name: string = '[Movie] Bio-Broly';

  constructor() {
    super();
    this.sagaDelay = 30;
  }

  spawnSagaUnits(): void {
    super.spawnSagaUnits();
    SagaHelper.showMessagesChanceOfJoke(
      [
        "Bio Broly has begun rampaging through the Bio Research Facility!",
      ],
    );

    this.addHeroListToSaga(["Broly Bio"], true);

    for (const [name, boss] of this.bosses) {
      SetUnitAcquireRange(boss, 4000);
    }

    this.ping();
    this.addActionRewardStats(this);
  }

  update(t: number): void {
    super.update(t);
  }

  canStart(): boolean {
    return true;
  }

  canComplete(): boolean {
    if (this.bosses.size > 0) {
      return SagaHelper.areAllBossesDead(this.bosses);
    }
    return false;
  }

  start(): void {
    super.start();
    this.spawnWhenDelayFinished();
  }

  spawnWhenDelayFinished(): void {
    if (this.sagaDelay <= 0) {
      this.spawnSagaUnits();
    } else {
      TimerStart(this.sagaDelayTimer, this.sagaDelay, false, ()=> {
        this.spawnSagaUnits();
        DestroyTimer(GetExpiredTimer());
      });
    }
  }

  complete(): void {
    super.complete();
  }
}