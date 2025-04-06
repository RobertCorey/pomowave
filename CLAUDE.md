# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands
- Client build: `cd client && npm run build`
- Client dev: `cd client && npm run dev`
- Client lint: `cd client && npm run lint`
- Client test: `cd client && npx playwright test`
- Client single test: `cd client && npx playwright test tests/example.spec.ts` (replace with specific test file)
- Server build: `cd server && npm run build`
- Server dev: `cd server && npm run dev`
- Server lint: `cd server && npm run lint`
- Server test: `cd server && npm test`
- Server single test: `cd server && npx jest src/path/to/test.ts` (replace with specific test file)

## Dev Environment
- The human will run server and client in separate terminals
- Server logs are available in `server/server-dev.log` 
- Client logs are available in `client/client-dev.log`
- Check these logs when investigating issues in the local development environment

## Code Style
- Use TypeScript with strict type checking
- Client: React functional components with hooks
- Follow existing naming conventions (camelCase for variables/functions, PascalCase for components/classes)
- Use async/await for asynchronous operations
- Use ES modules (import/export) syntax
- Ensure proper error handling with try/catch blocks
- Keep functions small and focused on a single responsibility
- Maintain consistent indentation (2 spaces)
- Add JSDoc comments for functions with complex logic