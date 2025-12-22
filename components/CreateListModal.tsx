/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { ModalContent, ModalFooter, ModalHeader, ModalProps, ModalRoot, openModalLazy } from "@utils/modal";
import { extractAndLoadChunksLazy } from "@webpack";
import { Button, Text } from "@webpack/common";
import { alterActivateUser, bypassLen, getAllUsers, removeUser } from "../data";
import { classNameFactory } from "@api/Styles";
import { useForceUpdater } from "@utils/react";
export const requireSettingsMenu = extractAndLoadChunksLazy(
    ['name:"UserSettings"'],
    /createPromise:.{0,20}(\i\.\i\("?.+?"?\).*?).then\(\i\.bind\(\i,"?(.+?)"?\)\).{0,50}"UserSettings"/,
);

const cl = classNameFactory("vc-notifications-");

export function ModalList(modalProps: any) {
    const users = getAllUsers();
    const empty = bypassLen();
    const forceUpdater = useForceUpdater();

    const onRemove = (channelId: string) => {
        removeUser(channelId);
        forceUpdater();
    };

    const onAlterActivate = (userId: string) => {
        alterActivateUser(userId);
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
                            <div key={user.id} className={cl("user-item")}>
                                <div className={cl("user-info")}>
                                    <Text variant="text-sm/normal" className={cl("user-id")}>
                                        ID: {user.id}
                                    </Text>
                                    <Text variant="text-md/semibold" className={cl("user-name")}>
                                        {user.name}
                                    </Text>
                                </div>
                                <div className={cl("user-status", user.activated ? "activated" : "deactivated")}>
                                    {user.activated ? "Activado" : "Desactivado"}
                                </div>
                                <div className={cl("user-buttons")}>
                                    <Button onClick={() => onRemove(user.channel)}>Eliminar</Button>
                                    <Button onClick={() => onAlterActivate(user.id)}>
                                        {user.activated ? "Desactivar" : "Activar"}
                                    </Button>
                                </div>
                            </div>
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
        return (modalProps) => <ModalList modalProps={modalProps}></ModalList>;
    });
};
