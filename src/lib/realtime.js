// Real-time Event Broadcaster (SSE / Server-Sent Events)
// Enables instant live dashboard updates when shipment status changes

const clients = new Set();

export function addClient(send) {
  clients.add(send);
  return () => {
    clients.delete(send);
  };
}

export function broadcastUpdate(event, data) {
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const client of clients) {
    try {
      client(payload);
    } catch {
      clients.delete(client);
    }
  }
}
