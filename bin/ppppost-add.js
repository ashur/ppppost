#!/usr/bin/env node

const {bootstrap, Config} = require( '../src/helpers/app-from-config-path' );
const Bot = require( '../src/bot' );
const Mastodon = require( '../src/mastodon' );
const pkg = require( '../package.json' ); 
const program = require( 'commander' );
const prompt = require( '../src/helpers/prompt' );
const readline = require('readline');

program
	.command( 'add <bot>', 'add a new bot' )
	.option( '-M, --mastodon', 'add Mastodon credentials' )
	.option( '-T, --twitter', 'add Twitter credentials' )
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

		if( app.bot( botName ) != null )
		{
			console.log( `${pkg.name}: Bot '${botName}' already exists. See '${pkg.name} list'.` );
			process.exit( 1 );
		}

		(function()
		{
			return new Promise( resolve =>
			{
				if( program.mastodon )
				{
					let data = {};

					prompt( rl, 'Mastodon Instance (ex., mastodon.social)', true )
						.then( instance =>
						{
							if( instance.slice( -1 ) == '/' )
							{
								instance = instance.slice( 0, -1 );
							}

							data.api_url = `https://${instance}/api/v1/`;

							return prompt( rl, 'Mastodon Token', true );
						})
						.then( access_token =>
						{
							data.access_token = access_token;

							botArgs.mastodon = new Mastodon( data );

							return prompt( rl, 'Mastodon Visibility', true );
						})
						.then( visibility =>
						{
							data.visibility = visibility;

							botArgs.mastodon = new Mastodon( data );
							resolve();
						})
				}
				else
				{
					resolve();
				}
			});
		})()
		.then( () =>
		{
			// TODO: Add Twitter support
		})
		.then( () =>
		{
			rl.close();

			app.addBot( new Bot( botArgs ) );
			app.save( configPath );
		});
	})
	.catch( error =>
	{
		console.log( `${pkg.name}: ${error}` );
		process.exit( 1 );
	})
