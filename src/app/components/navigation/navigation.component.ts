import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import { 
  homeOutline, 
  barChartOutline, 
  addOutline, 
  ribbonOutline, 
  personOutline 
} from 'ionicons/icons';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class NavigationComponent  implements OnInit {

  constructor(private router: Router) { 
    addIcons({
      homeOutline,
      barChartOutline,
      addOutline,
      ribbonOutline,
      personOutline
    });
  }

  navigate(path: string) {
    this.router.navigate([path]);
  }

  ngOnInit() {}

}
