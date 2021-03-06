#!/usr/bin/env node

const {bootstrap, Config} = require( '../src/helpers/app-from-config-path' );
const path = require( 'path' );
const pkg = require( '../package.json' ); 
const program = require( 'commander' );

function list( val )
{
	const PLACEHOLDER = '%PPPPOST_ESCAPED_COMMA%';
	let list = val
		.replace( /\\,/g, PLACEHOLDER )
		.split( ',' )
		.map( item => item.replace( new RegExp( PLACEHOLDER, 'g' ), ',' ) )

	return list;
}

program
	.command( 'to <bot>', 'post a message' )
	.option( '-c, --captions <captions>', 'comma-separated list of captions to accompany images', list )
	.option( '-i, --images <paths>', 'comma-separated list of paths', list )
	.option( '-m, --message <message>', 'status text' )
	.option( '-M, --mastodon', 'post only to Mastodon' )
	.option( '-T, --twitter', 'post only to Twitter' )
	.option( '-v, --visibility <value>', 'override <bot>\'s default Mastodon visibility' )
	.parse( process.argv );

if( !program.images && !program.message )
{
	console.log( `${pkg.name}:`, 'You must provide either a status message or images, or both.' );
	process.exit( 1 );
}

let visibilities = ['direct','private','unlisted','public'];
if( program.visibility && visibilities.indexOf( program.visibility ) == -1 )
{
	console.log( `${pkg.name}: Unknown visibility value '${program.visibility}'.` );
	process.exit( 1 );
}

/**
 * Run the command
 */
let { PPPPOST_CONFIG:configPath = Config.DEFAULT_PATH } = process.env;

bootstrap( configPath )
	.then( app =>
	{
		let botName = program.args[0];
		let bot = app.bot( botName );

		if( bot == undefined )
		{
			console.log( `${pkg.name}: Bot '${botName}' not found.` );
			process.exit( 1 );
		}

		/**
		 * Build status
		 */
		let status = {};

		if( program.images )
		{
			let absolutePaths = program.images.map( imagePath =>
			{
				imagePath = imagePath.replace( '~', process.env.HOME );
				return path.resolve( imagePath );
			});

			status.media = absolutePaths;

			if( program.captions )
			{
				status.captions = program.captions;
			}
		}
		if( program.message )
		{
			status.message = program.message;
		}

		/**
		 * Post status
		 */
		let postToAll      = !program.mastodon && !program.twitter;
		let postToMastodon = program.mastodon || ( postToAll && bot.hasMastodon() );
		let postToTwitter  = program.twitter || ( postToAll && bot.hasTwitter() );

		let allUpdates = [];
		let exitCode = 0;
		let result = {
			date: Date.now()
		};

		if( postToMastodon )
		{
			if( program.visibility )
			{
				status.visibility = program.visibility;
			}

			result.mastodon = {};

			let mastodonUpdate = bot.toot( status )
				.then( id =>
				{
					result.mastodon.status = 'ok';
					result.mastodon.id = id;
				})
				.catch( error =>
				{
					exitCode = 1;

					result.mastodon.status = 'error';
					result.mastodon.error = {
						code: error.statusCode,
						message: error.message,
					};
				});

			allUpdates.push( mastodonUpdate );
		}
		if( postToTwitter )
		{
			result.twitter = {};

			let twitterUpdate = bot.tweet( status )
				.then( id =>
				{
					result.twitter.status = 'ok';
					result.twitter.id = id;
				})
				.catch( error =>
				{
					exitCode = 1;

					result.twitter.status = 'error';
					result.twitter.error = {
						code: error.statusCode,
						message: error.message,
					};
				});

			allUpdates.push( twitterUpdate );
		}

		Promise.all( allUpdates )
			.then( () =>
			{
				console.log( JSON.stringify( result, null, 4 ) );
				process.exit( exitCode );
			})
	})
	.catch( error =>
	{
		console.log( `${pkg.name}: ${error}` );
		process.exit( 1 );
	})
