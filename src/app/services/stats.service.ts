import { Injectable } from '@angular/core';
import { Activity, Energy } from '../models/activity.model';

export type MagnoliaState = 'bloom' | 'fade' | 'wilt';
export type InsightType = 'success' | 'warning';

export interface DayBar {
  label: string;
  travel: number;
  shopping: number;
  energy: number;
  total: number;
  isToday: boolean;
}

export interface InsightCard {
  type: InsightType;
  text: string;
}

export interface PeriodStats {
  totalEmission: number;
  byCategory: { travel: number; shopping: number; energy: number };
  categoryPercent: { travel: number; shopping: number; energy: number };
  dailyBars: DayBar[];
  bestDay: { label: string; emission: number } | null;
  worstDay: { label: string; emission: number } | null;
  previousPeriodEmission: number;
  percentChange: number | null;
  insight: InsightCard;
  treeCount: number;
  magnoliaState: MagnoliaState;
  periodLimitKg: number;
  barLimitKg: number;
}

@Injectable({ providedIn: 'root' })
export class StatsService {
  readonly DAILY_LIMIT_KG = 10;
  readonly TREE_KG_PER_YEAR = 21;

  private readonly DAY_LABELS = ['V', 'H', 'K', 'Sze', 'Cs', 'P', 'Szo'];
  private readonly WEEK_LABELS = ['4 hete', '3 hete', '2 hete', 'Ez a hét'];
  private readonly MONTH_LABELS = ['Jan', 'Feb', 'Már', 'Ápr', 'Máj', 'Jún',
                                    'Júl', 'Aug', 'Szep', 'Okt', 'Nov', 'Dec'];

  computeWeekStats(activities: Activity[]): PeriodStats {
    const today = new Date();
    const periodLimitKg = this.DAILY_LIMIT_KG * 7;
    const barLimitKg = this.DAILY_LIMIT_KG;

    const bars: DayBar[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dayActs = activities.filter(a => this.isSameDay(this.toDate(a.timestamp), d));
      const travel = this.sumCat(dayActs, 'travel');
      const shopping = this.sumCat(dayActs, 'shopping');
      const energy = dayActs
        .filter(a => a.type === 'energy')
        .reduce((s, a) => s + this.getDailyEmission(a), 0);
      bars.push({ label: this.DAY_LABELS[d.getDay()], travel, shopping, energy,
                  total: travel + shopping + energy, isToday: i === 0 });
    }

    const totalEmission = bars.reduce((s, b) => s + b.total, 0);
    const byCategory = {
      travel: bars.reduce((s, b) => s + b.travel, 0),
      shopping: bars.reduce((s, b) => s + b.shopping, 0),
      energy: bars.reduce((s, b) => s + b.energy, 0),
    };

    let prevTotal = 0;
    for (let i = 7; i <= 13; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      prevTotal += this.sumAll(activities.filter(a => this.isSameDay(this.toDate(a.timestamp), d)));
    }

    return this.build(bars, totalEmission, byCategory, prevTotal, periodLimitKg, barLimitKg);
  }

  computeMonthStats(activities: Activity[]): PeriodStats {
    const today = new Date();
    const periodLimitKg = this.DAILY_LIMIT_KG * 28;
    const barLimitKg = this.DAILY_LIMIT_KG * 7;

    const bars: DayBar[] = [];
    for (let week = 3; week >= 0; week--) {
      let travel = 0, shopping = 0;
      const weekDays: Date[] = [];
      for (let day = 0; day < 7; day++) {
        const d = new Date(today);
        d.setDate(today.getDate() - week * 7 - day);
        weekDays.push(d);
        const da = activities.filter(a => this.isSameDay(this.toDate(a.timestamp), d));
        travel += this.sumCat(da, 'travel');
        shopping += this.sumCat(da, 'shopping');
      }
      const weekEnergyActs = activities.filter(
        a => a.type === 'energy' && weekDays.some(d => this.isSameDay(this.toDate(a.timestamp), d))
      );
      const energy = weekEnergyActs.reduce((s, a) => s + this.getDailyEmission(a) * 7, 0);

      bars.push({ label: this.WEEK_LABELS[3 - week], travel, shopping, energy,
                  total: travel + shopping + energy, isToday: week === 0 });
    }

    const totalEmission = bars.reduce((s, b) => s + b.total, 0);
    const byCategory = {
      travel: bars.reduce((s, b) => s + b.travel, 0),
      shopping: bars.reduce((s, b) => s + b.shopping, 0),
      energy: bars.reduce((s, b) => s + b.energy, 0),
    };

    let prevTotal = 0;
    for (let i = 28; i < 56; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      prevTotal += this.sumAll(activities.filter(a => this.isSameDay(this.toDate(a.timestamp), d)));
    }

    return this.build(bars, totalEmission, byCategory, prevTotal, periodLimitKg, barLimitKg);
  }

