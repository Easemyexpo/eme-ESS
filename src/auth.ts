import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { authConfig } from "@/auth.config";
import { dbConnect } from "@/lib/mongodb";
import { User } from "@/models/User";
import { Employee } from "@/models/Employee";

const credentialsSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(raw) {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) return null;

        const { username, password } = parsed.data;
        await dbConnect();

        const user = await User.findOne({ username: username.toLowerCase() }).lean();
        if (!user) return null;

        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return null;

        const employee = await Employee.findOne({ empId: user.empId })
          .select("fullName")
          .lean();

        return {
          id: String(user._id),
          empId: user.empId,
          role: user.role,
          name: employee?.fullName ?? user.username,
        };
      },
    }),
  ],
});
