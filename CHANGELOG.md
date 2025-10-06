# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2025-10-06

### Added
- **Review Posting Functionality**: Added `postGuestReview()` method to post reviews for guests
- **Session-based Authentication**: Added `login()` method for web app API authentication
- **Session Cookie Management**: Implemented cookie handling for authenticated requests
- New `LoginData` interface for login credentials
- New `PostGuestReviewData` interface for review posting with category ratings
- Support for web app base URL configuration (`webAppBaseUrl`)
- Operator ID configuration and automatic extraction from login response
- Example script for review posting in `examples/review-posting.ts`

### Changed
- Updated `HostexClientConfig` to include optional `webAppBaseUrl` and `operatorId` parameters
- Enhanced documentation with instructions for finding operator ID and using login flow

### Technical Details
- Review posting uses undocumented `/api/reservation_comment/send_comment` endpoint
- Requires session-based authentication via email/password login
- Web app API uses different response format (error_code: 0 for success vs 200)

## [0.1.1] - 2025-01-04

### Fixed
- Integration tests date ranges
- CommonJS require export for Node.js compatibility

## [0.1.0] - 2025-01-04

### Added
- Initial release
- Complete TypeScript client for Hostex API v3.0.0 (Beta)
- Support for Properties, Room Types, Reservations, Availability, Listings, Conversations, Reviews, and Webhooks
- Full TypeScript type definitions
- Integration tests
- Examples for basic usage, reservation management, and messaging
