# Timer Architecture

Client-side countdown timers that merely decrement a `timeLeft` integer are vulnerable to browser reloads, tab throttling, and client clock manipulation.

## Timestamp-Based Design
The platform calculates remaining duration using absolute Unix timestamps:

```ts
totalDurationSeconds = durationMinutes * 60;
endTimeMs = startedAtMs + (totalDurationSeconds * 1000);
remainingSeconds = Math.max(0, Math.ceil((endTimeMs - Date.now()) / 1000));
```

## Behavior on Events
- **Page Refresh:** End time remains fixed (`startedAtMs` persisted in local storage & database). Remaining time is accurately recalculated upon page mount.
- **Browser Tab Sleep:** Upon waking up, the interval computes `endTimeMs - Date.now()`, instantly jumping to the true remaining time without lost seconds.
- **Timeout (remainingSeconds <= 0):** Automatically triggers `handleFinalSubmission(true)`, locks the attempt, displays a notification toast, and redirects to results.
