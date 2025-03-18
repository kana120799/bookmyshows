"use client";
import store from "@/GlobalState/store";
import { Provider } from "react-redux";

export default function ClientWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Provider store={store}>{children}</Provider>;
}
