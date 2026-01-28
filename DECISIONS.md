### How to run the app locally
Install dependencies using your preferred package manager (I used npm)
```cd server && npm install```
```cd client && npm install```

Start both server(4000 by default) and client(3000 by default)
```npm run dev```

Visit `http://localhost:3000` on your browser


# Assumptions & Trade-offs

## In-Memory Data Store

All thread and message data is stored in memory and resets when the server restarts.

**Trade-off:** This simplifies the API and makes the SSE behavior deterministic for a take-home project. In a production environment, data would be persisted in a database and message consistency would need to account for concurrent writers.

## Cursor based on createdAt

Messages are paginated using a cursor derived from createdAt

**Trade-off:** This keeps pagination simple. In a production system, a monotonic message ID or database cursor would be safer to avoid possible issues with timezones.

## Server-Sent Events(SSE) over WebSockets

Real-time updates are one-way from server to client, and limited to new messages per thread

**Trade-off:** SSE is simpler and sufficient for this use case. Websockets, though more complex, would be more flexible for a two way interaction and high frequency interactions, like in a production environment.

## Reliance on React Query

Request cancellation is handled through React Query's AbortSignal integration

**Trade-off:** This was to avoid manual AbortController management. Easily couples cancellation behaviour with React Query and keeps the logic easy and consistent.

## Client-Side search

Thread search is performed client side

**Trade-off:** This is fine for the current dataset size. On a larger scale, search is more likely to be on the server-side with indexing and debouncing, resulting in accurate searches on larger datasets.


#Decisions

## Handling large numbers of messages
The API currently seeds one thread with 25k messages to validate performance under load.
Rendering a large number of rows as normal React elements slow scroll performance, create large DOM trees and expensive layout.

I rendered messaging using Virtualisation through react-window to keep rendering limited to the visible viewport and allows scrolling to fetch more messages.

## Scroll Anchoring and New Messages behaviour

When older messages are loaded (prepended to the top), the user's scroll position must be preserved to prevent jumps. I capture scroll metrics (`scrollHeight`, `scrollTop`) before fetching older messages, then use `useLayoutEffect` to adjust the scroll position by the height difference after prepending. This runs synchronously after DOM mutations but before paint, ensuring smooth visual continuity.

I track whether the user is at the bottom using a ref `atBottomRef` updated on every scroll event. When a new message arrives, `useLayoutEffect` checks this ref and only auto-scrolls if the user was already at the bottom. A small delay (100ms) before showing the "New messages" pill prevents it from flashing during auto-scroll. A separate "Scroll to bottom" button appears whenever the user manually scrolls up, providing consistent navigation back to the latest messages.

## Race Conditions & Cancellation
Cancellation matters because stale requests can resolve late and overwrite state for a new thread causing UI inconsistencies.

I used useInfiniteQuery provided by React Query, with `threadId` as part of the query key. When a query key changes, React Query cancels in-flight requests for the old key, and the HTTP requests are aborted.
The query function also receives an AbortSignal and passes it directly to the axios function.

## React State Management / Lifecycle Hooks
I used React Query for request deduping, consistent loading/error state handling, built-in cancellation support for AbortSignal, easier real-time updates to states and API calls without useEffect.

I used useMemo to avoid unnecessary rerenders with threads and their respective messages, especially during infinite loading in useInfiniteQuery and making our client-side search.

I used useCallback to avoid function recreations especially with all the scroll listeners, we need a stable reference to avoid the page jumping, infinite loops and UI inconstencies.

I used useRef to keep track of scroll states mostly, for example, if user is at the bottom of the message list, or tracking ID of the last message in order to detect new messages.


NOTES: Didn't use `unreadCount` as it was optional but instead implemented real-time "New messages" indicators that appear when messages arrive while the user is scrolled up.

In a production environment with `unreadCount` support, I would:
Store `unreadCount` per thread per user in the database, incrementing it when new messages arrive via SSE.
When broadcasting via SSE, increment `unreadCount` for all users subscribed to that thread (except the sender).
When the user scrolls to the bottom or views the thread, send a request to mark messages as read and reset `unreadCount` to 0.
Show the count in the thread list and update the `New messages" button to display "2 new messages" instead.

Also need to debounce read-status updates to avoid excessive API calls when scrolling, and batch updates in the case of multiple messages arriving quickly. 

Edge Case: Handling multiple tabs (might have to use BroadcastChannel or localStorage to sync counts), reconnections (fetch latest count on reconnect), and race conditions (use optimistic updates with rollback).
