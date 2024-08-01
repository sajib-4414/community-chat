export const SOCKET_CONNECTED = "connect"
export const SOCKET_DISCONNECTED = "disconnect"
export const SOCKET_CONNECTION_ERROR = "connect_error"
export const USER_CAME_ONLINE = "some_user_came_online"
export const ONLINE_STATUS_BROADCAST_FROM_SERVER = "user_sockets_status_broadcast"

export enum ROOM_TYPE {
    ONE_TO_ONE = "one_to_one",
    GROUP_CHAT = "group_chat",
    CHANNEL_CHAT = "channel_chat"
}

export enum MESSAGE_TYPES{
    SYSTEM_MSG = "system_message",
    USER_MSG = "user_message"
}