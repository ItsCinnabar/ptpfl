const ptp = require('../index.js'),
	{ validateConfig, fetchTorrents, writeTorrentCache } = require('./index.js');

const run = async () => {
	try {
		const config = await validateConfig(),
			{ torrents } = await fetchTorrents(config);

		writeTorrentCache(torrents);
	} catch(error) {
		console.log(error);
	}
};

run();
