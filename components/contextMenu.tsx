/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { findGroupChildrenByChildId, NavContextMenuPatchCallback } from "@api/ContextMenu";
import { Menu } from "@webpack/common";
import { addUser, bypassLen, isBypass, removeUser, User } from "../data";
import { t } from "../i18n";
import { logger } from "@components/settings/tabs/plugins";

function createNotificationMenuItem(channelId: string, name: string) {
    logger.info("Reached the function");
    const bypass = isBypass(channelId);

    const handleAdd = () => {
        const user: User = { id: "user-" + bypassLen(), channel: channelId, customName: "", name: name, activated: true };
        addUser(user);
    };

    const handleRemove = () => {
        removeUser(channelId);
    };

    return (
        <Menu.MenuItem id="notification-bypass" label={t("menu.bypass")}>
            {!bypass && (
                <>
                    <Menu.MenuItem id="notification-bypass-add" label={t("menu.add")} action={handleAdd}></Menu.MenuItem>
                </>
            )}
            {bypass && (
                <>
                    <Menu.MenuItem
                        id="notification-bypass-remove"
                        label={t("menu.remove")}
                        color="danger"
                        action={handleRemove}
                    ></Menu.MenuItem>
                </>
            )}
        </Menu.MenuItem>
    );
}

const GroupDMContext: NavContextMenuPatchCallback = (children, props) => {
    const container = findGroupChildrenByChildId("leave-channel", children);
    container?.unshift(createNotificationMenuItem(props.channel.id, props.channel.name));
};

const UserContext: NavContextMenuPatchCallback = (children, props) => {
    const container = findGroupChildrenByChildId("close-dm", children);
    if (container) {
        const idx = container.findIndex((c) => c?.props?.id === "close-dm");
        const userName = props.user?.globalName || props.user?.username || "Unknown";
        container.splice(idx, 0, createNotificationMenuItem(props.channel.id, userName));
    }
};

export const contextMenus = {
    "gdm-context": GroupDMContext,
    "user-context": UserContext,
};
