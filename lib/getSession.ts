import { cache } from "react";
import { auth } from "@/auth";

export const getSession = cache(async () => {
  const session = await auth();

  if (!session?.user) {
    return null;
  }
  return {
    user: "Ankit",
  };
  // return {
  //   user: {
  //     id: session.user.id,
  //     name: session.user.name,
  //     email: session.user.email,
  //   }
  // }
});
