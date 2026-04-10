.PHONY: dev frontend backend install

dev:
	@lsof -ti:8000 | xargs kill -9 2>/dev/null; true
	@trap 'kill 0' SIGINT; \
	(cd backend && .venv/bin/uvicorn main:app --reload --port 8000) & \
	(cd frontend && npm run dev) & \
	wait

backend:
	cd backend && .venv/bin/uvicorn main:app --reload --port 8000

frontend:
	cd frontend && npm run dev

install:
	cd backend && python3 -m venv .venv && .venv/bin/pip install -r requirements.txt
	cd frontend && npm install
