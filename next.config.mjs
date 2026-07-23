/** @type {import('next').NextConfig} */
const nextConfig = {
  // The file-backed seed reader uses node:fs at request time; keep it server-only.
  serverExternalPackages: ["postgres"],
};

export default nextConfig;
