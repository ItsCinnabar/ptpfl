const ptp = require('../index.js'),
	{ interval } = require('../../config.json');

if(!interval) {
	console.log('To schedule this tool please provide an interval in your config.json file');
	process.exit();
}

const run = () => {
	console.log(`Script run at ${new Date().toLocaleTimeString('en-UK')}`);
	ptp();
};

setInterval(run, interval * 60000);
