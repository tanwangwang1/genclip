import type { MetadataRoute } from "next";
import { execSync } from "child_process";
import { readdir, stat } from "fs/promises";
import { join } from "path";

import { siteConfig } from "@/config/site";
import { buildAlternates, getLocaleUrl } from "@/lib/seo";

// Always generate the latest sitemap on request.
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type ChangeFrequency = "daily" | "weekly" | "monthly";

type RouteEntry = {
  path: string;
  file: string;
  priority: number;
  changeFrequency: ChangeFrequency;
};

const gitTimestampCache = new Map<string, Date>();

const EXCLUDED_EXACT_ROUTES = new Set(["/privacy", "/terms"]);

const getLastModified = async (filePath: string): Promise<Date> => {
  const cached = gitTimestampCache.get(filePath);
  if (cached) {
    return cached;
  }

  try {
    // 转义文件路径中的特殊字符，避免 shell 解析错误
    const escapedPath = filePath.replace(/'/g, "'\\''");
    const timestamp = execSync(`git log -1 --format=%cI '${escapedPath}'`)
      .toString()
      .trim();
    if (timestamp) {
      const parsed = new Date(timestamp);
      gitTimestampCache.set(filePath, parsed);
      return parsed;
    }
  } catch {
    // Fall through to filesystem mtime when git is unavailable.
  }

  try {
    const fileStat = await stat(filePath);
    gitTimestampCache.set(filePath, fileStat.mtime);
    return fileStat.mtime;
  } catch {
    const now = new Date();
    gitTimestampCache.set(filePath, now);
    return now;
  }
};

/**
 * 递归扫描目录，查找所有 page.tsx 文件
 */
async function scanPages(
  dir: string,
  baseDir: string
): Promise<RouteEntry[]> {
  const pages: RouteEntry[] = [];

  try {
    const entries = await readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(dir, entry.name);

      // 跳过特定目录
      if (
        entry.name.startsWith('_') ||  // Next.js 私有目录
        entry.name.startsWith('.') ||  // 隐藏文件
        entry.name === 'node_modules' ||
        entry.name === 'api'           // 跳过 API 路由
      ) {
        continue;
      }

      if (entry.isDirectory()) {
        // 递归扫描子目录
        const subPages = await scanPages(fullPath, baseDir);
        pages.push(...subPages);
      } else if (entry.name === 'page.tsx') {
        // 计算路由路径
        const relativePath = fullPath.replace(baseDir, '');
        const routePath = relativePath
          .replace(/\/page\.tsx$/, '')           // 移除 /page.tsx
          .replace(/\[.*?\]/g, '')                // 移除动态路由参数
          .replace(/\/\([^)]+\)/g, '')            // 移除路由组 (marketing)/(tool)
          .replace('//', '/')                     // 修复双斜杠
          .replace(/^\//, '')                     // 移除开头的斜杠
          || '/';                                 // 根路径

        const normalizedPath = routePath === "/" ? "" : `/${routePath}`;

        // 跳过 dashboard、admin 等不需要 SEO 的页面
        const skipRoutes = ['dashboard', 'admin', 'auth', 'login', 'register', 'settings'];
        if (skipRoutes.some(route => routePath.includes(route))) {
          continue;
        }

        // 跳过旧法务页，避免与新的 canonical 页面重复收录
        if (EXCLUDED_EXACT_ROUTES.has(normalizedPath)) {
          continue;
        }

        // 根据路径确定优先级和更新频率
        let priority = 0.8;
        let changeFrequency: ChangeFrequency = 'weekly';

        if (routePath === '' || routePath === '/') {
          priority = 1.0;
          changeFrequency = 'daily';
        } else if (routePath.includes('pricing')) {
          priority = 0.9;
          changeFrequency = 'weekly';
        } else if (
          routePath.includes('privacy') ||
          routePath.includes('terms') ||
          routePath.includes('refund')
        ) {
          priority = 0.3;
          changeFrequency = 'monthly';
        } else if (routePath.includes('-to-') || /\d/.test(routePath)) {
          // 工具页面和模型页面
          priority = 0.7;
          changeFrequency = 'weekly';
        }

        pages.push({
          path: normalizedPath,
          file: fullPath,
          priority,
          changeFrequency,
        });
      }
    }
  } catch (error) {
    console.error(`Error scanning directory ${dir}:`, error);
  }

  return pages;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // 自动扫描所有页面
  const appDir = join(process.cwd(), 'src', 'app', '[locale]');
  const scannedRoutes = await scanPages(appDir, appDir);

  const uniqueRoutes = Array.from(
    new Map(scannedRoutes.map((route) => [route.path, route])).values()
  ).sort((a, b) => {
    if (a.path === b.path) return 0;
    if (a.path === "") return -1;
    if (b.path === "") return 1;
    return a.path.localeCompare(b.path);
  });

  const routesWithModified = await Promise.all(
    uniqueRoutes.map(async (route) => ({
      ...route,
      lastModified: await getLastModified(route.file),
    }))
  );

  return routesWithModified.flatMap((route) =>
    (["en", "zh"] as const).map((locale) => {
      const alternates = buildAlternates(route.path, locale);

      return {
        url: getLocaleUrl(route.path, locale),
        lastModified: route.lastModified,
        changeFrequency: route.changeFrequency,
        priority: route.priority,
        alternates: {
          languages: alternates.languages,
        },
      };
    })
  );
}
