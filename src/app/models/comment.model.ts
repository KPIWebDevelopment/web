export interface Comment {
  id?: string;
  content: string;
  postId: string;
  userId: string;
  username?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
