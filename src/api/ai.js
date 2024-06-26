export default class Ai {
	constructor() {
		this.url = "https://api.openai.com/v1";
		this.max_tokens = 2048;
		this.model = "text-davinci-003";
		this.temperature = 0.6;
		this.top_p = 0;
		this.apiKey = process.env.REACT_APP_APIKEY;
	}

	async getCompletion(prompt) {
		const path = `${this.url}/completions`;
		const response = await fetch(`${path}`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${this.apiKey}`,
			},
			body: JSON.stringify({
				model: this.model,
				prompt: prompt,
				temperature: this.temperature,
				max_tokens: this.max_tokens,
				top_p: this.top_p,
			}),
		});
		try {
			const data = await response.json();
			return data.choices[0].text;
		} catch (error) {
			return `${error}`;
		}
	}
}