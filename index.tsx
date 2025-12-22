/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

// TO DO
// Comprobacion de menor que x personas - HECHO
// Eliminar o desactivar a las personas desde la lista - HECHO
// nombres personalizados a la hora de añadir o modificables - FEATURE
// Las propias notificaciones
// Boton para accesibilidad de la lista - DE MOMENTO COMANDO
// Si quieren musica o no en notificaciones
// Escapar urls y esas cosas en los mensajes
import "./styles.css";
import { ApplicationCommandInputType } from "@api/Commands";
import { logger } from "@components/settings/tabs/plugins";
import definePlugin, { OptionType, StartAt } from "@utils/types";
import { contextMenus } from "./components/contextMenu";
import { definePluginSettings } from "@api/Settings";
import { init, shouldNotifyMessage, User } from "./data";
import { requireSettingsMenu } from "./components/CreateListModal";
import { openBypassModal } from "./components/CreateListModal";
import { cleanMessage } from "./sanitize";
import { showNotification } from "@api/Notifications";
import { UserStore } from "@webpack/common";

export const settings = definePluginSettings({
    maxList: {
        type: OptionType.NUMBER,
        description: "¿Cuánta gente puedes tener bypasseada en total",
        default: 10,
    },
    userBasedBypassList: {
        type: OptionType.CUSTOM,
        default: {} as Record<string, User[]>,
    },
});

const plugin = definePlugin({
    name: "NotificationBypass",
    description: "Permite recibir notificaciones de amigos específicos incluso en modo No Molestar",
    authors: [{ name: "Carlos Maria Casado Lopez", id: 585093668315332628n }],
    contextMenus,
    settings,
    requireSettingsMenu,

    commands: [
        {
            name: "bypass",
            description: "Abre la lista de bypass",
            inputType: ApplicationCommandInputType.BUILT_IN,
            execute: async () => {
                try {
                    await requireSettingsMenu();
                    openBypassModal();
                    return { content: "Lista de bypass abierta" };
                } catch (error) {
                    console.error("Error al abrir bypass modal:", error);
                    return { content: "Error al abrir la lista" };
                }
            },
        },
    ],

    startAt: StartAt.WebpackReady,
    start: init,
    flux: {
        MESSAGE_CREATE: (event) => {
            try {
                const message = event.message;
                if (!message || !message.author) return;

                if (shouldNotifyMessage(message, message.channel_id)) {
                    const cleanContent = cleanMessage(message.content || "");

                    // Reproducir sonido de notificación
                    const audio = new Audio("https://discord.com/assets/dd920c06a01e5bb8b09678581e29d56f.mp3");
                    audio.volume = 0.5;
                    audio.play().catch((err) => console.error("Error al reproducir sonido:", err));

                    // Solo mostrar notificación si Discord NO tiene el foco
                    if (!document.hasFocus()) {
                        const user = UserStore.getUser(message.author.id);
                        const avatarUrl =
                            user?.getAvatarURL(undefined, true, true) ||
                            `https://cdn.discordapp.com/avatars/${message.author.id}/${message.author.avatar}.webp?size=96`;

                        showNotification({
                            title: `Mensaje de ${message.author.username}`,
                            body: cleanContent || "(sin contenido)",
                            icon: avatarUrl,
                            onClick: () => {
                                // Opcional: ir al canal
                                console.log("Notificación clickeada");
                            },
                        });
                    }
                }
            } catch (error) {
                console.error("Error:", error);
            }
        },
        CONNECTION_OPEN: init,
    },
    stop() {
        logger.info("Plugin detenido");
    },
});

export default plugin;
