# WordPress Agent Skills Extension for Gemini CLI

This directory contains the repackaged WordPress Agent Skills as a Gemini CLI extension.

## Installation

You can install this extension directly from GitHub using the Gemini CLI:

```bash
gemini extensions install https://github.com/Xilonz/gemini-wordpress-agent-skills
```

## Development

### Local Installation

You can also install this extension locally for development:

```bash
gemini extensions install .
```

(Run this command from inside this `extensions/gemini-cli` directory)

## Development

The skills are sourced from the root `skills/` directory of this repository.
The `package.json` includes a `build` script that copies the skills into this directory for packaging.

```bash
npm run build
```
