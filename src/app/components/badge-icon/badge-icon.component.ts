import { Component, Input, OnChanges, SimpleChanges, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BadgeRarity } from 'src/app/models/badge.model';

export type BadgeIconState = 'idle' | 'earned' | 'locked';

@Component({
  selector: 'app-badge-icon',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './badge-icon.component.html',
  styleUrls: ['./badge-icon.component.scss'],
})
export class BadgeIconComponent implements OnChanges {
  @Input() badgeId!: string;
  @Input() rarity: BadgeRarity = 'common';
  @Input() state: BadgeIconState = 'idle';
  @Input() size: number = 96;

  get assetPath(): string {
    const fileName = BadgeIconComponent.ID_TO_FILE[this.badgeId];
    return fileName
      ? `assets/badges/${fileName}`
      : 'assets/badges/placeholder.svg';
  }

  get sizePx(): string {
    return `${this.size}px`;
  }

  ngOnChanges(_changes: SimpleChanges): void {}

  private static readonly ID_TO_FILE: Record<string, string> = {
    first_activity:              '01-elso-lepes.svg',
    first_travel:                '02-uton-utfelen.svg',
    first_shopping:              '03-tudatos-vasarlo.svg',
    first_energy:                '04-energia-figyelo.svg',
    first_goal:                  '05-celba-ertem.svg',
    first_challenge:             '06-kihivas-elfogadva.svg',

    goal_meatless_month:         '07-zold-szakacs.svg',
    goal_public_transport:       '08-bkv-bajnok.svg',
    goal_active_travel:          '09-aktiv-mozgo.svg',
    goal_co2_reduction:          '10-labnyom-mester.svg',
    goal_consistent:             '11-vas-szorgalom.svg',
    all_goals:                   '12-oko-mester.svg',
    
    challenge_5:                 '13-kihivas-kezdo.svg',
    challenge_10:                '14-kihivas-harcos.svg',
    challenge_20:                '15-kihivas-veteran.svg',
    challenge_50:                '16-kihivas-legenda.svg',
    
    activity_10:                 '17-szorgalmas-naplozo.svg',
    activity_50:                 '18-rutinosodo-eco-harcos.svg',
    activity_100:                '19-szazad-vitez.svg',
    activity_500:                '20-elkotelezett-zold-harcos.svg',

    level_5:                     '21-fiatal-fa.svg',
    level_max:                   '22-bolygolako.svg',

    streak_7:                    '23-heti-hos.svg',
    streak_30:                   '24-havi-megallithatatlan.svg',
  };
}
