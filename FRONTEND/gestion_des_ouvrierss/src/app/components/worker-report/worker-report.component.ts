import { Component, OnInit } from '@angular/core';
import { DataService } from '../../services/data.service';
import { Ouvrier } from '../../models/ouvrier';
import { OuvrierService } from '../../services/ouvrier.service';
import * as XLSX from 'xlsx';
import html2pdf from 'html2pdf.js';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-worker-report',
  templateUrl: './worker-report.component.html',
  styleUrls: ['./worker-report.component.css']
})
export class WorkerReportComponent implements OnInit {
  reportData: any[] = [];
  userName: string | null = null;

  constructor(
    private dataservice: DataService,
    private ouvrierService: OuvrierService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.userName = this.authService.getUserName();
    if (!this.userName) {
      this.authService.logout();
    }
    this.getWorkerReport();
  }

  getWorkerReport(): void {
    this.dataservice.getWorkerReport().subscribe(data => {
      this.reportData = data;
    });
  }

  exportToExcel(): void {
    const ws = XLSX.utils.json_to_sheet(this.reportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Report');
    XLSX.writeFile(wb, 'Worker_Report.xlsx');
  }

  exportToPDF(): void {
    this.preloadImages().then(() => {
      const contentHtml = this.createContentHtml();
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = contentHtml;
      
      const opt = {
        margin: 10,
        filename: 'Worker_Report.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, logging: true, allowTaint: true, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
      };

      html2pdf().from(tempDiv).set(opt).save();
    });
  }

  private preloadImages(): Promise<void[]> {
    const imagePromises = this.reportData
      .filter(item => item.photo)
      .map(item => {
        return new Promise<void>((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve();
          img.onerror = reject;
          img.crossOrigin = 'Anonymous';
          img.src = this.getImageUrl(item.photo);
        });
      });
    return Promise.all(imagePromises);
  }

  private createContentHtml(): string {
    const title = "Rapport des Ouvriers";
    const currentDate = new Date().toLocaleDateString();
    
    let contentHtml = `
      <style>
        @media print {
          tr {
            page-break-inside: avoid;
          }
        }
      </style>
      <div style="text-align: center; margin-bottom: 20px;">
        <h1 style="color: #333;">${title}</h1>
        <p>Date du rapport: ${currentDate}</p>
      </div>
      <table style="width:100%; border-collapse: collapse;">
        <thead>
          <tr>
            <th style="border: 1px solid black; padding: 5px;">Photo</th>
            <th style="border: 1px solid black; padding: 5px;">First Name</th>
            <th style="border: 1px solid black; padding: 5px;">Last Name</th>
            <th style="border: 1px solid black; padding: 5px;">CIN</th>
            <th style="border: 1px solid black; padding: 5px;">Email</th>
            <th style="border: 1px solid black; padding: 5px;">Total Hours</th>
            <th style="border: 1px solid black; padding: 5px;">nombre_absences</th>
          </tr>
        </thead>
        <tbody>
    `;
  
    this.reportData.forEach(item => {
      const imageUrl = this.getImageUrl(item.photo);
      contentHtml += `
        <tr style="page-break-inside: avoid;">
          <td style="border: 1px solid black; padding: 5px;">
            <img src="${imageUrl}" style="width: 50px; height: 50px; object-fit: cover;" crossorigin="anonymous">
          </td>
          <td style="border: 1px solid black; padding: 5px;">${item.First_Name || ''}</td>
          <td style="border: 1px solid black; padding: 5px;">${item.Last_Name || ''}</td>
          <td style="border: 1px solid black; padding: 5px;">${item.CIN || ''}</td>
          <td style="border: 1px solid black; padding: 5px;">${item.E_mail || ''}</td>
          <td style="border: 1px solid black; padding: 5px;">${item.total_hours || ''}</td>
          <td style="border: 1px solid black; padding: 5px;">${item.nombre_absences|| ''}</td>
        </tr>
      `;
    });
  
    contentHtml += `
        </tbody>
      </table>
    `;
  
    return contentHtml;
  }

  getImageUrl(photoPath: string | null): string {
    if (photoPath) {
      return `http://localhost:3000/${photoPath}`;
    }
    return '';
  }
}