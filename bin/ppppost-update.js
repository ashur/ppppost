#!/usr/bin/env node

const {bootstrap, Config} = require( '../src/helpers/app-from-config-path' );
const Bot = require( '../src/bot' );
const pkg = require( '../package.json' ); 
const program = require( 'commander' );
const prompt = require( '../src/helpers/prompt' );
const readline = require('readline');

program
	.command( 'update <bot>', 'update an existing bot' )
	.option( '-M, --mastodon', 'only update Mastodon credentials' )
	.option( '-T, --twitter', 'only update Twitter credentials' )
	.parse( process.argv );

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
});

function truncate( string, length )
{
	if( string.length <= length )
	{
		return string;
	}

	return `${string.substr(0, length - 3)}...`;
}

/**
 * Run the command
 */
let { PPPPOST_CONFIG:configPath = Config.DEFAULT_PATH } = process.env;

bootstrap( configPath )
	.then( app =>
	{
		let botOriginalName = program.args[0];

		if( !app.hasBot( botOriginalName ) )
		{
			console.log( `${pkg.name}: Bot '${botOriginalName}' not found. See '${pkg.name} list'.` );
			process.exit( 1 );
		}

		let bot = app.bot( botOriginalName );

		/**
		 * Which services to update
		 */
		let updateAll      = !program.mastodon && !program.twitter;
		let updateMastodon = program.mastodon || updateAll;
		let updateTwitter  = program.twitter || updateAll;

		(function()
		{
			return new Promise( resolve =>
			{
				prompt({
						rl: rl,
						message: `Bot Name`,
						defaultAnswer: botOriginalName
				})
					.then( botName =>
					{
						bot.name = botName;
						resolve();
					})
			});
		})()
		.then( () =>
		{
			/**
			 * Mastodon
			 */
			return new Promise( (resolve, reject) =>
			{
				if( updateMastodon )
				{
					let mastodon = {};

					let instance;
					if( bot.hasMastodon() )
					{
						let matches = /https:\/\/([^\/]+)/.exec( bot.mastodon.api_url );
						instance = matches[1] ? matches[1] : null;
					}

					prompt( {
						rl: rl,
						message: bot.hasMastodon() ? `Mastodon Instance` : 'Mastodon Instance (ex., mastodon.social)',
						required: !bot.hasMastodon() || (bot.hasMastodon() && !instance),
						defaultAnswer: instance ? instance : null
					})
						.then( instance =>
						{
							if( instance.slice( -1 ) == '/' )
							{
								instance = instance.slice( 0, -1 );
							}

							bot.mastodon.api_url = `https://${instance}/api/v1/`;
						})
						.then( () =>
						{
							return prompt({
								rl: rl,
								message: 'Mastodon Access Token',
								required: !bot.mastodon.access_token,
								defaultAnswer: truncate( bot.mastodon.access_token, 11 )
							});
						})
						.then( access_token =>
						{
							bot.mastodon.access_token = access_token;
						})
						.then( () =>
						{
							return prompt({
								rl: rl,
								message: 'Mastodon Visibility',
								required: !bot.mastodon.visibility,
								defaultAnswer: bot.mastodon.visibility
							});
						})
						.then( visibility =>
						{
							bot.mastodon.visibility = visibility;
						})
						.then( () =>
						{
							resolve();
						});
				}
				else
				{
					resolve();
				}
			});
		})
		.then( () =>
		{
			/**
			 * Twitter
			 */
			return new Promise( resolve =>
			{
				if( updateTwitter )
				{
					let twitter = {};

					prompt({
						rl: rl,
						message: 'Twitter Consumer Key',
						required: true
					})
						.then( consumer_key =>
						{
							twitter.consumer_key = consumer_key;
						})
						.then( () =>
						{
							return prompt({
								rl: rl,
								message: 'Twitter Consumer Secret',
								required: true 
							});
						})
						.then( consumer_secret =>
						{
							twitter.consumer_secret = consumer_secret;
						})
						.then( () =>
						{
							return prompt({
								rl: rl,
								message: 'Twitter Access Token',
								required: true 
							});
						})
						.then( access_token =>
						{
							twitter.access_token = access_token;
						})
						.then( () =>
						{
							return prompt({
								rl: rl,
								message: 'Twitter Access Token Secret',
								required: true 
							});
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

			console.log( bot );
			app.updateBot( botOriginalName, bot );

			return Promise.resolve();
			return app.save( configPath );
		});
	})
	.catch( error =>
	{
		console.log( `${pkg.name}: ${error}` );
		process.exit( 1 );
	})
