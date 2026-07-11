---
title: Rate Limiter
---

## Scenario Summary

A component that limits how many requests a client (user, API key, or IP) can make within a time window, rejecting or throttling requests over the limit.

## Assumed Requirements

- Must be checked on (or very near) every incoming request, so the check itself must be extremely low-latency and cheap.
- Needs to work correctly across multiple application server instances (the limiter's state can't be purely local to one process, or a client could bypass the limit by hitting different instances).
- Approximate accuracy is usually acceptable (being off by a small margin under high concurrency is fine); strict exactness is rarely a hard requirement.
- High availability matters more than perfect precision: if the rate limiter itself becomes a bottleneck or single point of failure, it can take down all traffic, not just the misbehaving clients.

## Reference Design

- Shared, centralized counter state (e.g. an in-memory data store optimized for atomic increments) rather than per-instance local counters, so the limit is enforced consistently regardless of which server instance handles a request.
- A windowed counting algorithm (fixed window, sliding window log, or sliding window counter/token bucket) — token bucket or sliding-window-counter are usually preferred over naive fixed windows, which allow bursts right at window boundaries.
- The limiter check sits early in the request path (e.g. at a gateway/middleware layer) so rejected requests are turned away cheaply, before reaching more expensive downstream processing.
- Counter state uses a short TTL/expiry matching the rate-limit window, so it doesn't accumulate unbounded stale entries for inactive clients.

## Trade-offs

- Centralizing counter state in a shared store adds a network hop to every request and makes that store's availability critical; this is accepted because the alternative (per-instance local limiting) doesn't actually enforce a global limit.
- Token bucket / sliding window counter are more complex to implement than a fixed window counter, but fixed windows allow a client to burst up to 2x the intended limit at window boundaries — an explicit trade of implementation simplicity against limiting precision.
- Favoring availability of the rate limiter over perfect accuracy means occasionally letting a few extra requests through is preferable to the limiter itself becoming a chokepoint that rejects legitimate traffic.
