export interface AdapterOptions {
  /**
   * Input directory containing the static files
   * @default 'dist' | 'build' | 'out' | 'public' (auto-detected)
   */
  input?: string;

  /**
   * Output directory for the OpenWorkers build
   * @default 'dist-openworkers'
   */
  out?: string;

  /**
   * Routing mode for serving files without extensions
   * - 'directory': /page -> /page/index.html
   * - 'flat': /page -> /page.html
   * @default auto-detected based on file structure
   */
  mode?: 'directory' | 'flat';

  /**
   * SPA fallback file path (e.g., '/index.html' or '/200.html')
   * When set, this file is served for all routes that don't match a file
   * @default undefined (no fallback, returns 404)
   */
  fallback?: string;

  /**
   * Glob patterns for immutable assets (hashed filenames)
   * These files get long cache headers
   * @default auto-detected (/_app/immutable/*, /assets/*, etc.)
   */
  immutable?: string[];
}

/**
 * Build static site for OpenWorkers
 */
export function adapt(options?: AdapterOptions): Promise<void>;

export default adapt;
