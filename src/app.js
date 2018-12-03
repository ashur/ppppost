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
	 * Add a bot to the list of bots
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

	/**
	 * Find a single bot
	 * @param {string} name - Name of bot
	 * @param {Bot}
	 */
	bot( name )
	{
		return this._bots.find( bot => bot.name == name );
	}

	/**
	 * Return an array of Bot objects, sorted by name
	 * @return {Bot[]} bots - An array of Bot objects
	 */
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

	/**
	 * Remove a bot from the list of bots
	 * @param {string} name
	 */
	removeBot( name )
	{
		let index = this._bots.findIndex( bot => bot.name == name );
		this._bots.splice( index, 1 );
	}

	/**
	 * Save the bot list to a JSON file
	 * @param {string} configPath
	 * @return {Promise}
	 */
	save( configPath )
	{
		let config = new Config( { version: "1.0", bots: this._bots } );
		return config.write( configPath );
	}
}

module.exports = App;
