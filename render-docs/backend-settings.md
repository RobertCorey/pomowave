# Backend Settings

This document contains the configuration settings for the Node.js server in Render.

## Web Service: `backend`

### General Information

| Setting | Value |
|---------|-------|
| Name | backend |
| Service Type | Node |
| Plan | Free |
| Region | Virginia (US East) |
| CPU | 0.1 CPU |
| Memory | 512 MB |
| Public URL | https://pomowave.onrender.com |

### Build & Deploy Configuration

| Setting | Value |
|---------|-------|
| Repository | https://github.com/RobertCorey/pomowave |
| Branch | main |
| Git Credentials | robertbcorey@gmail.com |
| Root Directory | server |

### Build Commands

| Command Type | Value |
|-------------|-------|
| Build Command | `npm run build:render` |
| Pre-Deploy Command | *Not set* |
| Start Command | `npm run start` |
| Auto-Deploy | Yes |

### Monitoring & Health

| Setting | Value |
|---------|-------|
| Health Check Path | /healthz |
| Service Notifications | Use workspace default (Only failure notifications) |
| Preview Environment Notifications | Use account default (Disabled) |
| Maintenance Mode | Disabled |

### Other Settings

- **Custom Domains**: Service is available at https://pomowave.onrender.com
- **PR Previews**: Off
- **Deploy Hook**: *Hidden for security reasons*