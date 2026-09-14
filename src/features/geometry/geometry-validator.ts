import type {
  GeometryAxes,
  GeometryDiagram,
  GeometryFill,
  GeometryLineStyle,
  GeometryTone,
} from './types';

type UnknownRecord = Record<string, unknown>;

const LINE_STYLES: GeometryLineStyle[] = ['solid', 'dashed', 'dotted'];
const TONES: GeometryTone[] = ['default', 'primary', 'muted', 'success', 'warning'];
const FILLS: GeometryFill[] = ['none', 'primary', 'muted', 'success', 'warning'];
const SVG_PATH_PATTERN = /^[MmLlHhVvCcSsQqTtAaZz0-9eE+.,\s-]+$/;

function isRecord(value: unknown): value is UnknownRecord {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function finite(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function text(value: unknown, max = 120) {
  return typeof value === 'string' && value.trim() && value.length <= max ? value.trim() : undefined;
}

function list(record: UnknownRecord, key: string, errors: string[], max = 120): unknown[] {
  const value = record[key];
  if (value === undefined) return [];
  if (!Array.isArray(value)) {
    errors.push(`diagram.${key} phải là một mảng.`);
    return [];
  }
  if (value.length > max) errors.push(`diagram.${key} chỉ được có tối đa ${max} phần tử.`);
  return value.slice(0, max);
}

function lineStyle(value: unknown): GeometryLineStyle | undefined {
  return LINE_STYLES.includes(value as GeometryLineStyle) ? value as GeometryLineStyle : undefined;
}

function tone(value: unknown): GeometryTone | undefined {
  return TONES.includes(value as GeometryTone) ? value as GeometryTone : undefined;
}

function fill(value: unknown): GeometryFill | undefined {
  return FILLS.includes(value as GeometryFill) ? value as GeometryFill : undefined;
}

function bounded(value: unknown, fallback: number, min: number, max: number) {
  return finite(value) ? Math.min(max, Math.max(min, value)) : fallback;
}

export function validateGeometryDiagram(value: unknown): { diagram?: GeometryDiagram; errors: string[] } {
  if (value === undefined || value === null) return { errors: [] };
  const errors: string[] = [];
  if (!isRecord(value)) return { errors: ['diagram phải là một đối tượng JSON.'] };
  if (value.type !== 'geometry') errors.push('diagram.type phải là "geometry".');

  const width = bounded(value.width, 360, 160, 1200);
  const height = bounded(value.height, 260, 120, 1000);
  const alt = text(value.alt, 240);
  if (!alt) errors.push('diagram.alt phải mô tả ngắn gọn hình cho người dùng trình đọc màn hình.');

  const pointIds = new Set<string>();
  const points = list(value, 'points', errors, 80).flatMap((item, index) => {
    if (!isRecord(item) || !text(item.id, 24) || !finite(item.x) || !finite(item.y)) {
      errors.push(`diagram.points[${index}] cần id, x, y hợp lệ.`);
      return [];
    }
    const id = text(item.id, 24)!;
    if (pointIds.has(id)) {
      errors.push(`diagram.points có id "${id}" bị trùng.`);
      return [];
    }
    pointIds.add(id);
    return [{
      id,
      x: item.x as number,
      y: item.y as number,
      label: text(item.label, 40),
      label_dx: finite(item.label_dx) ? item.label_dx : undefined,
      label_dy: finite(item.label_dy) ? item.label_dy : undefined,
      hidden: item.hidden === true,
    }];
  });

  const hasPoint = (id: unknown, path: string): id is string => {
    if (typeof id === 'string' && pointIds.has(id)) return true;
    errors.push(`${path} tham chiếu điểm không tồn tại.`);
    return false;
  };

  const segments = list(value, 'segments', errors).flatMap((item, index) => {
    const record: UnknownRecord | null = Array.isArray(item) && item.length === 2
      ? { from: item[0], to: item[1] }
      : isRecord(item) ? item : null;
    if (!record || !hasPoint(record.from, `diagram.segments[${index}].from`) || !hasPoint(record.to, `diagram.segments[${index}].to`)) return [];
    const arrows = ['none', 'start', 'end', 'both'].includes(String(record.arrows)) ? record.arrows as 'none' | 'start' | 'end' | 'both' : undefined;
    return [{
      from: record.from as string,
      to: record.to as string,
      style: lineStyle(record.style),
      tone: tone(record.tone),
      arrows,
      ticks: finite(record.ticks) ? Math.round(bounded(record.ticks, 0, 0, 3)) : undefined,
      parallel_marks: finite(record.parallel_marks) ? Math.round(bounded(record.parallel_marks, 0, 0, 3)) : undefined,
      label: text(record.label, 60),
      label_dx: finite(record.label_dx) ? record.label_dx : undefined,
      label_dy: finite(record.label_dy) ? record.label_dy : undefined,
    }];
  });

  const polygons = list(value, 'polygons', errors, 60).flatMap((item, index) => {
    if (!isRecord(item) || !Array.isArray(item.points) || item.points.length < 3 || !item.points.every((id) => hasPoint(id, `diagram.polygons[${index}].points`))) {
      errors.push(`diagram.polygons[${index}] cần ít nhất 3 điểm hợp lệ.`);
      return [];
    }
    return [{ points: item.points as string[], fill: fill(item.fill), opacity: finite(item.opacity) ? bounded(item.opacity, .14, 0, 1) : undefined, style: lineStyle(item.style), tone: tone(item.tone) }];
  });

  const circles = list(value, 'circles', errors, 40).flatMap((item, index) => {
    if (!isRecord(item) || !hasPoint(item.center, `diagram.circles[${index}].center`) || !finite(item.radius) || item.radius <= 0) {
      errors.push(`diagram.circles[${index}] cần tâm và bán kính dương.`);
      return [];
    }
    return [{ center: item.center as string, radius: item.radius, style: lineStyle(item.style), tone: tone(item.tone), label: text(item.label, 60) }];
  });

  const arcs = list(value, 'arcs', errors, 60).flatMap((item, index) => {
    if (!isRecord(item) || !hasPoint(item.center, `diagram.arcs[${index}].center`) || !finite(item.radius) || item.radius <= 0 || !finite(item.start_angle) || !finite(item.end_angle)) {
      errors.push(`diagram.arcs[${index}] cần tâm, bán kính và hai góc hợp lệ.`);
      return [];
    }
    return [{ center: item.center as string, radius: item.radius, start_angle: item.start_angle, end_angle: item.end_angle, style: lineStyle(item.style), tone: tone(item.tone), label: text(item.label, 60) }];
  });

  const ellipses = list(value, 'ellipses', errors, 40).flatMap((item, index) => {
    if (!isRecord(item) || !finite(item.cx) || !finite(item.cy) || !finite(item.rx) || !finite(item.ry) || item.rx <= 0 || item.ry <= 0) {
      errors.push(`diagram.ellipses[${index}] cần cx, cy, rx, ry hợp lệ.`);
      return [];
    }
    return [{ cx: item.cx, cy: item.cy, rx: item.rx, ry: item.ry, rotation: finite(item.rotation) ? item.rotation : undefined, style: lineStyle(item.style), tone: tone(item.tone), fill: fill(item.fill), opacity: finite(item.opacity) ? bounded(item.opacity, .14, 0, 1) : undefined }];
  });

  const paths = list(value, 'paths', errors, 40).flatMap((item, index) => {
    if (!isRecord(item) || !text(item.d, 4000) || !SVG_PATH_PATTERN.test(String(item.d))) {
      errors.push(`diagram.paths[${index}].d không phải dữ liệu SVG path an toàn.`);
      return [];
    }
    return [{ d: String(item.d), style: lineStyle(item.style), tone: tone(item.tone), fill: fill(item.fill), opacity: finite(item.opacity) ? bounded(item.opacity, .14, 0, 1) : undefined }];
  });

  const angles = list(value, 'angles', errors, 60).flatMap((item, index) => {
    if (!isRecord(item) || !hasPoint(item.from, `diagram.angles[${index}].from`) || !hasPoint(item.vertex, `diagram.angles[${index}].vertex`) || !hasPoint(item.to, `diagram.angles[${index}].to`)) return [];
    return [{ from: item.from as string, vertex: item.vertex as string, to: item.to as string, radius: finite(item.radius) ? bounded(item.radius, 24, 8, 80) : undefined, label: text(item.label, 40), double: item.double === true, tone: tone(item.tone) }];
  });

  const right_angles = list(value, 'right_angles', errors, 40).flatMap((item, index) => {
    if (!isRecord(item) || !hasPoint(item.at, `diagram.right_angles[${index}].at`)) return [];
    if (item.from !== undefined && !hasPoint(item.from, `diagram.right_angles[${index}].from`)) return [];
    if (item.to !== undefined && !hasPoint(item.to, `diagram.right_angles[${index}].to`)) return [];
    return [{ at: item.at as string, from: item.from as string | undefined, to: item.to as string | undefined, size: finite(item.size) ? bounded(item.size, 14, 6, 40) : undefined }];
  });

  const labels = list(value, 'labels', errors, 80).flatMap((item, index) => {
    if (!isRecord(item) || !finite(item.x) || !finite(item.y) || !text(item.text, 120)) {
      errors.push(`diagram.labels[${index}] cần x, y và text hợp lệ.`);
      return [];
    }
    const align = ['start', 'middle', 'end'].includes(String(item.align)) ? item.align as 'start' | 'middle' | 'end' : undefined;
    return [{ x: item.x, y: item.y, text: text(item.text, 120)!, align, tone: tone(item.tone) }];
  });

  let axes: GeometryAxes | undefined;
  if (value.axes !== undefined && value.axes !== null) {
    const item = value.axes;
    if (!isRecord(item) || !finite(item.origin_x) || !finite(item.origin_y) || !finite(item.x_min) || !finite(item.x_max) || !finite(item.y_min) || !finite(item.y_max) || item.x_min >= item.x_max || item.y_min >= item.y_max) {
      errors.push('diagram.axes cần gốc tọa độ và miền x/y hợp lệ.');
    } else {
      axes = { origin_x: item.origin_x, origin_y: item.origin_y, unit_x: bounded(item.unit_x, 28, 8, 120), unit_y: bounded(item.unit_y, 28, 8, 120), x_min: item.x_min, x_max: item.x_max, y_min: item.y_min, y_max: item.y_max, grid: item.grid === true, x_label: text(item.x_label, 12), y_label: text(item.y_label, 12) };
    }
  }

  const plots = list(value, 'plots', errors, 20).flatMap((item, index) => {
    if (!isRecord(item) || !Array.isArray(item.points) || item.points.length < 2 || item.points.length > 300 || !item.points.every((point) => Array.isArray(point) && point.length === 2 && finite(point[0]) && finite(point[1]))) {
      errors.push(`diagram.plots[${index}] cần từ 2 đến 300 cặp tọa độ số.`);
      return [];
    }
    return [{ points: item.points as Array<[number, number]>, style: lineStyle(item.style), tone: tone(item.tone) }];
  });

  if (errors.length) return { errors };
  return { diagram: { type: 'geometry', width, height, alt: alt!, points, segments, polygons, circles, arcs, ellipses, paths, angles, right_angles, labels, axes, plots }, errors };
}
