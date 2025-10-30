# app\app.component.html

```html
<ion-app> <ion-router-outlet></ion-router-outlet> </ion-app>
```

# app\app.component.scss

```scss

```

# app\app.component.spec.ts

```ts
import { TestBed } from '@angular/core/testing'; import { provideRouter } from '@angular/router'; import { AppComponent } from './app.component'; describe('AppComponent', () => { it('should create the app', async () => { await TestBed.configureTestingModule({ imports: [AppComponent], providers: [provideRouter([])] }).compileComponents(); const fixture = TestBed.createComponent(AppComponent); const app = fixture.componentInstance; expect(app).toBeTruthy(); }); });
```

# app\app.component.ts

```ts
import { Component } from '@angular/core'; import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone'; @Component({ selector: 'app-root', templateUrl: 'app.component.html', imports: [IonApp, IonRouterOutlet], }) export class AppComponent { constructor() {} }
```

# app\app.routes.ts

```ts
import { Routes } from '@angular/router'; import { AuthGuard } from './services/auth.guard'; export const routes: Routes = [ { path: 'home', loadComponent: () => import('./pages/home/home.page').then((m) => m.HomePage), }, { path: 'activity', loadComponent: () => import('./pages/activity/activity.page').then(m => m.ActivityPage) }, { path: 'social', loadComponent: () => import('./pages/social/social.page').then( m => m.SocialPage) }, { path: 'profile', loadComponent: () => import('./pages/profile/profile.page').then(m => m.ProfilePage) }, { path: '', redirectTo: 'home', pathMatch: 'full' }, { path: '**', redirectTo: 'home' } ];
```

# app\components\challenges\challenges.component.html

```html
<div class="tab-content"> <div class="section-header"> <div class="section-title"> <ion-icon name="flame"></ion-icon> <h3>Aktív kihívások</h3> </div> </div> <div class="challenges-list"> <div class="challenge-item"> <div class="challenge-icon"> <ion-icon name="trophy"></ion-icon> </div> <div class="challenge-content"> <div class="challenge-header"> <h4>Weekend Warrior</h4> <span class="time-badge">2 nap van hátra</span> </div> <p class="challenge-desc">Csökkentsd a kibocsátást 30%-kal</p> <div class="challenge-progress"> <ion-progress-bar value="0.65"></ion-progress-bar> <div class="challenge-stats"> <span>65% teljesítve</span> <div class="participants"> <ion-icon name="people"></ion-icon> <span>24 résztvevő</span> </div> </div> </div> </div> </div> <div class="challenge-item"> <div class="challenge-icon"> <ion-icon name="radio-button-on"></ion-icon> </div> <div class="challenge-content"> <div class="challenge-header"> <h4>Zero Waste Week</h4> <span class="time-badge green">5 nap van hátra</span> </div> <p class="challenge-desc">Rögzíts 7 napnyi öko-tevékenységet</p> <div class="challenge-progress"> <ion-progress-bar value="0.43"></ion-progress-bar> <div class="challenge-stats"> <span>3 / 7 nap</span> <div class="reward"> <ion-icon name="flash"></ion-icon> <span>+500 XP jutalom</span> </div> </div> </div> </div> </div> </div> <div class="section-header"> <h3>Csatlakozz új kihíváshoz</h3> </div> <div class="join-challenges"> <div class="join-challenge-item"> <div class="join-icon"> <ion-icon name="radio-button-on"></ion-icon> </div> <div class="join-info"> <p class="join-title">Eco Transport</p> <p class="join-desc">Használj tömegközlekedést 5 napig</p> </div> <button class="join-btn">Csatlakozás</button> </div> <div class="join-challenge-item"> <div class="join-icon"> <ion-icon name="leaf"></ion-icon> </div> <div class="join-info"> <p class="join-title">Green Shopping</p> <p class="join-desc">Vásárolj 10 helyi terméket</p> </div> <button class="join-btn">Csatlakozás</button> </div> </div> </div>
```

# app\components\challenges\challenges.component.scss

```scss
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; .section-title { display: flex; align-items: center; gap: 8px; ion-icon { font-size: 1.5rem; color: #2d4a3e; } h3 { color: #2d4a3e; font-size: 1.1rem; font-weight: 600; margin: 0; } } } .challenges-list { display: flex; flex-direction: column; gap: 12px; margin-bottom: 32px; .challenge-item { background: white; border: 2px solid #e0e0d8; border-radius: 16px; padding: 16px; display: flex; gap: 12px; .challenge-icon { width: 48px; height: 48px; background: #5a7a6a; border-radius: 12px; display: flex; justify-content: center; align-items: center; flex-shrink: 0; ion-icon { font-size: 1.5rem; color: white; } } .challenge-content { flex: 1; .challenge-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; h4 { color: #2d4a3e; font-size: 0.95rem; font-weight: 600; margin: 0; } .time-badge { background: #e8f0e6; color: #5a7a6a; font-size: 0.75rem; font-weight: 600; padding: 4px 8px; border-radius: 10px; &.green { background: #d0e8d0; } } } .challenge-desc { color: #7a7a7a; font-size: 0.85rem; margin: 0 0 12px 0; } .challenge-progress { ion-progress-bar { --background: rgba(138, 173, 147, 0.3); --progress-background: #5a7a6a; height: 6px; border-radius: 3px; margin-bottom: 8px; } .challenge-stats { display: flex; justify-content: space-between; align-items: center; font-size: 0.85rem; span { color: #7a7a7a; } .participants, .reward { display: flex; align-items: center; gap: 4px; color: #5a7a6a; ion-icon { font-size: 1rem; } } } } } } } .join-challenges { display: flex; flex-direction: column; gap: 12px; .join-challenge-item { background: white; border: 2px solid #e0e0d8; border-radius: 16px; padding: 16px; display: flex; align-items: center; gap: 12px; .join-icon { width: 48px; height: 48px; background: #f0f5ee; border-radius: 12px; display: flex; justify-content: center; align-items: center; flex-shrink: 0; ion-icon { font-size: 1.5rem; color: #5a7a6a; } } .join-info { flex: 1; .join-title { color: #2d4a3e; font-size: 0.95rem; font-weight: 600; margin: 0 0 4px 0; } .join-desc { color: #7a7a7a; font-size: 0.85rem; margin: 0; } } .join-btn { background: #5a7a6a; color: white; border: none; padding: 8px 16px; border-radius: 12px; font-size: 0.85rem; font-weight: 600; cursor: pointer; transition: all 0.2s; &:active { background: #4a6a5a; } } } }
```

# app\components\challenges\challenges.component.spec.ts

```ts
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'; import { IonicModule } from '@ionic/angular'; import { ChallengesComponent } from './challenges.component'; describe('ChallengesComponent', () => { let component: ChallengesComponent; let fixture: ComponentFixture<ChallengesComponent>; beforeEach(waitForAsync(() => { TestBed.configureTestingModule({ declarations: [ ChallengesComponent ], imports: [IonicModule.forRoot()] }).compileComponents(); fixture = TestBed.createComponent(ChallengesComponent); component = fixture.componentInstance; fixture.detectChanges(); })); it('should create', () => { expect(component).toBeTruthy(); }); });
```

# app\components\challenges\challenges.component.ts

```ts
import { Component, OnInit } from '@angular/core'; import { IonicModule } from '@ionic/angular'; @Component({ selector: 'app-challenges', templateUrl: './challenges.component.html', styleUrls: ['./challenges.component.scss'], imports: [IonicModule] }) export class ChallengesComponent implements OnInit { constructor() { } ngOnInit() {} }
```

# app\components\energy\energy.component.html

```html
<div class="activity-section"> <div class="section-header"> <div class="section-icon"> <ion-icon name="flash-outline"></ion-icon> </div> <div> <h3>Energia</h3> <p>Rögzítsd a fogyasztásod</p> </div> </div> <div class="energy-form"> <div class="form-group"> <ion-label>Fogyasztás típusa</ion-label> <ion-select placeholder="Válassz" interface="popover"> <ion-select-option value="electricity">Villany</ion-select-option> <ion-select-option value="gas">Gáz</ion-select-option> <ion-select-option value="water">Víz</ion-select-option> </ion-select> </div> <div class="form-group"> <ion-label>Mennyiség</ion-label> <div class="input-with-unit"> <ion-input type="number" placeholder="0"></ion-input> <span class="unit">kWh</span> </div> </div> <div class="form-group"> <ion-label>Időszak</ion-label> <ion-select placeholder="Válassz" interface="popover"> <ion-select-option value="today">Mai nap</ion-select-option> <ion-select-option value="week">Heti</ion-select-option> <ion-select-option value="month">Havi</ion-select-option> </ion-select> </div> </div> <p class="subsection-title">Korábbi bejegyzések</p> <div class="energy-list"> <div class="energy-item"> <div class="energy-info"> <h4>Villany fogyasztás</h4> <p>150 kWh <span class="separator">•</span> Ez a hét</p> </div> <div class="energy-impact">+42 kg</div> </div> <div class="energy-item"> <div class="energy-info"> <h4>Gáz fogyasztás</h4> <p>80 m³ <span class="separator">•</span> Ez a hét</p> </div> <div class="energy-impact">+160 kg</div> </div> </div> <ion-button expand="block" class="save-button">Mentés</ion-button> </div>
```

