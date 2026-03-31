import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { Activity } from 'src/app/models/activity.model';
import { AuthService } from 'src/app/services/auth.service';
import { DataService } from 'src/app/services/data.service';
import { StatsService, PeriodStats, DayBar, MagnoliaState } from 'src/app/services/stats.service';
import { NavigationComponent } from 'src/app/components/navigation/navigation.component';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonFooter, IonIcon,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  leafOutline, leaf, flameOutline, trophyOutline, warningOutline,
  trendingDownOutline, trendingUpOutline, calendarOutline,
} from 'ionicons/icons';

export type Period = 'week' | 'month' | 'year';

@Component({
  selector: 'app-stats',
  templateUrl: './stats.page.html',
  styleUrls: ['./stats.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    NavigationComponent,
    IonHeader, IonToolbar, IonTitle, IonContent, IonFooter, IonIcon,
  ],
})
export class StatsPage implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private dataService = inject(DataService);
  statsService = inject(StatsService);

  readonly Math = Math;

  private sub?: Subscription;
  activities: Activity[] = [];

  selectedPeriod: Period = 'week';
  stats: PeriodStats | null = null;

  readonly CHART_HEIGHT = 120;
  readonly DAILY_LIMIT = this.statsService.DAILY_LIMIT_KG;
  readonly KSH_YEARLY_KG = 6350;

  constructor() {
    addIcons({
      leafOutline, leaf, flameOutline, trophyOutline, warningOutline,
      trendingDownOutline, trendingUpOutline, calendarOutline,
    });
  }

  ngOnInit() {
    const user = this.authService.currentUser;
    if (user) {
      this.sub = this.dataService.getUserActivities(user.uid).subscribe(acts => {
        this.activities = acts;
        this.compute();
      });
    }
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  selectPeriod(p: Period) {
    this.selectedPeriod = p;
    this.compute();
  }

  private compute() {
    switch (this.selectedPeriod) {
      case 'week':  this.stats = this.statsService.computeWeekStats(this.activities); break;
      case 'month': this.stats = this.statsService.computeMonthStats(this.activities); break;
      case 'year':  this.stats = this.statsService.computeYearStats(this.activities); break;
    }
  }

  getChartMax(): number {
    if (!this.stats) return 10;
    const maxBar = Math.max(...this.stats.dailyBars.map(b => b.total), this.stats.barLimitKg);
    return maxBar || 1;
  }

  getBarHeightPx(bar: DayBar): number {
    if (bar.total === 0) return 0;
    return Math.round((bar.total / this.getChartMax()) * this.CHART_HEIGHT);
  }

  getSegmentHeightPx(bar: DayBar, type: 'travel' | 'shopping' | 'energy'): number {
    if (bar.total === 0 || bar[type] === 0) return 0;
    return Math.round((bar[type] / bar.total) * this.getBarHeightPx(bar));
  }

  getLimitLinePx(): number {
    if (!this.stats) return 0;
    return Math.round((this.stats.barLimitKg / this.getChartMax()) * this.CHART_HEIGHT);
  }

  getTreeIcons(): Array<'full' | 'partial' | 'empty'> {
    return this.statsService.getTreeIcons(this.stats?.treeCount ?? 0);
  }

  getPeriodLabel(): string {
    switch (this.selectedPeriod) {
      case 'week':  return 'Ez a hét';
      case 'month': return 'Ez a hónap';
      case 'year':  return 'Ez az év';
    }
  }

  getLimitLabel(): string {
    switch (this.selectedPeriod) {
      case 'week':  return 'Heti limit: 70 kg';
      case 'month': return `Havi limit: ${this.stats ? Math.round(this.stats.periodLimitKg) : 280} kg`;
      case 'year':  return 'Éves limit: 3 650 kg';
    }
  }

  getLimitProgressValue(): number {
    if (!this.stats || this.stats.periodLimitKg === 0) return 0;
    return Math.min(1, this.stats.totalEmission / this.stats.periodLimitKg);
  }

  getDayCount(): number {
    switch (this.selectedPeriod) {
      case 'week':  return 7;
      case 'month': return 28;
      case 'year':  return 365;
    }
  }

  getDailyAvg(): number {
    if (!this.stats || this.stats.totalEmission === 0) return 0;
    const days = this.getActualPeriodDays();
    return Math.round((this.stats.totalEmission / days) * 10) / 10;
  }

  getHungarianAvg(): number {
    return Math.round(this.KSH_YEARLY_KG / 365 * this.getActualPeriodDays());
  }

  private getActualPeriodDays(): number {
    if (this.selectedPeriod === 'week') return 7;
    if (this.selectedPeriod === 'year') return 365;
    return this.stats ? Math.round(this.stats.periodLimitKg / this.DAILY_LIMIT) : 30;
  }

  getMagnoliaStatusText(): string {
    if (!this.stats) return '';
    const remaining = this.stats.periodLimitKg - this.stats.totalEmission;
    if (remaining > 0) {
      return `Még ${remaining.toFixed(1)} kg maradt a limitből`;
    }
    return `${Math.abs(remaining).toFixed(1)} kg-ot lépted túl`;
  }
}
