// Helper functions for HEDERA data storage
import { HederaAgent, HEDERA_CONFIG } from './hederaAgent';

// Initialize HEDERA agent
const getHederaAgent = () => {
  const config = process.env.NODE_ENV === 'production' 
    ? HEDERA_CONFIG.mainnet 
    : HEDERA_CONFIG.testnet;
  return new HederaAgent(config);
};

// Store sensor snapshot to HEDERA
export async function saveSnapshotToHedera(snapshot: {
  timestamp: bigint;
  deviceId: string;
  location: string;
  tds: { value: number; unit: string };
  ph: { value: number; unit: string };
  turbidity: { value: number; unit: string };
}): Promise<string> {
  const hederaAgent = getHederaAgent();
  
  try {
    const sensorData = {
      pH: snapshot.ph.value,
      tds: snapshot.tds.value,
      temperature: 25, // Default temperature
      timestamp: Number(snapshot.timestamp),
      location: snapshot.location
    };
    
    const transactionId = await hederaAgent.storeSensorData(sensorData);
    return transactionId;
  } catch (error) {
    console.error('Failed to save snapshot to HEDERA:', error);
    throw error;
  } finally {
    hederaAgent.close();
  }
}

// Store survey data to HEDERA
export async function addSurveyToHedera(sentiment: 'positive' | 'neutral' | 'negative'): Promise<string> {
  const hederaAgent = getHederaAgent();
  
  try {
    const surveyData = {
      sentiment,
      timestamp: Date.now(),
      deviceId: 'POS-HEDERA-1',
      rating: sentiment === 'positive' ? 5 : sentiment === 'neutral' ? 3 : 1
    };
    
    const transactionId = await hederaAgent.storeSurveyData(surveyData);
    return transactionId;
  } catch (error) {
    console.error('Failed to save survey to HEDERA:', error);
    throw error;
  } finally {
    hederaAgent.close();
  }
}

// Store analytics data to HEDERA
export async function storeAnalyticsData(analyticsData: any): Promise<string> {
  const hederaAgent = getHederaAgent();
  
  try {
    const transactionId = await hederaAgent.storeAnalyticsData(analyticsData);
    return transactionId;
  } catch (error) {
    console.error('Failed to save analytics to HEDERA:', error);
    throw error;
  } finally {
    hederaAgent.close();
  }
}

// Legacy function names for backward compatibility
export const saveSnapshotToCanister = saveSnapshotToHedera;
export const addSurvey = addSurveyToHedera;