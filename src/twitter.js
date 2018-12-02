const fs = require( 'fs' );
const T = require( 'twit' );

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

		let t = new T({
			consumer_key: this.consumer_key,
			consumer_secret: this.consumer_secret,
			access_token: this.access_token,
			access_token_secret: this.access_token_secret,
			timeout_ms: 60*1000,
		});

		let mediaIds = [];
		let mediaUploads = media.map( path =>
		{
			return t.post( 'media/upload', {
				media_data: fs.readFileSync( path , { encoding: 'base64' } )
			})
				.then( response =>
				{
					mediaIds.push( response.data.media_id_string );
				})
		});

		return Promise.all( mediaUploads )
			.then( () =>
			{
				let tweet = {};

				if( message != '' )
				{
					tweet.status = message;
				}

				if( mediaIds.length > 0 )
				{
					tweet.media_ids = mediaIds;
				}

				return t.post( 'statuses/update', tweet );
			});
	}
}

module.exports = Twitter;
