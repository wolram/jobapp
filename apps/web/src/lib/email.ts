import { Resend } from "resend";
import type { AlertDigestDTO } from "@jobapp/contracts";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendDigestEmail(
  to: string,
  digest: AlertDigestDTO
): Promise<{ success: boolean; error?: string }> {
  try {
    const opportunityRows = digest.opportunities
      .map(
        (opp) =>
          `<tr>
            <td style="padding:8px;border-bottom:1px solid #eee">
              <a href="${opp.url}" style="color:#d97706;font-weight:600">${opp.title}</a>
              <br/><span style="color:#666">${opp.company}</span>
            </td>
            <td style="padding:8px;border-bottom:1px solid #eee;text-align:center">
              <strong style="color:${opp.total_score >= 70 ? "#16a34a" : opp.total_score >= 40 ? "#d97706" : "#dc2626"}">${opp.total_score}%</strong>
            </td>
            <td style="padding:8px;border-bottom:1px solid #eee;font-size:13px;color:#666">
              ${opp.reasons.slice(0, 2).map((r) => r.detail).join("; ")}
            </td>
          </tr>`
      )
      .join("");

    const html = `
      <div style="max-width:600px;margin:0 auto;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
        <h2 style="color:#78350f">GoldMedal Jobs - Daily Digest</h2>
        <p>Here are your top new matches for <strong>${digest.profile_title}</strong>:</p>
        <table style="width:100%;border-collapse:collapse">
          <thead>
            <tr style="background:#fef3c7">
              <th style="padding:8px;text-align:left">Position</th>
              <th style="padding:8px;text-align:center">Score</th>
              <th style="padding:8px;text-align:left">Why</th>
            </tr>
          </thead>
          <tbody>
            ${opportunityRows}
          </tbody>
        </table>
        <p style="margin-top:16px;font-size:13px;color:#999">
          Generated at ${new Date(digest.generated_at).toLocaleString()}.
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/jobs" style="color:#d97706">View all in dashboard</a>
        </p>
      </div>
    `;

    const { error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL ?? "jobs@goldmedaljobs.com",
      to,
      subject: `GoldMedal Jobs: ${digest.opportunities.length} new matches for "${digest.profile_title}"`,
      html,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}
