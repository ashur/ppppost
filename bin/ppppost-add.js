#!/usr/bin/env node

const {bootstrap, Config} = require( '../src/helpers/app-from-config-path' );
const Bot = require( '../src/bot' );
const pkg = require( '../package.json' ); 
const program = require( 'commander' );
const prompt = require( '../src/helpers/prompt' );
const readline = require('readline');

program
	.command( 'add <bot>', 'add a new bot' )
	.option( '-M, --mastodon', 'only add Mastodon credentials' )
	.option( '-T, --twitter', 'only add Twitter credentials' )
	.parse( process.argv );

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
});

/**
 * Run the command
 */
let { PPPPOST_CONFIG:configPath = Config.DEFAULT_PATH } = process.env;

bootstrap( configPath )
	.then( app =>
	{
		let botName = program.args[0];
		let botArgs = {
			name: botName
		};

		if( app.hasBot( botName ) )
		{
			console.log( `${pkg.name}: Bot '${botName}' already exists. See '${pkg.name} list'.` );
			process.exit( 1 );
		}

		/**
		 * Which services to define
		 */
		let createAll      = !program.mastodon && !program.twitter;
		let createMastodon = program.mastodon || createAll;
		let createTwitter  = program.twitter || createAll;

		(function()
		{
			/**
			 * Mastodon
			 */
			return new Promise( resolve =>
			{
				if( createMastodon )
				{
					let mastodon = {};

					prompt( rl, 'Mastodon Instance (ex., mastodon.social)', true )
						.then( instance =>
						{
							if( instance.slice( -1 ) == '/' )
							{
								instance = instance.slice( 0, -1 );
							}

							mastodon.api_url = `https://${instance}/api/v1/`;
						})
						.then( () =>
						{
							return prompt( rl, 'Mastodon Access Token', true );
						})
						.then( access_token =>
						{
							mastodon.access_token = access_token;							
						})
						.then( () =>
						{
							return prompt( rl, 'Mastodon Visibility', true );
						})
						.then( visibility =>
						{
							mastodon.visibility = visibility;
						})
						.then( () =>
						{
							botArgs.mastodon = mastodon;
							resolve();
						});
				}
				else
				{
					resolve();
				}
			});
		})()
		.then( () =>
		{
			/**
			 * Twitter
			 */
			return new Promise( resolve =>
			{
				if( createTwitter )
				{
					let twitter = {};

					prompt( rl, 'Twitter Consumer Key', true )
						.then( consumer_key =>
						{
							twitter.consumer_key = consumer_key;
						})
						.then( () =>
						{
							return prompt( rl, 'Twitter Consumer Secret', true );
						})
						.then( consumer_secret =>
						{
							twitter.consumer_secret = consumer_secret;
						})
						.then( () =>
						{
							return prompt( rl, 'Twitter Access Token', true );
						})
						.then( access_token =>
						{
							twitter.access_token = access_token;
						})
						.then( () =>
						{
							return prompt( rl, 'Twitter Access Token Secret', true );
						})
						.then( access_token_secret =>
						{
							twitter.access_token_secret = access_token_secret;
						})
						.then( () =>
						{
							botArgs.twitter = twitter;
							resolve();
						})
				}
				else
				{
					resolve();
				}
			});
		})
		.then( () =>
		{
			rl.close();

			app.addBot( new Bot( botArgs ) );
			return app.save( configPath );
		});
	})
	.catch( error =>
	{
		console.log( `${pkg.name}: ${error}` );
		process.exit( 1 );
	})
