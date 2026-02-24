---
title: Account system
weight: 2
---

# Account System

## Introduction

**Cherry VM Studio** uses its own internal account system, fully managed from the administrative web panel. The system is integrated with **Apache Guacamole** to provide centralized authentication across the platform.

[Learn more](#more-on-guacamole-synchronization)

The platform enforces a clear separation between **administrative** and **client** accounts.

- Administrators can create and manage resources, such as virtual machines, and assign them to client accounts.
- Privileged administrators have extended capabilities, including managing other user accounts and modifying system-wide settings.
- Clients are limited to using assigned resources: they can start, stop, and access virtual machines but cannot create or modify any system resources themselves.

[Learn more](#account-types)

## More on Guacamole Synchronization

When a user account is created or managed in CVMS, corresponding authentication data is synchronized with Guacamole. This integration enables logging in to virtual machines using CVMS credentials and seamless access to virtual machines directly from the CVMS web panel without requiring a second login prompt.

Although users can authenticate to Apache Guacamole using CVMS credentials, the reverse is not supported. For this reason, administrators should:

- Manage all user accounts exclusively through the CVMS administrative panel.

- Avoid creating or modifying user accounts directly in Guacamole.

- Treat CVMS as the single source of truth for authentication and authorization.

## Account Types

🚧 Work in progress

### Administrators

🚧 Work in progress

#### Base capabilities

🚧 Work in progress

#### Additional permissions

🚧 Work in progress

### Clients

🚧 Work in progress
