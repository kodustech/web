import * as NextAuth from "next-auth"

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  export interface Session extends NextAuth.Session {
    user: {
      accessToken: string
    }
  }
}

export default {}
