import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-mission-modal',
  standalone: true,
  templateUrl: './mission-modal.component.html',
  styleUrls: ['./mission-modal.component.css']
})
export class MissionModalComponent {
  @Input() missionTitle!: string;
  @Input() missionList!: { name: string; score: number }[];
  closeModal() {
    // Logic to close the modal
 
     const modal = document.getElementById('missionModal');
  if (modal) {
    modal.classList.remove('flex');
    modal.classList.add('hidden');
  }
  }
}