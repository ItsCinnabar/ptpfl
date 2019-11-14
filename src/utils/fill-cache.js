const { validateConfig, getCache, fetchTorrents, writeTorrentCache } = require('./index.js');

(async () => {
	try {
		const cache = getCache(),
			config = await validateConfig(),
			{ torrents } = await fetchTorrents(config, true);

		writeTorrentCache(cache, torrents);

		torrents.forEach(torrent => console.log(`\nCached: ${torrent.ReleaseName}`));
	} catch(error) {
		console.log(error);
	}
})();
