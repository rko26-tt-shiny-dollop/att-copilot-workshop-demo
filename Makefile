.PHONY: install dev dev-api dev-frontend build test lint e2e clean

install:
	cd api && npm install
	cd frontend && npm install

## Run API (:3000) and frontend (:5137) together
dev:
	( cd api && npm run dev ) & ( cd frontend && npm run dev ) & wait

dev-api:
	cd api && npm run dev

dev-frontend:
	cd frontend && npm run dev

build:
	cd api && npm run build
	cd frontend && npm run build

test:
	cd api && npm test

lint:
	cd api && npm run lint
	cd frontend && npm run lint

e2e:
	cd frontend && npm run test:e2e

clean:
	rm -rf api/node_modules api/dist frontend/node_modules frontend/dist
