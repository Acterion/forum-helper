'use server';

import OpenAI from "openai";

const systemPrompt = `
Please enhance or edit this forum reply to ensure it's empathetic, supportive, and helpful, without sounding overly friendly. 
The forum is about women’s health, and replies should be sensitive to the potentially emotional and personal nature of the discussions. 
The response should be coherent, concise, and well-formatted, showing genuine empathy and understanding while offering useful support or advice when possible.

First inform the user how they can change their reply in 1-2 short sentences. The propose your edited reply.

Format:
<1-2 sentences of feedback>
Suggested edits:
<edited reply>`

export async function createAiResponse(prompt: string) {
    const openai = new OpenAI({apiKey: process.env.OPENAI_API_KEY});
    const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{role: "system", content: systemPrompt}, {role: "user", content: prompt}],
    });
    return response.choices[0].message.content;
}