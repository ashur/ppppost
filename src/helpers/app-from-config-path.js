const App = require( '../app' );
const Bot = require( '../bot' );
const Config = require( '../config' );

let app = new App();

module.exports.bootstrap = configPath =>
{
	return new Promise( (resolve, reject) =>
	{
		Config.read( configPath )
			.then( config =>
			{
				config.bots.forEach( data =>
				{
					app.addBot( new Bot( data ) );
				});

				resolve( app );
			})
			.catch( error =>
			{
				// The file doesn't exist, so let's try to create it

				let config = new Config();
				config.write( configPath )
					.then( () =>
					{
						config.bots.forEach( data =>
						{
							app.addBot( new Bot( data ) );
						});

						resolve( app );
					})
					.catch( error =>
					{
						reject( `Could not read or write to ${configPath}: ${error.message}` );
					})
			});
	});
};

module.exports.Config = Config;
