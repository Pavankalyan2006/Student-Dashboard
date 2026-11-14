import { toast } from 'sonner';

/**
 * Copies text to the clipboard. Browsers can refuse (no permission, insecure context, older
 * browser); instead of an unhandled rejection the student gets a clear message.
 * Resolves true when the copy succeeded.
 */
export async function copyText(text: string): Promise<boolean> {
  try {
    if (!navigator.clipboard?.writeText) throw new Error('Clipboard not available');
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Callers that do not await may already have shown "Copied"; replace it with the real outcome.
    toast.dismiss();
    toast.error('Could not copy. Your browser blocked clipboard access; select the text and copy it manually.');
    return false;
  }
}
