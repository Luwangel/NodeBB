.PHONY: default help install start logs stop

default: help

help:
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | gawk 'match($$0, /(makefile:)?(.*):.*?## (.*)/, a) {printf "\033[36m%-30s\033[0m %s\n", a[2], a[3]}'

start: ## Start the NodeBB server
	./nodebb start

start-db: ## Start the NodeBB server
	docker-compose up -d

restart: ## Restart the NodeBB server
	./nodebb restart

stop: ## Stop the NodeBB server
	./nodebb stop

logs: ## View server output
	./nodebb log
