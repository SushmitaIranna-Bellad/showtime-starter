import { Facebook, Twitter, Instagram, Youtube } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Column 1 */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Movies Now Showing</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Pushpa 2</a></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Dune Part Two</a></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Fighter</a></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Crew</a></li>
            </ul>
          </div>

          {/* Column 2 */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Upcoming Movies</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Deadpool 3</a></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Kalki 2898 AD</a></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Singham Again</a></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Stree 2</a></li>
            </ul>
          </div>

          {/* Column 3 */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Help</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">About Us</a></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Contact Us</a></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">FAQs</a></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Terms & Conditions</a></li>
            </ul>
          </div>

          {/* Column 4 */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Connect With Us</h4>
            <div className="flex gap-4">
              <a href="#" className="p-2 rounded-full bg-secondary text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 rounded-full bg-secondary text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 rounded-full bg-secondary text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 rounded-full bg-secondary text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold">B</span>
            </div>
            <span className="text-sm font-medium text-muted-foreground">
              © 2024 BookMyShow Clone. All rights reserved.
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            Made with ❤️ for movie lovers
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
