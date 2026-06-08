import {Edge, Node} from 'reactflow';

function xmlEscape(s: string): string {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// HTML-escape text content, then XML-escape the resulting HTML for safe use
// in an XML attribute value (draw.io value="...").
function htmlText(s: string): string {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

async function fetchIconAsDataUrl(iconPath: string): Promise<string | null> {
  try {
    const response = await fetch(iconPath);
    if (!response.ok) return null;
    const blob = await response.blob();
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('FileReader error'));
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

function buildResourceLabel(
  label: string,
  serviceName: string,
  iconDataUrl: string | null,
): string {
  const safeLabel = htmlText(label);
  const safeService = htmlText(serviceName);
  const imgHtml = iconDataUrl
    ? `<img src="${iconDataUrl}" width="40" height="40" /><br />`
    : '';
  const html = `${imgHtml}<b>${safeLabel}</b><br /><font style="font-size:10px;">${safeService}</font>`;
  return xmlEscape(html);
}

function buildHtmlLabel(primary: string, secondary?: string): string {
  const p = htmlText(primary);
  if (!secondary) {
    return xmlEscape(`<b>${p}</b>`);
  }
  const s = htmlText(secondary);
  return xmlEscape(
    `<b>${p}</b><br /><font style="font-size:10px;">${s}</font>`,
  );
}

function getNodeLabel(node: Node, iconDataUrls: Map<string, string>): string {
  const d = node.data ?? {};
  switch (node.type) {
    case 'resourceNode': {
      const serviceName = String(d.type ?? '')
        .replace('AWS::', '')
        .replace(/::/g, ' ')
        .trim();
      const iconDataUrl = d.iconPath
        ? (iconDataUrls.get(String(d.iconPath)) ?? null)
        : null;
      return buildResourceLabel(
        String(d.label ?? node.id),
        serviceName,
        iconDataUrl,
      );
    }
    case 'textAnnotation':
    case 'calloutAnnotation':
      return xmlEscape(String(d.text ?? ''));
    default:
      return buildHtmlLabel(String(d.label ?? node.id));
  }
}

function getNodeStyle(node: Node): string {
  const d = node.data ?? {};
  switch (node.type) {
    case 'resourceNode': {
      const bg = String(d.customStyle?.backgroundColor ?? '#dae8fc');
      const stroke = String(d.customStyle?.borderColor ?? '#6c8ebf');
      return `rounded=1;whiteSpace=wrap;html=1;fillColor=${bg};strokeColor=${stroke};align=center;verticalAlign=top;spacingTop=4;`;
    }
    case 'group':
      return 'rounded=1;whiteSpace=wrap;html=0;verticalAlign=top;fillColor=#f5f5f5;strokeColor=#666666;fontColor=#333333;fontStyle=1;fontSize=12;container=1;';
    case 'customGroup': {
      const color = String(d.color ?? '#aaaaaa');
      return `rounded=1;whiteSpace=wrap;html=0;verticalAlign=top;fillColor=${color};opacity=15;strokeColor=${color};fontStyle=1;fontSize=12;container=1;`;
    }
    case 'textAnnotation': {
      const color = String(d.color ?? '#fff9c4');
      return `text;html=0;align=left;verticalAlign=top;whiteSpace=wrap;overflow=hidden;fillColor=${color};strokeColor=none;`;
    }
    case 'calloutAnnotation': {
      const color = String(d.color ?? '#fff9c4');
      const dirMap: Record<string, string> = {
        top: 'north',
        right: 'east',
        bottom: 'south',
        left: 'west',
      };
      const dir = dirMap[String(d.arrowPosition ?? 'right')] ?? 'east';
      return `shape=callout;direction=${dir};whiteSpace=wrap;html=0;fillColor=${color};strokeColor=#a0a0a0;`;
    }
    case 'highlightBox': {
      const color = String(d.color ?? '#fff2cc');
      const opacity = Math.round(Number(d.opacity ?? 0.3) * 100);
      return `rounded=1;whiteSpace=wrap;html=0;fillColor=${color};strokeColor=${color};opacity=${opacity};`;
    }
    default:
      return 'rounded=1;whiteSpace=wrap;html=0;';
  }
}

function getEdgeStyle(edge: Edge): string {
  const d = edge.data ?? {};
  const color = String(d.color ?? '#94a3b8');
  const strokeWidth = Number(d.strokeWidth ?? 1.5);
  const dashed = d.dashed ? 'dashed=1;' : '';
  return `edgeStyle=orthogonalEdgeStyle;html=1;${dashed}strokeColor=${color};strokeWidth=${strokeWidth};`;
}

export async function exportToDrawio(
  nodes: Node[],
  edges: Edge[],
  diagramName: string,
): Promise<string> {
  // Collect unique icon paths from resource nodes
  const iconPaths = new Set<string>();
  for (const node of nodes) {
    if (node.type === 'resourceNode' && node.data?.iconPath) {
      iconPaths.add(String(node.data.iconPath));
    }
  }

  // Fetch all icons in parallel, keyed by path
  const iconDataUrls = new Map<string, string>();
  await Promise.all(
    Array.from(iconPaths).map(async (path) => {
      const dataUrl = await fetchIconAsDataUrl(path);
      if (dataUrl) {
        iconDataUrls.set(path, dataUrl);
      }
    }),
  );

  const idMap = new Map<string, number>();
  let counter = 2; // 0 and 1 are reserved by draw.io
  for (const node of nodes) idMap.set(node.id, counter++);
  for (const edge of edges) idMap.set(edge.id, counter++);

  // Parents must appear before their children in the XML
  const sorted = [...nodes].sort((a, b) => {
    const aDepth = a.parentNode != null ? 1 : 0;
    const bDepth = b.parentNode != null ? 1 : 0;
    return aDepth - bDepth;
  });

  const parts: string[] = [];

  for (const node of sorted) {
    const id = idMap.get(node.id)!;
    const parentId = node.parentNode ? (idMap.get(node.parentNode) ?? 1) : 1;
    const label = getNodeLabel(node, iconDataUrls);
    const style = getNodeStyle(node);
    const x = Math.round(node.position.x);
    const y = Math.round(node.position.y);
    const isGroup = node.type === 'group' || node.type === 'customGroup';
    const d = node.data ?? {};
    const w = Math.round(
      (node.width ?? Number(d.width || 0)) || (isGroup ? 300 : 160),
    );
    const h = Math.round(
      (node.height ?? Number(d.height || 0)) || (isGroup ? 200 : 80),
    );
    const tooltip =
      node.type === 'resourceNode'
        ? ` tooltip="${xmlEscape(String(node.data?.type ?? ''))}"`
        : '';

    parts.push(
      `        <mxCell id="${id}" value="${label}" style="${style}" vertex="1" parent="${parentId}"${tooltip}>`,
      `          <mxGeometry x="${x}" y="${y}" width="${w}" height="${h}" as="geometry" />`,
      `        </mxCell>`,
    );
  }

  for (const edge of edges) {
    const id = idMap.get(edge.id);
    const srcId = idMap.get(edge.source);
    const tgtId = idMap.get(edge.target);
    if (id == null || srcId == null || tgtId == null) continue;

    const rawLabel =
      typeof edge.label === 'string'
        ? edge.label
        : String(edge.data?.label ?? '');
    const label = xmlEscape(rawLabel);
    const style = getEdgeStyle(edge);

    parts.push(
      `        <mxCell id="${id}" value="${label}" style="${style}" edge="1" source="${srcId}" target="${tgtId}" parent="1">`,
      `          <mxGeometry relative="1" as="geometry" />`,
      `        </mxCell>`,
    );
  }

  return [
    `<mxfile host="CDK Canvas" agent="CDK Canvas" version="1.0">`,
    `  <diagram name="${xmlEscape(diagramName)}" id="cdk-canvas-diagram">`,
    `    <mxGraphModel dx="1422" dy="762" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="1169" pageHeight="827" math="0" shadow="0">`,
    `      <root>`,
    `        <mxCell id="0" />`,
    `        <mxCell id="1" parent="0" />`,
    ...parts,
    `      </root>`,
    `    </mxGraphModel>`,
    `  </diagram>`,
    `</mxfile>`,
  ].join('\n');
}
