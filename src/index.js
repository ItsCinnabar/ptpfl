const { validateConfig, fetchTorrents, writeTorrentCache } = require('./utils'),
	sendDiscordNotification = require('./modules/discord'),
	downloadTorrent = require('./modules/download');

module.exports = async function() {
	try {
		const config = await validateConfig(),
			{ torrents, authKey, passKey } = await fetchTorrents(config);

		for (const torrent of torrents) {
			await downloadTorrent({ torrent, authKey, passKey }, config);

			await sendDiscordNotification({ torrent, authKey, passKey }, config);
		}

		writeTorrentCache(torrents);
	} catch(error) {
		console.log(error);
	}
}
