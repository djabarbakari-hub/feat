import { TabBar } from "@/components/TabBar";

export default function AppLayout({ children }) {
  return (
    <>
      {children}
      <TabBar />
    </>
  );
}
