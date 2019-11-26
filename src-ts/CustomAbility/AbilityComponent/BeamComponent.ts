import { AbilityComponent } from "./AbilityComponent";
import { HeightVariation } from "Common/HeightVariation";
import { CustomAbilityInput } from "CustomAbility/CustomAbilityInput";
import { Vector2D } from "Common/Vector2D";
import { UnitHelper } from "Common/UnitHelper";
import { CustomAbility } from "CustomAbility/CustomAbility";
import { CoordMath } from "Common/CoordMath";
import { PathingCheck } from "Common/PathingCheck";
import { AbilityComponentHelper } from "./AbilityComponentHelper";

export class BeamComponent implements AbilityComponent, Serializable<BeamComponent> {

  public beamUnit: unit;
  public delayTicks: number;
  public angle: number;
  public previousHp: number;

  constructor(
    public name: string = "BeamComponent",
    public repeatInterval: number = 1,
    public beamHpMult: number = 0.5,
    public beamHpAttribute: number = bj_HEROSTAT_INT,
    public speed: number = 16,
    public aoe: number = 250,
    public clashingDelayTicks: number = 1,
    public maxDelayTicks: number = 8,
    public durationIncPerDelay: number = 15,
    public heightVariation: HeightVariation = new HeightVariation(
      250, 0, HeightVariation.LINEAR_VARIATION
    ),
    public isTracking : boolean = false,
    public isFixedAngle : boolean = true,
    public canClashWithHero : boolean = true,
    public beamUnitType: number = FourCC('hpea'),
    public components: AbilityComponent[] = [],
  ) {
    this.beamUnit = GetEnumUnit();
    this.delayTicks = 0;
    this.angle = 0;
    this.previousHp = 0;
  }

  protected getNearbyEnemies(input: CustomAbilityInput) {
    const sourceCoord = new Vector2D(GetUnitX(this.beamUnit), GetUnitY(this.beamUnit));
    const affectedGroup = UnitHelper.getNearbyValidUnits(
      sourceCoord, 
      this.aoe,
      () => {
        return UnitHelper.isUnitTargetableForPlayer(GetFilterUnit(), input.casterPlayer);
      }
    );
    const numEnemies = UnitHelper.countEnemyHeroes(affectedGroup, input.casterPlayer);
    DestroyGroup(affectedGroup);
    return numEnemies;
  }

  protected checkForBeamClash(input: CustomAbilityInput): this {
    if (this.clashingDelayTicks > 0) {
      const currentHp = GetUnitState(this.beamUnit, UNIT_STATE_LIFE);
      if (
        currentHp < this.previousHp || 
        (this.canClashWithHero && this.getNearbyEnemies(input) > 0)
      ) {
        this.delayTicks = Math.min(this.maxDelayTicks, (this.delayTicks + this.clashingDelayTicks));
      }
      this.previousHp = currentHp;
    }
    return this;
  }

  protected moveBeamUnit(ability: CustomAbility, input: CustomAbilityInput): this {
    
    if (this.delayTicks <= 0) {
      const currentCoord = new Vector2D(GetUnitX(this.beamUnit), GetUnitY(this.beamUnit));
      if (!this.isFixedAngle) {
        this.angle = GetUnitFacing(this.beamUnit);
      }
      const targetCoord = CoordMath.polarProjectCoords(currentCoord, this.angle, this.speed);

     PathingCheck.moveFlyingUnitToCoord(this.beamUnit, targetCoord);
    } else {
      --this.delayTicks;
      // when delaying movement, if duration inc per delay > 0
      // there is a chance that the current tick is reduced by 1
      // i.e. total duration of beam is increased by 1
      // e.g. a durationIncPerDelay of 1, would on average 
      // increase the beam duration by 1 per 100 ticks
      // thus duractionIncPerDelay X produces a +X% incerease in total duration
      if (this.durationIncPerDelay > Math.random()*99 + 0.0001) {
        ability.reduceCurrentTick(1);
      }
    }
    return this;
  }

