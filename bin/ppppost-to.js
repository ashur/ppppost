#!/usr/bin/env node

const {bootstrap, Config} = require( '../src/helpers/app-from-config-path' );
const path = require( 'path' );
const pkg = require( '../package.json' ); 
const program = require( 'commander' );

function list( val )
{
	return val.split(',');
}

program
	.command( 'to <bot>', 'post a message' )
	.option( '-i, --images <paths>', 'list of images', list )
	.option( '-m, --message <message>', 'status text' )
	.option( '-M, --mastodon', 'post only to Mastodon' )
	.option( '-T, --twitter', 'post only to Twitter' )
	.parse( process.argv );

if( !program.images && !program.message )
{
	console.log( `${pkg.name}:`, 'You must provide either a status message or images, or both.' );
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
				return path.resolve( imagePath );
			});

			status.media = absolutePaths;
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

		if( postToMastodon )
		{
			bot.toot( status )
				.then( url =>
				{
					if( !postToTwitter )
					{
						console.log( url );
					}
					else
					{
						console.log( '✓ Mastodon', url );
					}
				})
				.catch( error =>
				{
					console.log( `${pkg.name}: Mastodon:`, error );
					process.exit( 1 );
				});
		}
		if( postToTwitter )
		{
			bot.tweet( status )
				.then( url =>
				{
					// ...
				})
				.catch( error =>
				{
					console.log( `${pkg.name}: Twitter:`, error );
					process.exit( 1 );
				});
		}
	})
	.catch( error =>
	{
		console.log( `${pkg.name}: ${error}` );
		process.exit( 1 );
	})
