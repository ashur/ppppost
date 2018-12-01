const Mastodon = require( './mastodon' );
const Twitter = require( './twitter' );

class Bot
{
	constructor( { name, mastodon, twitter } )
	{
		this.name = name;

		if( mastodon )
		{
			this.mastodon = new Mastodon( mastodon );
		}
		if( twitter )
		{
			this.twitter = new Twitter( twitter );
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
	 * Attempt to post a new status to Mastodon. Resolves Promise with ID of
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
					resolve( response.data.id );
				})
				.catch( error =>
				{
					reject( error );
				});
		})
	}

	/**
	 * Attempt to post a new status to Twitter. Resolves Promise with ID of
	 * the newly created tweet if successful.
	 *
	 * @param {Object} status - The status to be posted
	 * @param {string} status.message - The status message [optional]
	 * @param {array} status.media - Array of local paths to images [optional]
	 * 
	 * @return {Promise}
	 */
	tweet( status )
	{
		return new Promise( (resolve, reject) =>
		{
			if( !this.hasTwitter() )
			{
				reject( `'${this.name}' has not been configured for Twitter` );
			}

			// TODO: Implement calling Twitter.post()
		});
	}
}

module.exports = Bot;
