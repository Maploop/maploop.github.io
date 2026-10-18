# Links analytics

`ARCHIVE/script/links/script.js` is the single analytics entry point for `/links`.
It sends readable reports to the existing Discord webhook and raw JSON to a separate
webhook. No external fingerprinting library
or jQuery is required.

## Identity and counting

- `visitorId`: a cryptographically random UUID stored in `links.visitor.v1` in
  first-party local storage. It stays the same across visits and tabs in the same
  browser profile, regardless of IP address, window size, or browser updates.
- `identityScope`: `browser` when local storage works, `tab` when only session
  storage works, or `page` when both are blocked. Interpret unique counts using
  this scope; temporary IDs cannot reliably distinguish returning visitors.
- `sessionId`: stored in session storage for the tab's lifetime, not an inactivity
  based session. Browsers may copy session storage when duplicating a tab.
- `pageViewId`: new for each page load; shared by its click and enrichment events.
- `eventId`: new for each event, suitable for deduplicating ingested records.
- `visitorHistory.lastVisit`: the previous visit time, or null on the first visit.
  Visit counts are local to the stored identity. Simultaneous tabs can race when
  updating local storage, so count received page-view events for reporting totals.

This is a stored browser identifier, not a device-derived fingerprint or a verified
person identity. Clearing site data, private browsing, another browser, or another
device can produce another ID. Shared browser profiles share an ID. There is no
attempt to reconstruct an ID after storage is cleared.

## Events

| Event | Meaning |
| --- | --- |
| `page_view` | One immediate event per page load; network status starts as pending. |
| `visitor_context` | IP lookup result, joined to the visit using `pageViewId`; do not count as another visit. |
| `link_click` | Activation of a `data-track` link/button, including middle-clicks on links. Discord records the copy attempt, not confirmed clipboard success. |
| `engagement` | Cumulative foreground seconds and maximum scroll depth, sent when hidden or leaving. Use the maximum values per `pageViewId`, not their sum. |

IP/location enrichment tries [ipwho.is](https://ipwhois.io/documentation), then
[ipapi](https://ipapi.co/api/). If neither returns a usable public IP, it tries
[ipify](https://www.ipify.org/)'s dual-stack endpoint followed by its IPv4 endpoint.
Each request has a 4-second timeout, bypasses cached responses, and omits credentials
and the referrer. A public IP already obtained is retained if later location lookup
fails. IP and location are always taken from the same provider response.

Raw data includes `network.lookups` with each attempted provider's result, including
HTTP errors, timeouts, network/CORS failures, and invalid responses. Local/private,
documentation, and malformed addresses are rejected. Location is an approximate
IP-based estimate, not GPS; VPNs/proxies expose their exit IP and its location.
If all providers fail, status remains unavailable rather than inventing a location.
Network data never determines visitor identity, and its lookup does not delay visits
or clicks.

The existing webhook receives only a readable report in message content. The new raw
webhook receives only the event's JSON embed. Both are built from the same event
snapshot, are sent independently, and share the same page-view ID. The report
summarizes the event, visitor ID and identity scope, new/returning status, device,
referrer/campaign, and available network information. Click reports name the action;
engagement reports show cumulative active time and maximum scroll. Pending or failed
network lookups are labeled explicitly, and locations are marked approximate.

Webhook events use bounded JSON in Discord embeds, disable mentions, and use fetch
with keepalive for navigation. Delivery failures are logged; events are not retried
because an ambiguous failure may already have been accepted. Browser shutdown,
blockers, offline visits, and webhook rate limits can still lose events. There is
no server acknowledgement store or exactly-once delivery guarantee.

Both webhook URLs are stored as AES-256-GCM ciphertext rather than plaintext. Web
Crypto decrypts them on HTTPS (or localhost) before sending. Because the decryption
key must also ship to the browser, this only obscures the URLs in source; visitors
can recover them or inspect network requests. A server-side collector with secrets
outside the public repository is needed to keep webhook URLs confidential and
implement durable delivery, validation, and centralized reporting.

## Verification

Run `node tests/links-analytics.test.cjs`. Tests intercept all network calls; they do
not send webhook messages or contact IP services.
