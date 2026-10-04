.PHONY: install help

install:
ifeq ($(OS),Windows_NT)
	powershell -ExecutionPolicy Bypass -File ./scripts/install.ps1
else
	chmod +x ./scripts/install.sh
	./scripts/install.sh
endif

help:
	@echo "Available commands:"
	@echo "  make install  - bootstrap environment"
	@echo "  make help     - show this help"