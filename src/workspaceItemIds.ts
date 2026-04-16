/** DOM id + URL hash fragment for scrolling to a row after global search. */
export const WORKSPACE_ITEM_ID_PREFIX = 'cc-item-'

export function workspaceItemElementId(entityId: string): string {
  return `${WORKSPACE_ITEM_ID_PREFIX}${entityId}`
}
