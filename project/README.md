# Ayurvedic Electronic Health Record (EHR) System

## Overview
This project is a modern Electronic Health Record (EHR) system tailored for Ayurvedic clinical practice. It enables healthcare professionals to manage patient records, conduct comprehensive Ayurvedic assessments, create treatment plans, and track patient progress using both traditional Ayurvedic principles and modern medical standards.

## Key Features
- **Comprehensive Patient Profiling**: Extended demographic data, Indian healthcare identifiers (UHID, Aadhaar, ABHA), family history, and emergency contacts.
- **Advanced Ayurvedic Assessment**: Dosha scoring (prakriti/vikriti), nadi/jihva/akriti pariksha, srotas evaluation, ICD-11 code integration.
- **Evidence-Based Disease Mappings**: ICD-11 to Ayurvedic disease correlations, dosha involvement, classical and modern references.
- **Multilingual Herb Database**: Sanskrit, Hindi, Malayalam names, pharmacological data, drug interaction warnings, dosages.
- **Structured Treatment Protocols**: Phase-based therapy tracking, diet/lifestyle recommendations, outcome timelines.
- **AI-Powered Clinical Insights**: Automated patient analysis, dosha imbalance detection, and treatment recommendations (OpenAI/Claude integration).
- **Modern UI**: Built with React, TypeScript, Tailwind CSS, and Vite for a fast, responsive experience.

## Tech Stack
- **Frontend**: React, TypeScript, Tailwind CSS, Vite
- **Backend/DB**: Supabase (PostgreSQL)
- **AI Integration**: OpenAI, Anthropic Claude (optional)

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm
- [Supabase](https://supabase.com/) project (for database)

### Installation
1. **Clone the repository:**
   ```bash
   git clone <repo-url>
   cd project
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Set up environment variables:**
   Create a `.env` file in the `project` directory with the following variables:
   ```env
   VITE_SUPABASE_URL=your-supabase-url
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   # Optional for AI features:
   VITE_OPENAI_API_KEY=your-openai-api-key
   VITE_ANTHROPIC_API_KEY=your-anthropic-api-key
   VITE_AI_SERVICE=mock # or 'openai' or 'claude'
   ```
4. **Run database migrations:**
   Ensure you have the [Supabase CLI](https://supabase.com/docs/guides/cli) installed and authenticated.
   ```bash
   npx supabase db push
   ```
5. **Start the development server:**
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:5173` by default.

## Usage
- Access the dashboard to view and manage patients.
- Add new patients, perform Ayurvedic assessments, and create treatment plans.
- Use the AI-powered analysis for patient insights (if API keys are configured).
- Search for herbs by indication and view disease mappings.

## Project Structure
- `src/` - Main frontend source code
  - `components/` - React components (dashboard, patients, forms, etc.)
  - `lib/` - API and AI service integrations 
  - `types/` - TypeScript types for database and forms
- `supabase/` - Database migrations and schema
- `convert-to-pdf.js` - Script to convert HTML documentation to PDF

## Environment Variables
| Variable                | Description                                 |
|-------------------------|---------------------------------------------|
| VITE_SUPABASE_URL       | Supabase project URL                        |
| VITE_SUPABASE_ANON_KEY  | Supabase anon/public API key                |
| VITE_OPENAI_API_KEY     | (Optional) OpenAI API key for AI features   |
| VITE_ANTHROPIC_API_KEY  | (Optional) Anthropic Claude API key         |
| VITE_AI_SERVICE         | 'mock', 'openai', or 'claude' (default: mock)|

## Database Schema
See [`ENHANCED_SCHEMA_DOCUMENTATION.md`](./ENHANCED_SCHEMA_DOCUMENTATION.md) and [`IMPLEMENTATION_GUIDE.md`](./IMPLEMENTATION_GUIDE.md) for detailed schema and setup instructions.

## Documentation
- User Guide: [`EHR_User_Documentation.html`](./EHR_User_Documentation.html) (and PDF)
- Schema: [`ENHANCED_SCHEMA_DOCUMENTATION.md`](./ENHANCED_SCHEMA_DOCUMENTATION.md)
- Implementation: [`IMPLEMENTATION_GUIDE.md`](./IMPLEMENTATION_GUIDE.md)

## Contributing
1. Fork the repo and create your branch.
2. Make your changes and add tests if needed.
3. Run `npm run lint` to check code style.
4. Submit a pull request.

## License
[MIT](LICENSE)

## Acknowledgements
- Inspired by modern EHR systems and classical Ayurvedic texts.
- Built with [Supabase](https://supabase.com/), [React](https://react.dev/), and [OpenAI](https://openai.com/). 