# app\components\energy\energy.component.scss

```scss
.energy-form { display: flex; flex-direction: column; gap: 16px; margin-bottom: 20px; .form-group { display: flex; flex-direction: column; gap: 8px; ion-label { color: #5a5a5a; font-size: 0.9rem; font-weight: 500; } ion-select, ion-input { --background: #f8faf8; --padding-start: 16px; --padding-end: 16px; border: 2px solid #e0e0d8; border-radius: 12px; font-size: 0.95rem; min-height: 48px; } .input-with-unit { display: flex; align-items: center; gap: 8px; ion-input { flex: 1; } .unit { color: #5a5a5a; font-size: 0.95rem; font-weight: 500; padding: 0 12px; } } } } .energy-list { display: flex; flex-direction: column; gap: 12px; margin-bottom: 20px; .energy-item { display: flex; justify-content: space-between; align-items: center; padding: 16px; background: #f8faf8; border: 1px solid #e8ede8; border-radius: 12px; .energy-info { h4 { color: #2d4a3e; font-size: 0.95rem; font-weight: 600; margin: 0 0 4px 0; } p { color: #7a7a7a; font-size: 0.85rem; margin: 0; .separator { margin: 0 6px; } } } .energy-impact { color: #5a7a6a; font-size: 0.95rem; font-weight: 600; background: #e8f0e6; padding: 4px 10px; border-radius: 8px; } } }
```

# app\components\energy\energy.component.spec.ts

```ts
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'; import { IonicModule } from '@ionic/angular'; import { EnergyComponent } from './energy.component'; describe('EnergyComponent', () => { let component: EnergyComponent; let fixture: ComponentFixture<EnergyComponent>; beforeEach(waitForAsync(() => { TestBed.configureTestingModule({ declarations: [ EnergyComponent ], imports: [IonicModule.forRoot()] }).compileComponents(); fixture = TestBed.createComponent(EnergyComponent); component = fixture.componentInstance; fixture.detectChanges(); })); it('should create', () => { expect(component).toBeTruthy(); }); });
```

# app\components\energy\energy.component.ts

```ts
import { Component, OnInit } from '@angular/core'; import { IonicModule } from '@ionic/angular'; @Component({ selector: 'app-energy', templateUrl: './energy.component.html', styleUrls: ['./energy.component.scss'], imports: [IonicModule] }) export class EnergyComponent implements OnInit { constructor() { } ngOnInit() {} }
```

# app\components\friends\friends.component.html

```html
<div class="tab-content"> <div class="section-header"> <div class="section-title-with-icon"> <ion-icon name="leaf"></ion-icon> <h3>Baráti kérések</h3> </div> <div class="badge-count">2 új</div> </div> <div class="friend-requests"> <div class="friend-request-item"> <div class="friend-avatar">L</div> <div class="friend-info"> <p class="friend-name">Luna Park</p> <p class="friend-mutual">8 közös barát</p> </div> <div class="friend-actions"> <button class="accept-btn"> <ion-icon name="checkmark"></ion-icon> </button> <button class="decline-btn">×</button> </div> </div> <div class="friend-request-item"> <div class="friend-avatar">R</div> <div class="friend-info"> <p class="friend-name">Ryan Torres</p> <p class="friend-mutual">3 közös barát</p> </div> <div class="friend-actions"> <button class="accept-btn"> <ion-icon name="checkmark"></ion-icon> </button> <button class="decline-btn">×</button> </div> </div> </div> <div class="section-header"> <h3>Barátaim</h3> <a class="see-all">Összes</a> </div> <div class="friends-list"> <div class="friend-item"> <div class="friend-avatar-wrapper"> <div class="friend-avatar">E</div> <div class="online-indicator"></div> </div> <div class="friend-info"> <p class="friend-name">Emma Wilson</p> <div class="friend-stats"> <span class="level-badge">12. szint</span> <span class="stat-value">158 kg</span> </div> </div> <ion-icon name="chevron-forward" class="chevron"></ion-icon> </div> <div class="friend-item"> <div class="friend-avatar-wrapper"> <div class="friend-avatar">M</div> <div class="online-indicator"></div> </div> <div class="friend-info"> <p class="friend-name">Mike Chen</p> <div class="friend-stats"> <span class="level-badge">9. szint</span> <span class="stat-value">142 kg</span> </div> </div> <ion-icon name="chevron-forward" class="chevron"></ion-icon> </div> <div class="friend-item"> <div class="friend-avatar-wrapper"> <div class="friend-avatar">A</div> <div class="online-indicator"></div> </div> <div class="friend-info"> <p class="friend-name">Alex Rivera</p> <div class="friend-stats"> <span class="level-badge">8. szint</span> <span class="stat-value">135 kg</span> </div> </div> <ion-icon name="chevron-forward" class="chevron"></ion-icon> </div> </div> </div>
```

# app\components\friends\friends.component.scss

```scss
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; .section-title-with-icon { display: flex; align-items: center; gap: 8px; ion-icon { font-size: 1.3rem; color: #5a7a6a; } h3 { color: #2d4a3e; font-size: 1.1rem; font-weight: 600; margin: 0; } } h3 { color: #2d4a3e; font-size: 1.1rem; font-weight: 600; margin: 0; } .badge-count { background: #5a7a6a; color: white; font-size: 0.75rem; font-weight: 600; padding: 4px 10px; border-radius: 12px; } .see-all { color: #7a9d8a; font-size: 0.9rem; text-decoration: none; cursor: pointer; } } .friend-requests { display: flex; flex-direction: column; gap: 12px; margin-bottom: 32px; .friend-request-item { background: white; border: 2px solid #e0e0d8; border-radius: 16px; padding: 16px; display: flex; align-items: center; gap: 12px; .friend-avatar { width: 48px; height: 48px; background: #e0e8e0; border-radius: 12px; display: flex; justify-content: center; align-items: center; font-size: 1.5rem; font-weight: 600; color: #5a7a6a; flex-shrink: 0; } .friend-info { flex: 1; .friend-name { color: #2d4a3e; font-size: 0.95rem; font-weight: 600; margin: 0 0 4px 0; } .friend-mutual { color: #7a7a7a; font-size: 0.85rem; margin: 0; } } .friend-actions { display: flex; gap: 8px; button { width: 36px; height: 36px; border-radius: 50%; border: none; display: flex; justify-content: center; align-items: center; cursor: pointer; transition: all 0.2s; } .accept-btn { background: #5a7a6a; color: white; ion-icon { font-size: 1.2rem; } } .decline-btn { background: #f0f0e8; color: #7a7a7a; font-size: 1.5rem; } } } } .friends-list { display: flex; flex-direction: column; gap: 12px; .friend-item { background: white; border: 2px solid #e0e0d8; border-radius: 16px; padding: 16px; display: flex; align-items: center; gap: 12px; cursor: pointer; transition: all 0.2s; &:active { background: #f8faf8; } .friend-avatar-wrapper { position: relative; flex-shrink: 0; .friend-avatar { width: 48px; height: 48px; background: #e0e8e0; border-radius: 12px; display: flex; justify-content: center; align-items: center; font-size: 1.5rem; font-weight: 600; color: #5a7a6a; } .online-indicator { position: absolute; bottom: 2px; right: 2px; width: 12px; height: 12px; background: #5a7a6a; border: 2px solid white; border-radius: 50%; } } .friend-info { flex: 1; .friend-name { color: #2d4a3e; font-size: 0.95rem; font-weight: 600; margin: 0 0 6px 0; } .friend-stats { display: flex; gap: 8px; .level-badge { background: #e8f0e6; color: #5a7a6a; font-size: 0.75rem; font-weight: 600; padding: 3px 8px; border-radius: 8px; } .stat-value { color: #7a7a7a; font-size: 0.85rem; } } } .chevron { color: #a8c5a0; font-size: 1.2rem; } } }
```

# app\components\friends\friends.component.spec.ts

```ts
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'; import { IonicModule } from '@ionic/angular'; import { FriendsComponent } from './friends.component'; describe('FriendsComponent', () => { let component: FriendsComponent; let fixture: ComponentFixture<FriendsComponent>; beforeEach(waitForAsync(() => { TestBed.configureTestingModule({ declarations: [ FriendsComponent ], imports: [IonicModule.forRoot()] }).compileComponents(); fixture = TestBed.createComponent(FriendsComponent); component = fixture.componentInstance; fixture.detectChanges(); })); it('should create', () => { expect(component).toBeTruthy(); }); });
```

# app\components\friends\friends.component.ts

```ts
import { Component, OnInit } from '@angular/core'; import { IonicModule } from '@ionic/angular'; @Component({ selector: 'app-friends', templateUrl: './friends.component.html', styleUrls: ['./friends.component.scss'], imports: [IonicModule] }) export class FriendsComponent implements OnInit { constructor() { } ngOnInit() {} }
```

