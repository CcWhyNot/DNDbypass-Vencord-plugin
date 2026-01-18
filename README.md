# DNDbypass Vencord Plugin

A Vencord plugin that allows you to receive notifications from selected users when DND (Do Not Disturb) is enabled.

## License

This plugin is licensed under the GPL-3.0 License.
See the [LICENSE](LICENSE) file for details.

Based on [Vencord](https://github.com/Vendicated/Vencord), which is also GPL-3.0 licensed.

## Working on

- [x] Custom names for groups and users in the list
- [ ] Button to open the list
- [ ] Custom sound for each user notification
- [ ] Max notifications simultaneously
- [ ] Better UI / UX
- [ ] Custom notifications
- [x] DND check
- [ ] Translate texts based on Discord's language settings.
- [ ] When you are in a channel and this person sends you a message, it won't sound.
- [ ] Clicking the notification redirects you to the channel.

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

Use the `/bypass` command to open the plugin interface.

You can add people to the list with right-click → Bypass → Add.

You can remove people from the list with right-click → Bypass → Remove.
