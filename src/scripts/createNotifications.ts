import { createPendingNotifications } from './createPendingNotifications';

// ID do Denis
const DENIS_ID = 'MwbZPKBPbpXtLj1fTz0YsJGSMko1';

async function main() {
  await createPendingNotifications(DENIS_ID);
}

main().catch(console.error);
