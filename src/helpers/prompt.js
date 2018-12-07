/**
 * @param {Object} object
 * @param {readline.Interface} [object.rl]
 * @param {string} [object.message]
 * @param {boolean} [object.required] - Re-prompt if empty answer is supplied
 * @param {boolean} [object.defaultAnswer]
 * @return {Promise}
 */
function prompt( {rl, message, required=false, defaultAnswer} )
{
	return new Promise( resolve =>
	{
		let defaultAnswerString = defaultAnswer ? ` [${defaultAnswer}]` : '';

		rl.question( `${message}${defaultAnswerString}: `, answer =>
		{
			if( answer == '' && required )
			{
				resolve( prompt({
					rl: rl,
					message: message,
					required: required,
					defaultAnswer: defaultAnswer,
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

module.exports = prompt;
