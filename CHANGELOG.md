# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Future improvements and features

## [0.1.1-alpha.0] - 2025-05-07

### Added

- Package rename to `sca-ts`
- Updated project configuration
- Improved documentation
- Added version management scripts

## [0.1.0] - 2025-05-07

### Added

- Initial release
- **Core Types**
  - Option, Either, Try implementations
  - Tuple implementation with Tuple2 and Tuple3
- **Pattern Matching**
  - Comprehensive pattern matching inspired by Scala 3
  - Pattern extractors and combinators
- **Collections**
  - Immutable collections (List, Map, Set)
  - LazyList for lazy evaluation
  - Vector for efficient indexed access
- **Functional Programming Tools**
  - For-comprehensions for monadic composition
  - Type Classes with extension methods
  - Ordering type-class for comparison operations
- **Resource Management**
  - Using utility for automatic resource closing
- **Monads**
  - State monad for functional state management
  - Writer monad for accumulating logs alongside computations
- **Validation**
  - Validated type for accumulating errors
- **Configuration**
  - Project setup with TypeScript
  - Testing infrastructure
  - Version management

[Unreleased]: https://github.com/chrismichaelps/scats/compare/v0.1.1-alpha.0...HEAD
[0.1.1-alpha.0]: https://github.com/chrismichaelps/scats/compare/v0.1.0...v0.1.1-alpha.0
[0.1.0]: https://github.com/chrismichaelps/scats/releases/tag/v0.1.0
