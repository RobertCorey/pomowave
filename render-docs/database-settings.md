# Database Settings

This document contains the configuration settings for the key-value database created in the Render account.

## Key Value Instance: `database`

### General Information

| Setting | Value |
|---------|-------|
| Name | database |
| Status | available |
| Maxmemory Policy | allkeys-lru (recommended for caches) |
| Region | Virginia |
| Runtime | Valkey 8.0.2 |

### Instance Type

| Setting | Value |
|---------|-------|
| Plan | Free |
| RAM | 25 MB |
| Connection Limit | 50 |

### Connection Information

| Connection Type | URL/Command |
|----------------|-------------|
| Internal Key Value URL | `redis://red-cvpfcn3e5dus73cg45r0:6379` |
| External Key Value URL | *Add IP addresses in the Access Control section* |
| Valkey CLI Command | *Add IP addresses in the Access Control section* |

### Access Control

0 IP ranges are allowed from outside of your private network.

**Note:** To allow external connections, you need to add allowed IP addresses in the Access Control section of the Render Dashboard.