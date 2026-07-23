export const metadata = {
  title: "My Plans",
  robots: { index: false, follow: true },
};

export default function PlansLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
