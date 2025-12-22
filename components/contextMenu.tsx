/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { findGroupChildrenByChildId, NavContextMenuPatchCallback } from "@api/ContextMenu";
import { Menu } from "@webpack/common";
import { addUser, bypassLen, isBypass, removeUser, User } from "../data";
import { logger } from "@components/settings/tabs/plugins";
import { openBypassModal } from "./CreateListModal";

function createNotificationMenuItem(channelId: string, name: string) {
    logger.info("Llego a la funcion");
    const bypass = isBypass(channelId);

    const handleAdd = () => {
        addUser({ channel: channelId, name: name, activated: true });
    };

    const handleRemove = () => {
        removeUser(channelId);
    };

    return (
        <Menu.MenuItem id="notification-bypass" label="Bypass">
            {!bypass && (
                <>
                    <Menu.MenuItem id="notification-bypass-add" label="Add" action={handleAdd}></Menu.MenuItem>
                    <Menu.MenuSeparator />
                </>
            )}
            {bypass && (
                <>
                    <Menu.MenuItem
                        id="notification-bypass-remove"
                        label="Remove"
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
