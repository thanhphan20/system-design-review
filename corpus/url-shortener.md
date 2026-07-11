---
title: URL Shortener
---

## Scenario Summary

A service that takes a long URL and returns a short alias; visiting the short URL redirects to the original.

## Assumed Requirements

- Read-heavy: redirects (reads) vastly outnumber shorten requests (writes), often 100:1 or higher.
- Low write volume relative to typical DAU (creating a short link is a deliberate, infrequent action).
- Redirect latency must be very low (sub-100ms) since it sits on the critical path of every click.
- Strong consistency is not required for the mapping to become visible; eventual consistency is acceptable for freshly created links.
- Uniqueness of the short code must be guaranteed (no collisions).

## Reference Design

- A key-value store (or a simple relational table with an indexed lookup on the short code) holding `short_code -> long_url`.
- Short codes generated via a base62 encoding of an auto-incrementing counter, or a hash of the long URL with collision-checking — not randomly regenerated on every collision, since collisions should be rare and cheaply detectable.
- A cache (in-memory or a dedicated cache layer) in front of the datastore for the redirect (read) path, since redirects are the dominant traffic and benefit the most from cache hits.
- Redirect endpoint is a thin, cache-first read path: check cache, fall back to datastore on miss, populate cache on the way back.
- Write path (creating a short link) does not need to be low-latency or cached; it can go straight to the datastore.

## Trade-offs

- Using an auto-incrementing counter for code generation is simple and collision-free, but requires a centralized counter (or a coordination scheme) if the write path is sharded across multiple regions.
- Caching favors read latency but introduces a consistency lag: a newly created link may briefly miss cache and hit the datastore directly, which is acceptable given the eventual-consistency requirement above.
- Optimizing heavily for redirect latency (the read path) at the expense of write-path complexity is the right trade for this read:write ratio; a system with a very different ratio would warrant reconsidering where the caching/indexing effort goes.
