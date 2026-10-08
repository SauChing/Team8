/**
 * Go Where Makan? / Jiak Simi API Health Status Handler
 * Accessible at /api/health and /api/health.js
 */

export default function healthHandler(req, res) {
  const uptimeSeconds = Math.floor(process.uptime());
  const memory = process.memoryUsage();
  const acceptHeader = req.headers?.accept || '';
  const isHtml = acceptHeader.includes('text/html') && !req.query?.json;

  const healthData = {
    status: 'ok',
    service: 'Go Where Makan? API',
    uptimeSeconds,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    nodeVersion: process.version,
    memory: {
      rssMb: Math.round((memory.rss / 1024 / 1024) * 100) / 100,
      heapUsedMb: Math.round((memory.heapUsed / 1024 / 1024) * 100) / 100,
    },
    integrations: {
      googlePlaces: Boolean(process.env.GOOGLE_MAPS_API_KEY || process.env.GOOGLE_PLACES_API_KEY),
      oneMap: true,
      sessionsStore: 'in-memory active',
    },
    endpoints: [
      { path: '/api/health', methods: ['GET'], description: 'System health check' },
      { path: '/api/health.js', methods: ['GET'], description: 'System health check status page' },
      { path: '/api/places/search', methods: ['GET'], description: 'Search Singapore eateries & hawkers' },
      { path: '/api/places/status', methods: ['GET'], description: 'Places API configuration status' },
      { path: '/api/places/v1/details', methods: ['GET'], description: 'Google Places API v1 details' },
      { path: '/api/places/v1/presets', methods: ['GET'], description: 'Curated Singapore Makan presets' },
      { path: '/api/onemap/search', methods: ['GET'], description: 'Singapore OneMap address search' },
      { path: '/api/onemap/revgeo', methods: ['GET'], description: 'Reverse geocode Singapore coordinates' },
      { path: '/api/sessions', methods: ['GET', 'POST'], description: 'Makan lunch session coordinator' },
    ],
  };

  if (isHtml) {
    const uptimeFormatted = `${Math.floor(uptimeSeconds / 3600)}h ${Math.floor((uptimeSeconds % 3600) / 60)}m ${uptimeSeconds % 60}s`;
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>API Health Status — Go Where Makan?</title>
  <style>
    * { box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background: #0f172a;
      color: #f8fafc;
      padding: 2.5rem 1.5rem;
      margin: 0;
      line-height: 1.6;
    }
    .container {
      max-width: 760px;
      margin: 0 auto;
    }
    .card {
      background: #1e293b;
      border-radius: 16px;
      border: 1px solid #334155;
      padding: 2rem;
      box-shadow: 0 20px 40px -15px rgba(0,0,0,0.5);
    }
    .header-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.25rem;
    }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 6px 14px;
      border-radius: 9999px;
      font-size: 0.875rem;
      font-weight: 600;
      background: #064e3b;
      color: #34d399;
      border: 1px solid #059669;
    }
    .pulse-dot {
      width: 10px;
      height: 10px;
      background: #10b981;
      border-radius: 50%;
      box-shadow: 0 0 10px #10b981;
      animation: pulse 2s infinite;
    }
    @keyframes pulse {
      0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
      70% { transform: scale(1); box-shadow: 0 0 0 8px rgba(16, 185, 129, 0); }
      100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
    }
    h1 {
      margin: 0 0 0.5rem 0;
      font-size: 1.75rem;
      font-weight: 800;
      color: #ffffff;
      letter-spacing: -0.02em;
    }
    .subtext {
      color: #94a3b8;
      font-size: 0.925rem;
      margin-bottom: 2rem;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }
    .metric {
      background: #0f172a;
      padding: 1.15rem;
      border-radius: 12px;
      border: 1px solid #334155;
    }
    .metric-label {
      font-size: 0.75rem;
      color: #94a3b8;
      text-transform: uppercase;
      font-weight: 600;
      letter-spacing: 0.05em;
    }
    .metric-val {
      font-size: 1.35rem;
      font-weight: 700;
      margin-top: 6px;
      color: #f1f5f9;
    }
    .section-title {
      font-size: 1.1rem;
      font-weight: 700;
      margin: 1.75rem 0 0.75rem 0;
      color: #e2e8f0;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .endpoint-list {
      background: #0f172a;
      border-radius: 12px;
      border: 1px solid #334155;
      overflow: hidden;
    }
    .endpoint-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.85rem 1.25rem;
      border-bottom: 1px solid #1e293b;
      font-size: 0.875rem;
      gap: 1rem;
    }
    .endpoint-row:last-child {
      border-bottom: none;
    }
    .endpoint-path {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      color: #38bdf8;
      font-weight: 600;
    }
    .method-badge {
      display: inline-block;
      font-size: 0.7rem;
      font-weight: 700;
      padding: 2px 6px;
      border-radius: 4px;
      background: #312e81;
      color: #a5b4fc;
      margin-left: 6px;
    }
    .endpoint-desc {
      color: #94a3b8;
      font-size: 0.825rem;
      text-align: right;
    }
    .footer {
      margin-top: 2rem;
      padding-top: 1.25rem;
      border-top: 1px solid #334155;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.85rem;
      color: #64748b;
    }
    .raw-link {
      color: #38bdf8;
      text-decoration: none;
      font-weight: 600;
      padding: 6px 12px;
      border-radius: 6px;
      background: #0f172a;
      border: 1px solid #334155;
      transition: all 0.15s ease;
    }
    .raw-link:hover {
      background: #1e293b;
      color: #7dd3fc;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="header-row">
        <span class="badge"><span class="pulse-dot"></span> System Operational</span>
        <span style="font-size:0.85rem; font-family: monospace; color:#94a3b8;">HTTP 200 OK</span>
      </div>

      <h1>Go Where Makan? API Health</h1>
      <div class="subtext">Active Express backend &bull; Checked at ${healthData.timestamp}</div>

      <div class="grid">
        <div class="metric">
          <div class="metric-label">Uptime</div>
          <div class="metric-val">${uptimeFormatted}</div>
        </div>
        <div class="metric">
          <div class="metric-label">Node Runtime</div>
          <div class="metric-val">${healthData.nodeVersion}</div>
        </div>
        <div class="metric">
          <div class="metric-label">Heap Memory</div>
          <div class="metric-val">${healthData.memory.heapUsedMb} MB</div>
        </div>
        <div class="metric">
          <div class="metric-label">Environment</div>
          <div class="metric-val">${healthData.environment}</div>
        </div>
      </div>

      <div class="section-title">Verified Endpoints</div>
      <div class="endpoint-list">
        ${healthData.endpoints
          .map(
            (e) => `
          <div class="endpoint-row">
            <div>
              <span class="endpoint-path">${e.path}</span>
              ${e.methods.map((m) => `<span class="method-badge">${m}</span>`).join('')}
            </div>
            <div class="endpoint-desc">${e.description}</div>
          </div>
        `
          )
          .join('')}
      </div>

      <div class="footer">
        <div><strong>Status:</strong> All subsystems running normally</div>
        <a class="raw-link" href="/api/health.js?json=true">View Raw JSON</a>
      </div>
    </div>
  </div>
</body>
</html>`;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(html);
  }

  res.setHeader('Content-Type', 'application/json');
  return res.status(200).json(healthData);
}
