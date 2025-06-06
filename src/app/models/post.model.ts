import { Comment } from './comment.model';

export interface Post {
  id?: string;
  title: string;
  content: string;
  imageUrl?: string;
  userId: string;
  username?: string;
  likes?: number;
  liked?: boolean;
  comments?: Comment[];
  createdAt?: Date;
  updatedAt?: Date;
}
