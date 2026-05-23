import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { IonContent, IonButton, IonIcon } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import { AuthService } from 'src/app/services/auth.service';
import { take } from 'rxjs/operators';
import {
  leafOutline,
  statsChartOutline,
  cartOutline,
  trophyOutline,
  chevronBackOutline,
  chevronForwardOutline,
  navigateOutline,
} from 'ionicons/icons';

interface Fact {
  emoji: string;
  title: string;
  text: string;
}

@Component({
  selector: 'app-landing',
  templateUrl: './landing.page.html',
  styleUrls: ['./landing.page.scss'],
  standalone: true,
  imports: [IonContent, IonButton, IonIcon, CommonModule, RouterLink],
})
export class LandingPage implements OnInit, OnDestroy {
  readonly facts: Fact[] = [
    {
      emoji: '☕',
      title: 'A kávé meglepő titka',
      text: 'Egy csésze kávé előállítása kb. 0.28 kg CO₂ – ugyanannyi, mint 3 km autózás. Napi 2 kávé évente több mint 200 kg CO₂-t jelent!',
    },
    {
      emoji: '🥩',
      title: 'Húsfogyasztás és klíma',
      text: 'Egy kg marhahús előállítása ~27 kg CO₂-t termel – ez 130 km autóút egyenértéke. Egy növényi étkezés hetente akár 50%-ot is spórolhat!',
    },
    {
      emoji: '✈️',
      title: 'Repülés vs. vonat',
      text: 'Egy Budapest–London repülőjegy ~150 kg CO₂ – annyi, mint 1 500 km autózás. Vonattal ugyanez mindössze 6 kg CO₂!',
    },
    {
      emoji: '🛍️',
      title: 'A divatipar titka',
      text: 'Egy pamutpóló gyártása ~7 kg CO₂ – 33 km autóút. A fast fashion ipar az összes globális CO₂ kibocsátás 10%-át adja!',
    },
    {
      emoji: '🌱',
      title: 'Magyar karbonlábnyom',
      text: 'Az átlag magyar évi karbonlábnyoma ~11 tonna CO₂. A Párizsi Megállapodás célszintje 2 tonna – ez ötszörös csökkentést igényel!',
    },
    {
      emoji: '🚲',
      title: 'Kerékpár vs. autó',
      text: 'Ha autó helyett kerékpárral teszel meg napi 5 km-t, évente ~380 kg CO₂-t spórolsz meg – ez egy fa 18 éves munkája!',
    },
  ];

  currentIndex = 0;
  animating = false;
  private timer: any;
  private authService = inject(AuthService);
  private router = inject(Router);

  constructor() {
    addIcons({
      leafOutline,
      statsChartOutline,
      cartOutline,
      trophyOutline,
      chevronBackOutline,
      chevronForwardOutline,
      navigateOutline,
    });
  }

  ngOnInit(): void {
    this.authService.user$.pipe(take(1)).subscribe(user => {
      if (user) {
        this.router.navigate(['/home'], { replaceUrl: true });
      }
    });
    this.startTimer();
  }

  ngOnDestroy(): void {
    clearInterval(this.timer);
  }

  prev(): void {
    if (this.animating) return;
    this.currentIndex = (this.currentIndex - 1 + this.facts.length) % this.facts.length;
    this.resetTimer();
  }

  next(): void {
    if (this.animating) return;
    this.currentIndex = (this.currentIndex + 1) % this.facts.length;
    this.resetTimer();
  }

  goTo(i: number): void {
    if (this.animating || i === this.currentIndex) return;
    this.currentIndex = i;
    this.resetTimer();
  }

  private startTimer(): void {
    this.timer = setInterval(() => {
      this.currentIndex = (this.currentIndex + 1) % this.facts.length;
    }, 4500);
  }

  private resetTimer(): void {
    clearInterval(this.timer);
    this.startTimer();
  }
}
