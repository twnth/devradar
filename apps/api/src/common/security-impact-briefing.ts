import { securityImpactBriefingSchema } from "@devradar/types";
import type { SecurityImpactBriefing } from "@devradar/types";
import type { SecurityIncident as PrismaIncident } from "@prisma/client";

const OPENAI_RESPONSES_URL = "https://api.openai.com/v1/responses";
const SECURITY_IMPACT_MODEL = "gpt-4o-mini";

type OpenAIResponse = {
  output?: Array<{
    type?: string;
    content?: Array<{
      type?: string;
      text?: string;
      refusal?: string;
    }>;
  }>;
};

function extractOutputText(payload: OpenAIResponse) {
  const texts: string[] = [];

  for (const item of payload.output ?? []) {
    if (item.type !== "message") {
      continue;
    }

    for (const content of item.content ?? []) {
      if (content.type === "output_text" && typeof content.text === "string") {
        texts.push(content.text);
      }
    }
  }

  return texts.join("").trim();
}

function buildSecurityInput(incident: PrismaIncident) {
  const rawPayload = incident.rawPayload as Record<string, unknown>;

  return {
    title: incident.title,
    packageName: incident.packageName,
    ecosystem: incident.ecosystem,
    severity: incident.severity,
    summaryKo: incident.summaryKo,
    affectedVersionRanges: incident.affectedVersionRanges,
    fixedVersions: incident.fixedVersions,
    aliases: incident.aliases,
    references: incident.references.slice(0, 5),
    exploitStatus: incident.exploitStatus,
    publishedAt: incident.publishedAt.toISOString(),
    modifiedAt: incident.modifiedAt.toISOString(),
    rawPreview: JSON.stringify(rawPayload).slice(0, 3500)
  };
}

export async function generateSecurityImpactBriefing(
  incident: PrismaIncident
): Promise<SecurityImpactBriefing | null> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return null;
  }

  const response = await fetch(OPENAI_RESPONSES_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: SECURITY_IMPACT_MODEL,
      input: [
        {
          role: "system",
          content: [
            {
              type: "input_text",
              text:
                "You write concise Korean security impact briefings for developers. Explain what may happen if the issue is not addressed, using only the provided advisory data. Do not invent exploit chains, internal architecture details, or guaranteed outcomes. Use conditional language when the exact impact is uncertain."
            }
          ]
        },
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: JSON.stringify(buildSecurityInput(incident))
            }
          ]
        }
      ],
      text: {
        format: {
          type: "json_schema",
          name: "security_impact_briefing",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            properties: {
              title: { type: "string" },
              intro: { type: "string" },
              sideEffects: {
                type: "array",
                items: { type: "string" },
                minItems: 2,
                maxItems: 4
              },
              operationalRisk: { type: "string" }
            },
            required: ["title", "intro", "sideEffects", "operationalRisk"]
          }
        }
      }
    })
  });

  if (!response.ok) {
    throw new Error(`OpenAI security impact request failed: ${response.status}`);
  }

  const payload = (await response.json()) as OpenAIResponse;
  const text = extractOutputText(payload);

  if (!text) {
    return null;
  }

  return securityImpactBriefingSchema.parse(JSON.parse(text));
}