  protected setupBeamUnit(ability: CustomAbility, input: CustomAbilityInput, source: unit) {
    const sourceCoord = new Vector2D(GetUnitX(source), GetUnitY(source));
    this.angle = CoordMath.angleBetweenCoords(sourceCoord, input.targetPoint);

    this.beamUnit = CreateUnit(
      input.casterPlayer, 
      this.beamUnitType, 
      sourceCoord.x, 
      sourceCoord.y, 
      this.angle,
    );

    UnitHelper.giveUnitFlying(this.beamUnit);
    SetUnitFlyHeight(this.beamUnit, this.heightVariation.start, 0);
    SetUnitFlyHeight(
      this.beamUnit, 
      this.heightVariation.finish, 
      Math.abs(
        (this.heightVariation.finish - this.heightVariation.start) 
        / 
        (ability.duration * ability.updateRate)
      ),
    );
    // hp MUST be a multiple of 50??? or something
    // else it causes a crash / uncatched exception
    // and prevents the rest of the beam code from firing
    let maxHp = GetUnitState(this.beamUnit, UNIT_STATE_LIFE);

    maxHp = Math.max(
      150, 
      50 * input.level *
      Math.floor(this.beamHpMult * GetHeroStatBJ(this.beamHpAttribute, input.caster.unit, true))
    );

    BlzSetUnitMaxHP(this.beamUnit, maxHp);
    // SetUnitState(this.beamUnit, UNIT_STATE_LIFE, maxHp);
    SetUnitLifePercentBJ(this.beamUnit, 100);
    this.previousHp = GetUnitState(this.beamUnit, UNIT_STATE_LIFE);
    BlzSetUnitName(this.beamUnit, this.name);

    if (!this.isTracking) {
      PauseUnit(this.beamUnit, true);
    } else {
      // possible selection bug again?
      SelectUnitAddForPlayer(this.beamUnit, input.casterPlayer);
    }
  }
  
  performTickAction(ability: CustomAbility, input: CustomAbilityInput, source: unit) {
    if (ability.currentTick == CustomAbility.START_TICK) {
      this.setupBeamUnit(ability, input, source);
    }
    if (this.beamUnit && IsUnitType(this.beamUnit, UNIT_TYPE_DEAD) == true) {
      ability.currentTick = ability.duration;
    }
    this.checkForBeamClash(input);
    this.moveBeamUnit(ability, input);
    for (const component of this.components) {
      if (ability.isReadyToUse(component.repeatInterval)) {
        component.performTickAction(ability, input, this.beamUnit);
      }
    }
    if (ability.currentTick >= ability.duration) {
      RemoveUnit(this.beamUnit);
    }
  }

  clone(): AbilityComponent {
    return new BeamComponent(
      this.name, this.repeatInterval, this.beamHpMult, this.beamHpMult, 
      this.speed, this. aoe, this.clashingDelayTicks, this.maxDelayTicks,
      this.durationIncPerDelay, this.heightVariation, this.isTracking,
      this.isFixedAngle, this.canClashWithHero, this.beamUnitType, 
      AbilityComponentHelper.clone(this.components),
    );
  }

  deserialize(
    input: {
      name: string;
      repeatInterval: number;
      beamHpMult: number;
      beamHpAttribute: number;
      speed: number;
      aoe: number;
      clashingDelayTicks: number;
      maxDelayTicks: number;
      durationIncPerDelay: number;
      heightVariation: {
        start: number;
        finish: number;
        scaling: number;
      };
      isTracking: boolean;
      isFixedAngle: boolean;
      canClashWithHero: boolean;
      beamUnitType: string;
      components: {
        name: string,
      }[];
    },
  ) {
    this.name = input.name;
    this.repeatInterval = input.repeatInterval;
    this.beamHpMult = input.beamHpMult;
    this.beamHpAttribute = input.beamHpAttribute;
    this.speed = input.speed;
    this.aoe = input.aoe;
    this.clashingDelayTicks = input.clashingDelayTicks;
    this.maxDelayTicks = input.maxDelayTicks;
    this.durationIncPerDelay = input.durationIncPerDelay;
    this.heightVariation = new HeightVariation().deserialize(input.heightVariation);
    this.isTracking = input.isTracking;
    this.isFixedAngle = input.isFixedAngle;
    this.canClashWithHero = input.canClashWithHero;
    this.beamUnitType = FourCC(input.beamUnitType);
    return this;
  }

  addComponent(component: AbilityComponent) {
    return this.components.push(component);
  }
}