  computeYearStats(activities: Activity[]): PeriodStats {
    const today = new Date();
    const periodLimitKg = this.DAILY_LIMIT_KG * 365;
    const barLimitKg = this.DAILY_LIMIT_KG * 30;

    const bars: DayBar[] = [];
    for (let m = 11; m >= 0; m--) {
      const d = new Date(today.getFullYear(), today.getMonth() - m, 1);
      const monthActs = activities.filter(a => {
        const ad = this.toDate(a.timestamp);
        return ad.getMonth() === d.getMonth() && ad.getFullYear() === d.getFullYear();
      });
      const travel = this.sumCat(monthActs, 'travel');
      const shopping = this.sumCat(monthActs, 'shopping');
      const energy = monthActs
        .filter(a => a.type === 'energy')
        .reduce((s, a) => s + this.getDailyEmission(a) * 30, 0);
      bars.push({ label: this.MONTH_LABELS[d.getMonth()], travel, shopping, energy,
                  total: travel + shopping + energy, isToday: m === 0 });
    }

    const totalEmission = bars.reduce((s, b) => s + b.total, 0);
    const byCategory = {
      travel: bars.reduce((s, b) => s + b.travel, 0),
      shopping: bars.reduce((s, b) => s + b.shopping, 0),
      energy: bars.reduce((s, b) => s + b.energy, 0),
    };

    let prevTotal = 0;
    for (let m = 12; m <= 23; m++) {
      const d = new Date(today.getFullYear(), today.getMonth() - m, 1);
      const monthActs = activities.filter(a => {
        const ad = this.toDate(a.timestamp);
        return ad.getMonth() === d.getMonth() && ad.getFullYear() === d.getFullYear();
      });
      prevTotal += this.sumCat(monthActs, 'travel') + this.sumCat(monthActs, 'shopping')
        + monthActs.filter(a => a.type === 'energy').reduce((s, a) => s + this.getDailyEmission(a) * 30, 0);
    }

    return this.build(bars, totalEmission, byCategory, prevTotal, periodLimitKg, barLimitKg);
  }

  computeTodayEmission(activities: Activity[]): number {
    const today = new Date();
    return activities
      .filter(a => this.isSameDay(this.toDate(a.timestamp), today))
      .reduce((s, a) => {
        if (a.type === 'energy') return s + this.getDailyEmission(a);
        return s + (a.emission || 0);
      }, 0);
  }

  getTodayMagnoliaState(todayEmission: number): MagnoliaState {
    if (todayEmission <= this.DAILY_LIMIT_KG * 0.7) return 'bloom';
    if (todayEmission <= this.DAILY_LIMIT_KG) return 'fade';
    return 'wilt';
  }

  getWeeklyStreak(activities: Activity[]): number {
    const today = new Date();
    let streak = 0;
    for (let i = 0; i < 60; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dayActs = activities.filter(a => this.isSameDay(this.toDate(a.timestamp), d));
      const dayTotal = this.sumAll(dayActs);
      if (dayTotal === 0) {
        if (i === 0) continue;
        break;
      }
      if (dayTotal <= this.DAILY_LIMIT_KG) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  }

  getLongestStreakInPeriod(activities: Activity[], period: 'week' | 'month' | 'year'): number {
    const today = new Date();
    const days = period === 'week' ? 7 : period === 'month' ? 28 : 365;

    let longest = 0;
    let current = 0;

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dayActs = activities.filter(a => this.isSameDay(this.toDate(a.timestamp), d));
      const dayTotal = this.sumAll(dayActs);

      if (dayTotal > 0 && dayTotal <= this.DAILY_LIMIT_KG) {
        current++;
        if (current > longest) longest = current;
      } else {
        current = 0;
      }
    }

    return longest;
  }

  getTodayInsight(activities: Activity[], streak: number): InsightCard {
    const todayEmission = this.computeTodayEmission(activities);
    if (streak >= 3) {
      return { type: 'success',
        text: `Szuper széria! Zsinórban ${streak} napja a limit alatt vagy!` };
    }
    if (todayEmission > this.DAILY_LIMIT_KG) {
      return { type: 'warning',
        text: `Ma már ${todayEmission.toFixed(1)} kg – a napi ${this.DAILY_LIMIT_KG} kg limitet átlépted. Holnap újra!` };
    }
    if (todayEmission > 0) {
      const remaining = (this.DAILY_LIMIT_KG - todayEmission).toFixed(1);
      return { type: 'success',
        text: `Ma eddig ${todayEmission.toFixed(1)} kg – még ${remaining} kg maradt a napi limitből.` };
    }
    return { type: 'success', text: 'Még nincs mai tevékenységed. Rögzítsd az első bejegyzésedet!' };
  }

