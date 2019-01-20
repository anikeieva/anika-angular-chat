export function getChatRoomStorageToken (id) {
  return `CHAT_ROOM_ID=${id}_STORAGE_TOKEN`;
}

export function getDirectRoomStorageToken (fromId, toId) {
  return `CHAT_ROOM_from=${fromId}_to=${toId}_STORAGE_TOKEN`;
}

export function getUserStorageToken (id) {
  return `USER_ID=${id}_STORAGE_TOKEN`;
}

export const currentUserToken = 'CURRENT_USER_id_TOKEN';
