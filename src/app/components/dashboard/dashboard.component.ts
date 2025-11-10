interface SiteStats {
  associates: number;
  top: number;
  avg: number;
  bottom: number;
  kudos: string;
}
interface Person {
  name: string;
  status: string;
  specialization: string;
}

import { Component, OnInit } from '@angular/core';
import { SiteDataService } from '../../services/site-data.service';
import { GoogleAuthService } from '../../services/google-auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ChartConfiguration, ChartType } from 'chart.js';
import { NgChartsModule } from 'ng2-charts';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { HttpClient } from '@angular/common/http';
import { MatNativeDateModule } from '@angular/material/core';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  providers: [GoogleAuthService],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgChartsModule, MatDatepickerModule,
    MatFormFieldModule, MatInputModule, MatNativeDateModule ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  totalAssociates = 0;
  topPerformers = 0;
  averagePerformers = 0;
  bottomPerformers = 0;

  constructor(
    private siteDataService: SiteDataService,
    private googleAuth: GoogleAuthService
  ) { }
  siteStats: any;
  selectedSite: string = 'Select Site';
  // startDate: string = '';
  // endDate: string = '';
  allItems: any[] = [/* your data here */];
  filteredItems: any[] = [];
  selectedSpecialization: string = 'All Specializations';
  startDate!: Date;
  endDate!: Date;

  specializations: string[] = [
    'All Specializations',
    'Compute',
    'DevOps',
    'Security',
    'GKE',
    'Networking',
    'Databases',
    'Data Analytics',
    'AI/ML',
    'Serverless',
    'Storage'
  ];
  popupType: string | null = null;

  openPopupz(type: string) {
    this.popupType = type;
  }

  closePopupz() {
    this.popupType = null;
  }
  getZoneMetrics() {
    if (this.popupType === 'topMetric') {
      return [
        { label: 'Quality', value: '93.4%', change: '+6.4%', colorClass: 'text-green-600 font-bold' },
        { label: 'SDR', value: '34%', change: '+9%', colorClass: 'text-green-600 font-bold' },
        { label: 'sBCR', value: '83.4%', change: '+3.4%', colorClass: 'text-green-600 font-bold' },
      ];
    } else if (this.popupType === 'averageMetric') {
      return [
        { label: 'Escalation Rate', value: '2.7%', change: '+0.3%', colorClass: 'text-yellow-600 font-bold' },
      ];
    } else if (this.popupType === 'leastMetric') {
      return [
        { label: 'Average FMR Hrs', value: '2.66', change: '+0.66', colorClass: 'text-red-600 font-bold' },
        { label: 'CES', value: '78.9%', change: '-12.1%', colorClass: 'text-red-600 font-bold' },
        { label: 'Hard Consult Rate', value: '45.6', change: '+11.6%', colorClass: 'text-red-600 font-bold' },
      ];
    }
    return [];
  }

  applyFilter() {

    if (!this.startDate || !this.endDate) {
      return;
    }
    if (this.startDate > this.endDate) {
      console.error('Start date cannot be after end date.');
      return;
    }
    const formattedStart = this.formatDate(this.startDate);
    const formattedEnd = this.formatDate(this.endDate);

    console.log('API CALL: Preparing to send these params:' +
      ` Start Date: ${formattedStart}, End Date: ${formattedEnd}`);


    const params = {
      startDate: formattedStart,
      endDate: formattedEnd,
    };

  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  sheetData: any[] = [];
  headers: string[] = [];
  trainingSheetHeaders: string[] = [];
  trainingSheetData: any[] = [];
  nestedCount = 0;
  readyCount = 0;
  trainingCount = 0;
  onboardingCount = 0;
  data: Person[] = [];
  ngOnInit(): void {
    const spreadsheetId = '1mfnbjmMP6nUavrjlV5C_g7W1S4Hx72jABsfY-aQiT10';
    const range = 'TSR_LDAP_wise_Performance!A1:J189';
    const apiKey = 'AIzaSyB2Wal4dub_mS231LVH2yq_oPQBckF74Q4';

    this.googleAuth.getSheetData(spreadsheetId, range, apiKey).then(data => {
      this.headers = data[0];
      this.sheetData = data.slice(1);
      const ratingIndex = this.headers.indexOf('Rating');
      const nameIndex = this.headers.indexOf('Name');
      const statusIndex = this.headers.indexOf('Status');
      const specializationIndex = this.headers.indexOf('Specialization');


      this.totalAssociates = this.sheetData.length;
      this.topPerformers = this.sheetData.filter(row => row[ratingIndex] == 5 || row[ratingIndex] == 4).length;
      this.averagePerformers = this.sheetData.filter(row => row[ratingIndex] == 3).length;
      this.bottomPerformers = this.sheetData.filter(row => row[ratingIndex] == 2 || row[ratingIndex] == 1).length;

      this.data = this.sheetData
        .map(row => ({
          name: row[nameIndex]?.trim(),
          status: row[statusIndex]?.trim(),
          specialization: row[specializationIndex]?.trim()
        }))
        .filter(row => row.name && row.status && row.specialization);
      this.calculateCounts();
    });

    this.fetchTrainingSheetData();
  }

  async loadData() {

    const spreadsheetId = '1mfnbjmMP6nUavrjlV5C_g7W1S4Hx72jABsfY-aQiT10';

    const range = 'TSR_LDAP_wise_Performance!A1:J189';

    this.sheetData = await this.googleAuth.getSheetData(spreadsheetId, range, 'AIzaSyB2Wal4dub_mS231LVH2yq_oPQBckF74Q4');
    console.log(this.sheetData);
  }

  fetchTrainingSheetData() {
    const spreadsheetId = '1mfnbjmMP6nUavrjlV5C_g7W1S4Hx72jABsfY-aQiT10';
    const range = 'Training!A1:C21';
    const apiKey = 'AIzaSyB2Wal4dub_mS231LVH2yq_oPQBckF74Q4';

    this.googleAuth.getSheetData(spreadsheetId, range, apiKey).then(data => {
      // Process the data as needed
      console.log('Training sheet data:', data);
      this.trainingSheetHeaders = data[0];
      const nameIndex = this.trainingSheetHeaders.indexOf('Name');
      const statusIndex = this.trainingSheetHeaders.indexOf('Status');
      const rows = data.slice(1);
      const specIndex = this.trainingSheetHeaders.indexOf('Specialization');

      this.data = rows
        .map(row => ({
          name: row[nameIndex]?.trim(),
          status: row[statusIndex]?.trim(),
          specialization: row[specIndex]?.trim()
        }))
        .filter(row => row.name && row.status && row.specialization);

      this.calculateCounts();
    });
  }

  updateSiteData(): void {
    const data = this.siteDataService.getSiteData(this.selectedSite);
    this.siteStats = data;
  }

  updateSitePerformance(): void {
    this.updateSiteData();
  }
  selectedMission: string = '';
  missionData: { [key: string]: { name: string, score: number }[] } = {
    'CES': [
      { name: 'Compute', score: 5 },
      { name: 'DevOps', score: 4 },
      { name: 'Security', score: 5 },
      { name: 'GKE', score: 5 },
      { name: 'Networking', score: 5 },
      { name: 'Databases', score: 4 },
      { name: 'Data Analytics', score: 4 },
      { name: 'AI/ML', score: 5 },
      { name: 'Serverless', score: 5 },
      { name: 'Storage', score: 4 }
    ],
    'SDR': [
      { name: 'Compute', score: 5 },
      { name: 'DevOps', score: 4 },
      { name: 'Security', score: 5 },
      { name: 'GKE', score: 5 },
      { name: 'Networking', score: 5 },
      { name: 'Databases', score: 4 },
      { name: 'Data Analytics', score: 4 },
      { name: 'AI/ML', score: 5 },
      { name: 'Serverless', score: 5 },
      { name: 'Storage', score: 4 }
    ],
    'Escalation Rate': [
      { name: 'Preventable Escalations', score: 3 },
      { name: 'Non-Preventable Escalations', score: 2 },
    ],
    'Quality': [
      { name: 'Compute', score: 5 },
      { name: 'DevOps', score: 4 },
      { name: 'Security', score: 5 },
      { name: 'GKE', score: 5 },
      { name: 'Networking', score: 5 },
      { name: 'Databases', score: 4 },
      { name: 'Data Analytics', score: 4 },
      { name: 'AI/ML', score: 5 },
      { name: 'Serverless', score: 5 },
      { name: 'Storage', score: 4 }
    ],
    'Average FMR': [
      { name: 'Compute', score: 5 },
      { name: 'DevOps', score: 4 },
      { name: 'Security', score: 5 },
      { name: 'GKE', score: 5 },
      { name: 'Networking', score: 5 },
      { name: 'Databases', score: 4 },
      { name: 'Data Analytics', score: 4 },
      { name: 'AI/ML', score: 5 },
      { name: 'Serverless', score: 5 },
      { name: 'Storage', score: 4 }
    ],
    'Hard Consult Rate': [
      { name: 'Compute', score: 5 },
      { name: 'DevOps', score: 4 },
      { name: 'Security', score: 5 },
      { name: 'GKE', score: 5 },
      { name: 'Networking', score: 5 },
      { name: 'Databases', score: 4 },
      { name: 'Data Analytics', score: 4 },
      { name: 'AI/ML', score: 5 },
      { name: 'Serverless', score: 5 },
      { name: 'Storage', score: 4 }
    ],
    'Signal Ratio': [
      { name: 'Hard Signal Ratio', score: 4 },
      { name: 'Soft Signal Ratio', score: 3 },
    ],
    'Backlog Control Rate': [
      { name: 'Compute', score: 5 },
      { name: 'DevOps', score: 4 },
      { name: 'Security', score: 5 },
      { name: 'GKE', score: 5 },
      { name: 'Networking', score: 5 },
      { name: 'Databases', score: 4 },
      { name: 'Data Analytics', score: 4 },
      { name: 'AI/ML', score: 5 },
      { name: 'Serverless', score: 5 },
      { name: 'Storage', score: 4 }
    ],
  };

  calculateCounts() {
    const filtered = this.selectedSpecialization === 'All Specializations'
      ? this.data
      : this.data.filter(d =>
        d.specialization.toLowerCase() === this.selectedSpecialization.toLowerCase()
      );
    console.log("Filtered data for", this.selectedSpecialization, filtered);

    this.nestedCount = filtered.filter(d => d.status?.toLowerCase() === 'nested').length;
    this.readyCount = filtered.filter(d => d.status?.toLowerCase() === 'ready').length;
    this.trainingCount = this.nestedCount + this.readyCount;
    this.onboardingCount = filtered.filter(d => d.status?.toLowerCase() === 'onboarding').length;
  }
  showMissions(missionType: string) {
    this.selectedMission = missionType;

    const modal = document.getElementById('missionModal');
    const missionTitle = document.getElementById('missionTitle');
    const missionList = document.getElementById('missionList');

    if (modal && missionTitle && missionList) {
      modal.classList.remove('hidden');
      modal.classList.add('flex');

      missionTitle.textContent = missionType;

      missionList.innerHTML = '';

      const missions = this.missionData[missionType] || [];

      missions.forEach(item => {
        const row = document.createElement('li');
        row.className = 'flex justify-between items-center bg-gray-50 px-4 py-2 rounded';

        const name = document.createElement('span');
        name.className = 'text-gray-700';
        name.textContent = item.name;

        const score = document.createElement('span');
        score.className = 'text-blue-600 font-semibold';
        score.textContent = item.score.toString();

        row.appendChild(name);
        row.appendChild(score);
        missionList.appendChild(row);
      });
    }
  }


  onSiteChange(site: string): void {
    this.selectedSite = site;
    this.updateSiteData();
  }

  closeModal() {
    const modal = document.getElementById('missionModal');
    if (modal) {
      modal.classList.add('hidden');
    }
  }

  showStatPopup = false;
  popupTitle = '';
  popupContent: string[] = [];
  searchTerm: string = '';
  filteredPopupContent: string[] = [];

  onSearchAssociate() {
    const term = this.searchTerm.toLowerCase();
    this.filteredPopupContent = this.popupContent.filter(name =>
      name.toLowerCase().includes(term)
    );
  }

  showPopup(type: string) {
    this.showStatPopup = true;
    this.searchTerm = '';
    const nameIndex = this.headers.indexOf('Name');
    const ratingIndex = this.headers.indexOf('Rating');
    let filtered: any[] = [];

    switch (type) {
      case 'totalAssociates':
        this.popupTitle = 'Total Associates';
        this.popupContent = this.sheetData
          .map(row => row[nameIndex])
          .filter(name => !!name)
          .sort((a: string, b: string) => a.localeCompare(b));
        break;
      case 'topPerformers':
        this.popupTitle = 'Top Performers';
        filtered = this.sheetData.filter(row => row[ratingIndex] == 5 || row[ratingIndex] == 4);
        this.popupContent = filtered
          .map(row => row[nameIndex])
          .filter(name => !!name)
          .sort((a: string, b: string) => a.localeCompare(b));
        break;
      case 'averagePerformers':
        this.popupTitle = 'Average Performers';
        filtered = this.sheetData.filter(row => row[ratingIndex] == 3);
        this.popupContent = filtered
          .map(row => row[nameIndex])
          .filter(name => !!name)
          .sort((a: string, b: string) => a.localeCompare(b));
        break;
      case 'bottomPerformers':
        this.popupTitle = 'Bottom Performers';
        filtered = this.sheetData.filter(row => row[ratingIndex] == 2 || row[ratingIndex] == 1);
        this.popupContent = filtered
          .map(row => row[nameIndex])
          .filter(name => !!name)
          .sort((a: string, b: string) => a.localeCompare(b));
        break;
    }
    this.filteredPopupContent = [...this.popupContent];
  }



  closePopup() {
    this.showStatPopup = false;
  }
  filterStats(filterType: string) {
    //Filtering logic here
    console.log('Filtering stats by:', filterType);
  }

  //team performance
  showOverallPerformancePopup = false;

  overallPerformanceData = [
    {
      icon: 'fas fa-comments text-blue-500',
      title: 'Chat Tickets',
      subtitle: 'Premium: 5 | Non Premium: 5',
      value: '10'
    },
    {
      icon: 'fas fa-globe text-green-500',
      title: 'Web Tickets',
      subtitle: 'Premium: 8 | Non Premium: 7',
      value: '15'
    },
    {
      icon: 'fas fa-user-graduate text-yellow-500',
      title: 'Training',
      subtitle: 'Nested: 7 | Ready: 5',
      value: '12'
    },
    {
      icon: 'fas fa-user-plus text-purple-500',
      title: 'Active Cases',
      value: '15'
    },
    {
      icon: 'fas fa-calendar-check text-red-500',
      title: 'Release Plan',
      value: '10'
    },
    {
      icon: 'fas fa-briefcase text-pink-500',
      title: 'TTM',
      value: '40%'
    },
    {
      icon: 'fas fa-fire text-orange-500',
      title: 'Smoky Cases',
      value: '7'
    },
    {
      icon: 'fas fa-clipboard-check text-blue-500',
      title: 'Handled Cases',
      subtitle: 'Well Handled Cases: 5',
      value: '10'
    },
    {
      icon: 'fas fa-check-circle text-green-600',
      title: 'Cases Closed',
      value: '5'
    }
  ];

  openOverallPerformancePopup() {
    this.showOverallPerformancePopup = true;
  }
  closeOverallPerformancePopup() {
    this.showOverallPerformancePopup = false;
  }
  //input output key
  showKeyPopup = false;

  openKeyPopup() {
    this.showKeyPopup = true;
  }

  closeKeyPopup() {
    this.showKeyPopup = false;
  }
  //youvs1st
  public youVsFirstLabels: string[] = [
    'CES', 'Escalation Rate', 'SDR', 'Quality', 'FMR', 'Hard Consult Rate'
  ];

  public youVsFirstData: ChartConfiguration<'bar'>['data'] = {
    labels: this.youVsFirstLabels,
    datasets: [
      {
        label: 'You',
        data: [79, 2.7, 34, 93.4, 2.6, 45.6], // Replace with your actual values
        backgroundColor: 'rgba(59, 130, 246, 1)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderRadius: 5,
        // pointBackgroundColor: 'rgba(59, 130, 246, 1)',
      },
      {
        label: 'Best Team',
        data: [95, 1.5, 38, 97, 2.1, 28], // Replace with best team values
        backgroundColor: 'rgba(16, 185, 129, 1)',
        borderColor: 'rgba(16, 185, 129, 1)',
        borderRadius: 5,
        // pointBackgroundColor: 'rgba(16, 185, 129, 1)',
      }
    ]
  };

  public youVsFirstOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'top'
      }
    }
  };

  actionItemInput: string = '';
  message: string = ''; // For displaying messages about action items

  selectedAssignee: string = 'everyone'; // To store the value of the "Assign To" select
  selectedTSRDisplayName: string = ''; // To display the selected TSR name

  // Properties for the modal
  showIndividualModal: boolean = false; // Controls the visibility of the modal
  selectedTSRValue: string = 'intro'; // Stores the selected value from the modal dropdown
  tsrOptions = [
    { value: 'intro', name: 'Choose a TSR' },
    { value: 'tsr1', name: 'Arjun Mehta' },
    { value: 'tsr2', name: 'Priya Sharma' },
    { value: 'tsr3', name: 'Sneha Reddy' },
    // Add more TSRs as needed
  ];
  // --- Functions related to Assign To / TSR selection ---

  handleTaskFilterChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    this.selectedAssignee = selectElement.value;
    this.message = ''; // Clear previous messages

    if (this.selectedAssignee === 'individual') {
      this.openIndividualModal();
    } else {
      this.selectedTSRDisplayName = ''; // Clear individual TSR display if "Everyone" is selected
    }
  }

  openIndividualModal(): void {
    this.showIndividualModal = true;
    // Reset modal selection if needed when opening
    this.selectedTSRValue = 'intro';
  }

  closeIndividualModal(): void {
    this.showIndividualModal = false;
    if (this.selectedAssignee === 'individual' && this.selectedTSRValue === 'intro') {

    }
  }

  saveTSRSelection(): void {
    if (this.selectedTSRValue === 'intro') {
      this.message = 'Please select a valid TSR.';
      return;
    }

    const selectedOption = this.tsrOptions.find(option => option.value === this.selectedTSRValue);
    if (selectedOption) {
      this.selectedTSRDisplayName = selectedOption.name;
      this.showIndividualModal = false; // Close the modal
    } else {
      this.message = 'Error: Selected TSR not found.';
    }
  }

  // --- Functions related to Action Item Input ---

  saveActionItem(): void {
    if (this.actionItemInput.trim() === '') {
      this.message = 'Please enter an action item.';
      alert(this.message);
    } else {
      // Logic to save the action item
      let assigneeInfo = '';
      if (this.selectedAssignee === 'everyone') {
        assigneeInfo = 'everyone';
      } else if (this.selectedAssignee === 'individual' && this.selectedTSRDisplayName) {
        assigneeInfo = this.selectedTSRDisplayName;
      } else {
        assigneeInfo = 'an unassigned individual (please select TSR)';
      }

      this.message = `"${this.actionItemInput}" added and assigned to ${assigneeInfo}.`;
      console.log('Action Item to save:', this.actionItemInput, 'Assigned To:', assigneeInfo);
      alert(this.message);
      this.actionItemInput = ''; // Clear the input after saving
    }
  }

  wishlistInput: string = '';

  saveWishlist(): void {
    if (this.wishlistInput.trim() === '') {
      alert('Please enter your wishlist item.');
    } else {
      // Logic to save the wishlist item
      alert('Your wishlist item is saved.');
      // You might want to clear the input after saving
      // this.wishlistInput = '';
    }
  }



}