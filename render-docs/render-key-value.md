# Render Key Value

Provision Redis®-compatible datastores for caching and job queues.

Render Key Value provides low-latency in-memory storage that's ideal for shared caches and job queues. Key Value instances are compatible with virtually all clients that interact with Redis®\*.

Paid Key Value instances include disk-backed persistence.

## Underlying Libraries

- Newly created Render Key Value instances run Valkey 8.
- Legacy Key Value instances (created before February 12, 2025) run Redis 6.
- Legacy instances no longer receive version updates, but they will continue to operate as usual.

## Quickstarts

These Render quickstarts include steps for provisioning a Key Value instance:

- Deploy a Celery background worker
- Deploy Rails with Sidekiq
- Rails caching with Redis
- Connecting to Render Key Value with ioredis

## Create Your Key Value Instance

1. Go to dashboard.render.com/new/redis, or select New > Key Value in the Render Dashboard.
2. Provide a helpful Name for your instance (you can change this value at any time).
3. Choose a Region to run your instance in (choose the same region as your services that will connect to the instance to minimize latency).
4. Optionally change the instance's Maxmemory Policy.
5. Select an instance type (determines available RAM and connection limit).
6. Click Create Key Value.

Your new instance's status updates to Available in the Render Dashboard when it's ready to use.

## Connect to Your Key Value Instance

Every Key Value instance has two different URLs for incoming connections:

- An internal URL for connections from your other Render services running in the same region
- An external URL for connections from everything else

Before you can use the external URL, you must first enable external connections for your Key Value instance.

Use the internal URL wherever possible. It minimizes latency by enabling communication over your private network.

Both URLs are available from the Connect menu in the top-right corner of your instance's page in the Render Dashboard.

Key Value instances use `redis://` and `rediss://` URL schemes. You can connect to your instance using any Redis-compatible client that supports these schemes.

### Internal Connection Example (sidekiq - Ruby)

```ruby
# Connect to your internal Redis instance using the REDIS_URL environment variable
# The REDIS_URL is set to the internal Redis URL e.g. redis://red-343245ndffg023:6379

Sidekiq.configure_server do |config|
  config.redis = {url: ENV.REDIS_URL}
end

Sidekiq.configure_client do |config|
  config.redis = {url: ENV.REDIS_URL}
end

# Simple example from https://github.com/mperham/sidekiq/wiki/Getting-Started
class HardJob
  include Sidekiq::Job
  
  def perform(name, count) # do something
  end
end

HardJob.perform_async('bob', 5)
```

## Enabling External Connections

By default, newly created Key Value instances are not reachable at their external URL. To keep your instance secure, you can grant external access to specific sets of IPs.

In the Render Dashboard, go to your Key Value instance's Info page and scroll down to the Access Control section. Here you can specify IP address blocks using CIDR notation.

**Note:**
- These rules apply only to connections that use your Key Value instance's external URL.
- Your Render services in the same region as your Key Value instance can always connect using your instance's internal URL.

If you attempt to connect from a disallowed IP address, your client will display an error like: `AUTH failed: Client IP address is not in the allowlist.`

## Connecting with CLI Tools

The redis-cli is a useful administrative tool for exploring and manipulating data on your Redis instance. There are 2 ways you can use redis-cli with your Redis instance:

1. If you have a running non-Docker service, redis-cli will be available as part of the environment and is accessible from the service's Shell page. The service must be in the same region as the Redis instance.
2. You can run redis-cli locally on your machine. You first need to install redis-cli onto your machine. A copy and pastable redis-cli command is available in the External Access section of your Redis settings.

External connections are TLS secured. The Redis CLI command provided will include the `--tls` flag.

Example commands:
```
oregon-redis.render.com:6379> set "render_is_cool" true
OK
oregon-redis.render.com:6379> get "render_is_cool"
"true"
oregon-redis.render.com:6379> KEYS r\*
1. "render_is_cool"
```

## Configure Your Key Value Instance

### Maxmemory Policy

Your Key Value instance's maxmemory policy determines which data it evicts to free space when it reaches its memory limit. You select a policy on instance creation and can change it later.

- For caching use cases, we recommend using `allkeys-lru`.
- For job queues, we recommend using `noeviction` to ensure that queued jobs are not lost.

Available policies:

| Option | Description | Can memory fill up? |
|--------|-------------|--------------------|
| allkeys-lru | Evict any key using approximated Least Recently Used (LRU). | No |
| noeviction | Don't evict data. Instead, return an error on write operations whenever the instance is out of memory. | Yes |
| volatile-lru | Evict using approximated LRU, only keys with an expire set. | Yes |
| volatile-lfu | Evict using approximated Least Frequently Used (LFU), only keys with an expire set. | Yes |
| allkeys-lfu | Evict any key using approximated LFU. | No |
| volatile-random | Remove a random key having an expire set. | Yes |
| allkeys-random | Remove a random key, any key. | No |
| volatile-ttl | Remove the key with the nearest expire time (minor TTL) | Yes |

## Changing Instance Types

You can upgrade your Key Value instance to a larger instance type with more RAM and a higher connection limit.

Note the following before you upgrade:

- It is not currently possible to downgrade a Key Value instance.
- Your Key Value instance will be unavailable for a minute or two during the upgrade.
- If you upgrade a Free Key Value instance, all of its data will be lost (because Free Key Value instances don't persist data to disk).

## Data Persistence

Paid Key Value instances on Render write their state to disk once per second via the configuration `appendfsync everysec`. If a paid instance experiences an interruption (or if you upgrade your instance type), you might lose up to one second of writes.

Free Key Value instances do not persist data to disk.

## Metrics

Metrics for memory usage, CPU load, and active connections are available for Key Value instances in the Render Dashboard. The default metrics granularity shown is 12 hours, which can be adjusted from 5 minutes to 1 week.

---

\*Redis is a registered trademark of Redis Ltd. Any rights therein are reserved to Redis Ltd. Any use by Render Inc is for referential purposes only and does not indicate any sponsorship, endorsement or affiliation between Redis and Render Inc.