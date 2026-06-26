/**
 * Twilio request signature verification.
 * Validates X-Twilio-Signature headers to ensure requests are from Twilio.
 */
import { createHmac, timingSafeEqual } from "crypto";
import { getConfig } from "../../utils/config";

export function verifyTwilioSignature(url: string, params: Record<string, unknown>, signature: string): boolean {
  const config = getConfig();
  const authToken = config.channels.twilio.auth_token || config.channels.twilio.secret;
  if (!authToken) return false;

  const sortedKeys = Object.keys(params).sort();
  const parts = [url, ...sortedKeys.map((k) => `${k}${params[k]}`)];
  const signatureBase = parts.join("");

  const expected = createHmac("sha256", authToken).update(signatureBase).digest("hex");

  try {
    return timingSafeEqual(Buffer.from(expected, "utf8"), Buffer.from(signature, "utf8"));
  } catch {
    return false;
  }
}