  getTreeIcons(treeCount: number): Array<'full' | 'partial' | 'empty'> {
    const display = 5;
    const full = Math.min(Math.floor(treeCount), display);
    const hasPartial = treeCount > full && full < display;
    const result: Array<'full' | 'partial' | 'empty'> = [];
    for (let i = 0; i < display; i++) {
      if (i < full) result.push('full');
      else if (i === full && hasPartial) result.push('partial');
      else result.push('empty');
    }
    return result;
  }

  private build(
    bars: DayBar[],
    totalEmission: number,
    byCategory: { travel: number; shopping: number; energy: number },
    previousPeriodEmission: number,
    periodLimitKg: number,
    barLimitKg: number,
  ): PeriodStats {
    const catTotal = byCategory.travel + byCategory.shopping + byCategory.energy;
    const categoryPercent = {
      travel: catTotal > 0 ? Math.round((byCategory.travel / catTotal) * 100) : 0,
      shopping: catTotal > 0 ? Math.round((byCategory.shopping / catTotal) * 100) : 0,
      energy: catTotal > 0 ? Math.round((byCategory.energy / catTotal) * 100) : 0,
    };

    const activeBars = bars.filter(b => b.total > 0);
    const bestDay = activeBars.length > 0
      ? (() => { const b = activeBars.reduce((m, x) => x.total < m.total ? x : m);
                 return { label: b.label, emission: b.total }; })()
      : null;
    const worstDay = activeBars.length > 0
      ? (() => { const b = activeBars.reduce((m, x) => x.total > m.total ? x : m);
                 return { label: b.label, emission: b.total }; })()
      : null;

    const percentChange = previousPeriodEmission > 0
      ? Math.round(((totalEmission - previousPeriodEmission) / previousPeriodEmission) * 100)
      : null;

    const treeCount = totalEmission / this.TREE_KG_PER_YEAR;

    const magnoliaState: MagnoliaState = totalEmission <= periodLimitKg * 0.7
      ? 'bloom'
      : totalEmission <= periodLimitKg
        ? 'fade'
        : 'wilt';

    const insight = this.buildInsight(categoryPercent, percentChange, totalEmission, periodLimitKg);

    return { totalEmission, byCategory, categoryPercent, dailyBars: bars,
             bestDay, worstDay, previousPeriodEmission, percentChange,
             insight, treeCount, magnoliaState, periodLimitKg, barLimitKg };
  }

  private buildInsight(
    pct: { travel: number; shopping: number; energy: number },
    percentChange: number | null,
    total: number,
    limit: number,
  ): InsightCard {
    if (pct.shopping > 60) {
      return { type: 'warning',
        text: `A vásárlásaid adják a lábnyomod ${pct.shopping}%-át. Próbálj meg egy húsmentes napot beiktatni!` };
    }
    if (pct.travel > 65) {
      return { type: 'warning',
        text: `Az utazásaid adják a lábnyomod ${pct.travel}%-át. Próbálj tömegközlekedést használni!` };
    }
    if (pct.energy > 60) {
      return { type: 'warning',
        text: `Az energia-felhasználásod adja a lábnyomod ${pct.energy}%-át. Érdemes átnézni az otthoni fogyasztásodat!` };
    }
    if (percentChange !== null && percentChange <= -10) {
      return { type: 'success',
        text: `Szuper! A múlt időszakhoz képest ${Math.abs(percentChange)}%-kal csökkentetted a lábnyomodat!` };
    }
    if (total < limit * 0.7) {
      return { type: 'success', text: 'Kiváló! Jóval a fenntartható limit alatt vagy. Tartsd fenn ezt a tempót!' };
    }
    if (total > limit) {
      return { type: 'warning', text: 'Túllépted az időszaki limitet. Holnap egy tudatos döntés sokat számíthat!' };
    }
    return { type: 'success', text: 'Jó úton jársz! A kibocsátásod a fenntartható limit közelében van.' };
  }

  private isSameDay(a: Date, b: Date): boolean {
    return a.getFullYear() === b.getFullYear() &&
           a.getMonth() === b.getMonth() &&
           a.getDate() === b.getDate();
  }

  toDate(ts: any): Date {
    if (ts instanceof Date) return ts;
    if (ts?.toMillis) return new Date(ts.toMillis());
    if (ts?.seconds) return new Date(ts.seconds * 1000);
    return new Date(ts);
  }

  private sumCat(acts: Activity[], type: string): number {
    return acts.filter(a => a.type === type).reduce((s, a) => s + (a.emission || 0), 0);
  }

  private sumAll(acts: Activity[]): number {
    return acts.reduce((s, a) => {
      if (a.type === 'energy') return s + this.getDailyEmission(a);
      return s + (a.emission || 0);
    }, 0);
  }

  private getDailyEmission(activity: Activity): number {
    const details = activity.details as Energy;
    const days = details.period === 'week' ? 7 : details.period === 'month' ? 30 : 365;
    return activity.emission / days;
  }
}
