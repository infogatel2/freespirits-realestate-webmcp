# Pre-existing Work vs. WebMCP Challenge Work

## Purpose

This document exists to make the challenge boundary explicit and auditable.

FreeSpirits Real Estate was already an active property marketplace before The WebMCP Challenge submission period began. The challenge submission is **not claiming the existing marketplace as newly created work**.

The competition-specific contribution is the new WebMCP-enabled Challenge Edition developed during the submission period.

## Pre-existing FreeSpirits Real Estate capabilities

The production application existed before August 25, 2026 and includes capabilities such as:

- Property listing creation and management
- Property search and filtering
- Property detail pages
- User accounts and authentication
- Favorites and enquiries
- Multilingual property content
- Images/media handling
- Property lifecycle and administration
- Marketplace administration
- Analytics and reporting functionality
- Production deployment and operational infrastructure

These capabilities provide the real-world domain and product context for the challenge extension, but they are not presented as challenge-period development.

## New work for The WebMCP Challenge

The following work is being designed and implemented after the challenge submission period began:

### 1. WebMCP tool layer

Structured WebMCP tools intended to include:

- `search_properties`
- `get_property_details`
- `compare_properties`
- `save_favorite`
- `prepare_enquiry`

### 2. Agent-oriented schemas

Purpose-built input/output contracts that allow an AI agent to interact with property data without relying on visual UI guessing.

### 3. Human-control boundaries

New challenge-specific interaction rules that distinguish safe read operations from actions that require user review or confirmation.

### 4. Challenge-safe data/API boundary

A controlled interface between the public Challenge Edition and property data, designed to avoid exposing production secrets or unrelated proprietary application internals.

### 5. Agent-native UX

A demonstration flow showing how a human and agent can jointly discover, inspect, compare, shortlist, and prepare an enquiry for real estate.

### 6. WebMCP testing and evaluation

Challenge-specific testing in WebMCP-capable environments, including schema validation, tool behavior, error handling, and judge-friendly testing instructions.

### 7. Public challenge repository and documentation

This public repository, its open-source Challenge Edition implementation, architecture documentation, test instructions, and demonstration material.

## Evidence strategy

Challenge work is recorded using Git commit timestamps in this public repository.

The repository was initialized on **August 27, 2026**, after the challenge submission period began on August 25, 2026.

Important milestones should be committed separately so reviewers can easily see the evolution of the WebMCP implementation.

## Production separation

The complete production FreeSpirits Real Estate source code is not part of this repository.

This repository must not contain:

- Production `.env` files
- API secrets
- Database credentials
- Payment credentials
- Private administrator functionality unrelated to the challenge
- Server credentials
- Private user data
- Proprietary production code not required to run or understand the Challenge Edition

## Challenge claim

The submission claim is intentionally narrow and verifiable:

> A pre-existing real estate marketplace was meaningfully extended during The WebMCP Challenge with a new, public, open-source agent interaction layer that lets humans and AI agents collaborate through structured WebMCP tools.

That new extension — rather than the prior marketplace itself — is the work being submitted for judging.
