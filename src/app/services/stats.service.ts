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
  private readonly MONTH_LABELS = [
    'Jan', 'Feb', 'Már', 'Ápr', 'Máj', 'Jún',
    'Júl', 'Aug', 'Szep', 'Okt', 'Nov', 'Dec',
  ];

  private getMonday(date: Date): Date {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diff);
    return d;
  }

  private getEnergyForDay(activity: Activity, day: Date): number {
    const details = activity.details as Energy;
    const billingDate = this.toDate(details.billingDate ?? activity.timestamp);
    if (details.period === 'month') {
      if (
        billingDate.getFullYear() === day.getFullYear() &&
        billingDate.getMonth() === day.getMonth()
      ) {
        const daysInMonth = new Date(
          billingDate.getFullYear(),
          billingDate.getMonth() + 1,
          0,
        ).getDate();
        return activity.emission / daysInMonth;
      }
    } else if (details.period === 'year') {
      if (billingDate.getFullYear() === day.getFullYear()) {
        return activity.emission / 365;
      }
    }
    return 0;
  }

  private getEnergyForMonth(activity: Activity, year: number, month: number): number {
    const details = activity.details as Energy;
    const billingDate = this.toDate(details.billingDate ?? activity.timestamp);
    if (details.period === 'month') {
      if (billingDate.getFullYear() === year && billingDate.getMonth() === month) {
        return activity.emission;
      }
    } else if (details.period === 'year') {
      if (billingDate.getFullYear() === year) {
        return activity.emission / 12;
      }
    }
    return 0;
  }

  computeWeekStats(activities: Activity[]): PeriodStats {
    const today = new Date();
    const monday = this.getMonday(today);
    const periodLimitKg = this.DAILY_LIMIT_KG * 7;
    const barLimitKg = this.DAILY_LIMIT_KG;

    const bars: DayBar[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const dayActs = activities.filter((a) =>
        this.isSameDay(this.toDate(a.timestamp), d),
      );
      const travel = this.sumCat(dayActs, 'travel');
      const shopping = this.sumCat(dayActs, 'shopping');
      const energy = activities
        .filter((a) => a.type === 'energy')
        .reduce((s, a) => s + this.getEnergyForDay(a, d), 0);
      bars.push({
        label: this.DAY_LABELS[d.getDay()],
        travel,
        shopping,
        energy,
        total: travel + shopping + energy,
        isToday: this.isSameDay(d, today),
      });
    }

    const totalEmission = bars.reduce((s, b) => s + b.total, 0);
    const byCategory = {
      travel: bars.reduce((s, b) => s + b.travel, 0),
      shopping: bars.reduce((s, b) => s + b.shopping, 0),
      energy: bars.reduce((s, b) => s + b.energy, 0),
    };

    const prevMonday = new Date(monday);
    prevMonday.setDate(monday.getDate() - 7);
    let prevTotal = 0;
    for (let i = 0; i < 7; i++) {
      const d = new Date(prevMonday);
      d.setDate(prevMonday.getDate() + i);
      const dayActs = activities.filter((a) =>
        this.isSameDay(this.toDate(a.timestamp), d),
      );
      prevTotal += this.sumCat(dayActs, 'travel') + this.sumCat(dayActs, 'shopping');
      prevTotal += activities
        .filter((a) => a.type === 'energy')
        .reduce((s, a) => s + this.getEnergyForDay(a, d), 0);
    }

    return this.build(bars, totalEmission, byCategory, prevTotal, periodLimitKg, barLimitKg);
  }

  computeMonthStats(activities: Activity[]): PeriodStats {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const periodLimitKg = this.DAILY_LIMIT_KG * daysInMonth;
    const barLimitKg = this.DAILY_LIMIT_KG * 7;

    const bars: DayBar[] = [];
    let weekStart = this.getMonday(firstDay);
    let weekNum = 1;

    while (weekStart <= lastDay) {
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);

      let travel = 0, shopping = 0, energy = 0;
      for (let i = 0; i < 7; i++) {
        const d = new Date(weekStart);
        d.setDate(weekStart.getDate() + i);
        if (d < firstDay || d > lastDay) continue;
        const dayActs = activities.filter((a) =>
          this.isSameDay(this.toDate(a.timestamp), d),
        );
        travel += this.sumCat(dayActs, 'travel');
        shopping += this.sumCat(dayActs, 'shopping');
        energy += activities
          .filter((a) => a.type === 'energy')
          .reduce((s, a) => s + this.getEnergyForDay(a, d), 0);
      }

      bars.push({
        label: `${weekNum}. hét`,
        travel,
        shopping,
        energy,
        total: travel + shopping + energy,
        isToday: today >= weekStart && today <= weekEnd,
      });
      weekNum++;
      weekStart = new Date(weekStart);
      weekStart.setDate(weekStart.getDate() + 7);
    }

    const totalEmission = bars.reduce((s, b) => s + b.total, 0);
    const byCategory = {
      travel: bars.reduce((s, b) => s + b.travel, 0),
      shopping: bars.reduce((s, b) => s + b.shopping, 0),
      energy: bars.reduce((s, b) => s + b.energy, 0),
    };

    const prevYear = month === 0 ? year - 1 : year;
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevFirstDay = new Date(prevYear, prevMonth, 1);
    const prevLastDay = new Date(prevYear, prevMonth + 1, 0);
    let prevTotal = 0;
    const d = new Date(prevFirstDay);
    while (d <= prevLastDay) {
      const dayD = new Date(d);
      const dayActs = activities.filter((a) =>
        this.isSameDay(this.toDate(a.timestamp), dayD),
      );
      prevTotal += this.sumCat(dayActs, 'travel') + this.sumCat(dayActs, 'shopping');
      prevTotal += activities
        .filter((a) => a.type === 'energy')
        .reduce((s, a) => s + this.getEnergyForDay(a, dayD), 0);
      d.setDate(d.getDate() + 1);
    }

    return this.build(bars, totalEmission, byCategory, prevTotal, periodLimitKg, barLimitKg);
  }

  computeYearStats(activities: Activity[]): PeriodStats {
    const today = new Date();
    const year = today.getFullYear();
    const periodLimitKg = this.DAILY_LIMIT_KG * 365;
    const barLimitKg = this.DAILY_LIMIT_KG * 30;

    const bars: DayBar[] = [];
    for (let m = 0; m < 12; m++) {
      const monthActs = activities.filter((a) => {
        const ad = this.toDate(a.timestamp);
        return ad.getFullYear() === year && ad.getMonth() === m;
      });
      const travel = this.sumCat(monthActs, 'travel');
      const shopping = this.sumCat(monthActs, 'shopping');
      const energy = activities
        .filter((a) => a.type === 'energy')
        .reduce((s, a) => s + this.getEnergyForMonth(a, year, m), 0);
      bars.push({
        label: this.MONTH_LABELS[m],
        travel,
        shopping,
        energy,
        total: travel + shopping + energy,
        isToday: m === today.getMonth(),
      });
    }

    const totalEmission = bars.reduce((s, b) => s + b.total, 0);
    const byCategory = {
      travel: bars.reduce((s, b) => s + b.travel, 0),
      shopping: bars.reduce((s, b) => s + b.shopping, 0),
      energy: bars.reduce((s, b) => s + b.energy, 0),
    };

    const prevYear = year - 1;
    let prevTotal = 0;
    for (let m = 0; m < 12; m++) {
      const monthActs = activities.filter((a) => {
        const ad = this.toDate(a.timestamp);
        return ad.getFullYear() === prevYear && ad.getMonth() === m;
      });
      prevTotal += this.sumCat(monthActs, 'travel') + this.sumCat(monthActs, 'shopping');
      prevTotal += activities
        .filter((a) => a.type === 'energy')
        .reduce((s, a) => s + this.getEnergyForMonth(a, prevYear, m), 0);
    }

    return this.build(bars, totalEmission, byCategory, prevTotal, periodLimitKg, barLimitKg);
  }

  computeTodayEmission(activities: Activity[]): number {
    const today = new Date();
    return activities
      .filter((a) => this.isSameDay(this.toDate(a.timestamp), today))
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
      const dayActs = activities.filter((a) =>
        this.isSameDay(this.toDate(a.timestamp), d),
      );

      if (dayActs.length === 0) {
        if (i === 0) continue;
        break;
      }
      streak++;
    }
    return streak;
  }

  getLongestStreakInPeriod(
    activities: Activity[],
    period: 'week' | 'month' | 'year',
  ): number {
    const today = new Date();
    let startDate: Date;
    if (period === 'week') {
      startDate = this.getMonday(today);
    } else if (period === 'month') {
      startDate = new Date(today.getFullYear(), today.getMonth(), 1);
    } else {
      startDate = new Date(today.getFullYear(), 0, 1);
    }

    let longest = 0;
    let current = 0;
    const d = new Date(startDate);
    while (d <= today) {
      const dayD = new Date(d);
      const dayActs = activities.filter((a) =>
        this.isSameDay(this.toDate(a.timestamp), dayD),
      );
      const dayTotal = this.sumAll(dayActs);
      if (dayActs.length > 0 && dayTotal <= this.DAILY_LIMIT_KG) {
        current++;
        if (current > longest) longest = current;
      } else {
        current = 0;
      }
      d.setDate(d.getDate() + 1);
    }
    return longest;
  }

  getTodayInsight(activities: Activity[], streak: number): InsightCard {
    const todayEmission = this.computeTodayEmission(activities);
    if (streak >= 3) {
      return {
        type: 'success',
        text: `Szuper széria! Zsinórban ${streak} napja a limit alatt vagy!`,
      };
    }
    if (todayEmission > this.DAILY_LIMIT_KG) {
      return {
        type: 'warning',
        text: `Ma már ${todayEmission.toFixed(1)} kg – a napi ${this.DAILY_LIMIT_KG} kg limitet átlépted. Holnap újra!`,
      };
    }
    if (todayEmission > 0) {
      const remaining = (this.DAILY_LIMIT_KG - todayEmission).toFixed(1);
      return {
        type: 'success',
        text: `Ma eddig ${todayEmission.toFixed(1)} kg – még ${remaining} kg maradt a napi limitből.`,
      };
    }
    return {
      type: 'success',
      text: 'Még nincs mai tevékenységed. Rögzítsd az első bejegyzésedet!',
    };
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
    const catTotal =
      byCategory.travel + byCategory.shopping + byCategory.energy;
    const categoryPercent = {
      travel:
        catTotal > 0 ? Math.round((byCategory.travel / catTotal) * 100) : 0,
      shopping:
        catTotal > 0 ? Math.round((byCategory.shopping / catTotal) * 100) : 0,
      energy:
        catTotal > 0 ? Math.round((byCategory.energy / catTotal) * 100) : 0,
    };

    const activeBars = bars.filter((b) => b.total > 0);
    const bestDay =
      activeBars.length > 0
        ? (() => {
            const b = activeBars.reduce((m, x) => (x.total < m.total ? x : m));
            return { label: b.label, emission: b.total };
          })()
        : null;
    const worstDay =
      activeBars.length > 0
        ? (() => {
            const b = activeBars.reduce((m, x) => (x.total > m.total ? x : m));
            return { label: b.label, emission: b.total };
          })()
        : null;

    const percentChange =
      previousPeriodEmission > 0
        ? Math.round(
            ((totalEmission - previousPeriodEmission) /
              previousPeriodEmission) *
              100,
          )
        : null;

    const treeCount = totalEmission / this.TREE_KG_PER_YEAR;

    const magnoliaState: MagnoliaState =
      totalEmission <= periodLimitKg * 0.7
        ? 'bloom'
        : totalEmission <= periodLimitKg
          ? 'fade'
          : 'wilt';

    const insight = this.buildInsight(
      categoryPercent,
      percentChange,
      totalEmission,
      periodLimitKg,
    );

    return {
      totalEmission,
      byCategory,
      categoryPercent,
      dailyBars: bars,
      bestDay,
      worstDay,
      previousPeriodEmission,
      percentChange,
      insight,
      treeCount,
      magnoliaState,
      periodLimitKg,
      barLimitKg,
    };
  }

  private buildInsight(
    pct: { travel: number; shopping: number; energy: number },
    percentChange: number | null,
    total: number,
    limit: number,
  ): InsightCard {
    if (pct.shopping > 60) {
      return {
        type: 'warning',
        text: `A vásárlásaid adják a lábnyomod ${pct.shopping}%-át. Próbálj meg egy húsmentes napot beiktatni!`,
      };
    }
    if (pct.travel > 65) {
      return {
        type: 'warning',
        text: `Az utazásaid adják a lábnyomod ${pct.travel}%-át. Próbálj tömegközlekedést használni!`,
      };
    }
    if (pct.energy > 60) {
      return {
        type: 'warning',
        text: `Az energia-felhasználásod adja a lábnyomod ${pct.energy}%-át. Érdemes átnézni az otthoni fogyasztásodat!`,
      };
    }
    if (percentChange !== null && percentChange <= -10) {
      return {
        type: 'success',
        text: `Szuper! A múlt időszakhoz képest ${Math.abs(percentChange)}%-kal csökkentetted a lábnyomodat!`,
      };
    }
    if (total < limit * 0.7) {
      return {
        type: 'success',
        text: 'Kiváló! Jóval a fenntartható limit alatt vagy. Tartsd fenn ezt a tempót!',
      };
    }
    if (total > limit) {
      return {
        type: 'warning',
        text: 'Túllépted az időszaki limitet. Holnap egy tudatos döntés sokat számíthat!',
      };
    }
    return {
      type: 'success',
      text: 'Jó úton jársz! A kibocsátásod a fenntartható limit közelében van.',
    };
  }

  private isSameDay(a: Date, b: Date): boolean {
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  }

  toDate(ts: any): Date {
    if (ts instanceof Date) return ts;
    if (ts?.toMillis) return new Date(ts.toMillis());
    if (ts?.seconds) return new Date(ts.seconds * 1000);
    return new Date(ts);
  }

  private sumCat(acts: Activity[], type: string): number {
    return acts
      .filter((a) => a.type === type)
      .reduce((s, a) => s + (a.emission || 0), 0);
  }

  private sumAll(acts: Activity[]): number {
    return acts.reduce((s, a) => {
      if (a.type === 'energy') return s + this.getDailyEmission(a);
      return s + (a.emission || 0);
    }, 0);
  }

  private getDailyEmission(activity: Activity): number {
    const details = activity.details as Energy;
    const days = details.period === 'month' ? 30 : 365;
    return activity.emission / days;
  }
}
