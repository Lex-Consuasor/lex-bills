# Lex Consuasor

A lightweight, open-source library for evaluating and advising on complex rule-based policies. Lex Consuasor helps you define, validate, and execute decision logic in a declarative, human-readable format, making it perfect for permission systems, feature flags, and workflow automation.

## Overview

Lex Consuasor (Latin for "Law Advisor") provides a robust engine to parse and execute conditional rules without writing cumbersome `if-else` blocks. It allows developers to define rules as JSON or YAML, evaluate them against input context, and receive a clear, structured output that advises on the next steps. It is framework-agnostic and works in both Node.js and browser environments.

## Features

- **Declarative Rule Engine**: Define rules in JSON/YAML with a clean, expressive syntax.
- **Asynchronous Support**: Natively handles async conditions and actions.
- **Pluggable Advisors**: Extend the core engine with custom condition operators and action handlers.
- **Detailed Evaluation Report**: Returns a full trace of which rules passed, failed, and why.
- **Zero Dependencies**: Lightweight and fast, with no external runtime requirements.

## Tech Stack

- JavaScript (ES6+)
- Node.js (>= 14)
- Jest (for testing)
- ESLint (for code linting)

## Setup

```bash
git clone https://github.com/username/lex-consuasor.git
cd lex-consuasor
npm install
