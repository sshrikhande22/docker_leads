import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-popup-modal',
  standalone: true,
  templateUrl: './popup-modal.component.html',
  styleUrls: ['./popup-modal.component.css']
})
export class PopupModalComponent {
  @Input() title: string = '';
  @Input() content: string[] = [];
  @Output() close = new EventEmitter<void>();
  @Input() showViewMore: boolean = false;
@Output() viewMore = new EventEmitter<void>();

  closePopup() {
    this.close.emit();
  }
}