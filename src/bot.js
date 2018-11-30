const Mastodon = require( './mastodon' );

class Bot
{
	constructor( { name, mastodon } )
	{
		this.name = name;

		if( mastodon )
		{
			this.mastodon = new Mastodon( mastodon );
		}
	}

	hasMastodon()
	{
		return this.mastodon != null;
	}

	hasTwitter()
	{
		return this.twitter != null;
	}

	/**
	 * Attempt to post a new status to Mastodon. Resolves Promise with URL of
	 * the newly created toot if successful.
	 *
	 * @param {Object} status - The status to be posted
	 * @param {string} status.message - The status message [optional]
	 * @param {array} status.media - Array of local paths to images [optional]
	 * 
	 * @return {Promise}
	 */
	toot( status )
	{
		return new Promise( (resolve, reject) =>
		{
			if( !this.hasMastodon() )
			{
				reject( `'${this.name}' has not been configured for Mastodon` );
			}

			this.mastodon.post( status )
				.then( response =>
				{
					resolve( response.data.url );
				})
				.catch( error =>
				{
					reject( `"${error.message}" (${error.statusCode})` );
				});
		})
	}

	tweet( status )
	{
		return new Promise( (resolve, reject) =>
		{
			if( !this.hasTwitter() )
			{
				reject( `'${this.name}' has not been configured for Twitter` );
			}
		});
	}
}

module.exports = Bot;
