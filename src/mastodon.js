const fs = require( 'fs' );
const M = require( 'mastodon' );

class Mastodon
{
	constructor( { api_url, access_token, visibility='unlisted' }  )
	{
		this.access_token = access_token;
		this.api_url = api_url;
		this.visibility = visibility;
	}

	/**
	 * Post a new status to Mastodon
	 * @param {Object} object
	 * @param {string} [object.message] - A status message string
	 * @param {string[]} [object.media] - An array of path strings
	 * @param {string[]} [object.captions] - An array of captions corresponding to media
	 * @param {string} [object.visibility] - Override default visibility
	 * @return {Promise}
	 */
	post( { message='', media=[], captions=[], visibility=this.visibility } = {} )
	{
		if( message == '' && media.length == 0 )
		{
			throw new Error( 'You must provide either a status message or media, or both.' );
		}

		let m = new M({
			access_token: this.access_token,
			api_url: this.api_url,
			timeout_ms: 60*1000,
		});

		let mediaIds = [];
		let mediaUploads = media.map( (path, index) =>
		{
			let media = {
				file: fs.createReadStream( path )
			};

			if( captions[index] )
			{
				media.description = captions[index];
			}

			return m.post( 'media', media )
				.then( response =>
				{
					mediaIds.push( response.data.id );
				});
		});

		return Promise.all( mediaUploads )
			.then( () =>
			{
				// We need to send along 'status' even if it's an empty string,
				// or Mastodon gets grumpy.

				let toot = {
					status: message,
					visibility: visibility,
				};

				if( mediaIds.length > 0 )
				{
					toot.media_ids = mediaIds;
				}

				return m.post( 'statuses', toot );
			});
	}
}

module.exports = Mastodon;
