# PassThePopcorn Freeleech Automator

A node.js script that automates the downloading of PassThePopcorn freeleech torrents.

### Feature Requests

Feature requests welcome. Feel free to create a [new issue](https://github.com/ergusto/ptp/issues/new) explaining the feature you'd like to see implemented into the package.

## Usage

### Prerequisites

[Install Node and NPM](https://tecadmin.net/install-nodejs-with-nvm/) (root not required).

### To install

`npm install` within the project directory.

### Setup

Copy `example.config.json` to `config.json` and fill in your apiUser and apiKey credentials from your user profile.

Add a `downloadPath` to `config.json` to have the torrents added to your torrent client's watch directory.

### To run

`npm start` to run manually.

`npm run schedule` to run at an interval of `x` minutes as defined by the `interval` setting in `config.json`. This is helpful for running in screen or tmux.

`npm run fill-cache` to fill the freeleech cache with currently available freeleech torrents. This is helpful if you'd like to start downloading future freeleech without flooding your torrent client with past freeleech. This caches all torrents; including those not filtered by your config.

## Discord notifications

Create a Webhook URL for a Discord channel and place it as `discordWebhookUrl` in your config file to be notified of grabbed torrents.

## Configuration

Configuration options with defaults shown:

```javascript
{
  "apiUser": "", // apiUser credential found in PTP profile security tab.
  "apiKey": "", // apiKey credential found in PTP profile security tab.
  "minseeders": -1, // Minimum amount of seeders. Set to -1 for unlimited.
  "maxseeders": -1, // Maximum amount of seeders. Set to -1 for unlimited.
  "minleechers": -1, // Minimum amount of leechers. Set to -1 for unlimited.
  "maxleechers": -1, // Maximum amount of leechers. Set to -1 for unlimited.
  "minsize": -1, // Minimum size in megabytes. Set to -1 for unlimited.
  "maxsize": -1, // Maximum size in megabytes. Set to -1 for unlimited.
  "maxAge": -1, // Maximum time in minutes since torrent was uploaded. See below note.
  "releaseYear": -1, // Filter by release year. Comma separated list of years.
  "imdbRating": -1, // Filter by minimum IMDB rating.
  "resolution": -1, // Filter by resolution. Comma separated list. See below for possible values.
  "codec": -1, // Filter by codex. Comma separated list. See below for possible values.
  "container": -1, // Filter by container. Comma separated list. See below for possible values.
  "source": -1, // Filter by source. Comma separated list. See below for possible values.
  "downloadPath": "", // Path to download .torrent files to. Optional.
  "discordWebhookUrl": "", // Discord webhook URI. Optional.
  "interval": -1 // Interval, in minutes, that you'd like to run the script at. 
}
```

## maxAge

Set `maxAge` to filter freeleech torrents by upload date, in minutes. Be aware that some torrents are given freeleech status well after initial upload, & in this case those torrents may not be filtered if this config is set.

## Filter Options

These options can be specified in a comma separated list within a string. For example: `"source": "cam,ts,dvd-screener"` or `"source": "cam"`.

| Resolution | Codec | Container | Source |
| --- | --- | --- | --- | 
|anysd|XviD|AVI|CAM|
|anyhd|DivX|MPG|TS|
|anyhdp|H.264|MKV|R5|
|anyuhd|x264|MP$|DVD-Screener|
|ntsc|H.265|VOV IFO|VHS|
|pal|x265|ISO|WEB|
|480p|DVD5|m2ts|DVD|
|576p|DVD9| |TV|
|720p|BD25| |HDTV|
|1080i|BD50| |HD-DVD|
|1080p|BD66| |Blu-ray|
|2160p|BD100| | |
