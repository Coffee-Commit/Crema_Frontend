// Materials Panel 관련 타입 정의

export interface JobSeekerInfo {
  name: string
  position: string
  experience: string
  skills: string[]
  introduction: string
  userId?: number
}

export interface MaterialError {
  code: string
  message: string
  statusCode?: number
}

export interface FileData {
  file: File
  id: string
  name: string
  size: number
  type: string
  lastModified: number
}

export interface UploadResponse {
  success: boolean
  data?: {
    imageKey: string
    imageUrl: string
    uploadedAt: string
    fileSize: number
  }
  error?: MaterialError
}

export interface MaterialUploadEvent {
  target: {
    files: FileList | null
  }
}

export interface MaterialsState {
  jobSeekerInfo: JobSeekerInfo | null
  isLoading: boolean
  error: MaterialError | null
  uploadedFiles: FileData[]
}

// File upload 관련 타입
export interface FileUploadProgress {
  fileId: string
  progress: number
  status: 'uploading' | 'completed' | 'error'
}

export interface DragEvent extends React.DragEvent<HTMLDivElement> {
  dataTransfer: DataTransfer
}

export interface ChangeEvent
  extends React.ChangeEvent<HTMLInputElement> {
  target: HTMLInputElement & {
    files: FileList | null
  }
}
