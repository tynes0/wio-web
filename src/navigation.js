export function shouldCloseNavigationOnLeave(boundary, target) {
  // A null/Window relatedTarget means the pointer left the browser surface,
  // not that it entered another part of the page. Keep the menu available.
  return Boolean(
    boundary && target && typeof target.nodeType === 'number' && !boundary.contains(target),
  )
}
