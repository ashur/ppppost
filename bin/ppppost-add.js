#!/usr/bin/env node

const {bootstrap, Config} = require( '../src/helpers/app-from-config-path' );
const Bot = require( '../src/bot' );
const pkg = require( '../package.json' ); 
const program = require( 'commander' );
const prompt = require( '../src/helpers/prompt' );
const readline = require('readline');

program
	.command( 'add <bot>', 'add a new bot' )
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
		 * Mastodon
		 */
		return prompt({
			rl: rl,
			message: 'Do you want to configure Mastodon? (y/n)',
			required: true,
		})
			.then( userCreateMastodon =>
			{
				return Promise.resolve( ['y','yes'].indexOf( userCreateMastodon.toLowerCase() ) > -1 );
			})
			.then( createMastodon =>
			{
				if( createMastodon )
				{
					let mastodon = {};

					return prompt({
						rl: rl,
						message: 'Mastodon Instance (ex., mastodon.social)',
						required: true
					})
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
							return prompt({
								rl: rl,
								message: 'Mastodon Access Token',
								required: true
							});
						})
						.then( access_token =>
						{
							mastodon.access_token = access_token;							
						})
						.then( () =>
						{
							return prompt({
								rl: rl,
								message: 'Mastodon Visibility',
								required: true
							});
						})
						.then( visibility =>
						{
							mastodon.visibility = visibility;
						})
						.then( () =>
						{
							botArgs.mastodon = mastodon;
						});
				}
			})

			/**
			 * Twitter
			 */
			.then( () =>
			{
				return prompt({
					rl: rl,
					message: 'Do you want to configure Twitter? (y/n)',
					required: true,
				})
					.then( userCreateTwitter =>
					{
						return Promise.resolve( ['y','yes'].indexOf( userCreateTwitter.toLowerCase() ) > -1 );
					})
					.then( createTwitter =>
					{
						if( createTwitter )
						{
							let twitter = {};

							return prompt({
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
								})
						}
					})
			})

			.then( () =>
			{
				if( !botArgs.mastodon && !botArgs.twitter )
				{
					return Promise.reject( 'Bot creation canceled.' );
				}

				app.addBot( new Bot( botArgs ) );
				return app.save( configPath );
			})
			.finally( () =>
			{
				rl.close();
			});
	})
	.catch( error =>
	{
		console.log( `${pkg.name}: ${error}` );
		process.exit( 1 );
	})
