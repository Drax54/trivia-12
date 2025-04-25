import Link from "next/link";
import { Brain } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Brain className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">Trivia Master</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Challenge your knowledge with thousands of quizzes across various categories.
            </p>
          </div>
          
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase">Categories</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/categories/history" className="text-muted-foreground hover:text-foreground">
                  History
                </Link>
              </li>
              <li>
                <Link href="/categories/science" className="text-muted-foreground hover:text-foreground">
                  Science
                </Link>
              </li>
              <li>
                <Link href="/categories/geography" className="text-muted-foreground hover:text-foreground">
                  Geography
                </Link>
              </li>
              <li>
                <Link href="/categories/literature" className="text-muted-foreground hover:text-foreground">
                  Literature
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/study" className="text-muted-foreground hover:text-foreground">
                  Study Mode
                </Link>
              </li>
              <li>
                <Link href="/leaderboard" className="text-muted-foreground hover:text-foreground">
                  Leaderboard
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-muted-foreground hover:text-foreground">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-muted-foreground hover:text-foreground">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase">Company</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-foreground">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-foreground">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-muted-foreground hover:text-foreground">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-muted-foreground hover:text-foreground">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 border-t pt-6">
          <p className="text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} Trivia Master. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}