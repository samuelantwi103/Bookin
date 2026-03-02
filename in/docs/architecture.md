# Project Architecture — Campus Facility Booking System

> **Course**: CPEN 412 — Web Software Architecture, University of Ghana
> **Stack**: Spring Boot 4.0.2 | Java 17 | Maven | Aiven PostgreSQL | MVC

## Overview

A **Campus Facility Booking System** allowing users to view facilities, check availability in 30-minute time slots, and create/manage bookings. Admins can manage facilities and monitor bookings.

## Database Configuration

Secrets are stored in `.env` (gitignored). Spring Boot loads them via `spring.config.import`.

| Variable | Description |
|----------|-------------|
| `DB_HOST` | Aiven PostgreSQL host |
| `DB_PORT` | Port (15571) |
| `DB_NAME` | Database name (defaultdb) |
| `DB_USERNAME` | Username (avnadmin) |
| `DB_PASSWORD` | Password (user-provided) |

## Database Schema (3NF)

All tables follow **3rd Normal Form** — no transitive dependencies, all non-key attributes depend solely on the primary key.

| Entity | Table | Key Fields | Relationships |
|--------|-------|-----------|---------------|
| `Facility` | `facilities` | `id`, `name`, `location`, `capacity` | Has many Bookings |
| `User` | `users` | `id`, `name`, `email` (unique), `role` | Has many Bookings |
| `Booking` | `bookings` | `id`, `facility_id` (FK), `user_id` (FK), `date`, `start_time`, `end_time`, `status` | Belongs to Facility, Belongs to User |

## MVC Layers

| Layer | Package | Responsibility |
|-------|---------|---------------|
| **Model** | `com.book.in.model` | JPA Entities (ORM mapping) |
| **Repository** | `com.book.in.repository` | Spring Data JPA interfaces |
| **Service** | `com.book.in.service` | Business logic, conflict detection |
| **Controller** | `com.book.in.controller` | REST endpoints, validation |
| **DTO** | `com.book.in.dto` | Request/Response objects |
| **Exception** | `com.book.in.exception` | Error handling |

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/users` | List all users |
| `GET` | `/users/{id}` | Get specific user |
| `POST` | `/users` | Create a user |
| `PUT` | `/users/{id}` | Update a user |
| `DELETE` | `/users/{id}` | Delete a user |
| `GET` | `/facilities` | List all facilities |
| `GET` | `/facilities/{id}` | Get specific facility |
| `POST` | `/facilities` | Create a facility |
| `PUT` | `/facilities/{id}` | Update a facility |
| `DELETE` | `/facilities/{id}` | Delete a facility |
| `GET` | `/bookings` | List all bookings |
| `POST` | `/bookings` | Create booking |
| `PUT` | `/bookings/{id}` | Update booking |
| `DELETE` | `/bookings/{id}` | Cancel booking |
| `GET` | `/availability` | Check availability by date/facility |

## Changelog

| Date | Description |
|------|-------------|
| 2026-02-17 | Initial setup: .env config, application.properties, 3 JPA entities (Facility, User, Booking) |
