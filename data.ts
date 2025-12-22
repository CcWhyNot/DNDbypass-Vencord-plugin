/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import { settings } from "userplugins/customNotifications";
import { UserStore, PresenceStore } from "@webpack/common";

export interface User {
    id: string;
    channel: string;
    name: string;
    activated: boolean;
}

export let currentUserBypassUsers: User[] = [];

export async function init() {
    const userId = UserStore.getCurrentUser()?.id;
    if (userId == null) return;

    currentUserBypassUsers = settings.store.userBasedBypassList[userId] ??= [];
}

export function shouldNotifyMessage(message: any, channelId: string) {
    const currentUser = UserStore.getCurrentUser();
    if (!currentUser) return false;

    // Comprobación de DND
    const status = PresenceStore.getStatus(currentUser?.id);
    if (status !== "dnd") return false;

    // No notificar si es tu propio mensaje
    if (message.author?.id === currentUser?.id) return false;

    // Comprueba bypass y activado
    return currentUser && isBypass(channelId) && isActived(channelId);
}

export function getUserByName(name: string) {
    return currentUserBypassUsers.find((c) => c.name === name);
}

export function getUserById(id: string) {
    return currentUserBypassUsers.find((c) => c.id === id);
}

function generateUniqueId(): string {
    // Genera un ID único usando timestamp + random
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export function addUser(user: Omit<User, "id">) {
    if (bypassLen() >= settings.store.maxList) return;

    const newUser: User = {
        ...user,
        id: generateUniqueId(),
    };

    currentUserBypassUsers.push(newUser);
    return newUser.id;
}

export function removeUser(channelId: string) {
    const userIndex = currentUserBypassUsers.findIndex((c) => c.channel === channelId);
    if (userIndex === -1) return;

    currentUserBypassUsers.splice(userIndex, 1);
}

export function bypassLen() {
    return currentUserBypassUsers.length;
}

export function isBypass(channelId: string) {
    return currentUserBypassUsers.some((c) => c.channel === channelId);
}

export function getAllUsers() {
    return currentUserBypassUsers;
}

export function isActived(channelId: string) {
    return currentUserBypassUsers.some((c) => c.channel === channelId && c.activated === true);
}

export function alterActivateUser(userId: string) {
    const userIndex = currentUserBypassUsers.findIndex((c) => c.id === userId);
    if (userIndex === -1) return;
    currentUserBypassUsers[userIndex].activated = !currentUserBypassUsers[userIndex].activated;
}
