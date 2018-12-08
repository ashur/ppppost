#!/usr/bin/env node

const {bootstrap, Config} = require( '../src/helpers/app-from-config-path' );
const Bot = require( '../src/bot' );
const Mastodon = require( '../src/mastodon' );
const Twitter = require( '../src/twitter' );
const pkg = require( '../package.json' ); 
const program = require( 'commander' );
const prompt = require( '../src/helpers/prompt' );
const readline = require('readline');

program
	.command( 'update <bot>', 'update an existing bot' )
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
		let botOriginalName = program.args[0];

		if( !app.hasBot( botOriginalName ) )
		{
			console.log( `${pkg.name}: Bot '${botOriginalName}' not found. See '${pkg.name} list'.` );
			process.exit( 1 );
		}

		let bot = app.bot( botOriginalName );

		return prompt({
				rl: rl,
				message: `Bot Name`,
				defaultAnswer: botOriginalName
		})
			.then( botName =>
			{
				bot.name = botName;
			})

			/**
			 * Mastodon
			 */
			.then( () =>
			{
				if( !bot.hasMastodon() )
				{
					return prompt({
						rl: rl,
						message: 'Do you want to configure Mastodon? (y/n)',
						required: true,
					})
						.then( userConfigureMastodon =>
						{
							return Promise.resolve( ['y','yes'].indexOf( userConfigureMastodon.toLowerCase() ) > -1 );
						});
				}
				else
				{
					return Promise.resolve( true );
				}
			})
			.then( configureMastodon =>
			{
				if( configureMastodon )
				{
					let defaults = {};

					if( bot.hasMastodon() )
					{
						let matches = /https:\/\/([^\/]+)/.exec( bot.mastodon.api_url );
	
						defaults.access_token = bot.mastodon.access_token;
						defaults.instance = matches[1] ? matches[1] : null;
						defaults.visibility = bot.mastodon.visibility;
					}
					else
					{
						bot.mastodon = new Mastodon({
							api_url: '',
							access_token: '',
						});
					}

					return prompt({
						rl: rl,
						message: defaults.instance ? 'Mastodon Instance' : 'Mastodon Instance (ex., mastodon.social)',
						required: !defaults.instance,
						defaultAnswer: defaults.instance
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
								required: !defaults.access_token,
								defaultAnswer: defaults.access_token,
								defaultAnswerMaxLength: 11,
							})
						})
						.then( accessToken =>
						{
							bot.mastodon.access_token = accessToken;
						})
						.then( () =>
						{
							return prompt({
								rl: rl,
								message: 'Mastodon Visibility',
								required: !defaults.visibility,
								defaultAnswer: defaults.visibility
							})
						})
						.then( visibility =>
						{
							bot.mastodon.visibility = visibility;
						})
				}
			})

			/**
			 * Twitter
			 */
			.then( () =>
			{
				if( !bot.hasTwitter() )
				{
					return prompt({
						rl: rl,
						message: 'Do you want to configure Twitter? (y/n)',
						required: true,
					})
						.then( userConfigureTwitter =>
						{
							return Promise.resolve( ['y','yes'].indexOf( userConfigureTwitter.toLowerCase() ) > -1 );
						});
				}
				else
				{
					return Promise.resolve( true );
				}
			})
			.then( configureTwitter =>
			{
				if( configureTwitter )
				{
					let defaults = {};

					if( bot.hasTwitter() )
					{
						defaults.consumer_key = bot.twitter.consumer_key;
						defaults.consumer_secret = bot.twitter.consumer_secret;
						defaults.access_token = bot.twitter.access_token;
						defaults.access_token_secret = bot.twitter.access_token_secret;
					}
					else
					{
						bot.twitter = new Twitter({
							consumer_key: '',
							consumer_secret: '',
							access_token: '',
							access_token_secret: '',
						});
					}

					return prompt({
						rl: rl,
						message: 'Twitter Consumer Key',
						required: !defaults.consumer_key,
						defaultAnswer: defaults.consumer_key,
						defaultAnswerMaxLength: 11,
					})
						.then( consumerKey =>
						{
							bot.twitter.consumer_key = consumerKey;
						})
						.then( () =>
						{
							return prompt({
								rl: rl,
								message: 'Twitter Consumer Secret',
								required: !defaults.consumer_secret,
								defaultAnswer: defaults.consumer_secret,
								defaultAnswerMaxLength: 11,
							})
						})
						.then( consumerSecret =>
						{
							bot.twitter.consumer_secret = consumerSecret;
						})
						.then( () =>
						{
							return prompt({
								rl: rl,
								message: 'Twitter Access Token',
								required: !defaults.access_token,
								defaultAnswer: defaults.access_token,
								defaultAnswerMaxLength: 11,
							})
						})
						.then( accessToken =>
						{
							bot.twitter.access_token = accessToken;
						})
						.then( () =>
						{
							return prompt({
								rl: rl,
								message: 'Twitter Access Token Secret',
								required: !defaults.access_token_secret,
								defaultAnswer: defaults.access_token_secret,
								defaultAnswerMaxLength: 11,
							})
						})
						.then( accessTokenSecret =>
						{
							bot.twitter.access_token_secret = accessTokenSecret;
						})
				}
			})

			.then( () =>
			{
				app.updateBot( botOriginalName, bot );
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
