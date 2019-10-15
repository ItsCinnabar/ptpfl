const getUserLocale = require('get-user-locale').getUserLocale,
	ptp = require('../index.js'),
	{ interval } = require('../../config.json');

if(!interval || interval === -1) {
	console.log('To schedule this tool please provide a positive integer as an interval in your config.json file');
	process.exit();
}

const run = () => {
	console.log(`Script run at ${new Date().toLocaleTimeString(getUserLocale())}`);
	ptp();
};

setInterval(run, interval * 60000);
