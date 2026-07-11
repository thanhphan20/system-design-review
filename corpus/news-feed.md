---
title: News Feed / Timeline
---

## Scenario Summary

A social feed where users see posts from people/accounts they follow, ordered roughly by recency or relevance.

## Assumed Requirements

- Extremely read-heavy: each post is written once but read (viewed in feeds) many times, especially for popular accounts.
- Highly skewed fan-out: most accounts have few followers, a small number have millions ("celebrity" problem).
- Feed reads must be fast (low, consistent latency) since they're the primary, repeated user interaction.
- Some staleness in the feed is acceptable (a post appearing a few seconds late is fine); strong consistency is not required.
- Write availability matters (posting should rarely fail), more than write latency.

## Reference Design

- Fan-out-on-write for most accounts: when a user posts, the post ID is pushed into the precomputed feed/timeline of each follower, so reads are a cheap lookup of an already-materialized list.
- Fan-out-on-read (or a hybrid) for accounts with very large follower counts: rather than writing to millions of follower feeds synchronously, celebrity posts are fetched and merged into the requesting user's feed at read time, to avoid a single write triggering millions of downstream writes.
- A queue/async worker layer decouples the act of posting from the fan-out work, so posting stays fast and available even while fan-out for a popular account is still in progress.
- Feed reads hit a precomputed/cached structure (e.g. a per-user feed cache) rather than querying and joining across the full post/follow graph on every request.

## Trade-offs

- Pure fan-out-on-write is simple but breaks down for celebrity accounts (a single post fanning out to millions of feed writes); the hybrid approach adds branching logic but avoids that write amplification cliff.
- Async fan-out via a queue means a follower's feed may not include a brand-new post instantly — an explicit, accepted trade against the staleness-tolerant requirement above.
- Precomputing feeds trades storage (duplicated post references across many followers' feeds) for read speed; this is the right trade only because reads dominate writes by a wide margin.
