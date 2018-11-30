const Bot = require( './bot' );
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
}

module.exports = App;
