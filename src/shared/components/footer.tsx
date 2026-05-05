import { Link } from "react-router-dom";
import { Plane } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full bg-slate-950 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 md:px-10 lg:px-20">
        {/* Grid: 1 column mobile, 2 md, 4 lg */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 text-white">
              <div className="flex items-center justify-center h-8 w-8 bg-primary/20 rounded-full text-primary">
                <Plane className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">Rahhal</span>
            </div>

            <p className="text-slate-400 text-sm">
              The social platform for modern travelers. Plan smarter, travel
              further, together.
            </p>
          </div>

          {/* Company */}
          <div className="flex flex-col gap-4">
            <h4 className="text-white font-bold">Company</h4>
            <Link
              className="text-slate-400 hover:text-primary transition-colors text-sm"
              to="/about"
            >
              About Us
            </Link>
            <Link
              className="text-slate-400 hover:text-primary transition-colors text-sm"
              to="/careers"
            >
              Careers
            </Link>
            <Link
              className="text-slate-400 hover:text-primary transition-colors text-sm"
              to="/blog"
            >
              Blog
            </Link>
            <Link
              className="text-slate-400 hover:text-primary transition-colors text-sm"
              to="/contact"
            >
              Contact
            </Link>
          </div>

          {/* Support */}
          <div className="flex flex-col gap-4">
            <h4 className="text-white font-bold">Support</h4>
            <Link
              className="text-slate-400 hover:text-primary transition-colors text-sm"
              to="/help-center"
            >
              Help Center
            </Link>
            <Link
              className="text-slate-400 hover:text-primary transition-colors text-sm"
              to="/safety"
            >
              Safety
            </Link>
            <Link
              className="text-slate-400 hover:text-primary transition-colors text-sm"
              to="/terms"
            >
              Terms of Service
            </Link>
            <Link
              className="text-slate-400 hover:text-primary transition-colors text-sm"
              to="/privacy"
            >
              Privacy Policy
            </Link>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-slate-800/50 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-slate-400 text-xs">
            © 2026 Rahhal Inc. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
