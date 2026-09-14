export type GeometryLineStyle = 'solid' | 'dashed' | 'dotted';
export type GeometryTone = 'default' | 'primary' | 'muted' | 'success' | 'warning';
export type GeometryFill = 'none' | 'primary' | 'muted' | 'success' | 'warning';

export type GeometryPoint = {
  id: string;
  x: number;
  y: number;
  label?: string;
  label_dx?: number;
  label_dy?: number;
  hidden?: boolean;
};

export type GeometrySegment = {
  from: string;
  to: string;
  style?: GeometryLineStyle;
  tone?: GeometryTone;
  arrows?: 'none' | 'start' | 'end' | 'both';
  ticks?: number;
  parallel_marks?: number;
  label?: string;
  label_dx?: number;
  label_dy?: number;
};

export type GeometryPolygon = {
  points: string[];
  fill?: GeometryFill;
  opacity?: number;
  style?: GeometryLineStyle;
  tone?: GeometryTone;
};

export type GeometryCircle = {
  center: string;
  radius: number;
  style?: GeometryLineStyle;
  tone?: GeometryTone;
  label?: string;
};

export type GeometryArc = {
  center: string;
  radius: number;
  start_angle: number;
  end_angle: number;
  style?: GeometryLineStyle;
  tone?: GeometryTone;
  label?: string;
};

export type GeometryEllipse = {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  rotation?: number;
  style?: GeometryLineStyle;
  tone?: GeometryTone;
  fill?: GeometryFill;
  opacity?: number;
};

export type GeometryPath = {
  d: string;
  style?: GeometryLineStyle;
  tone?: GeometryTone;
  fill?: GeometryFill;
  opacity?: number;
};

export type GeometryAngle = {
  from: string;
  vertex: string;
  to: string;
  radius?: number;
  label?: string;
  double?: boolean;
  tone?: GeometryTone;
};

export type GeometryRightAngle = {
  at: string;
  from?: string;
  to?: string;
  size?: number;
};

export type GeometryLabel = {
  x: number;
  y: number;
  text: string;
  align?: 'start' | 'middle' | 'end';
  tone?: GeometryTone;
};

export type GeometryAxes = {
  origin_x: number;
  origin_y: number;
  unit_x?: number;
  unit_y?: number;
  x_min: number;
  x_max: number;
  y_min: number;
  y_max: number;
  grid?: boolean;
  x_label?: string;
  y_label?: string;
};

export type GeometryPlot = {
  points: Array<[number, number]>;
  style?: GeometryLineStyle;
  tone?: GeometryTone;
};

export type GeometryDiagram = {
  type: 'geometry';
  width: number;
  height: number;
  alt: string;
  points: GeometryPoint[];
  segments: GeometrySegment[];
  polygons: GeometryPolygon[];
  circles: GeometryCircle[];
  arcs: GeometryArc[];
  ellipses: GeometryEllipse[];
  paths: GeometryPath[];
  angles: GeometryAngle[];
  right_angles: GeometryRightAngle[];
  labels: GeometryLabel[];
  axes?: GeometryAxes;
  plots: GeometryPlot[];
};
