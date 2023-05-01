export interface TrackableFile {
  file: string
  gitRepoFilePath: string
  lastUpdatedAt: string
}
export type Tracker = TrackableFile[]

export interface OversizedFileStats {
  filePath: string;
  size: number
}

