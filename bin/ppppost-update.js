#!/usr/bin/env node

const {bootstrap, Config} = require( '../src/helpers/app-from-config-path' );
const Bot = require( '../src/bot' );
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
								defaultAnswer: truncate( defaults.access_token, 11 )
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
				else
				{
					return Promise.resolve();
				}
			})
			.then( () =>
			{
				console.log( bot );
				// app.updateBot( botOriginalName, bot );
				// return app.save( configPath );
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
