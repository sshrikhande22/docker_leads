import { Component } from '@angular/core';
import { SiteDataService } from '../../services/site-data.service';
import { CommonModule } from '@angular/common';
import { FilterService } from '../../services/filter.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  selectedSite: string = 'Select Site';
  selectedBusinessline: string = 'Select';
  sites: string[] = [
    'CGN-HYD',
    'CGN-TLV',
    'CGN-BUH',
    'CGN-CBE',
  ];

  constructor(private siteDataService: SiteDataService,
    private filterService: FilterService
  ) {}

  updateSiteData(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    this.selectedSite = selectElement.value;
    this.siteDataService.setSelectedSite(this.selectedSite);
  }

  toggleMenu() {
    const dropdown = document.getElementById("menuDropdown");
 if (dropdown) {
    dropdown.classList.toggle("hidden");
  }  }

  onBusinessLineChange() {

    console.log(`HEADER: Sending business line to service: '${this.selectedBusinessline}'`);

    this.filterService.setBusinessLine(this.selectedBusinessline);
  }
}
