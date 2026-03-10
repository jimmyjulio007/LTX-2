export interface Folder {
  id: string;
  name: string;
  parent_id: string | null;
  sort_order: number;
}
