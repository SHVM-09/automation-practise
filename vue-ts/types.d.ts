export interface TrackableFile {
  file: string
  gitRepoFilePath: string
  lastUpdatedAt: string
}
export type Tracker = TrackableFile[]
