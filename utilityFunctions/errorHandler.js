const fs = require('fs');

function errorHandler(err, cb = null) {
	fs.appendFile(
		'error.log',
		`${new Date().toISOString()}: ${err.stack}\n`,
		(error) => {
			if (error) {
				console.error('Error writing to error log:', error);
			}
		}
	);
	console.error('An error occurred:', err);
	cb && cb();
}

module.exports = errorHandler;
