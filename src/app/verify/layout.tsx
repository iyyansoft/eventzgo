export default function VerifyLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen">
            {/* No header - clean interface for staff */}
            {children}
            {/* No footer - clean interface for staff */}
        </div>
    );
}
