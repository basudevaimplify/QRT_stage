# Financial Data Processor

A modern web application for processing and analyzing financial data, built with React, TypeScript, and Vite.

## Features

- Journal Entry Processing
- Intercompany Reconciliation
- Financial Consolidation
- GST Validation
- TDS Validation
- Provision Planning
- Real-time Data Analysis
- AI-powered Insights

## Tech Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Radix UI Components
- OpenAI Integration
- PostgreSQL Database

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- PostgreSQL database

### Installation

1. Clone the repository:
```bash
git clone https://github.com/basudevaimplify/QRT_stage.git
cd QRT_stage
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```
VITE_API_URL=http://localhost:8000
VITE_GEMINI_API_KEY=your_gemini_api_key
```

4. Start the development server:
```bash
npm run dev
```

### Building for Production

```bash
npm run build
```

## Project Structure

```
intellifin---financial-data-processor/
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/         # Page components
│   ├── lib/           # Utility functions and API services
│   ├── hooks/         # Custom React hooks
│   └── types/         # TypeScript type definitions
├── public/            # Static assets
└── ...config files
```

## API Integration

The application integrates with a FastAPI backend that provides:
- File upload and processing
- Data validation
- AI-powered analysis
- Database operations

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

Basudev - basudev@aimplify.tech

Project Link: [https://github.com/basudevaimplify/QRT_stage](https://github.com/basudevaimplify/QRT_stage)