# app\components\leaderboard\leaderboard.component.html

```html
<div class="tab-content"> <div class="position-card"> <div class="position-avatar-wrapper"> <div class="position-avatar">V</div> <div class="position-badge">#6</div> </div> <div class="position-info"> <p class="position-label">A te helyezésed</p> <h2>6. hely</h2> <div class="position-trend"> <ion-icon name="trending-up"></ion-icon> <span>+3 a héten</span> </div> </div> <div class="position-points"> <p>Pontszám</p> <h3>444 pont</h3> </div> </div> <div class="top-three"> <div class="podium-item second"> <div class="podium-avatar">M</div> <div class="podium-badge second-badge">#2</div> <p class="podium-name">Máté</p> <p class="podium-points">440 pont</p> </div> <div class="podium-item first"> <div class="podium-avatar">E</div> <div class="podium-badge first-badge">#1</div> <p class="podium-name">Edina</p> <p class="podium-points">444 pont</p> </div> <div class="podium-item third"> <div class="podium-avatar">K</div> <div class="podium-badge third-badge">#3</div> <p class="podium-name">Kata</p> <p class="podium-points">420 pont</p> </div> </div> <div class="rankings-list"> <div class="rank-item"> <div class="rank-badge fourth">#4</div> <div class="rank-avatar">D</div> <div class="rank-info"> <p class="rank-name">Dorka</p> <p class="rank-points">412 pont</p> </div> <div class="rank-change up"> <ion-icon name="trending-up"></ion-icon> <span>+2</span> </div> </div> <div class="rank-item"> <div class="rank-badge fifth">#5</div> <div class="rank-avatar">G</div> <div class="rank-info"> <p class="rank-name">Gréta</p> <p class="rank-points">412 pont</p> </div> <div class="rank-change down"> <ion-icon name="trending-down"></ion-icon> <span>-1</span> </div> </div> <div class="rank-item you"> <div class="rank-badge sixth">#6</div> <div class="rank-avatar">V</div> <div class="rank-info"> <p class="rank-name">Viktória</p> <p class="rank-points">412 pont</p> </div> <div class="rank-change up"> <ion-icon name="trending-up"></ion-icon> <span>+3</span> </div> </div> </div> </div>
```

# app\components\leaderboard\leaderboard.component.scss

```scss
.position-card { background: linear-gradient(135deg, #b8cec0 0%, #a8c5a0 100%); border-radius: 20px; padding: 24px; display: flex; align-items: center; gap: 16px; margin-bottom: 24px; .position-avatar-wrapper { position: relative; flex-shrink: 0; .position-avatar { width: 80px; height: 80px; background: rgba(255, 255, 255, 0.4); border-radius: 16px; display: flex; justify-content: center; align-items: center; font-size: 2.5rem; font-weight: 600; color: #5a7a6a; } .position-badge { position: absolute; bottom: -8px; right: -8px; width: 36px; height: 36px; background: #5a7a6a; border-radius: 50%; display: flex; justify-content: center; align-items: center; color: white; font-size: 0.85rem; font-weight: 700; } } .position-info { flex: 1; .position-label { color: rgba(45, 74, 62, 0.8); font-size: 0.85rem; margin: 0 0 4px 0; } h2 { color: #2d4a3e; font-size: 1.8rem; font-weight: 700; margin: 0 0 4px 0; } .position-trend { display: flex; align-items: center; gap: 4px; ion-icon { font-size: 1rem; color: #2d4a3e; } span { color: #2d4a3e; font-size: 0.85rem; } } } .position-points { text-align: right; p { color: rgba(45, 74, 62, 0.8); font-size: 0.85rem; margin: 0 0 4px 0; } h3 { color: #2d4a3e; font-size: 1.5rem; font-weight: 700; margin: 0; } } } .top-three { display: flex; justify-content: center; align-items: flex-end; gap: 12px; margin-bottom: 24px; .podium-item { flex: 1; background: white; border: 2px solid #e0e0d8; border-radius: 16px; padding: 20px 12px; display: flex; flex-direction: column; align-items: center; position: relative; &.first { padding-top: 45px; padding-bottom: 45px; } &.second { padding-top: 30px; padding-bottom: 30px; } .podium-avatar { width: 64px; height: 64px; background: #e0e8e0; border-radius: 14px; display: flex; justify-content: center; align-items: center; font-size: 2rem; font-weight: 600; color: #5a7a6a; margin-bottom: 8px; } .podium-badge { top: 12px; width: 32px; height: 32px; border-radius: 50%; display: flex; justify-content: center; align-items: center; color: white; font-size: 0.8rem; font-weight: 700; } .first-badge { background: #5a7a6a; } .second-badge { background: #7a9d8a; } .third-badge { background: #a8b8aa; } .podium-name { color: #5a7a6a; font-size: 0.95rem; font-weight: 600; margin: 8px 0 4px 0; } .podium-points { color: #7a7a7a; font-size: 0.85rem; margin: 0; } } } .rankings-list { display: flex; flex-direction: column; gap: 12px; .rank-item { background: white; border: 2px solid #e0e0d8; border-radius: 16px; padding: 16px; display: flex; align-items: center; gap: 12px; &.you { background: #e8f0e6; border-color: #7a9d8a; margin-bottom: 40px; } .rank-badge { width: 36px; height: 36px; border-radius: 50%; display: flex; justify-content: center; align-items: center; font-size: 0.85rem; font-weight: 700; color: #2d4a3e; flex-shrink: 0; &.fourth { background: #f0f0e8; } &.fifth { background: #f5f5e8; } &.sixth { background: #5a7a6a; color: white; } } .rank-avatar { width: 48px; height: 48px; background: #e0e8e0; border-radius: 12px; display: flex; justify-content: center; align-items: center; font-size: 1.5rem; font-weight: 600; color: #5a7a6a; flex-shrink: 0; } .rank-info { flex: 1; .rank-name { color: #2d4a3e; font-size: 0.95rem; font-weight: 600; margin: 0 0 4px 0; } .rank-points { color: #7a7a7a; font-size: 0.85rem; margin: 0; } } .rank-change { display: flex; align-items: center; gap: 4px; padding: 4px 10px; border-radius: 12px; font-size: 0.85rem; font-weight: 600; &.up { background: rgba(168, 197, 160, 0.3); color: #5a7a6a; ion-icon { color: #5a7a6a; } } &.down { background: rgba(200, 150, 150, 0.3); color: #a06060; ion-icon { color: #a06060; } } ion-icon { font-size: 1rem; } } } }
```

# app\components\leaderboard\leaderboard.component.spec.ts

```ts
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'; import { IonicModule } from '@ionic/angular'; import { LeaderboardComponent } from './leaderboard.component'; describe('LeaderboardComponent', () => { let component: LeaderboardComponent; let fixture: ComponentFixture<LeaderboardComponent>; beforeEach(waitForAsync(() => { TestBed.configureTestingModule({ declarations: [ LeaderboardComponent ], imports: [IonicModule.forRoot()] }).compileComponents(); fixture = TestBed.createComponent(LeaderboardComponent); component = fixture.componentInstance; fixture.detectChanges(); })); it('should create', () => { expect(component).toBeTruthy(); }); });
```

# app\components\leaderboard\leaderboard.component.ts

```ts
import { Component, OnInit } from '@angular/core'; import { IonicModule } from '@ionic/angular'; @Component({ selector: 'app-leaderboard', templateUrl: './leaderboard.component.html', styleUrls: ['./leaderboard.component.scss'], imports: [IonicModule] }) export class LeaderboardComponent implements OnInit { constructor() { } ngOnInit() {} }
```

# app\components\navigation\navigation.component.html

```html
<div class="tabs-container"> <div class="tab-button" (click)="navigate('/home')"> <ion-icon name="home-outline"></ion-icon> </div> <div class="tab-button" (click)="navigate('/stats')"> <ion-icon name="bar-chart-outline"></ion-icon> </div> <div class="add-button" (click)="navigate('/activity')"> <ion-icon name="add-outline"></ion-icon> </div> <div class="tab-button" (click)="navigate('/social')"> <ion-icon name="ribbon-outline"></ion-icon> </div> <div class="tab-button" (click)="navigate('/profile')"> <ion-icon name="person-outline"></ion-icon> </div> </div>
```

# app\components\navigation\navigation.component.scss

```scss
.tabs-container { background: linear-gradient(135deg, #3d5a52 0%, #2d4a3e 100%); display: flex; justify-content: space-around; align-items: center; padding: 12px 20px 20px 20px; border-radius: 24px 24px 0 0; position: relative; box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.1); .tab-button { flex: 1; display: flex; justify-content: center; align-items: center; padding: 12px; cursor: pointer; transition: transform 0.2s; &:active { transform: scale(0.95); } ion-icon { font-size: 1.6rem; color: rgba(255, 255, 255, 0.7); transition: color 0.2s; } &:hover ion-icon { color: rgba(255, 255, 255, 0.9); } } .add-button { width: 56px; height: 56px; background: linear-gradient(135deg, #7a9d8a 0%, #5a7a6a 100%); border-radius: 50%; display: flex; justify-content: center; align-items: center; cursor: pointer; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2); transition: transform 0.2s; margin: 0 8px; &:active { transform: scale(0.95); } ion-icon { font-size: 2rem; color: white; font-weight: bold; } } }
```

