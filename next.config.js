/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: "/user/:path*", destination:   `${process.env.NEXT_PUBLIC_API_URL}/`   + ":path*",
      },
      // {
      //   source: "/api/repository/:path*",
      //   destination:
      //        `${process.env.NEXT_PUBLIC_API_URL_2}/`
      //       + ":path*",
      // },
      // {
      //   source: "/api/members/:path*",
      //   destination:
      //        `${process.env.NEXT_PUBLIC_API_URL_2}/api/`
      //       + ":path*",
      // },
      
      {
        source: "/v1/uploadfile/:path*", destination: `${process.env.NEXT_PUBLIC_API_URL_2}/v1/uploadfile/:path*`,
      },
      // {
      //   source: "/v1/members/:memberId/installments/bulk", destination: `${process.env.NEXT_PUBLIC_INSTALLMENT}/members/:memberId/installments/bulk`,
      // },
       {
        source: "/api/v1/installments/:path*", destination: `${process.env.NEXT_PUBLIC_INSTALLMENT}/` + ":path*",
      },
      {
        source: "/api/:path*", destination: `${process.env.NEXT_PUBLIC_API_URL_2}/v1/` + ":path*",
      },
    ];
  },
}

module.exports = nextConfig
