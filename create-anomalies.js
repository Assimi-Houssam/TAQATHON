#!/usr/bin/env node

const API_BASE_URL = 'http://localhost:7532';

// Simplified fake data - essential fields only
const equipmentIds = [
  'EQ-001-2024', 'EQ-002-2024', 'EQ-003-2024', 'EQ-004-2024', 'EQ-005-2024',
  'EQ-006-2024', 'EQ-007-2024', 'EQ-008-2024', 'EQ-009-2024', 'EQ-010-2024'
];

// Simplified - only essential data
const descriptions = [
  'Equipment overheating detected', 'Abnormal vibration in pump',
  'Pressure drop in pipeline', 'Temperature sensor malfunction',
  'Unusual noise from motor', 'Fluid leak detected',
  'Control valve stuck', 'Bearing wear detected',
  'Electrical fault in panel', 'Filter clogging observed'
];

// Updated enums based on DTO
const origins = ['ORACLE', 'MAXIMO', 'EMC', 'APM'];
const statuses = ['NEW', 'IN_PROGRESS', 'CLOSED'];

// Generate random date within last 30 days
function getRandomDate(daysBack = 30) {
  const now = new Date();
  const pastDate = new Date(now.getTime() - (Math.random() * daysBack * 24 * 60 * 60 * 1000));
  return pastDate.toISOString();
}

// Get random item from array
function getRandomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

// Create a single anomaly object - only essential fields
function createAnomalyData(index) {
  const detectionDate = getRandomDate();

  return {
    num_equipments: equipmentIds[index],
    descreption_anomalie: descriptions[index],
    origine: getRandomItem(origins),
    date_detection: detectionDate,
    status: getRandomItem(statuses)
  };
}

// Post anomaly to API
async function postAnomaly(anomalyData, index) {
  try {
    const response = await fetch(`${API_BASE_URL}/anomaly/createAnomaly`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(anomalyData)
    });

    if (response.ok) {
      const result = await response.json();
      console.log(`✅ Anomaly ${index + 1} created successfully:`, result.id || 'Success');
    } else {
      const errorText = await response.text();
      console.error(`❌ Failed to create anomaly ${index + 1}:`, response.status, errorText);
    }
  } catch (error) {
    console.error(`❌ Error creating anomaly ${index + 1}:`, error.message);
  }
}

// Main function
async function createAnomalies() {
  console.log('🚀 Starting to create 10 anomalies...\n');

  for (let i = 0; i < 10; i++) {
    const anomalyData = createAnomalyData(i);
    console.log(`📝 Creating anomaly ${i + 1}/${10} - Equipment: ${anomalyData.num_equipments}`);
    await postAnomaly(anomalyData, i);
    
    // Add a small delay between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\n🎉 Finished creating anomalies!');
}

// Check if API is accessible
async function checkAPIHealth() {
  try {
    console.log('🔍 Checking API health...');
    const response = await fetch(`${API_BASE_URL}/anomaly`, {
      method: 'GET'
    });
    
    if (response.ok || response.status === 404) {
      console.log('✅ API is accessible\n');
      return true;
    } else {
      console.error(`❌ API returned status: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.error('❌ Cannot connect to API:', error.message);
    console.log('Make sure the backend server is running on http://localhost:7532');
    return false;
  }
}

// Run the script
async function main() {
  console.log('🎯 Anomaly Creation Script');
  console.log('==========================\n');
  
  const isAPIHealthy = await checkAPIHealth();
  
  if (isAPIHealthy) {
    await createAnomalies();
  } else {
    process.exit(1);
  }
}

// Execute if run directly
if (require.main === module) {
  main().catch(console.error);
} 