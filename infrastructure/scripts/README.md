# Infrastructure scripts

This directory is reserved for maintenance and setup helpers used by the home server infrastructure.

The current repository keeps the service definitions and documentation in `stacks/`, while operational helpers such as Docker network creation or validation commands can live here.

## Current scope

- Docker network creation and verification;
- setup aid scripts for infrastructure bootstrap;
- host-level validation helpers.

## Important rule

Scripts must not contain secrets, private keys, or production credentials. Any sensitive values must be injected from the host environment or from a secure secret store.
