#!/usr/bin/env node

const program = require( 'commander' );
const pkg = require( '../package.json' ); 

program
	.version( `${pkg.name} version ${pkg.version}` )
	.command( 'add <bot>', 'add a new bot' )
	.command( 'list', 'list all bots' ).alias( 'ls' )
	.command( 'to <bot>', 'post a message' )
	.parse( process.argv );
