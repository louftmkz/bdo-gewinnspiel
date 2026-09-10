/** @type {import('next').NextConfig} */
const nextConfig = {
  // Make sure raffle data files are always bundled into the serverless
  // functions, even though they're read dynamically at runtime (fs.readdir),
  // which Next's static file tracer can't detect on its own.
  outputFileTracingIncludes: {
    "/**": ["./data/raffles/**"],
  },
};

export default nextConfig;
