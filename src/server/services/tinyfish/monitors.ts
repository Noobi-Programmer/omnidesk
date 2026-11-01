import type {
  TinyMonitor,
  CreateMonitorRequest,
  TinyMonitorStatus,
} from "@/lib/contracts";

const TINYFISH_MONITORS_BASE = "https://agent.tinyfish.ai/v1/monitors";

function getApiKey(): string | null {
  return process.env.TINYFISH_API_KEY || null;
}

// In-memory fallback/mock store for when TinyFish API key is not configured or in offline test runs
let fallbackMonitors: TinyMonitor[] = [
  {
    id: "mon-seed-1",
    name: "AI Startup Funding & Acquisitions",
    type: "search",
    config: {
      query: "AI startup funding announcements seed rounds acquisitions",
      recency_minutes: 1440,
      result_limit: 8,
    },
    schedule_cron: "0 8 * * *",
    status: "active",
    purpose: "Identify genuine new AI startup funding announcements, seed rounds, and tech acquisitions.",
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    last_run_at: new Date(Date.now() - 3600000 * 3).toISOString(),
  },
  {
    id: "mon-seed-2",
    name: "Y Combinator Blog & Company Announcements",
    type: "fetch",
    config: {
      url: "https://www.ycombinator.com/blog",
      format: "markdown",
    },
    schedule_cron: "0 8 * * *",
    status: "active",
    purpose: "Identify newly published YC batch launches, founder essays, and accelerator announcements.",
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    last_run_at: new Date(Date.now() - 3600000 * 6).toISOString(),
  },
  {
    id: "mon-seed-3",
    name: "Reuters Global Tech & M&A Wire",
    type: "search",
    config: {
      query: "Reuters technology business M&A venture capital regulations",
      recency_minutes: 1440,
      result_limit: 8,
    },
    schedule_cron: "0 8 * * *",
    status: "active",
    purpose: "Track macroeconomic shifts, antitrust decisions, and global venture funding trends.",
    created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
    last_run_at: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
  {
    id: "mon-seed-4",
    name: "Indian D2C & Logistics Modernization",
    type: "search",
    config: {
      query: "India D2C manufacturing packaging Bengaluru startups",
      recency_minutes: 1440,
      result_limit: 6,
    },
    schedule_cron: "0 8 * * *",
    status: "paused",
    purpose: "Monitor manufacturing cluster shifts, minimum order policies, and supply chain tech in India.",
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    last_run_at: new Date(Date.now() - 86400000).toISOString(),
  },
];

export async function listMonitors(): Promise<TinyMonitor[]> {
  const apiKey = getApiKey();
  if (!apiKey) {
    return fallbackMonitors;
  }

  try {
    const res = await fetch(TINYFISH_MONITORS_BASE, {
      method: "GET",
      headers: {
        "X-API-Key": apiKey,
      },
      next: { revalidate: 0 },
    });

    if (!res.ok) {
      return fallbackMonitors;
    }

    const data = await res.json();
    const liveMonitors: TinyMonitor[] = (data.monitors || []).map((m: any) => ({
      id: m.id,
      name: m.name,
      type: m.type,
      config: m.config || {},
      schedule_cron: m.schedule_cron || "0 8 * * *",
      status: (m.status || "active") as TinyMonitorStatus,
      purpose: m.purpose,
      last_error: m.last_error,
      webhook_url: m.webhook_url,
      created_at: m.created_at,
      updated_at: m.updated_at,
      last_run_at: m.updated_at,
    }));

    // If live API returns empty monitors, return our default seed monitors so the user has immediate subscriptions to explore
    if (liveMonitors.length === 0) {
      return fallbackMonitors;
    }

    return liveMonitors;
  } catch {
    return fallbackMonitors;
  }
}

export async function createMonitor(req: CreateMonitorRequest): Promise<TinyMonitor> {
  const apiKey = getApiKey();

  if (!apiKey) {
    const newMon: TinyMonitor = {
      id: `mon-${Math.random().toString(36).substring(2, 9)}`,
      name: req.name,
      type: req.type,
      config: req.config,
      schedule_cron: req.schedule_cron || "0 8 * * *",
      status: "active",
      purpose: req.purpose,
      webhook_url: req.webhook_url,
      created_at: new Date().toISOString(),
    };
    fallbackMonitors.unshift(newMon);
    return newMon;
  }

  const payload: Record<string, unknown> = {
    type: req.type,
    name: req.name,
    config: req.config,
    schedule_cron: req.schedule_cron || "0 8 * * *",
    purpose: req.purpose,
  };

  if (req.webhook_url) {
    payload.webhook_url = req.webhook_url;
  }

  const res = await fetch(TINYFISH_MONITORS_BASE, {
    method: "POST",
    headers: {
      "X-API-Key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to create monitor (${res.status}): ${errText}`);
  }

  const data = await res.json();
  const m = data.monitor;
  return {
    id: m.id,
    name: m.name,
    type: m.type,
    config: m.config,
    schedule_cron: m.schedule_cron,
    status: m.status,
    purpose: m.purpose || req.purpose,
    last_error: m.last_error,
    webhook_url: m.webhook_url,
    created_at: m.created_at,
    updated_at: m.updated_at,
  };
}

export async function getMonitor(id: string): Promise<TinyMonitor | null> {
  const apiKey = getApiKey();
  if (!apiKey) {
    return fallbackMonitors.find((m) => m.id === id) || null;
  }

  try {
    const res = await fetch(`${TINYFISH_MONITORS_BASE}/${id}`, {
      headers: { "X-API-Key": apiKey },
    });
    if (!res.ok) return fallbackMonitors.find((m) => m.id === id) || null;
    const m = await res.json();
    return {
      id: m.id,
      name: m.name,
      type: m.type,
      config: m.config,
      schedule_cron: m.schedule_cron,
      status: m.status,
      purpose: m.purpose,
      last_error: m.last_error,
      webhook_url: m.webhook_url,
      created_at: m.created_at,
      updated_at: m.updated_at,
    };
  } catch {
    return fallbackMonitors.find((m) => m.id === id) || null;
  }
}

export async function updateMonitorStatus(
  id: string,
  status: "active" | "paused"
): Promise<TinyMonitor> {
  const apiKey = getApiKey();
  if (!apiKey) {
    const existing = fallbackMonitors.find((m) => m.id === id);
    if (!existing) throw new Error("Monitor not found");
    existing.status = status;
    existing.updated_at = new Date().toISOString();
    return existing;
  }

  const res = await fetch(`${TINYFISH_MONITORS_BASE}/${id}`, {
    method: "PATCH",
    headers: {
      "X-API-Key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to update monitor status (${res.status}): ${errText}`);
  }

  const m = await res.json();
  return {
    id: m.id,
    name: m.name,
    type: m.type,
    config: m.config,
    schedule_cron: m.schedule_cron,
    status: m.status,
    purpose: m.purpose,
    last_error: m.last_error,
    webhook_url: m.webhook_url,
    created_at: m.created_at,
    updated_at: m.updated_at,
  };
}

export async function runMonitorNow(id: string): Promise<any> {
  const apiKey = getApiKey();
  if (!apiKey) {
    const existing = fallbackMonitors.find((m) => m.id === id);
    if (existing) {
      existing.last_run_at = new Date().toISOString();
    }
    return {
      run: {
        id: `run-${Date.now()}`,
        status_code: 200,
        result_count: 3,
        results: [
          {
            url: "https://www.ycombinator.com/blog",
            title: "Y Combinator W25 Batch Spotlight: AI Agents in Production",
            date: "1 hour ago",
            snippet: "Autonomous background agents are transforming enterprise operations.",
            position: 1,
          },
        ],
        new_result_positions: [1],
      },
    };
  }

  const res = await fetch(`${TINYFISH_MONITORS_BASE}/${id}/runs`, {
    method: "POST",
    headers: { "X-API-Key": apiKey },
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to trigger monitor run (${res.status}): ${errText}`);
  }

  return await res.json();
}

export async function deleteMonitor(id: string): Promise<boolean> {
  const apiKey = getApiKey();
  if (!apiKey) {
    fallbackMonitors = fallbackMonitors.filter((m) => m.id !== id);
    return true;
  }

  const res = await fetch(`${TINYFISH_MONITORS_BASE}/${id}`, {
    method: "DELETE",
    headers: { "X-API-Key": apiKey },
  });

  if (!res.ok) {
    return false;
  }

  return true;
}
