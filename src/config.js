const jsonfile = require( 'jsonfile' );
const path = require( 'path' );
const fs = require( 'fs' );

class Config
{
	constructor( { version="1.0", bots=[] } = {} )
	{
		this.version = version;

		if( version == "1.0" )
		{
			this.bots = bots;
		}
	}

	static read( configPath )
	{
		return new Promise( (resolve, reject) =>
		{
			let absolutePath = path.resolve( configPath.replace( '~', process.env.HOME ) );

			jsonfile.readFile( absolutePath )
				.then( data =>
				{
					data.path = absolutePath;
					resolve( new Config( data ) );
				})
				.catch( error =>
				{
					reject( error.message );
				});
	
		});
	}

	write( configPath )
	{
		return new Promise( (resolve, reject) =>
		{
			let data = {};

			if( this.version == "1.0" )
			{
				data.version = this.version;
				data.bots = this.bots;
			}

			let absolutePath = path.resolve( configPath.replace( '~', process.env.HOME ) );

			// Attempt to create the parent folder structure in case it doesn't
			// already exist.

			fs.mkdir( path.dirname( absolutePath ), { recursive: true }, error =>
			{
				if( !error )
				{
					jsonfile.writeFile( absolutePath, data )
						.then( () =>
						{
							resolve();
						})
						.catch( error =>
						{
							reject( error );
						});
				}
				else
				{
					reject( error );
				}
			});
		});
	}
}

Config.DEFAULT_PATH = '~/.config/ppppost/config.json';

module.exports = Config;
