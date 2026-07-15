import { t } from "./i18n";

export function sanitizeMessage(text: string): string {
    if (!text) return "";

    // Remove or clean up malicious URLs
    // (No HTML escaping: the native Notification shows plain text and doesn't parse it)
    const sanitized = text.replace(/(https?:\/\/[^\s]+)/g, (url) => {
        try {
            const urlObj = new URL(url);
            // Only allow http/https
            if (urlObj.protocol !== "http:" && urlObj.protocol !== "https:") {
                return t("sanitize.linkRemoved");
            }
            // Shorten long URLs
            return url.length > 50 ? url.substring(0, 50) + "..." : url;
        } catch {
            return t("sanitize.linkInvalid");
        }
    });

    return sanitized;
}

// Remove dangerous mentions
export function removeMentions(text: string): string {
    return text
        .replace(/<@!?(\d+)>/g, "@user") // User mentions
        .replace(/<@&(\d+)>/g, "@role") // Role mentions
        .replace(/<#(\d+)>/g, "#channel"); // Channel mentions
}

// Remove custom emojis (optional)
export function removeCustomEmojis(text: string): string {
    return text.replace(/<a?:[a-zA-Z0-9_]+:\d+>/g, ":emoji:");
}

// Full cleanup
export function cleanMessage(text: string): string {
    let clean = text;
    clean = removeMentions(clean);
    clean = removeCustomEmojis(clean);
    clean = sanitizeMessage(clean);
    return clean.trim();
}

const USERNAME_MAX_LENGTH = 32;

// Control characters and writing-direction override characters (used for visual spoofing, e.g. in webhook names)
const UNSAFE_USERNAME_CHARS = new RegExp(
    "[\\u0000-\\u001F\\u007F-\\u009F\\u200B-\\u200F\\u202A-\\u202E\\u2060-\\u206F]",
    "g",
);

// Clean up the author's name (webhooks can set it to any text, without the normal username restrictions)
export function sanitizeUsername(name: string): string {
    if (!name) return t("sanitize.unknownUser");

    const clean = name.replace(UNSAFE_USERNAME_CHARS, "").trim();
    if (!clean) return t("sanitize.unknownUser");

    return clean.length > USERNAME_MAX_LENGTH ? clean.substring(0, USERNAME_MAX_LENGTH) + "..." : clean;
}
