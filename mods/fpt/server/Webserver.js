
import Express from 'express';

export default class Webserver {

	static create() {
		return new Webserver();
	}

	constructor() {

		var app = new Express();

		app.use('/client', Express.static('mods/fpt/client'));
		app.use('/built', Express.static('mods/fpt/built'));

		app.listen(3000, function() {
			console.info('Express server started at http://localhost:' + 3000);
		});

	}

}
