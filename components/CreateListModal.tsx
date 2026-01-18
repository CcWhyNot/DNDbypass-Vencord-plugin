/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { ModalContent, ModalFooter, ModalHeader, ModalProps, ModalRoot, openModalLazy } from "@utils/modal";
import { showToast, Toasts } from "@webpack/common";
import { extractAndLoadChunksLazy } from "@webpack";
import { Button, Text } from "@webpack/common";
import { alterActivateUser, bypassLen, getAllUsers, removeUser, changeCustomName } from "../data";
import { classNameFactory } from "@api/Styles";
import { useForceUpdater } from "@utils/react";
import { useState } from "@webpack/common";
export const requireSettingsMenu = extractAndLoadChunksLazy(
    ['name:"UserSettings"'],
    /createPromise:.{0,20}(\i\.\i\("?.+?"?\).*?).then\(\i\.bind\(\i,"?(.+?)"?\)\).{0,50}"UserSettings"/,
);

const cl = classNameFactory("vc-notifications-");

function UserItem({
    user,
    onRemove,
    onAlterActivate,
    onCustomName,
}: {
    user: { id: string; name: string; customName: string; channel: string; activated: boolean };
    onRemove: (channelId: string, displayName: string) => void;
    onAlterActivate: (userId: string, displayName: string, currentlyActivated: boolean) => void;
    onCustomName: (userId: string, newCustomName: string, originalName: string) => void;
}) {
    const [customName, setCustomName] = useState(user.customName);

    return (
        <div className={cl("user-item")}>
            <div className={cl("user-info")}>
                <input
                    type="text"
                    className={cl("custom-name-input")}
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder={user.name}
                />
                <Text variant="text-md/semibold" className={cl("user-name")}>
                    {user.name}
                </Text>
            </div>
            <div className={cl("user-status", user.activated ? "activated" : "deactivated")}>
                {user.activated ? "Activado" : "Desactivado"}
            </div>
            <div className={cl("user-buttons")}>
                <Button className={cl("btn-delete")} onClick={() => onRemove(user.channel, user.customName || user.name)}>
                    Eliminar
                </Button>
                <Button
                    className={cl("btn-toggle")}
                    onClick={() => onAlterActivate(user.id, user.customName || user.name, user.activated)}
                >
                    {user.activated ? "Desactivar" : "Activar"}
                </Button>
                <Button className={cl("btn-rename")} onClick={() => onCustomName(user.id, customName, user.name)}>
                    Cambiar apodo
                </Button>
            </div>
        </div>
    );
}

export function ModalList(modalProps: any) {
    const users = getAllUsers();
    const empty = bypassLen();
    const forceUpdater = useForceUpdater();

    const onRemove = (channelId: string, displayName: string) => {
        removeUser(channelId);
        showToast(`"${displayName}" eliminado`, Toasts.Type.SUCCESS);
        forceUpdater();
    };

    const onAlterActivate = (userId: string, displayName: string, currentlyActivated: boolean) => {
        alterActivateUser(userId);
        const status = currentlyActivated ? "desactivado" : "activado";
        showToast(`"${displayName}" ${status}`, Toasts.Type.SUCCESS);
        forceUpdater();
    };

    const onCustomName = (userId: string, newCustomName: string, originalName: string) => {
        changeCustomName(userId, newCustomName);
        const displayName = newCustomName || originalName;
        showToast(`Apodo cambiado a "${displayName}"`, Toasts.Type.SUCCESS);
        forceUpdater();
    };

    return (
        <ModalRoot {...modalProps} className={cl("content")}>
            <ModalHeader>
                <Text variant="heading-lg/semibold">Lista de personas / grupos bypasseados</Text>
            </ModalHeader>

            <ModalContent>
                {empty === 0 ? (
                    <section className={cl("empty-message")}>
                        <Text variant="text-md/normal">No tienes ninguno ahora mismo</Text>
                    </section>
                ) : (
                    <section className={cl("users-list")}>
                        {users.map((user) => (
                            <UserItem
                                key={user.id}
                                user={user}
                                onRemove={onRemove}
                                onAlterActivate={onAlterActivate}
                                onCustomName={onCustomName}
                            />
                        ))}
                    </section>
                )}
            </ModalContent>
        </ModalRoot>
    );
}

export const openBypassModal = () => {
    openModalLazy(async () => {
        await requireSettingsMenu();
        return (modalProps) => <ModalList {...modalProps}></ModalList>;
    });
};
