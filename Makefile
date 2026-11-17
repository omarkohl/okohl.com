.DEFAULT_GOAL := help
.PHONY: help install dev build preview format format-check check test precommit clean

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*## ' $(MAKEFILE_LIST) | awk -F':.*## ' '{printf "  %-14s %s\n", $$1, $$2}'

install: ## Install dependencies
	npm install

dev: ## Start dev server at http://localhost:4321
	npm run dev

build: ## Build site and search index into dist/
	npm run build

preview: ## Serve the built site locally
	npm run preview

format: ## Format all files with Prettier
	npm run format

format-check: ## Check formatting without changing files
	npm run format:check

check: ## Type-check with astro check
	npm run check

test: ## Run unit tests
	npm test

precommit: test check format-check build ## Run tests, type check, format check and build

clean: ## Remove build output (dist/ and .astro/)
	rm -rf dist .astro
