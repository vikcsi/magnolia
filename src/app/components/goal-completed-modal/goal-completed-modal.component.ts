import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonButton, IonIcon, ModalController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { trophyOutline } from 'ionicons/icons';
import { Goal } from 'src/app/models/goal.model';

@Component({
  selector: 'app-goal-completed-modal',
  templateUrl: './goal-completed-modal.component.html',
  styleUrls: ['./goal-completed-modal.component.scss'],
  standalone: true,
  imports: [CommonModule, IonButton, IonIcon],
})
export class GoalCompletedModalComponent {
  @Input() goal!: Goal;
  private modalCtrl = inject(ModalController);

  constructor() {
    addIcons({ trophyOutline });
  }

  close() {
    this.modalCtrl.dismiss();
  }
}