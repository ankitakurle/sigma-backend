import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const openAiResponse = async (message) => {
  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: message }]
  });

  return response.choices[0].message.content;
};

export default openAiResponse;
