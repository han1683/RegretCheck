# RegretCheck

RegretCheck is a Next.js MVP that helps people check whether a caption or post could come across as cringe, risky, unprofessional, too dramatic, or damaging before it goes live.

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000` or the port shown in your terminal.

## AI Analysis

The app works without an API key by using the mock analyzer in `lib/analyzePost.ts`.

To enable real AI analysis, create a local `.env` file:

```bash
OPENAI_API_KEY=your_api_key_here
OPENAI_MODEL=gpt-5.5
```

The `/api/analyze` route uses OpenAI when `OPENAI_API_KEY` is present and falls back to the mock analyzer if the API call fails.
