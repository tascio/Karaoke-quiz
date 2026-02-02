# SingQuiz

SingQuiz is a karaoke game with a quiz component. A "host" manages the game through an admin panel, sending songs, questions, and sounds, while displaying scores and rankings.

## Overview

The game has three main URLs:
- **Root URL**: Where players connect to play (https://singquiz.com)
- **Host Page**: Admin panel for game management (https://localhost/host)
- **Karaoke Page**: Displays songs, questions, and scores (https://localhost/karaoke)

## Setup

### Songs

Songs can be downloaded from YouTube in MP4 format. They must be renamed with a unique QUID (Question ID) at the start of the filename:

```
000aaa_song_name.mp4
```

- The QUID is an alphabetic character set
- It's separated from the rest of the filename by an underscore `_`
- This is necessary to associate songs with questions

### Questions

Questions are stored in a JSON file (see example in the `quiz` folder). When creating questions:

- **`quid` field**: Must match the song's QUID (e.g., `"000aaa"` for `000aaa_song_name.mp4`)
- **`correct` field**: Index of the correct answer, **starting from 0** (not 1!)
  - Example: If the correct answer is C, the `correct` index is `2`

### Database Files

- **`questions.json`**: Loaded when Docker starts; contains the current game session questions and songs
- **`database.json`**: Your repository of all questions and songs inserted over time
  - Copy questions from here to `questions.json` to create a game session

## Network Configuration

To play without network issues, create a LAN with internet disabled. Players can then access the game at `https://singquiz.com`.

### Linux Setup Example

You'll need a DHCP server and hotspot on your host PC. Here's an example configuration:

#### Wireless Network Card

```bash
sudo ip addr add 192.168.50.1/24 dev wlp0s20f3
sudo ip link set wlp0s20f3 up
```

#### dnsmasq Configuration

```conf
interface=wlp0s20f3
bind-interfaces
dhcp-range=192.168.50.10,192.168.50.150,12h
# Redirect DNS (captive portal-like)
address=/#/192.168.50.1
```

#### hostapd Configuration

```conf
interface=wlp0s20f3
driver=nl80211
ssid=KaraokeHotspot
hw_mode=g
channel=6
macaddr_acl=0
auth_algs=1
ignore_broadcast_ssid=0
wpa=2
wpa_passphrase=karaoke123
wpa_key_mgmt=WPA-PSK
rsn_pairwise=CCMP
```

## Important Notes

- The karaoke page displays QR codes with these network settings
- **Remind players to disable mobile data** — otherwise the DNS redirect won't work!
- **Remind to generate your OWN SSL CERTIFICATE!**