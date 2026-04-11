import { TestBed } from '@angular/core/testing';
import { StatsService } from './stats.service';
import { Activity } from '../models/activity.model';

// Helper: create a minimal Activity with a plain Date timestamp
function makeActivity(
  type: 'travel' | 'shopping' | 'energy',
  emission: number,
  date: Date,
  details: any = {},
): Activity {
  return {
    id: Math.random().toString(36).slice(2),
    userId: 'test-user',
    type,
    emission,
    timestamp: date,
    details,
  } as unknown as Activity;
}

function today(): Date {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  return d;
}

function daysAgo(n: number): Date {
  const d = today();
  d.setDate(d.getDate() - n);
  return d;
}

describe('StatsService', () => {
  let service: StatsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StatsService);
  });

  // --- getTodayMagnoliaState ---

  it('should return "bloom" when emission is well below the daily limit', () => {
    expect(service.getTodayMagnoliaState(0)).toBe('bloom');
    expect(service.getTodayMagnoliaState(6)).toBe('bloom'); // 60% of 10 kg limit
  });

  it('should return "fade" when emission is between 70% and 100% of limit', () => {
    expect(service.getTodayMagnoliaState(8)).toBe('fade');
    expect(service.getTodayMagnoliaState(10)).toBe('fade');
  });

  it('should return "wilt" when emission exceeds the daily limit', () => {
    expect(service.getTodayMagnoliaState(11)).toBe('wilt');
    expect(service.getTodayMagnoliaState(25)).toBe('wilt');
  });

  // --- getTreeIcons ---

  it('should return 5 empty icons when treeCount is 0', () => {
    const icons = service.getTreeIcons(0);
    expect(icons).toEqual(['empty', 'empty', 'empty', 'empty', 'empty']);
  });

  it('should return all full icons when treeCount >= 5', () => {
    const icons = service.getTreeIcons(5);
    expect(icons).toEqual(['full', 'full', 'full', 'full', 'full']);
  });

  it('should include a partial icon for fractional treeCount', () => {
    const icons = service.getTreeIcons(2.7);
    expect(icons[0]).toBe('full');
    expect(icons[1]).toBe('full');
    expect(icons[2]).toBe('partial');
    expect(icons[3]).toBe('empty');
    expect(icons[4]).toBe('empty');
  });

  // --- computeTodayEmission ---

  it('should return 0 when there are no activities', () => {
    expect(service.computeTodayEmission([])).toBe(0);
  });

  it('should sum emissions only for today (travel + shopping)', () => {
    const acts: Activity[] = [
      makeActivity('travel', 5, today()),
      makeActivity('shopping', 3, today()),
      makeActivity('travel', 7, daysAgo(2)), // outside today — must be ignored
    ];
    expect(service.computeTodayEmission(acts)).toBeCloseTo(8, 1);
  });

  // --- getWeeklyStreak ---

  it('should return 0 streak when there are no activities', () => {
    expect(service.getWeeklyStreak([])).toBe(0);
  });

  it('should count consecutive days ending today', () => {
    const acts: Activity[] = [
      makeActivity('travel', 1, today()),
      makeActivity('travel', 1, daysAgo(1)),
      makeActivity('travel', 1, daysAgo(2)),
      // gap: daysAgo(3) missing
      makeActivity('travel', 1, daysAgo(4)),
    ];
    expect(service.getWeeklyStreak(acts)).toBe(3);
  });

  it('streak should not break if today has no activities yet (gap at 0 is skipped)', () => {
    const acts: Activity[] = [
      makeActivity('travel', 1, daysAgo(1)),
      makeActivity('travel', 1, daysAgo(2)),
    ];
    // today is empty → loop skips i=0 and continues; streak = 2
    expect(service.getWeeklyStreak(acts)).toBe(2);
  });

  // --- getTodayInsight ---

  it('should return a streak-based success insight when streak >= 3', () => {
    const insight = service.getTodayInsight([], 5);
    expect(insight.type).toBe('success');
    expect(insight.text).toContain('5');
  });

  it('should return a warning insight when today emission exceeds limit', () => {
    const acts: Activity[] = [makeActivity('travel', 15, today())];
    const insight = service.getTodayInsight(acts, 0);
    expect(insight.type).toBe('warning');
  });

  it('should return success with remaining kg when emission is partial', () => {
    const acts: Activity[] = [makeActivity('shopping', 4, today())];
    const insight = service.getTodayInsight(acts, 0);
    expect(insight.type).toBe('success');
    expect(insight.text).toContain('6.0'); // 10 - 4 = 6.0 remaining
  });

  // --- toDate helper ---

  it('should convert Firestore Timestamp-like object to Date', () => {
    const ts = { seconds: 1700000000, nanoseconds: 0 };
    const result = service.toDate(ts);
    expect(result instanceof Date).toBe(true);
    expect(result.getTime()).toBe(1700000000 * 1000);
  });
});
