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
	 * Post a new status to Twitter
	 * @param {Object} object
	 * @param {string} [object.message] - A status message string
	 * @param {string[]} [object.captions] - An array of captions corresponding to media
	 * @param {string[]} [object.media] - An array of path strings
	 * @return {Promise}
	 */
	post( { message='', media=[], captions=[] } = {} )
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
		let mediaUploads = media.map( (path, index) =>
		{
			let media = {
				media_data: fs.readFileSync( path , { encoding: 'base64' } )
			};

			return t.post( 'media/upload', media )
				.then( response =>
				{
					let mediaId = response.data.media_id_string
					mediaIds.push( mediaId );

					if( captions[index] )
					{
						let metadata = {
							media_id: mediaId,
							alt_text: {
								text: captions[index]
							}
						};

						return t.post( 'media/metadata/create', metadata );
					}
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
