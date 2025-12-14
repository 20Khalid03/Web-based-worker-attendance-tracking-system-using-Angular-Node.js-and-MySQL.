import { Component, OnInit } from '@angular/core';
import { Chart } from 'chart.js/auto';
import { DataService } from '../../services/data.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-visualisation',
  templateUrl: './visualisation.component.html',
  styleUrl: './visualisation.component.css'
})
export class VisualisationComponent implements OnInit {
  public barChart: any;
  public pieChart: any;
  public startDate = '2024-01-01'; 
  public endDate = '2024-12-31';  
  userName: string | null = null;

  constructor(private dataService: DataService,private authService: AuthService) {}

  ngOnInit(): void {
    this.userName = this.authService.getUserName();
    if (!this.userName) {
      this.authService.logout();
    }
    this.loadCharts();
  }

  loadCharts() {
    this.dataService.getHoursWorked(this.startDate, this.endDate).subscribe(data => {
      const sortedBarData = this.sortDataByDate(data.barData);
      this.createBarChart(sortedBarData);
    });

    this.dataService.getTopProductiveWorkers().subscribe(data => {
      this.createPieChart(data);
    });
  }

  sortDataByDate(data: any) {
    const combined = data.labels.map((label: any, index: any) => ({
      label: label,
      value: data.values[index]
    }));
    combined.sort((a: { label: string | number | Date; }, b: { label: string | number | Date; }) => new Date(a.label).getTime() - new Date(b.label).getTime());
    return {
      labels: combined.map((item: { label: any; }) => item.label),
      values: combined.map((item: { value: any; }) => item.value)
    };
  }

  createBarChart(data: any) {
    if (this.barChart) {
      this.barChart.destroy(); 
    }
    this.barChart = new Chart('barChart', {
      type: 'bar',
      data: {
        labels: data.labels,
        datasets: [{
          label: 'Heures Travaillées',
          data: data.values,
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1
        }]
      },
      options: {
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }

  createPieChart(data: any) {
    if (this.pieChart) {
      this.pieChart.destroy(); 
    }
    this.pieChart = new Chart('pieChart', {
      type: 'pie',
      data: {
        labels: data.labels,
        datasets: [{
          label: 'Top 10 Ouvriers',
          data: data.values,
          backgroundColor: [
            'rgba(255, 0, 0,0.6)',
            'rgba(0, 0, 255, 0.6)',
            'rgba(60, 179, 113, 0.6)',
            'rgba(75, 192, 192, 0.6)',
            'rgba(153, 102, 255, 0.6)',
            'rgba(245, 40, 145, 0.8)',
            'rgba(88, 215, 67, 1)',
            'rgba(0, 0, 255, 0.89)',
            'rgba(165, 255, 0, 0.89)'
          ], 
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)'
          ],
          borderWidth: 1
        }]
      }
    });
  }
}