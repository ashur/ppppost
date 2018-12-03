const Bot = require( './bot' );
const Config = require( './config' );
const jsonfile = require( 'jsonfile' );
const path = require( 'path' );

class App
{
	constructor()
	{
		this._bots = [];
	}

	/**
	 * @param {Bot} bot
	 */
	addBot( bot )
	{
		if( bot instanceof Bot )
		{
			this._bots.push( bot );
		}
		else
		{
			throw new Error( 'Invalid argument type: Bot required' );
		}
	}

	bot( name )
	{
		return this._bots.find( bot => bot.name == name );
	}

	get bots()
	{
		return this._bots.sort( (a, b) =>
		{
			if( a.name < b.name )
			{
				return -1;
			}

			return 1;
		});
	}

	/**
	 * Return whether the list of bots contains a specific bot name
	 * @param {string} name
	 * @return {boolean}
	 */
	hasBot( name )
	{
		return this._bots.find( bot => bot.name == name ) != null;
	}

	save( configPath )
	{
		let config = new Config( { version: "1.0", bots: this._bots } );
		return config.write( configPath );
	}
}

module.exports = App;
