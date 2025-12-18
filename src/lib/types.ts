export type Hostel = {
    id: string;
    name: string;
    totalRooms: number;
    totalCapacity: number;
    totalApprovedUsers: number;
    isFull: boolean;
    approvedUsers: string[]; // Changed to string
    pendingUsers: string[]; // Changed to string
    rejectedUsers: string[]; // Changed to string
    rooms: {
        id: string;
        name: string;
        maxSize: number;
        currentUsers: number;
        userStatuses: {
            userId: string;
            status: string;
        }[]
    }[]
}

export type Room = {
    id: string;
    name: string;
    maxSize: number;
    currentUsers: number;
    hostelId: string | null;
}

export type NewRoomState = {
    name: string;
    maxSize: string;
    hostelId: string | null;
};