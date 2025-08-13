import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import './DataValidation.css';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const DataValidation = () => {
  const [validationData, setValidationData] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [error, setError] = useState(null);
  const [displayInfo, setDisplayInfo] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const encodedData = params.get('data');
    
    console.log('URL Parameter:', encodedData); // Debug log
    
    if (!encodedData) {
      setError('No validation data provided');
      return;
    }

    try {
      const decodedData = decodeURIComponent(encodedData);
      console.log('Decoded Data:', decodedData); // Debug log
      
      const data = JSON.parse(decodedData);
      console.log('Parsed Data:', data); // Debug log
      
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid validation data format');
      }

      // Check if we have the expected data structure
      if (!data.data || !data.data.report) {
        console.error('Missing data or report in validation data:', data);
        throw new Error('Invalid validation data structure');
      }

      // Store the validation data and display info separately
      setValidationData(data.data);
      setDisplayInfo({
        tableName: data.tableName || 'Unknown Table',
        validationColumn: data.validationColumn || 'Unknown Column',
        validationColumnDisplay: data.validationColumnDisplay || data.validationColumn || 'Unknown Column'
      });
      
      // Prepare chart data if validation data exists
      if (data.data.report?.validation_data) {
        console.log('Validation Data:', data.data.report.validation_data); // Debug log
        const { real, synthetic } = data.data.report.validation_data;
        if (real?.bin_edges && real?.counts && synthetic?.bin_edges && synthetic?.counts) {
          setChartData({
            labels: real.bin_edges.map((edge, i) => 
              i < real.bin_edges.length - 1 ? `${edge.toFixed(0)}-${real.bin_edges[i + 1].toFixed(0)}` : edge.toFixed(0)
            ),
            datasets: [
              {
                label: 'Real Data',
                data: real.counts,
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgba(75, 192, 192, 0.5)',
                tension: 0.1
              },
              {
                label: 'Synthetic Data',
                data: synthetic.counts,
                borderColor: 'rgb(255, 99, 132)',
                backgroundColor: 'rgba(255, 99, 132, 0.5)',
                tension: 0.1
              }
            ]
          });
        } else {
          console.error('Missing histogram data:', { real, synthetic });
        }
      } else {
        console.error('Missing validation_data in report:', data.data.report);
      }
    } catch (error) {
      console.error('Error parsing validation data:', error);
      setError(error.message || 'Failed to parse validation data');
    }
  }, []);

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Distribution Comparison: Real vs Synthetic Data'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Count'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Value Range'
        }
      }
    }
  };

  if (error) {
    return (
      <div className="data-validation-container">
        <div className="error-message">
          <h2>Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!validationData || !displayInfo) {
    return <div className="loading">Loading validation data...</div>;
  }

  if (!validationData.report) {
    return (
      <div className="data-validation-container">
        <div className="error-message">
          <h2>No Validation Report</h2>
          <p>The validation data does not contain a report.</p>
        </div>
      </div>
    );
  }

  const { report } = validationData;

  return (
    <div className="data-validation-container">
      <div className="validation-header">
        <h1>Data Validation Results</h1>
        <div className="validation-info">
          <p><strong>Table:</strong> {displayInfo.tableName}</p>
          <p><strong>Validation Column:</strong> {displayInfo.validationColumnDisplay}</p>
        </div>
      </div>

      <div className="validation-content">
        {/* Diagnostic Report */}
        {report.diagnostic_report && report.diagnostic_report.length > 0 && (
          <div className="report-section">
            <h2>Diagnostic Report</h2>
            <div className="metrics-grid">
              {report.diagnostic_report.map((item, index) => (
                <div key={index} className="metric-card">
                  <h3>{item.Property || 'Unknown Property'}</h3>
                  <div className="score">
                    <div className="score-value" style={{ '--score': (item.Score || 0) * 100 }}>
                      {((item.Score || 0) * 100).toFixed(1)}%
                    </div>
                    <div className="score-bar">
                      <div 
                        className="score-fill"
                        style={{ width: `${(item.Score || 0) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quality Report */}
        {report.quality_report && report.quality_report.length > 0 && (
          <div className="report-section">
            <h2>Quality Report</h2>
            <div className="metrics-grid">
              {report.quality_report.map((item, index) => (
                <div key={index} className="metric-card">
                  <h3>{item.Property || 'Unknown Property'}</h3>
                  <div className="score">
                    <div className="score-value" style={{ '--score': (item.Score || 0) * 100 }}>
                      {((item.Score || 0) * 100).toFixed(1)}%
                    </div>
                    <div className="score-bar">
                      <div 
                        className="score-fill"
                        style={{ width: `${(item.Score || 0) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Distribution Chart */}
        {chartData && (
          <div className="report-section">
            <h2>Data Distribution</h2>
            <div className="chart-container">
              <Line data={chartData} options={chartOptions} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DataValidation; 