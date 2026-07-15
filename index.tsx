/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

// TO DO
// Check for fewer than x people - DONE
// Remove or deactivate people from the list - DONE
// Custom names when adding or editable - FEATURE
// Custom notifications
// Button for list accessibility - COMMAND FOR NOW
// Whether they want sound or not in notifications - DONE
// Escape URLs and that kind of thing in messages - DONE
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
import { cleanMessage, sanitizeUsername } from "./sanitize";
import { NavigationRouter } from "@webpack/common";

export const settings = definePluginSettings({
    userBasedBypassList: {
        type: OptionType.CUSTOM,
        default: {} as Record<string, User[]>,
    },
    showPopupNotification: {
        type: OptionType.BOOLEAN,
        description: "Show the Windows/Discord popup notification",
        default: true,
    },
    playSound: {
        type: OptionType.BOOLEAN,
        description: "Play the notification sound",
        default: true,
    },
    useCustomDuration: {
        type: OptionType.BOOLEAN,
        description: "Use a custom duration for the popup instead of the system's",
        default: false,
    },
    notificationDuration: {
        type: OptionType.NUMBER,
        description: "Seconds you want the popup to last before it closes itself",
        default: 5,
        hidden() {
            return !this.store.useCustomDuration;
        },
    },
});

function createBypassNotification(title: string, body: string, channelId: string) {
    const n = new Notification(title, {
        body,
        silent: true,
    });
    n.onclick = () => {
        window.focus();
        NavigationRouter.transitionTo(`/channels/@me/${channelId}`);
    };

    if (settings.store.useCustomDuration) {
        const duration = Number(settings.store.notificationDuration);
        if (Number.isFinite(duration) && duration > 0) {
            setTimeout(() => n.close(), duration * 1000);
        }
    }
}

const plugin = definePlugin({
    name: "NotificationBypass",
    description: "Allows you to receive notifications from specific friends even in Do Not Disturb mode",
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
            description: "Opens the bypass list",
            inputType: ApplicationCommandInputType.BUILT_IN,
            execute: async () => {
                try {
                    await requireSettingsMenu();
                    openBypassModal();
                    return { content: "Bypass list opened" };
                } catch (error) {
                    console.error("Error opening bypass modal:", error);
                    return { content: "Error opening the list" };
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
                    const cleanUsername = sanitizeUsername(message.author.globalName || message.author.username);

                    if (settings.store.playSound) {
                        const audio = new Audio("https://discord.com/assets/dd920c06a01e5bb8b09678581e29d56f.mp3");
                        audio.volume = 0.5;
                        audio.play().catch((err) => console.error("Error playing sound:", err));
                    }

                    // Only show the visual notification if Discord does NOT have focus and the user has it enabled
                    if (!document.hasFocus() && settings.store.showPopupNotification) {
                        const title = `Message from ${cleanUsername}`;
                        const body = cleanContent || "(no content)";

                        if (Notification.permission === "granted") {
                            createBypassNotification(title, body, message.channel_id);
                        } else if (Notification.permission !== "denied") {
                            Notification.requestPermission().then((permission) => {
                                if (permission === "granted") {
                                    createBypassNotification(title, body, message.channel_id);
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
        logger.info("Plugin stopped");
    },
});

export default plugin;
