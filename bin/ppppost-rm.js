#!/usr/bin/env node

const {bootstrap, Config} = require( '../src/helpers/app-from-config-path' );
const Bot = require( '../src/bot' );
const pkg = require( '../package.json' ); 
const program = require( 'commander' );

program
	.command( 'add <bot>', 'add a new bot' )
	.option( '-M, --mastodon', 'add Mastodon credentials' )
	.option( '-T, --twitter', 'add Twitter credentials' )
	.parse( process.argv );

/**
 * Run the command
 */
let { PPPPOST_CONFIG:configPath = Config.DEFAULT_PATH } = process.env;

bootstrap( configPath )
	.then( app =>
	{
		let botName = program.args[0];

		if( !app.hasBot( botName ) )
		{
			console.log( `${pkg.name}: Bot '${botName}' not found.` );
			process.exit( 1 );
		}

		app.removeBot( botName );
		return app.save( configPath );
	})
	.catch( error =>
	{
		console.log( `${pkg.name}: ${error}` );
		process.exit( 1 );
	})
