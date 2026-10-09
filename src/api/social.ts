import type { Comment, ListResult, Post, User } from '../types'
import { api, buildQuery } from './client'

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  username: string
  email: string
  password: string
}

export interface LoginResponse {
  access_token: string
  user: User
}

export function login(payload: LoginPayload): Promise<LoginResponse> {
  return api<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function register(payload: RegisterPayload): Promise<User> {
  return api<User>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export interface PostQuery {
  current?: number
  limit?: number
  title?: string
  author?: string
}

export function fetchPosts(query: PostQuery = {}): Promise<ListResult<Post>> {
  const qsObj: Record<string, string> = {}
  if (query.title) qsObj['qs[title]'] = query.title
  if (query.author) qsObj['qs[author]'] = query.author

  const search = buildQuery({
    current: query.current,
    limit: query.limit,
    ...qsObj,
  })
  return api<ListResult<Post>>(`/posts/post${search}`)
}

export interface CreatePostPayload {
  title: string
  content: string
  authorId: string
}

export function createPost(payload: CreatePostPayload): Promise<Post> {
  return api<Post>('/posts/post', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function fetchPost(id: string): Promise<Post> {
  return api<Post>(`/posts/${id}`)
}

export function updatePost(
  id: string,
  payload: { title?: string; content?: string },
): Promise<Post> {
  return api<Post>(`/posts/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

export function deletePost(id: string): Promise<Post> {
  return api<Post>(`/posts/${id}`, { method: 'DELETE' })
}

export function fetchComments(
  postId: string,
  page = 1,
  limit = 20,
): Promise<ListResult<Comment>> {
  const search = buildQuery({
    current: page,
    limit,
    'qs[post]': postId,
  })
  return api<ListResult<Comment>>(`/comments/posts${search}`)
}

export function createComment(
  postId: string,
  content: string,
): Promise<Comment> {
  return api<Comment>(`/comments/posts/${postId}/comments`, {
    method: 'POST',
    body: JSON.stringify({ content }),
  })
}

export function deleteComment(id: string): Promise<Comment> {
  return api<Comment>(`/comments/${id}`, { method: 'DELETE' })
}
