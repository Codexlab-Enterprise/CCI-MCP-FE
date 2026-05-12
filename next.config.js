/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const apiUrl2 = process.env.NEXT_PUBLIC_API_URL_2;
    const installmentUrl = process.env.NEXT_PUBLIC_INSTALLMENT;

    const rewrites = [
      apiUrl && {
        source: "/user/:path*",
        destination: `${apiUrl}/:path*`,
      },
      apiUrl2 && {
        source: "/v1/uploadfile/:path*",
        destination: `${apiUrl2}/v1/uploadfile/:path*`,
      },
      installmentUrl && {
        source: "/api/v1/installments/:path*",
        destination: `${installmentUrl}/:path*`,
      },
      apiUrl2 && {
        source: "/api/:path*",
        destination: `${apiUrl2}/v1/:path*`,
      },
    ];

    return rewrites.filter(Boolean);
  },
};

module.exports = nextConfig
