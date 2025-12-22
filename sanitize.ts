export function sanitizeMessage(text: string): string {
    if (!text) return "";

    // Escapar HTML
    const escaped = text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#x27;");

    // Remover URLs maliciosas o limpiarlas
    const sanitized = escaped.replace(/(https?:\/\/[^\s]+)/g, (url) => {
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
