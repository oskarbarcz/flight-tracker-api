export const AUTO_APPROVAL_MIN_MINUTES = 20;
export const AUTO_APPROVAL_MAX_MINUTES = 40;

export const AUTO_APPROVAL_MAX_AGE_MINUTES = 24 * 60;

export function autoApprovalDeadlineMinutes(requestId: string): number {
  let hash = 0;
  for (let i = 0; i < requestId.length; i++) {
    hash = (hash * 31 + requestId.charCodeAt(i)) | 0;
  }
  const span = AUTO_APPROVAL_MAX_MINUTES - AUTO_APPROVAL_MIN_MINUTES + 1;
  return AUTO_APPROVAL_MIN_MINUTES + (Math.abs(hash) % span);
}
