const getUserLocale = require('get-user-locale').getUserLocale,
	ptp = require('../index.js'),
	{ interval } = require('../../config.json');

if(!interval) {
	console.log('To schedule this tool please provide an interval in your config.json file');
	process.exit();
}

const run = () => {
	console.log(`Script run at ${new Date().toLocaleTimeString(getUserLocale())}`);
	ptp();
};

setInterval(run, interval * 60000);
