#!/usr/bin/env node

const program = require( 'commander' );
const pkg = require( '../package.json' ); 

program
	.version( `${pkg.name} version ${pkg.version}` )
	.command( 'add <bot>', 'add a new bot' )
	.command( 'list', 'list all bots' ).alias( 'ls' )
	.command( 'rm <bot>', 'remove a bot' )
	.command( 'to <bot>', 'post a message' )
	.command( 'update <bot>', 'update an existing bot' )
	.parse( process.argv );