# app\components\navigation\navigation.component.spec.ts

```ts
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'; import { IonicModule } from '@ionic/angular'; import { NavigationComponent } from './navigation.component'; describe('NavigationComponent', () => { let component: NavigationComponent; let fixture: ComponentFixture<NavigationComponent>; beforeEach(waitForAsync(() => { TestBed.configureTestingModule({ declarations: [ NavigationComponent ], imports: [IonicModule.forRoot()] }).compileComponents(); fixture = TestBed.createComponent(NavigationComponent); component = fixture.componentInstance; fixture.detectChanges(); })); it('should create', () => { expect(component).toBeTruthy(); }); });
```

# app\components\navigation\navigation.component.ts

```ts
import { Component, OnInit } from '@angular/core'; import { Router } from '@angular/router'; import { IonicModule } from '@ionic/angular'; import { CommonModule } from '@angular/common'; import { addIcons } from 'ionicons'; import { homeOutline, barChartOutline, addOutline, ribbonOutline, personOutline } from 'ionicons/icons'; @Component({ selector: 'app-navigation', templateUrl: './navigation.component.html', styleUrls: ['./navigation.component.scss'], standalone: true, imports: [IonicModule, CommonModule] }) export class NavigationComponent implements OnInit { constructor(private router: Router) { addIcons({ homeOutline, barChartOutline, addOutline, ribbonOutline, personOutline }); } navigate(path: string) { this.router.navigate([path]); } ngOnInit() {} }
```

# app\components\shopping\shopping.component.html

```html
<div class="activity-section"> <div class="section-header"> <div class="section-icon"> <ion-icon name="cart-outline"></ion-icon> </div> <div> <h3>Vásárlás</h3> <p>Rögzítsd a vásárlásaid</p> </div> </div> <div class="toggle-buttons"> <button class="toggle-btn active">Termék beolvasás</button> <button class="toggle-btn">Manuális hozzáadás</button> </div> <ion-button expand="block" class="scan-button"> <ion-icon name="camera-outline" slot="start"></ion-icon> Vonalkód beolvasása </ion-button> <p class="subsection-title">Legutóbbi termékek</p> <div class="products-list"> <div class="product-item"> <div class="product-info"> <h4>Tej, 1L</h4> <p>Tegnap</p> </div> <div class="product-impact">+0,9 kg</div> </div> <div class="product-item"> <div class="product-info"> <h4>Kenyér, teljes kiőrlésű</h4> <p>2 napja</p> </div> <div class="product-impact">+0,6 kg</div> </div> <div class="product-item"> <div class="product-info"> <h4>Csirkemell, 500g</h4> <p>3 napja</p> </div> <div class="product-impact">+2,3 kg</div> </div> </div> <ion-button expand="block" class="save-button">Mentés</ion-button> </div>
```

# app\components\shopping\shopping.component.scss

```scss
.scan-button { --background: #5a7a6a; --background-hover: #4a6a5a; --border-radius: 12px; height: 48px; font-weight: 600; margin-bottom: 20px; text-transform: none; ion-icon { font-size: 1.3rem; } } .products-list { display: flex; flex-direction: column; gap: 12px; margin-bottom: 20px; .product-item { display: flex; justify-content: space-between; align-items: center; padding: 16px; background: #f8faf8; border: 1px solid #e8ede8; border-radius: 12px; .product-info { h4 { color: #2d4a3e; font-size: 0.95rem; font-weight: 600; margin: 0 0 4px 0; } p { color: #7a7a7a; font-size: 0.85rem; margin: 0; } } .product-impact { color: #5a7a6a; font-size: 0.95rem; font-weight: 600; background: #e8f0e6; padding: 4px 10px; border-radius: 8px; } } }
```

# app\components\shopping\shopping.component.spec.ts

```ts
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'; import { IonicModule } from '@ionic/angular'; import { ShoppingComponent } from './shopping.component'; describe('ShoppingComponent', () => { let component: ShoppingComponent; let fixture: ComponentFixture<ShoppingComponent>; beforeEach(waitForAsync(() => { TestBed.configureTestingModule({ declarations: [ ShoppingComponent ], imports: [IonicModule.forRoot()] }).compileComponents(); fixture = TestBed.createComponent(ShoppingComponent); component = fixture.componentInstance; fixture.detectChanges(); })); it('should create', () => { expect(component).toBeTruthy(); }); });
```

# app\components\shopping\shopping.component.ts

```ts
import { Component, OnInit } from '@angular/core'; import { IonicModule } from '@ionic/angular'; @Component({ selector: 'app-shopping', templateUrl: './shopping.component.html', styleUrls: ['./shopping.component.scss'], imports: [IonicModule] }) export class ShoppingComponent implements OnInit { constructor() { } ngOnInit() { } }
```

# app\components\transport\transport.component.html

```html
<div class="activity-section"> <div class="section-header"> <div class="section-icon"> <ion-icon name="location-outline"></ion-icon> </div> <div> <h3>Közlekedés</h3> <p>Naplózd az utazásaid</p> </div> </div> <div class="toggle-buttons"> <button class="toggle-btn active">Bemért útvonalak</button> <button class="toggle-btn">Manuális hozzáadás</button> </div> <p class="subsection-title">Válassz utazási eszközt</p> <div class="transport-options"> <div class="transport-option"> <div class="transport-icon">🚗</div> <ion-label>Autó</ion-label> </div> <div class="transport-option"> <div class="transport-icon">🚌</div> <ion-label>Busz</ion-label> </div> <div class="transport-option"> <div class="transport-icon">🚲</div> <ion-label>Bicikli</ion-label> </div> <div class="transport-option"> <div class="transport-icon">🚶</div> <ion-label>Séta</ion-label> </div> </div> <p class="subsection-title">Válassz az útvonalak közül</p> <div class="routes-list"> <div class="route-item"> <div class="route-info"> <h4>Otthon - Munka</h4> <p>~15 perc <span class="separator">•</span> Ma, 8:14</p> </div> <div class="route-distance">3,4 km</div> </div> <div class="route-item"> <div class="route-info"> <h4>Munka - Élelmiszer­bolt</h4> <p>~5 perc <span class="separator">•</span> Tegnap, 16:32</p> </div> <div class="route-distance">1,4 km</div> </div> </div> <ion-button expand="block" class="save-button">Mentés</ion-button> </div>
```

# app\components\transport\transport.component.scss

```scss
.transport-options { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 20px; .transport-option { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 16px 8px; background: white; border: 2px solid #e0e0d8; border-radius: 16px; cursor: pointer; transition: all 0.2s; &:hover { border-color: #7a9d8a; background: #f8faf8; } .transport-icon { font-size: 2rem; } ion-label { color: #5a7a6a; font-size: 0.85rem; text-align: center; } } } .routes-list { display: flex; flex-direction: column; gap: 12px; margin-bottom: 20px; max-height: 200px; overflow-y: auto; padding-right: 4px; &::-webkit-scrollbar { width: 4px; } &::-webkit-scrollbar-track { background: #f0f0f0; border-radius: 2px; } &::-webkit-scrollbar-thumb { background: #5a7a6a; border-radius: 2px; } .route-item { display: flex; justify-content: space-between; align-items: center; padding: 16px; background: #f8faf8; border: 1px solid #e8ede8; border-radius: 12px; .route-info { h4 { color: #2d4a3e; font-size: 0.95rem; font-weight: 600; margin: 0 0 4px 0; } p { color: #7a7a7a; font-size: 0.85rem; margin: 0; .separator { margin: 0 6px; } } } .route-distance { color: #5a7a6a; font-size: 0.95rem; font-weight: 600; } } } @media (max-width: 415px) { .transport-options { grid-template-columns: repeat(2, 1fr); } }
```

# app\components\transport\transport.component.spec.ts

```ts
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'; import { IonicModule } from '@ionic/angular'; import { TransportComponent } from './transport.component'; describe('TransportComponent', () => { let component: TransportComponent; let fixture: ComponentFixture<TransportComponent>; beforeEach(waitForAsync(() => { TestBed.configureTestingModule({ declarations: [ TransportComponent ], imports: [IonicModule.forRoot()] }).compileComponents(); fixture = TestBed.createComponent(TransportComponent); component = fixture.componentInstance; fixture.detectChanges(); })); it('should create', () => { expect(component).toBeTruthy(); }); });
```

# app\components\transport\transport.component.ts

```ts
import { Component, OnInit } from '@angular/core'; import { IonicModule } from '@ionic/angular'; @Component({ selector: 'app-transport', templateUrl: './transport.component.html', styleUrls: ['./transport.component.scss'], imports: [IonicModule] }) export class TransportComponent implements OnInit { constructor() { } ngOnInit() { } }
```

