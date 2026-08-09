export interface SocialPost {
    id: number;
    author: {
        id: number;
        name: string;
        avatar: string;
        username: string;
        role?: string;
        isVerified?: boolean;
    };
    title?: string;
    content: string;
    images?: string[];
    video?: string;
    likes: number;
    comments: number;
    shares: number;
    isLiked: boolean;
    isSaved: boolean;
    createdAt: Date;
    tags?: string[];
    type: 'post' | 'question' | 'event' | 'announcement';
    privacy: 'public' | 'friends' | 'private';
    isExpanded?: boolean;
}

export interface SocialMember {
    id: number;
    name: string;
    username: string;
    avatar: string;
    role: string;
    company?: string;
    followers: number;
    following: number;
    posts: number;
    isFollowing: boolean;
    isOnline: boolean;
    isVerified?: boolean;
}

export interface SocialEvent {
    id: number;
    title: string;
    description: string;
    date: Date;
    location: string;
    type: 'online' | 'offline';
    maxParticipants: number;
    currentParticipants: number;
    image: string;
    organizer: string;
    isRegistered: boolean;
}

export interface SocialGroup {
    id: number;
    name: string;
    description: string;
    icon: string;
    members: number;
    posts: number;
    isJoined: boolean;
    isPrivate: boolean;
}

export interface SocialComment {
    id: number;
    author: {
        id: number;
        name: string;
        avatar: string;
        username: string;
    };
    content: string;
    likes: number;
    isLiked: boolean;
    createdAt: Date;
    replies?: SocialComment[];
}