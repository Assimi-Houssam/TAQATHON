import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ArrowDownToLine } from "lucide-react";
import { FaFileExcel, FaFileCode, FaFileCsv, FaPrint } from "react-icons/fa";
import { useTimeFrame } from "@/context/TimeFrameContext";
import { useAnomalies } from "@/hooks/useAnomalies";
import { useAllKPIs } from "@/hooks/useKPIs";
import { format } from "date-fns";
import { toast } from "sonner";

interface ExportMenuProps {
  className?: string;
}

export const ExportMenu = ({ className }: ExportMenuProps) => {
  const { dateRange } = useTimeFrame();
  
  // Fetch anomalies data for export (get all data, no pagination limit)
  const { data: anomaliesData, isLoading } = useAnomalies({
    page: 1,
    limit: 1000, // Get more data for export
  });
  
  const kpis = useAllKPIs();

  const getExportData = () => {
    const anomalies = anomaliesData?.anomalies || [];
    const fromDate = dateRange.from ? format(dateRange.from, 'yyyy-MM-dd') : 'N/A';
    const toDate = dateRange.to ? format(dateRange.to, 'yyyy-MM-dd') : 'N/A';
    
    // Calculate Action Plan Completion Rate
    const actionPlanCompletionRate = kpis.actionPlan.data?.action && kpis.actionPlan.data.action.total > 0
      ? (kpis.actionPlan.data.action.completed / kpis.actionPlan.data.action.total) * 100
      : 0;
    
    return {
      metadata: {
        exportDate: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
        dateRange: `${fromDate} to ${toDate}`,
        totalRecords: anomalies.length,
      },
      kpis: {
        closingRate: Math.round(kpis.closed.data?.percentageWithDates || 0),
        processingRate: Math.round(kpis.inProgress.data?.percentageWithDates || 0),
        actionPlanCompletionRate: Math.round(actionPlanCompletionRate) || 0,
        totalAnomalies: kpis.closed.data?.totalAnomalies || 0,
        closedAnomalies: kpis.closed.data?.totalanomaliesclosed || 0,
        inProgressAnomalies: kpis.inProgress.data?.totalanomaliesinprogress || 0,
        averageProcessingTime: `${kpis.processingTime.data?.averageDays || 0}d ${kpis.processingTime.data?.averageHours || 0}h`,
        actionPlanCompleted: kpis.actionPlan.data?.action.completed || 0,
        actionPlanTotal: kpis.actionPlan.data?.action.total || 0,
      },
      anomalies: anomalies.map(anomaly => ({
        id: anomaly.id,
        equipmentId: anomaly.num_equipments || '-',
        system: anomaly.systeme || '-',
        description: anomaly.descreption_anomalie || '-',
        processSafety: anomaly.process_safty || '-',
        reliability: anomaly.fiablite_integrite || '-',
        availability: anomaly.disponsibilite || '-',
        criticality: anomaly.criticite || '-',
        status: anomaly.status || '-',
        dateDetected: anomaly.date_detection ? format(new Date(anomaly.date_detection), 'yyyy-MM-dd') : '-',
        origin: anomaly.origine || '-',
        dateCreated: anomaly.created_at ? format(new Date(anomaly.created_at), 'yyyy-MM-dd HH:mm:ss') : '-',
        dateUpdated: anomaly.updated_at ? format(new Date(anomaly.updated_at), 'yyyy-MM-dd HH:mm:ss') : '-',
      }))
    };
  };

  const downloadFile = (content: string, filename: string, contentType: string) => {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    if (isLoading) {
      toast.error("Data is still loading. Please wait...");
      return;
    }

    try {
      const data = getExportData();
      
      // CSV headers
      const headers = [
        'ID', 'Equipment ID', 'System', 'Description', 'Process Safety', 
        'Reliability', 'Availability', 'Criticality', 'Status', 
        'Date Detected', 'Origin', 'Date Created', 'Date Updated'
      ];
      
      // Convert data to CSV format
      const csvContent = [
        `# Anomalies Export - ${data.metadata.dateRange}`,
        `# Export Date: ${data.metadata.exportDate}`,
        `# Total Records: ${data.metadata.totalRecords}`,
        '',
        headers.join(','),
        ...data.anomalies.map(row => [
          row.id, row.equipmentId, row.system, row.description,
          row.processSafety, row.reliability, row.availability,
          row.criticality, row.status, row.dateDetected,
          row.origin, row.dateCreated, row.dateUpdated
        ].map(field => `"${field}"`).join(','))
      ].join('\n');

      downloadFile(csvContent, `anomalies_export_${format(new Date(), 'yyyyMMdd_HHmmss')}.csv`, 'text/csv');
      toast.success("CSV export completed successfully!");
    } catch (error) {
      toast.error("Failed to export CSV. Please try again.");
      console.error('CSV export error:', error);
    }
  };

  const handleExportJSON = () => {
    if (isLoading) {
      toast.error("Data is still loading. Please wait...");
      return;
    }

    try {
      const data = getExportData();
      const jsonContent = JSON.stringify(data, null, 2);
      
      downloadFile(jsonContent, `anomalies_export_${format(new Date(), 'yyyyMMdd_HHmmss')}.json`, 'application/json');
      toast.success("JSON export completed successfully!");
    } catch (error) {
      toast.error("Failed to export JSON. Please try again.");
      console.error('JSON export error:', error);
    }
  };

  const handleExportXLSX = () => {
    if (isLoading) {
      toast.error("Data is still loading. Please wait...");
      return;
    }

    try {
      const data = getExportData();
      
      // Create a simple tab-separated format that Excel can open
      const headers = [
        'ID', 'Equipment ID', 'System', 'Description', 'Process Safety', 
        'Reliability', 'Availability', 'Criticality', 'Status', 
        'Date Detected', 'Origin', 'Date Created', 'Date Updated'
      ];
      
      const tsvContent = [
        `Anomalies Export - ${data.metadata.dateRange}`,
        `Export Date: ${data.metadata.exportDate}`,
        `Total Records: ${data.metadata.totalRecords}`,
        '',
        `KPI Summary:`,
        `Closing Rate: ${data.kpis.closingRate}%`,
        `Processing Rate: ${data.kpis.processingRate}%`,
        `Action Plan Completion Rate: ${data.kpis.actionPlanCompletionRate}%`,
        `Total Anomalies: ${data.kpis.totalAnomalies}`,
        `Closed Anomalies: ${data.kpis.closedAnomalies}`,
        `In Progress Anomalies: ${data.kpis.inProgressAnomalies}`,
        `Average Processing Time: ${data.kpis.averageProcessingTime}`,
        `Action Plans Completed: ${data.kpis.actionPlanCompleted} / ${data.kpis.actionPlanTotal}`,
        '',
        headers.join('\t'),
        ...data.anomalies.map(row => [
          row.id, row.equipmentId, row.system, row.description,
          row.processSafety, row.reliability, row.availability,
          row.criticality, row.status, row.dateDetected,
          row.origin, row.dateCreated, row.dateUpdated
        ].join('\t'))
      ].join('\n');

      downloadFile(tsvContent, `anomalies_export_${format(new Date(), 'yyyyMMdd_HHmmss')}.xls`, 'application/vnd.ms-excel');
      toast.success("Excel export completed successfully!");
    } catch (error) {
      toast.error("Failed to export Excel file. Please try again.");
      console.error('Excel export error:', error);
    }
  };

  const handlePrint = () => {
    if (isLoading) {
      toast.error("Data is still loading. Please wait...");
      return;
    }

    try {
      const data = getExportData();
      
      const printContent = `
        <html>
          <head>
            <title>Anomalies Report - ${data.metadata.dateRange}</title>
            <style>
              @page {
                margin: 20mm;
                size: A4;
              }
              
              body { 
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                margin: 0;
                padding: 0;
                line-height: 1.5;
                color: #374151;
                background: white;
              }
              
              /* First Page Styles */
              .cover-page {
                min-height: 90vh;
                display: flex;
                flex-direction: column;
                page-break-after: always;
                padding: 20px;
              }
              
              .header {
                border-radius: 10px;
                background: #2563eb;
                color: white;
                padding: 20px;
                text-align: center;
                margin-bottom: 20px;
              }
              
              .header h1 {
                font-size: 28px;
                font-weight: 600;
                margin: 0 0 6px 0;
              }
              
              .header .subtitle {
                font-size: 14px;
                margin: 0;
                font-weight: 400;
                opacity: 0.9;
              }
              
              .report-info {
                border-radius: 10px;
                border: 1px solid #e5e7eb;
                padding: 15px;
                margin-bottom: 15px;
              }
              
              .info-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 12px;
              }
              
              .info-item {
                padding: 10px;
                border: 1px solid #e5e7eb;
              }
              
              .info-label {
                font-size: 11px;
                color: #6b7280;
                font-weight: 500;
                margin-bottom: 4px;
                text-transform: uppercase;
              }
              
              .info-value {
                font-size: 16px;
                font-weight: 600;
                color: #111827;
              }
              
              .kpi-section {
                border-radius: 10px;
                border: 1px solid #e5e7eb;
                padding: 15px;
                flex-grow: 1;
              }
              
              .kpi-title {
                font-size: 18px;
                font-weight: 600;
                color: #111827;
                margin-bottom: 15px;
                text-align: center;
                border-bottom: 1px solid #e5e7eb;
                padding-bottom: 8px;
              }
              
              .kpi-list {
                display: flex;
                flex-direction: column;
                gap: 8px;
                margin-bottom: 15px;
              }
              
              .kpi-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 8px 0;
                border-bottom: 1px solid #f3f4f6;
              }
              
              .kpi-item:last-child {
                border-bottom: none;
              }
              
              .kpi-label {
                font-size: 13px;
                color: #6b7280;
                font-weight: 500;
              }
              
              .kpi-value {
                font-size: 16px;
                font-weight: 600;
                color: #2563eb;
              }
              
              .summary-stats {
                display: flex;
                justify-content: space-between;
                gap: 12px;
                margin-top: 15px;
                padding-top: 15px;
                border-top: 1px solid #e5e7eb;
              }
              
              .stat-item {
                text-align: center;
                flex: 1;
              }
              
              .stat-number {
                font-size: 20px;
                font-weight: 600;
                color: #2563eb;
                display: block;
                margin-bottom: 2px;
              }
              
              .stat-label {
                font-size: 11px;
                color: #6b7280;
                font-weight: 500;
              }
              
              .footer-info {
                text-align: center;
                color: #6b7280;
                font-size: 10px;
                margin-top: 20px;
                padding-top: 10px;
                border-top: 1px solid #e5e7eb;
              }
              
              /* Second Page Styles */
              .details-page {
                page-break-before: always;
                padding: 10px;
              }
              
              table {
                width: 100%;
                border-collapse: collapse;
                border: 1px solid #e5e7eb;
                background: white;
                table-layout: fixed;
              }
              
              th {
                background: #2563eb;
                color: white;
                padding: 6px 4px;
                text-align: left;
                font-size: 9px;
                font-weight: 600;
                text-transform: uppercase;
                border-right: 1px solid #1d4ed8;
              }
              
              th:last-child {
                border-right: none;
              }
              
              td {
                padding: 4px;
                text-align: left;
                font-size: 8px;
                border-bottom: 1px solid #f3f4f6;
                border-right: 1px solid #f3f4f6;
                vertical-align: top;
                overflow: hidden;
              }
              
              td:last-child {
                border-right: none;
              }
              
              tr:nth-child(even) {
                background-color: #f9fafb;
              }
              
              .status-badge {
                padding: 1px 3px;
                font-size: 7px;
                font-weight: 600;
                text-transform: uppercase;
                border: 1px solid;
                display: inline-block;
                white-space: nowrap;
              }
              
              .status-new { background: #fef3c7; color: #92400e; border-color: #fbbf24; }
              .status-progress { background: #dbeafe; color: #1e40af; border-color: #60a5fa; }
              .status-closed { background: #d1fae5; color: #065f46; border-color: #34d399; }
              
              @media print {
                .cover-page { 
                  page-break-after: always; 
                }
                .details-page { 
                  page-break-before: always; 
                }
                body { -webkit-print-color-adjust: exact; }
              }
            </style>
          </head>
          <body>
            <!-- First Page: Cover & KPIs -->
            <div class="cover-page">
              <div class="header">
                <h1>Anomalies Dashboard Report</h1>
                <p class="subtitle">
                  This report contains ${data.metadata.totalRecords} anomaly records from the selected time period.
                </p>
              </div>
              
              <div class="report-info">
                <div class="info-grid">
                  <div class="info-item">
                    <div class="info-label">Report Period</div>
                    <div class="info-value">${data.metadata.dateRange}</div>
                  </div>
                  <div class="info-item">
                    <div class="info-label">Generated On</div>
                    <div class="info-value">${format(new Date(data.metadata.exportDate), 'MMM dd, yyyy')}</div>
                  </div>
                  <div class="info-item">
                    <div class="info-label">Total Records</div>
                    <div class="info-value">${data.metadata.totalRecords.toLocaleString()}</div>
                  </div>
                  <div class="info-item">
                    <div class="info-label">Report Type</div>
                    <div class="info-value">Detailed Analysis</div>
                  </div>
                </div>
              </div>
              
              <div class="kpi-section">
                <h2 class="kpi-title">Key Performance Indicators</h2>
                <div class="kpi-list">
                  <div class="kpi-item">
                    <span class="kpi-label">Closing Rate</span>
                    <span class="kpi-value">${data.kpis.closingRate}%</span>
                  </div>
                  <div class="kpi-item">
                    <span class="kpi-label">Processing Rate</span>
                    <span class="kpi-value">${data.kpis.processingRate}%</span>
                  </div>
                  <div class="kpi-item">
                    <span class="kpi-label">Average Processing Time</span>
                    <span class="kpi-value">${data.kpis.averageProcessingTime}</span>
                  </div>
                  <div class="kpi-item">
                    <span class="kpi-label">Action Plan Completion Rate</span>
                    <span class="kpi-value">${data.kpis.actionPlanCompletionRate}%</span>
                  </div>
                  <div class="kpi-item">
                    <span class="kpi-label">In Progress Anomalies</span>
                    <span class="kpi-value">${data.kpis.inProgressAnomalies.toLocaleString()}</span>
                  </div>
                </div>
                
                <div class="summary-stats">
                  <div class="stat-item">
                    <span class="stat-number">${data.kpis.totalAnomalies.toLocaleString()}</span>
                    <div class="stat-label">Total Anomalies</div>
                  </div>
                  <div class="stat-item">
                    <span class="stat-number">${data.kpis.closedAnomalies.toLocaleString()}</span>
                    <div class="stat-label">Resolved Issues</div>
                  </div>
                  <div class="stat-item">
                    <span class="stat-number">${data.kpis.actionPlanCompleted.toLocaleString()}/${data.kpis.actionPlanTotal.toLocaleString()}</span>
                    <div class="stat-label">Action Plans</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Second Page: Anomalies Details -->
            <div class="details-page">
              <table>
                <thead>
                  <tr>
                    <th style="width: 8%;">ID</th>
                    <th style="width: 12%;">Equipment</th>
                    <th style="width: 10%;">System</th>
                    <th style="width: 35%;">Description</th>
                    <th style="width: 10%;">Criticality</th>
                    <th style="width: 10%;">Status</th>
                    <th style="width: 10%;">Date</th>
                    <th style="width: 5%;">Origin</th>
                  </tr>
                </thead>
                <tbody>
                  ${data.anomalies.map(anomaly => `
                    <tr>
                      <td><strong>${anomaly.id.toString().slice(-6).toUpperCase()}</strong></td>
                      <td>${anomaly.equipmentId}</td>
                      <td>${anomaly.system}</td>
                      <td style="word-wrap: break-word; line-height: 1.3;">${anomaly.description}</td>
                      <td><span class="status-badge">${anomaly.criticality}</span></td>
                      <td><span class="status-badge status-${anomaly.status.toLowerCase().replace('_', '-')}">${anomaly.status}</span></td>
                      <td style="font-size: 8px;">${anomaly.dateDetected}</td>
                      <td style="text-align: center;">${anomaly.origin}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </body>
        </html>
      `;

      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
      }
      
      toast.success("Print dialog opened successfully!");
    } catch (error) {
      toast.error("Failed to open print dialog. Please try again.");
      console.error('Print error:', error);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline"
          className="bg-background/50 backdrop-blur-sm border-border/50 hover:bg-accent/50 transition-all duration-200"
          disabled={isLoading}
        >
          <ArrowDownToLine className="h-4 w-4 mr-2 opacity-50" />
          {isLoading ? "Loading..." : "Export"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-48 p-1 bg-background/95 backdrop-blur-sm border-border/50"
      >
        {[
          { label: "Excel", onClick: handleExportXLSX, icon: FaFileExcel },
          { label: "JSON", onClick: handleExportJSON, icon: FaFileCode },
          { label: "CSV", onClick: handleExportCSV, icon: FaFileCsv },
          { label: "Print", onClick: handlePrint, icon: FaPrint },
        ].map((item, index) => (
          <DropdownMenuItem
            key={index}
            onClick={item.onClick}
            className="cursor-pointer px-3 py-2 hover:bg-accent/50 rounded-sm transition-colors duration-150"
            disabled={isLoading}
          >
            <item.icon className="mr-2 h-4 w-4 opacity-50" />
            <span className="text-sm">{item.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}; 