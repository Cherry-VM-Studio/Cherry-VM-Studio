---
title: "WebSockets"
weight: 1
---

# WebSockets

WebSockets are a crucial element of the Cherry API, enabling frontend interface integration and synchronization.

## Connection

To connect to any WebSocket endpoint, you must include your authentication token as an access_token parameter when establishing the connection. Please note that if your token expires during an active session, you will be disconnected with error code `4401`.

## Disconnection codes

Below is a short guide to common disconnect codes shared by each websocket in the application.

| Code | Title                 | Description                                                                                                    |
| ---- | --------------------- | -------------------------------------------------------------------------------------------------------------- |
| 1000 | Undefined/Custom      | -                                                                                                              |
| 1011 | Internal server error | Returned on server-side exception.                                                                             |
| 4401 | Unauthorized          | Indicates issues with the user authentication token. Often returned on token validation failure or expiration. |
| 4403 | Forbidden             | Resource requires elevated permissions to access.                                                              |

## Machine WebSockets

The following WebSocket endpoints provide real-time machine data streams within the application:

- `/ws/machines/subscribed` – streams data for machines explicitly subscribed to by the client
- `/ws/machines/account` – streams data for all machines owned by or assigned to the currently authenticated user
- `/ws/machines/global` – streams data for all machines available in the system. Requires `VIEW_ALL_VMS` permission.

Each message follows the unified format below:

```json
{
    "uuid": "Unique message identifier",
    "type": "Message type",
    "body": "Message body content",
    "timestamp": "ISO 8601 Timestamp"
}
```

### Message types

The following table describes all WebSocket message types, their payload formats, trigger conditions, and purpose.

| Type                     | Body format                             | Sent on                                                       | Description                                                                           |
| ------------------------ | --------------------------------------- | ------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| CREATE                   | `MachinePropertiesPayload`              | Successful machine creation                                   | Static properties of a newly created machine.                                         |
| DELETE                   | `{ uuid }`                              | Successful machine deletion                                   | Identifies a removed machine.                                                         |
| DATA_STATIC              | `dict[UUID, MachinePropertiesPayload]`  | WebSocket connection<br/>Successful properties modification   | Static properties keyed by machine UUID. Full set on connect; single entry on update. |
| DATA_DYNAMIC             | `dict[UUID, MachineStatePayload]`       | WebSocket connection<br/>Every 1s                             | Dynamic machine state keyed by machine UUID.                                          |
| DATA_DYNAMIC_DISKS       | `dict[UUID, MachineDisksPayload]`       | WebSocket connection<br/>WebSocket connection<br/>Every 2 min | Disk state data keyed by machine UUID.                                                |
| DATA_DYNAMIC_CONNECTIONS | `dict[UUID, MachineConnectionsPayload]` | WebSocket connection<br/>Every 10s                            | Network connection data keyed by machine UUID.                                        |
| BOOTUP_START             | `{ uuid }`                              | Bootup initiated                                              | Indicates boot process start.                                                         |
| BOOTUP_SUCCESS           | `{ uuid }`                              | Bootup completed                                              | Indicates successful boot.                                                            |
| BOOTUP_FAIL              | `{ uuid, error }`                       | Bootup failure                                                | Indicates failed boot with error details.                                             |
| SHUTDOWN_START           | `{ uuid }`                              | Shutdown initiated                                            | Indicates shutdown process start.                                                     |
| SHUTDOWN_SUCCESS         | `{ uuid }`                              | Shutdown completed                                            | Indicates successful shutdown.                                                        |
| SHUTDOWN_FAIL            | `{ uuid, error }`                       | Shutdown failure                                              | Indicates failed shutdown with error details.                                         |

### Important Notes

#### `/ws/machines/subscribed`

- When a subscribed machine is deleted, a `DELETE` message is sent. Dynamic broadcasts for that machine stop, but the WebSocket connection remains open.
- `CREATE` messages are not emitted on this WebSocket.
