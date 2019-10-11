const { validateConfig, fetchTorrents, writeTorrentCache } = require('./index.js');

const run = async () => {
	try {
		const config = await validateConfig(),
			{ torrents } = await fetchTorrents(config);

		writeTorrentCache(torrents);

		torrents.forEach(torrent => console.log(`\nCached: ${torrent.ReleaseName}`));
	} catch(error) {
		console.log(error);
	}
};

run();