# app\models\user.model.ts

```ts
export interface User { id: string; email: string; username: string; password: string; } export const MOCK_USERS: User[] = [ { id: 'mock-user-123', email: 'test@magnolia.hu', username: 'vilenaaa', password: 'jelszo' } ];
```

# app\pages\activity\activity.page.html

```html
<ion-header class="ion-no-border"> <ion-toolbar mode="md"> <ion-title>Tevékenység</ion-title> </ion-toolbar> </ion-header> <ion-content [fullscreen]="true"> <div class="ion-padding"> <h2 class="section-title">Kategóriák</h2> <div class="categories-container"> <div class="category-card" [class.active]="selectedCategory === 'transport'" (click)="selectCategory('transport')"> <div class="category-icon"> <ion-icon name="location-outline"></ion-icon> </div> <ion-label>Közlekedés</ion-label> </div> <div class="category-card" [class.active]="selectedCategory === 'shopping'" (click)="selectCategory('shopping')"> <div class="category-icon"> <ion-icon name="cart-outline"></ion-icon> </div> <ion-label>Vásárlás</ion-label> </div> <div class="category-card" [class.active]="selectedCategory === 'energy'" (click)="selectCategory('energy')"> <div class="category-icon"> <ion-icon name="flash-outline"></ion-icon> </div> <ion-label>Energia</ion-label> </div> </div> @switch (selectedCategory) { @case ('transport') { <app-transport></app-transport> } @case ('shopping') { <app-shopping></app-shopping> } @case ('energy') { <app-energy></app-energy> } @default { <div>Nincs találat</div> } } </div> </ion-content> <ion-footer class="ion-no-border"> <app-navigation></app-navigation> </ion-footer>
```

# app\pages\activity\activity.page.scss

```scss
ion-header { ion-toolbar { --background: #f5f5f0; --color: #2d4a3e; ion-title { font-size: 1.2rem; font-weight: 600; } } } ion-content { --background: #f5f5f0; } .section-title { color: #2d4a3e; font-size: 1.1rem; font-weight: 600; margin: 0 0 16px 0; } .categories-container { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 24px; .category-card { flex: 1; background: white; border: 2px solid #e0e0d8; border-radius: 16px; padding: 20px 12px; display: flex; flex-direction: column; align-items: center; gap: 8px; cursor: pointer; transition: all 0.2s; &.active { background: #e8f0e6; border-color: #7a9d8a; } .category-icon { width: 48px; height: 48px; background: #f0f5ee; border-radius: 12px; display: flex; justify-content: center; align-items: center; margin-bottom: 4px; ion-icon { font-size: 1.5rem; color: #5a7a6a; } } &.active .category-icon { background: white; } ion-label { color: #2d4a3e; font-size: 0.9rem; text-align: center; font-weight: 500; } } } @media (max-width: 380px) { .categories-container { grid-template-columns: repeat(2, 1fr); } }
```

