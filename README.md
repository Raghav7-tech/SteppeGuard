# SteppeGuard 🌍🔥

🚀 **Live Project:** [https://steppe-guard.vercel.app/](https://steppe-guard.vercel.app/)

**SteppeGuard** is an advanced, AI-powered platform dedicated to predicting, monitoring, and mitigating wildfires across the steppes of Kazakhstan. It fuses satellite data, weather forecasting, and generative AI to provide real-time situational awareness and actionable insights.

## ✨ Features

- **Interactive Risk Dashboard**: Visualizes fire risk levels, historical observations, and predicted fire spread using dynamic map layers.
- **SteppeGuard AI Chat**: A floating, multilingual (English, Russian, Kazakh) AI assistant powered by **Google Gemini 2.5**, capable of analyzing live database contexts and forecasting district-specific risks.
- **Real-Time Data Pipelines**: Integrates with Open-Meteo for wind and weather forecasting, NASA FIRMS for real-time fire detection, and Supabase for structured observation storage.
- **Risk Mindmap**: A draggable, node-based interactive mindmap for breaking down risk factors such as agricultural burning, lightning, and human activity.

## 🛠️ Tech Stack

- **Frontend**: React (Vite), Tailwind CSS, React Rnd, Lucide Icons.
- **Backend**: FastAPI (Python), Uvicorn, Pydantic.
- **AI / LLM**: Google Gemini API.
- **Database & Services**: Supabase (PostgreSQL), NASA FIRMS, Open-Meteo.

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- Python 3.10+
- A Supabase Project
- API Keys for Google Gemini and NASA FIRMS (Optional for mock data)

### 1. Setup the Backend
Navigate to the root folder, set up your Python environment, and start the server:

```bash
# Create and activate virtual environment
python -m venv venv
venv\Scripts\activate  # On Windows

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY and SUPABASE keys.

# Run the backend
cd backend
uvicorn main:app --reload --port 8000
```

### 2. Setup the Frontend
Open a new terminal and start the React application:

```bash
cd frontend
npm install
npm run dev
```

### 3. Usage
Once both servers are running, open `http://localhost:5173` for locally running in your browser. You can interact with the map, click on districts to view the risk mindmap, and use the floating SteppeGuard AI chat in the bottom right corner.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
