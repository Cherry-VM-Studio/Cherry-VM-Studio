---
title: "Database"
weight: 3
---

# Database

This project uses expanded Apache Guacamole's PostgreSQL Database.

## Deployed tables

### administrators

> This table contains data of the administrative users.
> | Field | Type | Constraints | Default |
> | :------------ | :---------- | :--------------------------- | :--------------- |
> | uuid | UUID | PRIMARY KEY | RANDOM UUID |
> | username | VARCHAR(24) | UNIQUE NOT NULL | - |
> | password | VARCHAR(60) | NOT NULL | - |
> | name | VARCHAR(50) | - | - |
> | surname | VARCHAR(50) | - | - |
> | email | VARCHAR(255)| UNIQUE | - |
> | creation_date | DATE | NOT NULL | CURRENT DATE |
> | last_active | TIMESTAMP | - | - |
> | disabled | BOOLEAN | - | FALSE |

### clients

> This table contains data of the client users.
> | Field | Type | Constraints | Default |
> | :------------ | :---------- | :--------------------------- | :--------------- |
> | uuid | UUID | PRIMARY KEY | RANDOM UUID |
> | username | VARCHAR(24) | UNIQUE NOT NULL | - |
> | password | VARCHAR(60) | NOT NULL | - |
> | name | VARCHAR(50) | - | - |
> | surname | VARCHAR(50) | - | - |
> | email | VARCHAR(255)| UNIQUE | - |
> | creation_date | DATE | NOT NULL | CURRENT DATE |
> | last_active | TIMESTAMP | - | - |
> | disabled | BOOLEAN | - | FALSE |

### roles

> This table contains data of administrative roles deployed in the application and the permissions they grant.
> | Field | Type | Constraints | Default |
> | :---------- | :---------- | :------------ | :---------- |
> | uuid | UUID | PRIMARY KEY | RANDOM UUID |
> | name | VARCHAR(50) | UNIQUE | - |
> | permissions | INT | - | 0 |

### groups

> This table contains data of groups of client users.
> | Field | Type | Constraints | Default |
> | :---- | :---------- | :---------- | :---------- |
> | uuid | UUID | PRIMARY KEY | RANDOM UUID |
> | name | VARCHAR(50) | UNIQUE | - |

### administrators_roles

> This table links the administrators to the roles they are granted with.
> | Field | Type | Constraints | Default |
> | :----------------- | :--- | :---------------------------------------------- | :------ |
> | administrator_uuid | UUID | PRIMARY KEY, FOREIGN KEY → administrators(uuid) | - |
> | role_uuid | UUID | PRIMARY KEY, FOREIGN KEY → roles(uuid) | - |

### clients_groups

> This table matches the clients with the groups they belong to.
> | Field | Type | Constraints | Default |
> | :---------- | :--- | :------------------------------------------ | :------ |
> | client_uuid | UUID | PRIMARY, FOREIGN KEY → clients(uuid) | - |
> | group_uuid | UUID | PRIMARY, FOREIGN KEY → groups(uuid) | - |

### deployed_machines_owners

> This table links the machines with their owners (administrative accounts).
> | Field | Type | Constraints | Default |
> | :---------- | :--- | :----------------------------------------- | :------ |
> | machine_uuid| UUID | PRIMARY KEY | - |
> | owner_uuid | UUID | FOREIGN KEY → administrators(uuid) | - |
> | started_at | TIMESTAMP | - | - |

### deployed_machines_clients

> This table links the clients with the machines they were assigned to by the machines' owners.
> | Field | Type | Constraints | Default |
> | :---------- | :--- | :--------------------------------------- | :------ |
> | machine_uuid| UUID | PRIMARY KEY, FOREIGN KEY → deployed_machines_owners(machine_uuid) | - |
> | client_uuid | UUID | PRIMARY KEY, FOREIGN KEY → clients(uuid) | - |

### network_panel_states

> This table stores the node positions within the network panel, enabling users to reopen the panel and restore their customized layout.
> | Field | Type | Constraints | Default |
> | :--------- | :---- | :---------------------------------------------- | :------ |
> | owner_uuid | UUID | PRIMARY KEY, FOREIGN KEY → administrators(uuid) | - |
> | positions | JSONB | NOT NULL | - |

### network_snapshots

> This table contains saved snapshots of the network panel.

> - _positions field is responsible for saving the positions of nodes in the network panel_
> - _intnets saves the actual machine - intnet connections_

> | Field      | Type        | Constraints                        | Default           |
> | :--------- | :---------- | :--------------------------------- | :---------------- |
> | uuid       | UUID        | PRIMARY KEY                        | RANDOM UUID       |
> | owner_uuid | UUID        | FOREIGN KEY → administrators(uuid) | -                 |
> | name       | VARCHAR(24) | UNIQUE NOT NULL                    | -                 |
> | created_at | TIMESTAMP   | NOT NULL                           | CURRENT TIMESTAMP |
> | intnets    | JSONB       | NOT NULL                           | -                 |
> | positions  | JSONB       | NOT NULL                           | -                 |

### iso_files

> This table contains records of ISO files uploaded to the system.
> | Field | Type | Constraints | Default |
> | :--------- | :---------- | :----------------------------------------- | :---------------- |
> | uuid | UUID | PRIMARY KEY | gen_random_uuid() |
> | name | VARCHAR(24) | UNIQUE, NOT NULL | — |
> | remote | BOOLEAN | — | — |
> | file_name | TEXT | — | — |
> | file_location | TEXT | — | — |
> | file_size_bytes | BIGINT | — | 0 |
> | last_used | TIMESTAMP | — | — |
> | imported_by | UUID | FOREIGN KEY → administrators(uuid) | — |
> | imported_at | TIMESTAMP | — | — |
> | last_modified_by | UUID | FOREIGN KEY → administrators(uuid) | — |
> | last_modified_at | TIMESTAMP | — | — |

### machine_templates

> This table contains saved machine templates. These templates can be later used for setting configuration data during machine creation.
> | Field | Type | Constraints | Default |
> | :----------- | :---------- | :--------------------------------------------------------------- | :------------------ |
> | uuid | UUID | PRIMARY KEY | gen_random_uuid() |
> | owner_uuid | UUID | NOT NULL, FOREIGN KEY → administrators(uuid) | — |
> | name | VARCHAR(24) | UNIQUE, NOT NULL | — |
> | ram | INT | NOT NULL | 0 |
> | vcpu | INT | NOT NULL | 0 |
> | created_at | TIMESTAMP | NOT NULL | NOW() |

### machine_snapshots

> This table contains saved machine snapshots. These snapshots can be later used during creation of the new virtual machines.
> | Field | Type | Constraints | Default |
> | :--------- | :---------- | :----------------------------------------- | :---------------- |
> | uuid | UUID | PRIMARY KEY | RANDOM UUID |
> | owner_uuid | UUID | FOREIGN KEY → administrators(uuid) | - |
> | name | VARCHAR(24) | UNIQUE NOT NULL | - |
> | created_at | TIMESTAMP | NOT NULL | CURRENT TIMESTAMP |
> | size | BIGINT | - | 0 |

### machine_snapshots_shares

> This table links saved machine snapshots to the administrators they are shared with.
> | Field | Type | Constraints | Default |
> | :------------ | :--- | :----------------------------------------- | :------ |
> | snapshot_uuid | UUID | PRIMARY KEY, FOREIGN KEY → machine_snapshots(uuid) | - |
> | recipient_uuid| UUID | PRIMARY KEY, FOREIGN KEY → administrators(uuid) | - |
