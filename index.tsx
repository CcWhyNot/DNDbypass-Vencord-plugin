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
import ErrorBoundary from "@components/ErrorBoundary";
import { logger } from "@components/settings/tabs/plugins";
import definePlugin, { OptionType, StartAt } from "@utils/types";
import { contextMenus } from "./components/contextMenu";
import { definePluginSettings } from "@api/Settings";
import { init, shouldNotifyMessage, User } from "./data";
import { requireSettingsMenu } from "./components/CreateListModal";
import { openBypassModal } from "./components/CreateListModal";
import { cleanMessage } from "./sanitize";
import { NavigationRouter } from "@webpack/common";

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

    patches: [
        {
            find: '.FRIENDS},"friends"',
            replacement: {
                match: /,"quests"\),/,
                replace: ',"quests"),$self.renderBypassButton(),',
            },
        },
    ],

    renderBypassButton: ErrorBoundary.wrap(
        () => (
            <div className="vc-notif-bypass-sidebar-btn" onClick={() => openBypassModal()} role="button" tabIndex={0}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none">
                    <path d="M12 2C10.34 2 9 3.34 9 5v.26C6.72 6.23 5 8.42 5 11v5l-2 2v1h18v-1l-2-2v-5c0-2.58-1.72-4.77-4-5.74V5c0-1.66-1.34-3-3-3zm0 20c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2z" />
                </svg>
                <span>Bypass</span>
            </div>
        ),
        { noop: true },
    ),

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

                    // Reproducir sonido de Discord siempre
                    const audio = new Audio("https://discord.com/assets/dd920c06a01e5bb8b09678581e29d56f.mp3");
                    audio.volume = 0.5;
                    audio.play().catch((err) => console.error("Error al reproducir sonido:", err));

                    // Solo mostrar notificación visual si Discord NO tiene el foco
                    if (!document.hasFocus()) {
                        if (Notification.permission === "granted") {
                            const n = new Notification(`Mensaje de ${message.author.username}`, {
                                body: cleanContent || "(sin contenido)",
                                silent: true,
                            });
                            n.onclick = () => {
                                window.focus();
                                NavigationRouter.transitionTo(`/channels/@me/${message.channel_id}`);
                            };
                        } else if (Notification.permission !== "denied") {
                            Notification.requestPermission().then((permission) => {
                                if (permission === "granted") {
                                    const n = new Notification(`Mensaje de ${message.author.username}`, {
                                        body: cleanContent || "(sin contenido)",
                                        silent: true,
                                    });
                                    n.onclick = () => {
                                        window.focus();
                                        NavigationRouter.transitionTo(`/channels/@me/${message.channel_id}`);
                                    };
                                }
                            });
                        }
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
