#!/usr/bin/env node

const {bootstrap, Config} = require( '../src/helpers/app-from-config-path' );
const pkg = require( '../package.json' ); 
const program = require( 'commander' );

function log( bot, visibilityPad )
{
	let pattern = '%s%s  %s  %s';
	console.log( pattern, bot.hasMastodon() ? 'm' : '-', bot.hasTwitter() ? 't' : '-', bot.hasMastodon() ? bot.mastodon.visibility.padEnd( visibilityPad, ' ' ) : '-'.padEnd( visibilityPad, ' ' ), bot.name );
}

program
	.parse( process.argv );

/**
 * Run the command
 */
let { PPPPOST_CONFIG:configPath = Config.DEFAULT_PATH } = process.env;

bootstrap( configPath )
	.then( app =>
	{
		if( program.args.length == 0 )
		{
			let visibilityPad = app.bots.reduce( (max, bot) =>
			{
				if( bot.hasMastodon() )
				{
					return Math.max( max, bot.mastodon.visibility.length );
				}
				else
				{
					return max;
				}
			}, 1 );
	
			app.bots.forEach( bot =>
			{
				log( bot, visibilityPad );
			});			
		}
		else
		{
			let botName = program.args[0];
			let bot = app.bot( botName );
			
			if( bot == undefined )
			{
				console.log( `${pkg.name}: Bot '${botName}' not found.` );
				process.exit( 1 );
			}
			else
			{
				log( bot, 0 );
			}
		}
	})
	.catch( error =>
	{
		console.log( `${pkg.name}: ${error}` );
		process.exit( 1 );
	});
