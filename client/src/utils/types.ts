export type Thread = {
    id: string;
    title: string;
    lastMessageAt: number;
    unreadCount?: number;
};

export type Message = {
    id: string;
    threadId: string;
    text: string;
    createdAt: number;
};

export type MessagesPage = {
    items: Message[];
    nextCursor: number | null;
};
