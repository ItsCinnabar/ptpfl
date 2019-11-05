const path = require('path'),
	fs = require('fs'),
	fetch = require('node-fetch'),
	importFresh = require('import-fresh'),
	directoryExists = require('directory-exists');

const configPath = path.join(__dirname, '../../config.json'),
	cachePath = path.join(__dirname, '../../data/cache.json');

const getConfig = () => {
	try {
		const config = importFresh(configPath);
		JSON.parse(JSON.stringify(config));
		return config;
	} catch(error) {
		if (error.message.includes('Cannot find module')) {
			console.log('Please ensure you\'ve created and filled in the config.json file');
			console.log('You may copy example.config.json to config.json and use that as a template.');
			process.exit();
		}

		if (error.message.includes('Unexpected token') || error.message.includes('Unexpected end of JSON input')) {
			console.log('Config.json contains invalid JSON. Please check and try again.');
			process.exit();
		}

		console.log(error);
		process.exit();
	}
};

exports.validateConfig = async () => {
	const configKeys = ['apiUser','apiKey','interval','downloadPath','discordWebhookUrl','minSeeders','maxSeeders','minLeechers','maxLeechers','minSize','maxSize','maxAge','resolution','codec','container','source','releaseGroup'],
		config = getConfig(),
		configFormatError = 'The format of config.json has changed. Please ensure it contains the exact same format and properties as example.config.json',
		downloadPathError = 'Specified downloadPath directory does not exist. Please check your config.';

	if (!config.apiUser || !config.apiKey) {
		console.log('Please ensure you\'ve added your ApiUser and ApiKey details from your PTP profile to the config file. See the example config file for details.');
		process.exit();
	}

	if (configKeys.length !== Object.keys(config).length || !configKeys.every(key => config[key] !== undefined)) {
		console.log(configFormatError);
		process.exit();
	}

	if (!config.downloadPath) {
		return config;
	}

	const folderExists = await directoryExists(config.downloadPath);

	if (!folderExists) {
		console.log(downloadPathError);
		process.exit();
	}

	return config;
};

const getCache = () => {
	try {
		const cache = importFresh(cachePath);
		return JSON.parse(JSON.stringify(cache));
	} catch(error) {
		if (error.message.includes('Cannot find module') || error.message.includes('Unexpected end of JSON input')) {
			return { freeleech: [] };
		}

		console.log('Cache has become corrupted. Please remove the data/cache.json file and try again.');
		process.exit();
	}
};

exports.writeTorrentCache = torrents => {
	const cache = getCache();

	cache.freeleech = cache.freeleech.concat(torrents
		.map(torrent => cache.freeleech.includes(torrent.Id) ? null : torrent.Id)
		.filter(id => id !== null));

	fs.writeFileSync(cachePath, JSON.stringify(cache), {
		encoding: 'utf8'
	});
};

const checkStatus = response => new Promise((resolve, reject) => {
	if (response.status >= 200 && response.status < 300) {
		resolve(response);
	} else {
		const error = new Error(response.statusText);
		error.response = response;
		reject(error);
	}
});

const isOlderThan = (date, minutes) => {
	const earliest = 1000 * minutes * 60,
		time = Date.now() - earliest;
	
	return new Date(date) < time;
};

