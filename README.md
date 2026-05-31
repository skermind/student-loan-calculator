# student-loan-calculator
Application to compare student loans and work out if it reasonable to pay back your student loan.

## Deployment Commands

### Backend (FastAPI)

#### Development
```bash
cd backend
source .venv/bin/activate
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

#### Production
```bash
cd backend
pip install -r ../requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

### Frontend (Next.js)

#### Development
```bash
cd frontend
npm install
npm run dev
```
Frontend will be available at `http://localhost:3000`

#### Production Build
```bash
cd frontend
npm install
npm run build
npm start
```
Frontend will be available at `http://localhost:3000`

### Running Both Services

#### Option 1: Terminal Windows (Development)
```bash
# Terminal 1 - Backend
cd backend
pip install -r ../requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Terminal 2 - Frontend
cd frontend
npm install
npm run dev
```

#### Option 2: Docker Compose (Production-ready)
Create a `docker-compose.yml` in the root directory for orchestrated deployment of both services.
