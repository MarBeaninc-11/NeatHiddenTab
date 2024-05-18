import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

app.use(express.json());

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

app.post('/api/generate-code', async (req, res) => {
	const { appName, appDescription } = req.body;

	try {
		const prompt = `
	  App Name: ${appName}
	  App Description: ${appDescription}

	  As a team of expert developers, generate a conversation between AI agents to design and develop the application based on the given app name and description. The conversation should cover the following roles and responsibilities:

	  1. Product Owner: Review the app name and description, and provide initial guidance and requirements.
	  2. Specification Writer: Analyze the app description and document the finalized requirements and features.
	  3. Architect: Recommend a suitable technology stack and architecture for the application.
	  4. Tech Lead: Break down the development process into smaller tasks and assign them to the Developer.
	  5. Developer: Provide detailed instructions on how to implement each task, including code structure and logic.
	  6. Code Monkey: Write the actual code based on the Developer's instructions.
	  7. Reviewer: Review the code written by Code Monkey and provide feedback on code quality and best practices.
	  8. Troubleshooter: Assist with any issues or roadblocks encountered during the development process.
	  9. Debugger: Identify and resolve any bugs or errors in the code.
	  10. Technical Writer: Document the project's progress, key decisions, and outcomes.

	  The conversation should be in a clear and readable format, with each agent's role and message specified. The generated code should be functional, well-structured, and adhere to industry best practices. Include comments and documentation to enhance readability and maintainability.
	`;

		const response = await axios.post('https://api.gemini.com/v1/completions', {
			prompt: prompt,
			model: 'gemini-1.5-pro-latest',
			max_tokens: 2048,
			temperature: 0.7,
		}, {
			headers: {
				'Authorization': `Bearer ${GEMINI_API_KEY}`,
				'Content-Type': 'application/json',
			},
		});

		const generatedText = response.data.choices[0].text.trim();
		const conversationMatch = generatedText.match(/AI Agent Conversation:[\s\S]*?Generated Code:/);
		const conversation = conversationMatch ? conversationMatch[0].replace('Generated Code:', '').trim() : '';
		const codeMatch = generatedText.match(/Generated Code:[\s\S]*/);
		const code = codeMatch ? codeMatch[0].replace('Generated Code:', '').trim() : '';

		res.json({ conversation, code });
	} catch (error) {
		console.error('Error generating code:', error);
		res.status(500).json({ error: 'Internal server error' });
	}
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