exports.torrentMatchesFilters = (torrent, config) => {
	let isMatch = true;

	const cache = getCache();

	const minSize = config.minsize === -1 ? -1 : Number(config.minsize) * 1024 * 1024,
		maxSize = config.maxsize === -1 ? -1 : Number(config.maxsize) * 1024 * 1024;

	if (cache.freeleech.includes(torrent.Id)) {
		return false;
	}

	if (config.minSeeders !== -1) {
		if (torrent.Seeders < config.minSeeders) {
			return false;
		}
	}

	if (config.maxSeeders !== -1) {
		if(torrent.Seeders > config.maxSeeders) {
			return false;
		}
	}

	if (config.minLeechers !== -1) {
		if(torrent.Leechers < config.minLeechers) {
			return false;
		}
	}

	if (config.maxLeechers !== -1) {
		if(torrent.Leechers > config.maxLeechers) {
			return false;
		}
	}

	if (config.minSize !== -1) {
		if(torrent.Size < minSize) {
			return false;
		}
	}

	if (config.maxSize !== -1) {
		if(torrent.Size > maxSize) {
			return false;
		}
	}

	if (config.maxAge !== -1) {
		if(isOlderThan(torrent.UploadTime, config.maxAge)) {
			return false;
		}
	}

	if (config.resolution !== -1 && config.resolution.length) {
		const resolutions = config.resolution.includes(',') ? config.resolution.split(',') : [config.resolution];

		if (!resolutions.find(resolution => resolution.trim().toLowerCase() === torrent.Resolution.toLowerCase())) {
			return false;
		}
	}

	if (config.codec !== -1 && config.codec.length) {
		const codecs = config.codec.includes(',') ? config.codec.split(',') : [config.codec];

		if (!codecs.find(codec => codec.trim().toLowerCase() === torrent.Codec.toLowerCase())) {
			return false;
		}
	}

	if (config.container !== -1 && config.container.length) {
		const containers = config.container.includes(',') ? config.container.split(',') : [config.container];

		if (!containers.find(container => container.trim().toLowerCase() === torrent.Container.toLowerCase())) {
			return false;
		}
	}

	if (config.source !== -1 && config.source.length) {
		const sources = config.source.includes(',') ? config.source.split(',') : [config.source];

		if (!sources.find(source => source.trim().toLowerCase() === torrent.Source.toLowerCase())) {
			return false;
		}
	}

	if (config.releaseGroup !== -1 && config.releaseGroup.length) {
		const releaseGroups = config.releaseGroup.includes(',') ? config.releaseGroup.split(',') : [config.releaseGroup];

		if (torrent.ReleaseGroup === null) return false;

		if (!releaseGroups.find(releaseGroup => releaseGroup.trim().toLowerCase() === torrent.ReleaseGroup.toLowerCase())) {
			return false;
		}
	}

	return isMatch;
};

const getTorrentsFromResponse = data => {
	return data.Movies.map(group => {
		const torrent = group.Torrents[0];

		torrent.Seeders = Number(torrent.Seeders);
		torrent.Leechers = Number(torrent.Leechers);
		torrent.Size = Number(torrent.Size);
		torrent.GroupId = group.GroupId;

		return torrent;
	}).filter(torrent => torrent.FreeleechType == 'Freeleech');
};

exports.fetchTorrents = async config => {
	let authKey, passKey, torrents = [];

	try {
		await (async function fetchTorrents(pageNumber) {
			const endpoint = `https://passthepopcorn.me/torrents.php?freetorrent=1&grouping=0&json=noredirect&page=${pageNumber}`,
				response = await fetch(endpoint, {
					headers: {
						'ApiUser': config.apiUser,
						'ApiKey': config.apiKey
					}
				});

			await checkStatus(response);

			const json = await response.json(),
				totalPages = Math.ceil(Number(json.TotalResults) / 50);

			torrents = torrents.concat(getTorrentsFromResponse(json));

			if (pageNumber < totalPages) {
				await fetchTorrents(pageNumber + 1);
			} else {
				authKey = json.AuthKey;
				passKey = json.PassKey;
			}
		})(1);

		return { torrents, authKey, passKey };
	} catch(error) {

		console.log(error);
		process.exit();
	}
};

exports.formatBytes = bytes =>{
	if (bytes === 0){
		return '0 B';
	}

	const k = 1024,
		sizes = [ 'B', 'KB', 'MB', 'GB', 'TB', 'PB' ],
		i = Math.floor(Math.log(bytes) / Math.log(k));

	return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};