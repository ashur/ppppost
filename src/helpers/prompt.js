/**
 * @param {readline.Interface} rl
 * @param {string} message
 * @param {boolean} required - Re-prompt if empty answer is supplied
 * @return {Promise}
 */
function prompt( rl, message, required=false )
{
	return new Promise( resolve =>
	{
		rl.question( `${message}: `, answer =>
		{
			if( answer == '' && required )
			{
				resolve( prompt( rl, message, required ) );
			}

			resolve( answer );
		});
	});
}

module.exports = prompt;