# app\pages\activity\activity.page.spec.ts

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing'; import { ActivityPage } from './activity.page'; describe('ActivityPage', () => { let component: ActivityPage; let fixture: ComponentFixture<ActivityPage>; beforeEach(() => { fixture = TestBed.createComponent(ActivityPage); component = fixture.componentInstance; fixture.detectChanges(); }); it('should create', () => { expect(component).toBeTruthy(); }); });
```

# app\pages\activity\activity.page.ts

```ts
import { Component, OnInit } from '@angular/core'; import { CommonModule } from '@angular/common'; import { FormsModule } from '@angular/forms'; import { NavigationComponent } from "src/app/components/navigation/navigation.component"; import { EnergyComponent } from 'src/app/components/energy/energy.component'; import { TransportComponent } from 'src/app/components/transport/transport.component'; import { ShoppingComponent } from 'src/app/components/shopping/shopping.component'; import { IonicModule } from '@ionic/angular'; import { addIcons } from 'ionicons'; import { locationOutline, cartOutline, flashOutline, cameraOutline } from 'ionicons/icons'; @Component({ selector: 'app-activity', templateUrl: './activity.page.html', styleUrls: ['./activity.page.scss'], standalone: true, imports: [IonicModule, NavigationComponent, EnergyComponent, ShoppingComponent, TransportComponent, CommonModule, FormsModule] }) export class ActivityPage implements OnInit { selectedCategory: string = 'transport'; constructor() { addIcons({ locationOutline, cartOutline, flashOutline, cameraOutline }); } ngOnInit() { } selectCategory(segment: string) { this.selectedCategory = segment; } }
```

# app\pages\home\home.page.html

```html
<ion-header class="ion-no-border"> <ion-toolbar mode="md"> <ion-title>Szép napot, Viktória!</ion-title> <ion-buttons slot="end"> <ion-button> <ion-icon slot="icon-only" name="notifications-outline"></ion-icon> </ion-button> </ion-buttons> </ion-toolbar> </ion-header> <ion-content [fullscreen]="true"> <div class="ion-padding"> <ion-card class="main-card"> <ion-card-content> <p>Mai lábnyom</p> <div class="footprint-value"> <h1>4,1 kg</h1> <span>CO2 kibocsátás</span> </div> <div class="limit-progress"> <span>Heti limit: 20 kg</span> <span>20%</span> </div> <ion-progress-bar value="0.2"></ion-progress-bar> </ion-card-content> </ion-card> <ion-grid> <ion-row> <ion-col> <ion-card class="summary-card"> <ion-icon name="trending-up-outline"></ion-icon> <p>Heti átlag</p> <h2>19,1 kg</h2> </ion-card> </ion-col> <ion-col> <ion-card class="summary-card"> <ion-icon name="star-outline"></ion-icon> <p>Szint</p> <h2>Zöldfülű</h2> </ion-card> </ion-col> </ion-row> </ion-grid> <h3 class="section-title">Eszközök</h3> <div class="tools-container"> <div class="tool-item"> <ion-button class="tool-button"> <ion-icon name="paper-plane-outline"></ion-icon> </ion-button> <ion-label>Útvonal-tervezés</ion-label> </div> <div class="tool-item"> <ion-button class="tool-button"> <ion-icon name="eye-outline"></ion-icon> </ion-button> <ion-label>Termék beolvasás</ion-label> </div> <div class="tool-item"> <ion-button class="tool-button"> <ion-icon name="camera-outline"></ion-icon> </ion-button> <ion-label>Új cél-kitűzés</ion-label> </div> </div> <h3 class="section-title">Legutóbbi tevékenységek</h3> <ion-list lines="none"> <ion-item class="activity-item"> <ion-icon name="bus-outline" slot="start"></ion-icon> <ion-label> <h2>Buszozás</h2> <p>Ma, 16:30 - 2,3 km</p> </ion-label> <div class="activity-value">+1,4 kg</div> </ion-item> <ion-item class="activity-item"> <ion-icon name="cart-outline" slot="start"></ion-icon> <ion-label> <h2>Bevásárlás</h2> <p>Ma, 13:13 - 8 termék</p> </ion-label> <div class="activity-value">+5,3 kg</div> </ion-item> </ion-list> </div> </ion-content> <ion-footer class="ion-no-border"> <app-navigation></app-navigation> </ion-footer>
```

# app\pages\home\home.page.scss

```scss
ion-header { ion-toolbar { --background: #f5f5f0; --color: #2d4a3e; ion-title { font-size: 1.2rem; font-weight: 600; } } } ion-content { --background: #f5f5f0; .ion-padding { padding: 16px; } } .main-card { background: linear-gradient(135deg, #5a7a6a 0%, #3d5a52 100%); border-radius: 24px; margin: 0 0 16px 0; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); ion-card-content { padding: 24px; p { color: rgba(255, 255, 255, 0.8); font-size: 0.9rem; margin: 0 0 8px 0; } .footprint-value { margin-bottom: 20px; h1 { color: white; font-size: 3rem; font-weight: 700; margin: 0; line-height: 1; } span { color: rgba(255, 255, 255, 0.9); font-size: 0.95rem; } } .limit-progress { display: flex; justify-content: space-between; margin-bottom: 8px; span { color: rgba(255, 255, 255, 0.9); font-size: 0.85rem; } } ion-progress-bar { --background: rgba(255, 255, 255, 0.3); --progress-background: #a8c5a0; height: 8px; border-radius: 4px; } } } ion-grid { padding: 0; margin-bottom: 24px; ion-row { gap: 12px; } ion-col { padding: 0; } } .summary-card { background: white; border-radius: 16px; margin: 0; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08); padding: 16px; ion-icon { font-size: 2rem; color: #5a7a6a; } p { color: #7a7a7a; font-size: 0.85rem; } h2 { color: #2d4a3e; font-size: 1.3rem; font-weight: 700; } } .section-title { color: #2d4a3e; font-size: 1.1rem; font-weight: 600; margin: 24px 0 16px 0; } .tools-container { display: flex; justify-content: space-between; gap: 12px; margin-bottom: 24px; .tool-item { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 8px; .tool-button { --background: white; --border-radius: 16px; --box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08); --padding-start: 0; --padding-end: 0; width: 100%; height: 80px; margin: 0; ion-icon { font-size: 1.8rem; color: #5a7a6a; } } ion-label { color: #2d4a3e; font-size: 0.8rem; text-align: center; line-height: 1.2; } } } ion-list { background: transparent; padding: 0; margin-bottom: 40px; .activity-item { --background: white; --border-radius: 16px; --padding-start: 16px; --padding-end: 16px; border-radius: 16px; margin-bottom: 12px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08); ion-icon { font-size: 1.8rem; color: #5a7a6a; margin-right: 12px; } ion-label { h2 { color: #2d4a3e; font-size: 1rem; font-weight: 600; margin: 0 0 4px 0; } p { color: #7a7a7a; font-size: 0.85rem; margin: 0; } } .activity-value { color: #5a7a6a; font-size: 0.95rem; font-weight: 600; background: #e8f0e6; padding: 4px 12px; border-radius: 12px; } } } ion-footer { background: transparent; }
```

# app\pages\home\home.page.spec.ts

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing'; import { HomePage } from './home.page'; describe('HomePage', () => { let component: HomePage; let fixture: ComponentFixture<HomePage>; beforeEach(async () => { fixture = TestBed.createComponent(HomePage); component = fixture.componentInstance; fixture.detectChanges(); }); it('should create', () => { expect(component).toBeTruthy(); }); });
```

# app\pages\home\home.page.ts

```ts
import { Component } from '@angular/core'; import { IonicModule } from '@ionic/angular'; import { CommonModule } from '@angular/common'; import { FormsModule } from '@angular/forms'; import { NavigationComponent } from "src/app/components/navigation/navigation.component"; import { addIcons } from 'ionicons'; import { notificationsOutline, trendingUpOutline, starOutline, paperPlaneOutline, eyeOutline, cameraOutline, busOutline, cartOutline } from 'ionicons/icons'; @Component({ selector: 'app-home', templateUrl: 'home.page.html', styleUrls: ['home.page.scss'], imports: [IonicModule, NavigationComponent, CommonModule, FormsModule], }) export class HomePage { constructor() { addIcons({ notificationsOutline, trendingUpOutline, starOutline, paperPlaneOutline, eyeOutline, cameraOutline, busOutline, cartOutline }); } }
```

# app\pages\login\login.page.html

```html
<ion-content [fullscreen]="true" class="ion-padding"> <div class="login-container"> <div class="app-title-container"> <h1>Magnólia</h1> </div> <ion-card class="login-card"> <ion-card-header> <ion-card-title>Bejelentkezés</ion-card-title> </ion-card-header> <ion-card-content> <ion-item lines="none" class="input-item"> <ion-label position="stacked">Felhasználónév</ion-label> <ion-input type="text" placeholder="felhasználónév"></ion-input> </ion-item> <ion-item lines="none" class="input-item"> <ion-label position="stacked">Jelszó</ion-label> <ion-input type="password" placeholder="jelszó"></ion-input> </ion-item> <div class="button-group"> <ion-button fill="outline" class="register-button">Még nincs fiókja?</ion-button> <ion-button class="login-button">Bejelentkezés</ion-button> </div> </ion-card-content> </ion-card> </div> </ion-content>
```

# app\pages\login\login.page.scss

```scss
:root { --app-primary-color: #4a7c59; --app-light-green: #eaf0e5; --app-border-color: #d8e2d7; --app-text-color: #2f4f4f; } ion-content { --background: var(--app-border-color); } .login-container { display: flex; flex-direction: column; justify-content: center; align-items: center; height: 100%; background: #f8f9f5; border: 1px solid var(--app-border-color); border-radius: 40px; margin: 16px; } .app-title-container { margin-bottom: 2rem; h1 { font-size: 3rem; font-weight: 600; color: var(--app-text-color); } } .login-card { --background: #ffffff; box-shadow: none; border-radius: 20px; border: 1px solid var(--app-border-color); width: 100%; max-width: 400px; padding: 1rem; } ion-card-title { text-align: center; font-size: 1.5rem; font-weight: bold; color: var(--app-text-color); } .input-item { --background: var(--app-light-green); --border-radius: 10px; --padding-start: 16px; margin-bottom: 1rem; ion-label { color: var(--app-text-color); font-size: 0.9rem; margin-bottom: 4px; } } .button-group { display: flex; justify-content: space-between; align-items: center; margin-top: 1.5rem; .register-button { --border-color: var(--app-primary-color); --color: var(--app-primary-color); --border-radius: 8px; text-transform: none; } .login-button { --background: var(--app-primary-color); --background-activated: #3a6347; --border-radius: 8px; text-transform: none; } }
```

# app\pages\login\login.page.spec.ts

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing'; import { LoginPage } from './login.page'; describe('LoginPage', () => { let component: LoginPage; let fixture: ComponentFixture<LoginPage>; beforeEach(() => { fixture = TestBed.createComponent(LoginPage); component = fixture.componentInstance; fixture.detectChanges(); }); it('should create', () => { expect(component).toBeTruthy(); }); });
```

# app\pages\login\login.page.ts

```ts
import { Component, OnInit } from '@angular/core'; import { CommonModule } from '@angular/common'; import { FormsModule } from '@angular/forms'; import { IonicModule } from '@ionic/angular'; import { User, MOCK_USERS } from 'src/app/models/user.model'; import { AuthService } from '../../services/auth.service'; import { Router } from '@angular/router'; @Component({ selector: 'app-login', templateUrl: './login.page.html', styleUrls: ['./login.page.scss'], standalone: true, imports: [IonicModule, CommonModule, FormsModule] }) export class LoginPage implements OnInit { username: string = ''; password: string = ''; constructor(private router: Router, private authService: AuthService) { } ngOnInit() { } login() { const foundUser = MOCK_USERS.find(u => u.username === this.username && u.password === this.password); if (foundUser) { this.authService.login(foundUser); this.router.navigate(['/home']); } else { alert('Hibás azonosító vagy jelszó!'); } } navigateToRegister() { } }
```

# app\pages\profile\profile.page.html

```html
<ion-header class="ion-no-border"> <ion-toolbar mode="md"> <ion-title>Profil</ion-title> <ion-buttons slot="end"> <ion-button> <ion-icon slot="icon-only" name="settings-outline"></ion-icon> </ion-button> </ion-buttons> </ion-toolbar> </ion-header> <ion-content [fullscreen]="true"> <div class="ion-padding"> <div class="profile-header"> <div class="avatar">V</div> <h2>Viktória</h2> <p class="username">@vilenaaa</p> <div class="level-badge"> <ion-icon name="star"></ion-icon> <span>1. szint - Zöldfülű</span> </div> </div> <div class="xp-section"> <div class="xp-header"> <div class="xp-label"> <ion-icon name="flash"></ion-icon> <span>Szint haladás</span> </div> <span class="xp-value">812 / 1000 XP</span> </div> <ion-progress-bar value="0.812"></ion-progress-bar> </div> <div class="stats-grid"> <div class="stat-card"> <div class="stat-icon"> <ion-icon name="ribbon"></ion-icon> </div> <h3>5</h3> <p>Kitűző</p> </div> <div class="stat-card"> <div class="stat-icon"> <ion-icon name="play-forward"></ion-icon> </div> <h3>10</h3> <p>Streak</p> </div> <div class="stat-card"> <div class="stat-icon"> <ion-icon name="people"></ion-icon> </div> <h3>2</h3> <p>Barát</p> </div> </div> <div class="section-header"> <div class="section-title"> <ion-icon name="radio-button-on"></ion-icon> <h3>Jelenlegi célok</h3> </div> <a class="see-all">Összes</a> </div> <div class="goals-list"> <div class="goal-item"> <div class="goal-icon"> <ion-icon name="radio-button-on"></ion-icon> </div> <div class="goal-content"> <h4>25%-kal csökkenteni a heti kibocsátást</h4> <span class="goal-time">4 nap múlva vége</span> <div class="goal-progress"> <ion-progress-bar value="0.58"></ion-progress-bar> <div class="goal-stats"> <span>58% kész</span> <span class="xp-reward">+100 XP</span> </div> </div> </div> </div> <div class="goal-item"> <div class="goal-icon"> <ion-icon name="radio-button-on"></ion-icon> </div> <div class="goal-content"> <h4>Jegyezzen fel tevékenységet 30 napon át</h4> <span class="goal-time">15 / 30 nap</span> <div class="goal-progress"> <ion-progress-bar value="0.5"></ion-progress-bar> <div class="goal-stats"> <span>50% kész</span> <span class="xp-reward">+200 XP</span> </div> </div> </div> </div> </div> <div class="section-header"> <div class="section-title"> <ion-icon name="leaf"></ion-icon> <h3>Legutóbbi kitűzők</h3> </div> <a class="see-all">Összes</a> </div> <div class="badges-grid"> <div class="badge-item"> <div class="badge-icon green"> <ion-icon name="leaf"></ion-icon> </div> <p>Eco Harcos</p> </div> <div class="badge-item"> <div class="badge-icon light-green"> <ion-icon name="trophy"></ion-icon> </div> <p>Bajnok</p> </div> <div class="badge-item"> <div class="badge-icon medium-green"> <ion-icon name="star"></ion-icon> </div> <p>Sztár</p> </div> <div class="badge-item"> <div class="badge-icon pale-green"> <ion-icon name="person"></ion-icon> </div> <p>Szintlépő</p> </div> </div> </div> </ion-content> <ion-footer class="ion-no-border"> <app-navigation></app-navigation> </ion-footer>
```

# app\pages\profile\profile.page.scss

```scss
ion-header { ion-toolbar { --background: #f5f5f0; --color: #2d4a3e; ion-title { font-size: 1.2rem; font-weight: 600; } ion-icon { font-size: 1.5rem; color: #2d4a3e; } } } ion-content { --background: #f5f5f0; } .profile-header { display: flex; flex-direction: column; align-items: center; margin-bottom: 24px; .avatar { width: 120px; height: 120px; background: #b8cec0; border-radius: 24px; display: flex; justify-content: center; align-items: center; font-size: 3.5rem; font-weight: 600; color: #5a7a6a; margin-bottom: 16px; } h2 { color: #2d4a3e; font-size: 1.5rem; font-weight: 700; margin: 0 0 4px 0; } .username { color: #a8c5a0; font-size: 0.95rem; margin: 0 0 12px 0; } .level-badge { display: flex; align-items: center; gap: 8px; background: #5a7a6a; color: white; padding: 8px 20px; border-radius: 20px; ion-icon { font-size: 1.1rem; } span { font-size: 0.9rem; font-weight: 500; } } } .xp-section { margin-bottom: 24px; .xp-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; .xp-label { display: flex; align-items: center; gap: 8px; ion-icon { font-size: 1.2rem; color: #5a7a6a; } span { color: #2d4a3e; font-size: 0.95rem; font-weight: 600; } } .xp-value { color: #5a7a6a; font-size: 0.9rem; font-weight: 600; } } ion-progress-bar { --background: rgba(138, 173, 147, 0.3); --progress-background: #5a7a6a; height: 8px; border-radius: 4px; } } .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 32px; .stat-card { background: white; border: 2px solid #e0e0d8; border-radius: 16px; padding: 20px 12px; display: flex; flex-direction: column; align-items: center; gap: 8px; .stat-icon { width: 48px; height: 48px; background: #5a7a6a; border-radius: 12px; display: flex; justify-content: center; align-items: center; position: relative; ion-icon { display: flex; align-items: center; font-size: 1.3rem; color: white; } } h3 { color: #2d4a3e; font-size: 1.5rem; font-weight: 700; margin: 0; } p { color: #a8c5a0; font-size: 0.85rem; margin: 0; } } } .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; .section-title { display: flex; align-items: center; gap: 8px; ion-icon { font-size: 1.5rem; color: #2d4a3e; } h3 { color: #2d4a3e; font-size: 1.1rem; font-weight: 600; margin: 0; } } .see-all { color: #a8c5a0; font-size: 0.9rem; font-weight: 500; text-decoration: none; cursor: pointer; } } .goals-list { display: flex; flex-direction: column; gap: 12px; margin-bottom: 32px; .goal-item { background: white; border: 2px solid #e0e0d8; border-radius: 16px; padding: 16px; display: flex; gap: 12px; .goal-icon { width: 48px; height: 48px; background: #3d5a52; border-radius: 12px; display: flex; justify-content: center; align-items: center; flex-shrink: 0; ion-icon { font-size: 1.5rem; color: white; } } .goal-content { flex: 1; h4 { color: #2d4a3e; font-size: 0.95rem; font-weight: 600; margin: 0 0 4px 0; } .goal-time { display: inline-block; background: #e8f0e6; color: #5a7a6a; font-size: 0.8rem; padding: 4px 10px; border-radius: 10px; margin-bottom: 12px; } .goal-progress { ion-progress-bar { --background: rgba(138, 173, 147, 0.3); --progress-background: #5a7a6a; height: 6px; border-radius: 3px; margin-bottom: 6px; } .goal-stats { display: flex; justify-content: space-between; font-size: 0.85rem; span { color: #7a7a7a; } .xp-reward { color: #5a7a6a; font-weight: 600; } } } } } } .badges-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 40px; .badge-item { display: flex; flex-direction: column; align-items: center; gap: 8px; .badge-icon { width: 64px; height: 64px; border-radius: 16px; display: flex; justify-content: center; align-items: center; &.green { background: #5a7a6a; } &.light-green { background: #a8c5a0; } &.medium-green { background: #7a9d8a; } &.pale-green { background: #c8d8ca; } ion-icon { font-size: 2rem; color: white; } } p { color: #2d4a3e; font-size: 0.8rem; text-align: center; margin: 0; } } } ion-footer { background: transparent; }
```

# app\pages\profile\profile.page.spec.ts

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing'; import { ProfilePage } from './profile.page'; describe('ProfilePage', () => { let component: ProfilePage; let fixture: ComponentFixture<ProfilePage>; beforeEach(() => { fixture = TestBed.createComponent(ProfilePage); component = fixture.componentInstance; fixture.detectChanges(); }); it('should create', () => { expect(component).toBeTruthy(); }); });
```

# app\pages\profile\profile.page.ts

```ts
import { Component, OnInit } from '@angular/core'; import { CommonModule } from '@angular/common'; import { FormsModule } from '@angular/forms'; import { IonicModule } from '@ionic/angular'; import { NavigationComponent } from "src/app/components/navigation/navigation.component"; import { addIcons } from 'ionicons'; import { settingsOutline, star, flash, ribbon, chevronForward, people, radioButtonOn, leaf, trophy, person, playForward } from 'ionicons/icons'; @Component({ selector: 'app-profile', templateUrl: './profile.page.html', styleUrls: ['./profile.page.scss'], standalone: true, imports: [IonicModule, NavigationComponent, CommonModule, FormsModule] }) export class ProfilePage implements OnInit { constructor() { addIcons({ settingsOutline, star, flash, ribbon, chevronForward, people, radioButtonOn, leaf, trophy, person, playForward }); } ngOnInit() { } }
```

# app\pages\social\social.page.html

```html
<ion-header class="ion-no-border"> <ion-toolbar mode="md"> <ion-title>Közösség</ion-title> </ion-toolbar> </ion-header> <ion-content [fullscreen]="true"> <div class="ion-padding"> <div class="tab-buttons"> <button class="tab-btn" [class.active]="selectedTab === 'leaderboard'" (click)="selectTab('leaderboard')"> Ranglista </button> <button class="tab-btn" [class.active]="selectedTab === 'friends'" (click)="selectTab('friends')"> Barátok </button> <button class="tab-btn" [class.active]="selectedTab === 'challenges'" (click)="selectTab('challenges')"> Kihívások </button> </div> @switch (selectedTab) { @case ('leaderboard') { <app-leaderboard></app-leaderboard> } @case ('friends') { <app-friends></app-friends> } @case ('challenges') { <app-challenges></app-challenges> } @default { <div>Nincs találat</div> } } </div> </ion-content> <ion-footer class="ion-no-border"> <app-navigation></app-navigation> </ion-footer>
```

# app\pages\social\social.page.scss

```scss
ion-header { ion-toolbar { --background: #f5f5f0; --color: #2d4a3e; ion-title { font-size: 1.2rem; font-weight: 600; } } } ion-content { --background: #f5f5f0; } .tab-buttons { display: flex; gap: 0; margin-bottom: 24px; background: white; border: 2px solid #e0e0d8; border-radius: 20px; padding: 4px; .tab-btn { flex: 1; padding: 12px; background: transparent; border: none; border-radius: 16px; color: #5a7a6a; font-size: 0.9rem; font-weight: 500; cursor: pointer; transition: all 0.2s; &.active { background: #5a7a6a; color: white; } } } .tab-content { margin-bottom: 80px; } ion-footer { background: transparent; }
```

# app\pages\social\social.page.spec.ts

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing'; import { SocialPage } from './social.page'; describe('SocialPage', () => { let component: SocialPage; let fixture: ComponentFixture<SocialPage>; beforeEach(() => { fixture = TestBed.createComponent(SocialPage); component = fixture.componentInstance; fixture.detectChanges(); }); it('should create', () => { expect(component).toBeTruthy(); }); });
```

# app\pages\social\social.page.ts

```ts
import { Component, OnInit } from '@angular/core'; import { CommonModule } from '@angular/common'; import { FormsModule } from '@angular/forms'; import { IonicModule } from '@ionic/angular'; import { NavigationComponent } from "src/app/components/navigation/navigation.component"; import { LeaderboardComponent } from 'src/app/components/leaderboard/leaderboard.component'; import { FriendsComponent } from 'src/app/components/friends/friends.component'; import { ChallengesComponent } from 'src/app/components/challenges/challenges.component'; import { addIcons } from 'ionicons'; import { trendingUp, trendingDown, leaf, checkmark, chevronForward, flame, trophy, radioButtonOn, people, flash } from 'ionicons/icons'; @Component({ selector: 'app-social', templateUrl: './social.page.html', styleUrls: ['./social.page.scss'], standalone: true, imports: [IonicModule, NavigationComponent, LeaderboardComponent, FriendsComponent, ChallengesComponent, CommonModule, FormsModule] }) export class SocialPage implements OnInit { selectedTab: string = 'leaderboard'; constructor() { addIcons({ trendingUp, trendingDown, leaf, checkmark, chevronForward, flame, trophy, radioButtonOn, people, flash }); } ngOnInit() { } selectTab(tab: string) { this.selectedTab = tab; } }
```

# app\services\auth.guard.ts

```ts
import { Injectable } from '@angular/core'; import { CanActivate, Router } from '@angular/router'; import { AuthService } from './auth.service'; @Injectable({ providedIn: 'root' }) export class AuthGuard implements CanActivate { constructor(private authService: AuthService, private router: Router) {} canActivate(): boolean { if (this.authService.isLoggedIn()) { return true; } else { this.router.navigate(['/login']); return false; } } }
```

# app\services\auth.service.ts

```ts
import { Injectable } from '@angular/core'; import { User } from '../models/user.model'; @Injectable({ providedIn: 'root' }) export class AuthService { private loggedIn = false; private currentUser: User | null = null; isLoggedIn(): boolean { return this.loggedIn || !!localStorage.getItem('loggedIn'); } getUser(): User | null { if (this.currentUser) return this.currentUser; const userJson = localStorage.getItem('user'); return userJson ? JSON.parse(userJson) : null; } login(user?: User): void { this.loggedIn = true; localStorage.setItem('loggedIn', 'true'); if (user) { this.currentUser = user; localStorage.setItem('user', JSON.stringify(user)); } } logout(): void { this.loggedIn = false; this.currentUser = null; localStorage.removeItem('loggedIn'); localStorage.removeItem('user'); } }
```

# assets\icon\favicon.png

This is a binary file of the type: Image

# assets\shapes.svg

This is a file of the type: SVG Image

# environments\environment.prod.ts

```ts
export const environment = { production: true };
```

# environments\environment.ts

```ts
// This file can be replaced during build by using the `fileReplacements` array. // `ng build` replaces `environment.ts` with `environment.prod.ts`. // The list of file replacements can be found in `angular.json`. export const environment = { production: false }; /* * For easier debugging in development mode, you can import the following file * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`. * * This import should be commented out in production mode because it will have a negative impact * on performance if an error is thrown. */ // import 'zone.js/plugins/zone-error'; // Included with Angular CLI.
```

# global.scss

```scss
/* * App Global CSS * ---------------------------------------------------------------------------- * Put style rules here that you want to apply globally. These styles are for * the entire app and not just one component. Additionally, this file can be * used as an entry point to import other CSS/Sass files to be included in the * output CSS. * For more information on global stylesheets, visit the documentation: * https://ionicframework.com/docs/layout/global-stylesheets */ /* Core CSS required for Ionic components to work properly */ @import "@ionic/angular/css/core.css"; /* Basic CSS for apps built with Ionic */ @import "@ionic/angular/css/normalize.css"; @import "@ionic/angular/css/structure.css"; @import "@ionic/angular/css/typography.css"; @import "@ionic/angular/css/display.css"; /* Optional CSS utils that can be commented out */ @import "@ionic/angular/css/padding.css"; @import "@ionic/angular/css/float-elements.css"; @import "@ionic/angular/css/text-alignment.css"; @import "@ionic/angular/css/text-transformation.css"; @import "@ionic/angular/css/flex-utils.css"; /** * Ionic Dark Mode * ----------------------------------------------------- * For more info, please see: * https://ionicframework.com/docs/theming/dark-mode */ /* @import "@ionic/angular/css/palettes/dark.always.css"; */ /* @import "@ionic/angular/css/palettes/dark.class.css"; */ @import '@ionic/angular/css/palettes/dark.system.css'; ion-header { ion-title { -webkit-padding-start: 16px; padding-inline-start: 16px; -webkit-padding-end: 16px; padding-inline-end: 16px; } } // Activity cards global styling .activity-section { background: white; border: 2px solid #e0e0d8; border-radius: 20px; padding: 24px; margin-bottom: 40px; } .section-header { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; .section-icon { width: 48px; height: 48px; background: #e8f0e6; border-radius: 12px; display: flex; justify-content: center; align-items: center; flex-shrink: 0; ion-icon { font-size: 1.5rem; color: #5a7a6a; } } h3 { color: #2d4a3e; font-size: 1.2rem; font-weight: 600; margin: 0; } p { color: #7a7a7a; font-size: 0.9rem; margin: 4px 0 0 0; } } .toggle-buttons { display: flex; gap: 8px; margin-bottom: 20px; .toggle-btn { flex: 1; padding: 12px; background: white; border: 2px solid #e0e0d8; border-radius: 12px; color: #2d4a3e; font-size: 0.9rem; font-weight: 500; cursor: pointer; transition: all 0.2s; &.active { background: #5a7a6a; color: white; border-color: #5a7a6a; } } } .subsection-title { color: #5a5a5a; font-size: 0.9rem; font-weight: 500; margin: 20px 0 12px 0; } .save-button { --background: #5a7a6a; --background-hover: #4a6a5a; --border-radius: 12px; height: 48px; font-weight: 600; text-transform: none; margin-top: 8px; } ion-footer { background: transparent; }
```

# index.html

```html
<!DOCTYPE html> <html lang="en"> <head> <meta charset="utf-8" /> <title>Ionic App</title> <base href="/" /> <meta name="color-scheme" content="light dark" /> <meta name="viewport" content="viewport-fit=cover, width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no" /> <meta name="format-detection" content="telephone=no" /> <meta name="msapplication-tap-highlight" content="no" /> <link rel="icon" type="image/png" href="assets/icon/favicon.png" /> <!-- add to homescreen for ios --> <meta name="mobile-web-app-capable" content="yes" /> <meta name="apple-mobile-web-app-status-bar-style" content="black" /> </head> <body> <app-root></app-root> </body> </html>
```

# main.ts

```ts
import { bootstrapApplication } from '@angular/platform-browser'; import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules } from '@angular/router'; import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone'; import { routes } from './app/app.routes'; import { AppComponent } from './app/app.component'; bootstrapApplication(AppComponent, { providers: [ { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }, provideIonicAngular(), provideRouter(routes, withPreloading(PreloadAllModules)), ], });
```

# polyfills.ts

```ts
/** * This file includes polyfills needed by Angular and is loaded before the app. * You can add your own extra polyfills to this file. * * This file is divided into 2 sections: * 1. Browser polyfills. These are applied before loading ZoneJS and are sorted by browsers. * 2. Application imports. Files imported after ZoneJS that should be loaded before your main * file. * * The current setup is for so-called "evergreen" browsers; the last versions of browsers that * automatically update themselves. This includes recent versions of Safari, Chrome (including * Opera), Edge on the desktop, and iOS and Chrome on mobile. * * Learn more in https://angular.io/guide/browser-support */ /*************************************************************************************************** * BROWSER POLYFILLS */ /** * By default, zone.js will patch all possible macroTask and DomEvents * user can disable parts of macroTask/DomEvents patch by setting following flags * because those flags need to be set before `zone.js` being loaded, and webpack * will put import in the top of bundle, so user need to create a separate file * in this directory (for example: zone-flags.ts), and put the following flags * into that file, and then add the following code before importing zone.js. * import './zone-flags'; * * The flags allowed in zone-flags.ts are listed here. * * The following flags will work for all browsers. * * (window as any).__Zone_disable_requestAnimationFrame = true; // disable patch requestAnimationFrame * (window as any).__Zone_disable_on_property = true; // disable patch onProperty such as onclick * (window as any).__zone_symbol__UNPATCHED_EVENTS = ['scroll', 'mousemove']; // disable patch specified eventNames * * in IE/Edge developer tools, the addEventListener will also be wrapped by zone.js * with the following flag, it will bypass `zone.js` patch for IE/Edge * * (window as any).__Zone_enable_cross_context_check = true; * */ import './zone-flags'; /*************************************************************************************************** * Zone JS is required by default for Angular itself. */ import 'zone.js'; // Included with Angular CLI. /*************************************************************************************************** * APPLICATION IMPORTS */
```

# test.ts

```ts
// This file is required by karma.conf.js and loads recursively all the .spec and framework files import 'zone.js/testing'; import { getTestBed } from '@angular/core/testing'; import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing'; // First, initialize the Angular testing environment. getTestBed().initTestEnvironment( BrowserDynamicTestingModule, platformBrowserDynamicTesting(), );
```

# theme\variables.scss

```scss
// For information on how to create your own theme, please see: // http://ionicframework.com/docs/theming/
```

# zone-flags.ts

```ts
/** * Prevents Angular change detection from * running with certain Web Component callbacks */ // eslint-disable-next-line no-underscore-dangle (window as any).__Zone_disable_customElements = true;
```

