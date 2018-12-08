/**
 * @param {Object} object
 * @param {readline.Interface} [object.rl]
 * @param {string} [object.message]
 * @param {boolean} [object.required] - Re-prompt if empty answer is supplied
 * @param {boolean} [object.defaultAnswer]
 * @param {number} [object.defaultAnswerMaxLength] - Number of characters to truncate to
 * @return {Promise}
 */
function prompt( {rl, message, required=false, defaultAnswer, defaultAnswerMaxLength} )
{
	return new Promise( (resolve, reject) =>
	{
		if( !rl )
		{
			reject( "Readline interface property 'rl' required." );
		}

		let defaultAnswerString;
		if( defaultAnswerMaxLength )
		{
			defaultAnswerString = truncate( defaultAnswer, defaultAnswerMaxLength );
		}
		else
		{
			defaultAnswerString = defaultAnswer;
		}
		defaultAnswerString = defaultAnswer ? ` [${defaultAnswerString}]` : '';

		rl.question( `${message}${defaultAnswerString}: `, answer =>
		{
			if( answer == '' && required )
			{
				resolve( prompt({
					rl: rl,
					message: message,
					required: required,
					defaultAnswer: defaultAnswer,
					defaultAnswerMaxLength: defaultAnswerMaxLength,
				}));
			}
			if( answer == '' && defaultAnswer )
			{
				answer = defaultAnswer;
			}

			resolve( answer );
		});
	});
}

/** 
 * @param {string} string
 * @param {number} length
 * @return {string}
 */
function truncate( string, length )
{
	if( string == null )
	{
		return null;
	}

	if( string.length <= length )
	{
		return string;
	}

	let ellipsisLength = "...".length;
	let leftLength = Math.ceil( (length - ellipsisLength) / 2 );
	let rightLength = Math.floor( (length - ellipsisLength) / 2 );
	
	let truncated = `${string.substring(0, leftLength)}...${string.substring(string.length - rightLength)}`;

	return truncated;
}

module.exports = prompt;
