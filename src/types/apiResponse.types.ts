export interface IParsedResponse {
  annotations: any;
  currentFrame: number;
  video_time: string;
}

interface IAnnotationProps {
  id_nr: number;
  category_name: string;
  bbox: [number, number, number, number];
  area: string;
  segmentation: string[];
  confidence: string;
  real_NIO: boolean;
  defect_size_mm: string;
  operator_found: boolean;
}

interface ParsedDataProps {
  qr_val: string;
  distance: string;
  annotations: IAnnotationProps;
}
