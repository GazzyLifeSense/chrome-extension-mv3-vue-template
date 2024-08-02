export interface bookmarkNode {
  children: Array<bookmarkNode>
  dateAdded: number
  dateGroupModified?: number
  index?: string
  parentId?: string
  id: string
  title: string
  url?: string
}
