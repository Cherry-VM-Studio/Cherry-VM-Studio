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

## Administrators

The main role of administrative accounts is to provide access to functionalities such as creating machines or assigning groups of clients to created environments.

An administrator with base permissions can create and manage their own library of virtual machines. They can also create snapshots and templates for those machines. Every administrator can see all other accounts, but special permission is required to manage them. Administrators may also access, create and manage client groups.

### Special permissions

Administrative accounts can be elevated through additional permissions. A set of available permissions (listed in the table below) can be granted to administrators through roles.

Only administrators with the `MANAGE_ADMIN_USERS` permission can assign roles to themselves or to other administrators. An administrator cannot assign or revoke permissions that they do not possess. The system also prevents accidental permission loss by ensuring that no permission becomes unassigned and unreachable.

#### Permissions

| ID  |           Name            |                                                                      Description                                                                      |
| :-: | :-----------------------: | :---------------------------------------------------------------------------------------------------------------------------------------------------: |
|  1  |    `VIEW_ALL_MACHINES`    |                                                     Allows viewing machines owned by other users.                                                     |
|  2  |   `MANAGE_ALL_MACHINES`   |                                Allows creating, modifying, changing state and deleting machines owned by other users.                                 |
|  3  |   `MANAGE_CLIENT_USERS`   |                                                Allows creating, managing and deleting client accounts.                                                |
|  4  |   `MANAGE_ADMIN_USERS`    | Allows creating, managing, and deleting administrative accounts. Accounts with permissions that the administrator does not possess cannot be removed. |
|  5  | `CHANGE_CLIENT_PASSWORD`  |                                                     Grants ability to change clients' passwords.                                                      |
|  6  |  `CHANGE_ADMIN_PASSWORD`  |                                                  Grants ability to change administrators' passwords.                                                  |
|  7  |    `MANAGE_ISO_FILES`     |                                                     Provides access to managing global ISO files.                                                     |
|  8  | `MANAGE_SYSTEM_RESOURCES` |                                                    Permission reserved for future functionalities.                                                    |

#### Roles

The table below lists all default roles available for administrators. It is currently not possible to create custom roles. This functionality will be introduced in a future release together with Cherry Policies.

|             Role name              |                   Permissions                    |
| :--------------------------------: | :----------------------------------------------: |
|          Machine Observer          |               `VIEW_ALL_MACHINES`                |
|          Machine Manager           |    `VIEW_ALL_MACHINES` `MANAGE_ALL_MACHINES`     |
|      Client Accounts Manager       |              `MANAGE_CLIENT_USERS`               |
|  Administrative Accounts Manager   |               `MANAGE_ADMIN_USERS`               |
|      Global Accounts Manager       |    `MANAGE_CLIENT_USERS` `MANAGE_ADMIN_USERS`    |
|     Client Credentials Manager     |             `CHANGE_CLIENT_PASSWORD`             |
| Administrative Credentials Manager |             `CHANGE_ADMIN_PASSWORD`              |
|     Global Credentials Manager     | `CHANGE_CLIENT_PASSWORD` `CHANGE_ADMIN_PASSWORD` |
|         Iso Files Manager          |                `MANAGE_ISO_FILES`                |
|   System Resources Administrator   |            `MANAGE_SYSTEM_RESOURCES`             |

#### How can I limit administrators resource access?

Currently it is not possible to restrict administrators access to resources and functionalities within the application. This feature will be introduced along with Cherry Policies in a future release.

## Clients

The purpose of client accounts is to provide access for users who do not need to manage their own resources. Resources assigned to clients are fully managed by administrators. This type of account is ideal for students in educational institutions or testers in debugging environments.

Clients can control the operational state of virtual machines assigned to them, such as starting or shutting them down. However, they cannot create, remove, or modify virtual machines.

Clients are also allowed to change their own passwords.

> If your environment requires client users to manage virtual machines, it is recommended to provide administrative accounts instead with only the minimal permissions necessary.

> Support for granting higher levels of access to client accounts is planned. This functionality will be introduced alongside Cherry Policies in a future release.

### Groups

Client groups are a core component of Cherry VM Studio automation. Administrators can create groups and assign clients to them, then reference these groups when provisioning virtual machines in bulk. Groups are global, meaning they are visible and manageable by all administrators.

## Attribute Requirements

This section defines the constraints and validation rules applied to user account properties. It specifies the required structure, allowed characters, and length limits for fields such as usernames, names, email addresses, and passwords. These rules ensure consistency, prevent invalid input, and maintain compatibility across the system.

### User Account Validation Rules

| Field        | Requirement / Constraint                                                                                                             | Example / Notes                      |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------ |
| **Username** | 3–24 characters; must start with a letter; only alphanumeric characters, underscores (`_`), hyphens (`-`), and periods (`.`) allowed | `john_doe`, `Alice-123`, `user.name` |
| **Password** | Minimum 12 characters; must include at least one digit, one lowercase letter, one uppercase letter, and one special character        | `P@ssword1234!`                      |
| **Name**     | Maximum 50 characters                                                                                                                | `John`, `Alice Marie`                |
| **Surname**  | Maximum 50 characters                                                                                                                | `Doe`, `Smith-Jones`                 |
| **Email**    | Must be unique (if provided)                                                                                                         | `user@example.com`                   |

### Group Validation Rules

| Field    | Requirement / Constraint              | Example / Notes          |
| -------- | ------------------------------------- | ------------------------ |
| **Name** | Maximum 50 characters; must be unique | `Testers`, `Lab Group A` |
