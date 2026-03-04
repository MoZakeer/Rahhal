

export interface ReportDetail {
  reportId: string;
  reporterUserName?: string;
  type?: string;
  createdDate: string;
  description?: string;
  reporterPicture?: string;
}

export interface ReportApiResponse {
  data: {
    reportInfo?: ReportDetail[];
    items?: ReportDetail[];
  };
}