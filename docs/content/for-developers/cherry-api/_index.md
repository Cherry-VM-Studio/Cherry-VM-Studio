---
title: "Cherry API"
weight: 1
bookCollapseSection: true
---

# Cherry API

Cherry API is a core component of the CVMS Stack, serving as an intermediate layer that bridges the frontend with low-level backend solutions. It provides the web application with HTML and WebSocket endpoints, enabling secure and streamlined data transfer.

## Technologies

Cherry API is primarily built using functional Python, with certain modules following an object-oriented approach. Pydantic is used for defining data models and documenting variable types.<br/><br/>
The core of the API is built upon the FastAPI Library. Its other main dependencies include, but are not limited to:

- Libvirt Virtualization API - enabling direct interaction with virtual machines.
- Psycopg - responsible for connecting with the [CVMS' PostgreSQL Database](PostgreSQL-Database).
  <br/><br/>
