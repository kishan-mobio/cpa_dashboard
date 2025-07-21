import { createProxyMiddleware } from 'http-proxy-middleware';

/**
 * Creates a proxy middleware
 * @param {string} targetUrl - The target URL
 * @param {Record<string, string>} pathRewrite - The path rewrite object
 * @returns {Function} - The proxy middleware
 */
const proxyMiddleware = (targetUrl, pathRewrite = {}) =>
  createProxyMiddleware({
    target: targetUrl,
    changeOrigin: true,
    pathRewrite,
  });

export default proxyMiddleware;
