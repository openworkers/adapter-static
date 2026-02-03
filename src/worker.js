/// <reference types="@openworkers/workers-types" />

import mime from 'mime/lite';
import routes from 'ROUTES';

/** @typedef {{ ASSETS: BindingAssets }} Env */

/**
 * Check if path matches an immutable pattern (contains hash)
 * @param {string} pathname
 * @returns {boolean}
 */
function isImmutable(pathname) {
  for (const pattern of routes.immutable) {
    // Handle wildcard patterns (/* or /**)
    if (pattern.endsWith('/**') || pattern.endsWith('/*')) {
      const prefix = pattern.endsWith('/**')
        ? pattern.slice(0, -2)  // Remove **
        : pattern.slice(0, -1); // Remove *

      if (pathname.startsWith(prefix)) {
        return true;
      }
    } else if (pathname === pattern) {
      return true;
    }
  }

  return false;
}

/** @type {ExportedHandler<Env>} */
export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    let { pathname } = url;

    try {
      pathname = decodeURIComponent(pathname);
    } catch {
      // ignore invalid URI
    }

    // Remove trailing slash (except for root)
    if (pathname !== '/' && pathname.endsWith('/')) {
      pathname = pathname.slice(0, -1);
    }

    // Try to serve the file directly
    let response = await tryServeFile(env, pathname);

    if (response) {
      return addHeaders(response, pathname);
    }

    // Try index.html for root or directory mode
    if (pathname === '/' || routes.mode === 'directory') {
      const indexPath = pathname === '/' ? '/index.html' : pathname + '/index.html';
      response = await tryServeFile(env, indexPath);

      if (response) {
        return addHeaders(response, indexPath);
      }
    }

    // Try flat mode: /page -> /page.html (not for root)
    if (routes.mode === 'flat' && pathname !== '/') {
      response = await tryServeFile(env, pathname + '.html');

      if (response) {
        return addHeaders(response, pathname + '.html');
      }
    }

    // SPA fallback
    if (routes.fallback) {
      response = await tryServeFile(env, routes.fallback);

      if (response) {
        return addHeaders(response, routes.fallback);
      }
    }

    // 404 fallback
    response = await tryServeFile(env, '/404.html');

    if (response) {
      return new Response(response.body, {
        status: 404,
        headers: response.headers
      });
    }

    return new Response('Not Found', { status: 404 });
  }
};

/**
 * Try to serve a file from ASSETS
 * @param {Env} env
 * @param {string} pathname
 * @returns {Promise<Response | null>}
 */
async function tryServeFile(env, pathname) {
  try {
    const response = await env.ASSETS.fetch(pathname);

    if (response.ok) {
      return response;
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Add appropriate headers to response
 * @param {Response} response
 * @param {string} pathname
 * @returns {Response}
 */
function addHeaders(response, pathname) {
  const headers = new Headers(response.headers);

  // Set content-type if not already set
  if (!headers.has('content-type')) {
    headers.set('content-type', mime.getType(pathname) ?? 'application/octet-stream');
  }

  // Cache immutable assets forever
  if (isImmutable(pathname)) {
    headers.set('cache-control', 'public, max-age=31536000, immutable');
  } else if (pathname.endsWith('.html')) {
    // Don't cache HTML files
    headers.set('cache-control', 'no-cache');
  } else {
    // Cache other static files for 1 hour
    headers.set('cache-control', 'public, max-age=3600');
  }

  return new Response(response.body, {
    status: response.status,
    headers
  });
}
