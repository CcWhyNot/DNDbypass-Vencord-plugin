export function sanitizeMessage(text: string): string {
    if (!text) return "";

    // Remover URLs maliciosas o limpiarlas
    // (Sin escape HTML: la Notification nativa muestra texto plano y no lo interpreta)
    const sanitized = text.replace(/(https?:\/\/[^\s]+)/g, (url) => {
        try {
            const urlObj = new URL(url);
            // Solo permitir http/https
            if (urlObj.protocol !== "http:" && urlObj.protocol !== "https:") {
                return "[enlace removido]";
            }
            // Acortar URLs largas
            return url.length > 50 ? url.substring(0, 50) + "..." : url;
        } catch {
            return "[enlace inválido]";
        }
    });

    return sanitized;
}

// Remover menciones peligrosas
export function removeMentions(text: string): string {
    return text
        .replace(/<@!?(\d+)>/g, "@usuario") // Menciones de usuario
        .replace(/<@&(\d+)>/g, "@rol") // Menciones de rol
        .replace(/<#(\d+)>/g, "#canal"); // Menciones de canal
}

// Remover emojis personalizados (opcional)
export function removeCustomEmojis(text: string): string {
    return text.replace(/<a?:[a-zA-Z0-9_]+:\d+>/g, ":emoji:");
}

// Limpieza completa
export function cleanMessage(text: string): string {
    let clean = text;
    clean = removeMentions(clean);
    clean = removeCustomEmojis(clean);
    clean = sanitizeMessage(clean);
    return clean.trim();
}

const USERNAME_MAX_LENGTH = 32;

// Caracteres de control y de override de dirección de escritura (usados para spoofing visual, p.ej. en nombres de webhooks)
const UNSAFE_USERNAME_CHARS = new RegExp(
    "[\\u0000-\\u001F\\u007F-\\u009F\\u200B-\\u200F\\u202A-\\u202E\\u2060-\\u206F]",
    "g",
);

// Limpiar el nombre de autor (los webhooks pueden poner cualquier texto, sin las restricciones normales de username)
export function sanitizeUsername(name: string): string {
    if (!name) return "Desconocido";

    const clean = name.replace(UNSAFE_USERNAME_CHARS, "").trim();
    if (!clean) return "Desconocido";

    return clean.length > USERNAME_MAX_LENGTH ? clean.substring(0, USERNAME_MAX_LENGTH) + "..." : clean;
}
