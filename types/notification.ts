export interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  resourceType: string;
  resourceId: string;
  read: boolean;
  readAt: string;
  createdAt: string;
}
