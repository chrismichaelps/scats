# Contributing to scats

First off, thanks for taking the time to contribute! ❤️

All types of contributions are encouraged and valued. See the [Table of Contents](#table-of-contents) for different ways to help and details about how this project handles them. Please make sure to read the relevant section before making your contribution. It will make it a lot easier for us maintainers and smooth out the experience for all involved.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [I Have a Question](#i-have-a-question)
- [I Want To Contribute](#i-want-to-contribute)
  - [Reporting Bugs](#reporting-bugs)
  - [Suggesting Enhancements](#suggesting-enhancements)
  - [Your First Code Contribution](#your-first-code-contribution)
  - [Pull Requests](#pull-requests)
- [Development Guidelines](#development-guidelines)
  - [Commit Messages](#commit-messages)
  - [TypeScript Guidelines](#typescript-guidelines)
  - [Testing Guidelines](#testing-guidelines)

## Code of Conduct

This project and everyone participating in it is governed by the
[Code of Conduct](CODE_OF_CONDUCT.md).
By participating, you are expected to uphold this code.

## I Have a Question

Before you ask a question, it is best to search for existing [Issues](https://github.com/chrismichaelps/scats/issues) that might help you. In case you have found a suitable issue and still need clarification, you can write your question in this issue.

If you still feel the need to ask a question and need clarification, we recommend:

- Open an [Issue](https://github.com/chrismichaelps/scats/issues/new).
- Provide as much context as you can about what you're running into.
- Provide project and platform versions (nodejs, npm, etc), depending on what seems relevant.

## I Want To Contribute

### Reporting Bugs

#### Before Submitting a Bug Report

A good bug report shouldn't leave others needing to chase you up for more information. Therefore, we ask you to investigate carefully, collect information and describe the issue in detail in your report. Please complete the following steps in advance to help us fix any potential bug as fast as possible.

- Make sure that you are using the latest version.
- Determine if your bug is really a bug and not an error on your side.
- Check if other users have experienced (and potentially already solved) the same issue you are having.
- Collect information about the bug:
  - Stack trace (Traceback)
  - OS, Platform and Version (Windows, Linux, macOS, x86, ARM)
  - Version of the interpreter, compiler, SDK, runtime environment, package manager, depending on what seems relevant.
  - Your input and the output
  - Can you reliably reproduce the issue? And can you also reproduce it with older versions?

### Suggesting Enhancements

Enhancement suggestions are tracked as [GitHub issues](https://github.com/chrismichaelps/scats/issues).

- Use a **clear and descriptive title** for the issue to identify the suggestion.
- Provide a **step-by-step description of the suggested enhancement** in as many details as possible.
- **Describe the current behavior** and **explain which behavior you expected to see instead** and why.
- **Explain why this enhancement would be useful** to most users.

### Your First Code Contribution

1. Fork the repository
2. Clone your fork
3. Create a new branch: `git checkout -b my-feature-branch`
4. Make your changes
5. Run the tests: `npm test`
6. Push to your fork and submit a pull request

### Pull Requests

The process described here has several goals:

- Maintain the project's quality
- Fix problems that are important to users
- Enable a sustainable system for the project's maintainers to review contributions

Please follow these steps to have your contribution considered by the maintainers:

1. Follow all instructions in [the template](PULL_REQUEST_TEMPLATE.md)
2. Follow the [styleguides](#styleguides)
3. After you submit your pull request, verify that all [status checks](https://help.github.com/articles/about-status-checks/) are passing

## Development Guidelines

### Commit Messages

- Use the present tense ("Add feature" not "Added feature")
- Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit the first line to 72 characters or less
- Reference issues and pull requests liberally after the first line

### TypeScript Guidelines

- Write clean, readable, and self-documenting code
- Follow TypeScript best practices and patterns
- Maintain type safety and avoid using `any` type
- Document public APIs using JSDoc comments
- Keep functions small and focused
- Use meaningful variable names

### Testing Guidelines

- Write tests for all new features and bug fixes
- Maintain high test coverage
- Test edge cases and error conditions
- Use descriptive test names
- Follow the existing test patterns in the codebase

Thank you for contributing to scats! ❤️
