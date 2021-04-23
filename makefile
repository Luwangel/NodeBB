.PHONY: default help install start logs stop

default: help

help:
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | gawk 'match($$0, /(makefile:)?(.*):.*?## (.*)/, a) {printf "\033[36m%-30s\033[0m %s\n", a[2], a[3]}'

start: ## Start the NodeBB server
	./nodebb dev

start-db: ## Start the NodeBB database
	docker-compose up -d

stop-db: ## Stop the NodeBB database
	docker-compose down

logs: ## View server output
	./nodebb log
