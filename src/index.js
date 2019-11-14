const { validateConfig, getCache, torrentMatchesFilters, fetchTorrents, writeTorrentCache } = require('./utils'),
	sendDiscordNotification = require('./modules/discord'),
	downloadTorrent = require('./modules/download');

module.exports = async function() {
	try {
		const cache = getCache(),
			config = await validateConfig(), 
			{ torrents, authKey, passKey } = await fetchTorrents(config);

		for (const torrent of torrents) {
			if (torrentMatchesFilters(torrent, config, cache)) {
				await downloadTorrent({ torrent, authKey, passKey }, config);

				await sendDiscordNotification({ torrent, authKey, passKey }, config);
			}
		}

		writeTorrentCache(cache, torrents);
	} catch(error) {
		console.log(error);
	}
}
