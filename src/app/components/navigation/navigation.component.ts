import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import {
  homeOutline,
  barChartOutline,
  addOutline,
  ribbonOutline,
  personOutline,
  paperPlaneOutline,
} from 'ionicons/icons';
import { IonIcon } from '@ionic/angular/standalone';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss'],
  standalone: true,
  imports: [CommonModule, IonIcon]
})
export class NavigationComponent  implements OnInit {

  constructor(private router: Router) { 
    addIcons({
      homeOutline,
      barChartOutline,
      addOutline,
      ribbonOutline,
      personOutline,
      paperPlaneOutline,
    });
  }

  navigate(path: string) {
    this.router.navigate([path]);
  }

  isActive(path: string): boolean {
    return this.router.url.startsWith(path);
  }

  ngOnInit() {}

}
