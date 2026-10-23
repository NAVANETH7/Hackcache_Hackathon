/**
 * n8n Cloud Automation Bridge for OPD Saathi
 * Dispatches real-time hospital events (registration, room reassignments, emergency alerts)
 * to n8n Cloud workflows for automated WhatsApp/SMS notifications and staff dispatch.
 */

let activeWebhookUrl = process.env.N8N_WEBHOOK_URL || '';
let eventHistory = [];

export function setN8nWebhookUrl(url) {
  activeWebhookUrl = url ? url.trim() : '';
  console.log(`[n8n] Active Webhook URL set to: ${activeWebhookUrl || 'None (Local Simulation Mode)'}`);
  return activeWebhookUrl;
}

export function getN8nWebhookUrl() {
  return activeWebhookUrl;
}

export function getN8nEventHistory() {
  return eventHistory.slice(-20); // Keep last 20 events
}

export async function dispatchN8nEvent(eventType, payload) {
  const event = {
    eventId: `N8N-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    eventType,
    timestamp: new Date().toISOString(),
    hospital: "District Government Headquarters Hospital",
    data: payload
  };

  eventHistory.unshift(event);
  if (eventHistory.length > 50) eventHistory.pop();

  if (!activeWebhookUrl) {
    console.log(`[n8n Local Simulation] Event '${eventType}' recorded (Webhook URL not set)`);
    return { success: true, simulated: true, event };
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const response = await fetch(activeWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Hospital-Source': 'OPD-Saathi-Core'
      },
      body: JSON.stringify(event),
      signal: controller.signal
    });

    clearTimeout(timeout);

    if (response.ok) {
      console.log(`[n8n] Successfully dispatched event '${eventType}' to n8n Cloud (HTTP ${response.status})`);
      return { success: true, simulated: false, status: response.status, event };
    } else {
      console.warn(`[n8n] Webhook responded with status HTTP ${response.status}`);
      return { success: false, status: response.status, error: `HTTP ${response.status}` };
    }
  } catch (err) {
    console.warn(`[n8n] Could not reach webhook at ${activeWebhookUrl}:`, err.message);
    return { success: false, error: err.message };
  }
}
