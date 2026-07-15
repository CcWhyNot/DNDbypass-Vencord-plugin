# DNDbypass Vencord Plugin

A Vencord plugin that lets you keep receiving notifications from specific friends, groups or DMs even while Discord is set to Do Not Disturb — with full control over how those notifications look, sound and behave.

## Features

- **Per-conversation bypass list** — right-click any DM or group DM and add/remove it from the bypass list, so only the people/groups you choose can break through Do Not Disturb.
- **Activate/deactivate without removing** — temporarily silence an entry without losing it from your list.
- **Custom nicknames** — rename any bypassed entry to whatever you want, independent of their Discord name.
- **No arbitrary list size limit** — bypass as many people or groups as you want.
- **Independent popup/sound toggles** — show the popup notification, play the sound, both, or neither — configured separately.
- **Configurable auto-close duration** — optionally make the popup close itself after a set number of seconds instead of waiting for the OS default.
- **Click-to-jump** — clicking a notification focuses Discord and jumps straight to the channel.
- **No duplicate pings** — if you already have the channel focused, it won't notify you.
- **Sanitized content** — message content and the author's name are cleaned before being shown (mentions, custom emojis, unsafe/spoofing characters, long or malicious links), so nothing unexpected ends up in your notification.
- **Multi-language UI** — settings, notifications, toasts and the bypass list modal follow your Discord language (English, Spanish, French, German — falls back to English otherwise).
- **Quick access** — open the list with the `/bypass` command or the sidebar button.

## Settings

| Setting | Description |
| --- | --- |
| Show popup notification | Toggle the Windows/Discord popup on or off. |
| Play sound | Toggle the notification sound on or off — independent of the popup. |
| Use custom duration | Enable a custom auto-close time for the popup instead of the system default. |
| Notification duration | Seconds the popup stays open before closing itself (only shown when the setting above is enabled). |

## License

This plugin is licensed under the GPL-3.0 License.
See the [LICENSE](LICENSE) file for details.

Based on [Vencord](https://github.com/Vendicated/Vencord), which is also GPL-3.0 licensed.

## Roadmap

- [x] Custom names for groups and users in the list
- [x] Button to open the list
- [x] DND check
- [x] When you are in a channel and this person sends you a message, it won't notify you
- [x] Clicking the notification redirects you to the channel
- [x] Independent popup/sound toggles and configurable auto-close duration
- [x] Sanitize message content and author name shown in notifications
- [x] Translate texts based on Discord's language settings (English, Spanish, French, German)
- [ ] Custom sound for each user notification
- [ ] Max notifications simultaneously
- [ ] Better UI / UX
- [ ] Custom notifications
- [ ] Server support (notifications from server channels)

## Installation

Until this plugin is submitted for official review, follow this installation guide:

### Prerequisites

- Install Vencord following their [official guide](https://docs.vencord.dev/installing/).

### Steps

1. Create the userplugins directory:

```bash
cd src
mkdir userplugins
cd userplugins
```

2. Clone this repository:

```bash
git clone https://github.com/CcWhyNot/DNDbypass-Vencord-plugin.git
```

3. Recompile and inject:

```bash
pnpm build && pnpm inject
```

## Usage

Use the `/bypass` command or the sidebar button to open the plugin interface.

You can add people to the list with right-click → Bypass → Add.

You can remove people from the list with right-click → Bypass → Remove.

From the list you can also rename an entry, or activate/deactivate it without removing it.
