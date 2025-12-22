import { ManagementAuthProvider } from "@/contexts/ManagementAuthContext";

export default function ManagementLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ManagementAuthProvider>
      {children}
    </ManagementAuthProvider>
  );
}
