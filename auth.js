{
  "version": 2,
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "/server.js"
    },
    {
      "source": "/js/:file*",
      "destination": "/:file*"
    },
    {
      "source": "/css/:file*",
      "destination": "/:file*"
    },
    {
      "source": "/assets/:file*",
      "destination": "/:file*"
    },
    {
      "source": "/logo/:file*",
      "destination": "/:file*"
    },
    {
      "source": "/",
      "destination": "/login.html"
    }
  ]
}
