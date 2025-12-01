import { ViewTreeLogo } from "./logo";

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm">
      <div className="max-w-viewtree mx-auto px-4 py-4">
        <ViewTreeLogo showText />
      </div>
    </nav>
  );
}
