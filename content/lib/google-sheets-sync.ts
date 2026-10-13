import { createSign } from "crypto";
import { ipv4HttpsFetch } from "@/lib/supabase";

export interface RestaurantSignupRecord {
  createdAt: string;
  userId: string;
  email: string;
  restaurantName: string;
  location: string;
  restaurantType: string;
  targetAudience: string;
  primaryCustomerAction: string;
  businessDescription: string;
  weeklyGoal: string;
}

const HEADERS = [
  "Created At", "User ID", "Email", "Restaurant Name", "Location",
  "Restaurant Type", "Target Customers", "Desired Customer Action",
  "Business Description", "Weekly Goal", "Sheets Sync Status",
];
const TOKEN_URL = "https://oauth2.googleapis.com/token";
const SHEETS_API = "https://sheets.googleapis.com/v4/spreadsheets";

type GoogleCredentials = { client_email: string; private_key: string };

function credentials(): GoogleCredentials | null {
  let inline = process.env.GOOGLE_SERVICE_ACCOUNT_JSON?.trim();
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL?.trim();
  const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.trim();
  if (inline) {
    if ((inline.startsWith("'") && inline.endsWith("'")) || (inline.startsWith('"') && inline.endsWith('"') && !inline.startsWith('{"'))) {
      inline = inline.slice(1, -1).trim();
    }
    try {
      const parsed = JSON.parse(inline) as GoogleCredentials;
      if (parsed.client_email && parsed.private_key) {
        return {
          client_email: parsed.client_email.trim(),
          private_key: parsed.private_key.replace(/\\n/g, "\n"),
        };
      }
    } catch {
      // fall through to separate email and key
    }
  }
  if (email && privateKey) return { client_email: email, private_key: privateKey.replace(/\\n/g, "\n") };
  return null;
}

function base64url(value: string | Buffer) {
  return Buffer.from(value).toString("base64url");
}

async function googleAccessToken(creds: GoogleCredentials): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const unsigned = `${base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }))}.${base64url(JSON.stringify({
    iss: creds.client_email,
    scope: "https://www.googleapis.com/auth/spreadsheets",
    aud: TOKEN_URL,
    iat: now,
    exp: now + 3600,
  }))}`;
  const signer = createSign("RSA-SHA256");
  signer.update(unsigned);
  const assertion = `${unsigned}.${signer.sign(creds.private_key).toString("base64url")}`;
  const response = await ipv4HttpsFetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion }).toString(),
  });
  if (!response.ok) throw new Error("google_token_exchange_failed");
  const tokenResponse = await response.json();
  if (!tokenResponse.access_token) throw new Error("google_token_missing");
  return tokenResponse.access_token as string;
}

async function sheetsRequest(token: string, url: string, init?: any) {
  const response = await ipv4HttpsFetch(url, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", ...init?.headers },
  });
  if (!response.ok) throw new Error(`google_sheets_http_${response.status}`);
  return response.status === 204 ? null : response.json();
}

export async function syncOnboardingToGoogleSheets(record: RestaurantSignupRecord): Promise<{
  synced: boolean;
  status: "synced" | "already_synced" | "pending_configuration" | "failed";
}> {
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
  const creds = credentials();
  if (!spreadsheetId || !creds) return { synced: false, status: "pending_configuration" };

  const token = await googleAccessToken(creds);
  const spreadsheet = await sheetsRequest(token, `${SHEETS_API}/${encodeURIComponent(spreadsheetId)}?fields=sheets.properties.title`);
  const configuredTitle = process.env.GOOGLE_SHEETS_SHEET_NAME?.trim();
  const sheetTitle = configuredTitle || spreadsheet?.sheets?.[0]?.properties?.title;
  if (configuredTitle && !spreadsheet?.sheets?.some((sheet: any) => sheet.properties?.title === configuredTitle)) {
    throw new Error("google_sheet_tab_missing");
  }
  if (!sheetTitle) throw new Error("google_sheet_tab_missing");
  const quotedTitle = `'${String(sheetTitle).replace(/'/g, "''")}'`;
  const valuesUrl = `${SHEETS_API}/${encodeURIComponent(spreadsheetId)}/values/${encodeURIComponent(`${quotedTitle}!A1:K`)}`;
  const existing = await sheetsRequest(token, valuesUrl);
  const rows: string[][] = existing?.values || [];

  if (!rows.length || HEADERS.some((header, index) => rows[0]?.[index] !== header)) {
    await sheetsRequest(token, `${SHEETS_API}/${encodeURIComponent(spreadsheetId)}/values/${encodeURIComponent(`${quotedTitle}!A1:K1`)}?valueInputOption=RAW`, {
      method: "PUT", body: JSON.stringify({ values: [HEADERS] }),
    });
  }
  const row = [record.createdAt, record.userId, record.email, record.restaurantName, record.location,
    record.restaurantType, record.targetAudience, record.primaryCustomerAction,
    record.businessDescription, record.weeklyGoal, "synced"];
  const existingRowIndex = rows.findIndex((existing, index) =>
    index > 0 && (
      (existing[1] && String(existing[1]).trim() === record.userId.trim()) ||
      (existing[2] && String(existing[2]).trim().toLowerCase() === record.email.trim().toLowerCase())
    )
  );
  if (existingRowIndex > 0) {
    const sheetRowNumber = existingRowIndex + 1;
    const updateRange = `${quotedTitle}!A${sheetRowNumber}:K${sheetRowNumber}`;
    const updateResult = await sheetsRequest(token, `${SHEETS_API}/${encodeURIComponent(spreadsheetId)}/values/${encodeURIComponent(updateRange)}?valueInputOption=RAW`, {
      method: "PUT", body: JSON.stringify({ values: [row] }),
    });
    if (!updateResult || (typeof updateResult.updatedRows === "number" && updateResult.updatedRows < 1)) {
      throw new Error("google_sheets_update_unconfirmed");
    }
    return { synced: true, status: "already_synced" };
  }

  const appendUrl = `${SHEETS_API}/${encodeURIComponent(spreadsheetId)}/values/${encodeURIComponent(`${quotedTitle}!A:K`)}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`;
  const appendResult = await sheetsRequest(token, appendUrl, { method: "POST", body: JSON.stringify({ values: [row] }) });
  if (!appendResult || !appendResult.updates || (typeof appendResult.updates.updatedRows === "number" && appendResult.updates.updatedRows < 1)) {
    throw new Error("google_sheets_append_unconfirmed");
  }
  return { synced: true, status: "synced" };
}
