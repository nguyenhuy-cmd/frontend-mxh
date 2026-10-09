export type UserRole = 'admin' | 'user';
export interface User {
    id: string;
    email: string;
    username: string;
    role: UserRole;
}
export interface Author {
    _id: string;
    username: string;
    email?: string;
}
export interface Post {
    _id: string;
    title: string;
    content: string;
    author: Author | string;
    createdAt: string;
    updatedAt: string;
}
export interface Comment {
    _id: string;
    content: string;
    post: string;
    author: Author | string;
    createdAt: string;
    updatedAt: string;
}
export interface Meta {
    current: number;
    pageSize: number;
    pages: number;
    total?: number;
}
export interface ListResult<T> {
    meta: Meta;
    result: T[];
}
