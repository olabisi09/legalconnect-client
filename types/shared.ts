// Backend: com.legalconnect.common.ApiResponse<T>
export interface ApiResponse<T> {
  success: boolean;
  message: string | null;
  data: T;
  timestamp: string;
}

// Backend: com.legalconnect.common.ApiError
export interface ApiError {
  errorCode: string | null;
  code: string;
  message: string;
  status: number;
  path: string;
  traceId: string;
  timestamp: string;
  details?: ApiFieldError[];
}

export interface ApiFieldError {
  field: string;
  reason: string;
  code: string;
}

// Backend: com.legalconnect.common.PagedResponse<T>
// Frozen contract — do not modify
export interface PagedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    size: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

export interface SharedParams {
  page?: number;
  size?: number;
  sort?: string;
  direction?: "asc" | "desc";
}

export interface AdvancedPageResponse<T> {
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  size: number;
  content: T[];
  number: number;
  sort: Sort[];
  numberOfElements: number;
  pageable: Pageable;
  empty: boolean;
}

interface Pageable {
  offset: number;
  sort: Sort[];
  pageNumber: number;
  pageSize: number;
  paged: boolean;
  unpaged: boolean;
}

interface Sort {
  direction: string;
  nullHandling: string;
  ascending: boolean;
  property: string;
  ignoreCase: boolean;
}
