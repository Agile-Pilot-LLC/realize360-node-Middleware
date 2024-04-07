const OpenAI = require('openai');
const openai = new OpenAI();

async function requestMusicType(prompt){
    const completion = await openai.chat.completions.create({
        messages: [
            {
                role: 'system',
                content: `
                    You are a robot designed specifically to correlate a prompt with a list of ways that music could "feel", even though you dont feel anything - you use your best knowledge to determine the correlation.

                    Based on the prompt given by the user, select one feeling from a list of "feelings" (surrounded by [] brackets) that resembles the prompt the closest. 
                    Respond with only the feeling name as it is written. If there is low correlation to any of the following, just respond none.

                    [Action]
                    [Bouncy]
                    [Bright]
                    [Calm]
                    [Dark]
                    [Driving]
                    [Eerie]
                    [Epic]
                    [Grooving]
                    [Humorous]
                    [Intense]
                    [Mysterious]
                    [Mystical]
                `
            },
            {
                role: 'user',
                content: prompt
            }
        ]
    })
    return completion.choices[0];
}

module.exports = requestMusicType;