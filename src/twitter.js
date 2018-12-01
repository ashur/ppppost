const fs = require( 'fs' );
const M = require( 'mastodon' );

class Twitter
{
	constructor( { consumer_key, consumer_secret, access_token, access_token_secret }  )
	{
		this.consumer_key = consumer_key;
		this.consumer_secret = consumer_secret;
		this.access_token = access_token;
		this.access_token_secret = access_token_secret;
	}

	/**
	 * @return {Promise}
	 */
	post( { message='', media=[] } = {} )
	{
		if( message == '' && media.length == 0 )
		{
			throw new Error( 'You must provide either a status message or media, or both.' );
		}

		// TODO: Implement Twitter.post()
	}
}

module.exports = Twitter;
