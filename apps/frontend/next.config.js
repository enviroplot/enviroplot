require('dotenv').config({ path: '../../.env' });

module.exports = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: process.env.NEXT_PUBLIC_BACKEND_API_URL + '/:path*',
      },
    ];
  },
}
