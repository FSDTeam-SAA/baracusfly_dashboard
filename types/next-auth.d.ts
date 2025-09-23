declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      role: string
      accessToken: string
      refreshToken: string
    }
  }

  interface User {
    id: string
    email: string
    role: string
    accessToken: string
    refreshToken: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    email: string
    role: string
    accessToken: string
    refreshToken: string
  }
}
