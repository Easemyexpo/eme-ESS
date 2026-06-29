import type { Role } from "@/types";
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      empId: string;
      role: Role;
    } & DefaultSession["user"];
  }

  interface User {
    id?: string;
    empId: string;
    role: Role;
    name?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    empId: string;
    role: Role;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    empId: string;
    role: Role;
  }
}
