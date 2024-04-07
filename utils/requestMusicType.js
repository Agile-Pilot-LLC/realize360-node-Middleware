const OpenAI = require('openai');
const openai = new OpenAI();

async function requestMusicType(prompt){
    const completion = await openai.chat.completions.create({
        messages: [
            {
                role: 'system',
                content: `
                    You are an AI tasked with correlating prompts with a list of predefined musical "feelings". From the provided list, select the feeling that best corresponds to the given prompt. Do not choose a feeling outside of the list. If none of the feelings correlate well, respond with "none".

                    List of feelings:
                    
                    Action
                    Bouncy
                    Bright
                    Calm
                    Dark
                    Driving
                    Eerie
                    Epic
                    Grooving
                    Humorous
                    Intense
                    Mysterious
                    Mystical
                `
            },
            {
                role: 'user',
                content: prompt
            }
        ],
        model: 'gpt-3.5-turbo'
    })
    return completion.choices[0].message.content;
}

module.exports = requestMusicType;