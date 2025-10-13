import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PopupDataService {
private popupData: { [key: string]: string[] } = {
    escalations: [
      "Escalation 1: AI/ML - High Priority",
      "Escalation 2: Serverless - Medium Priority",
      "Escalation 3: Data Analytics - Low Priority"
    ],
    teamGrowthPlan: [
      "Conduct one-on-one meetings with team members",
      "Identify skill gaps and training needs",
      "Set individual performance goals"
    ],
  };

  constructor() { }

  getPopupData(type: string): string[] {
    return this.popupData[type] || [];
  }
}