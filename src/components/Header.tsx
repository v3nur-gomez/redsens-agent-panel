import { Menu, User, CreditCard, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import redSensLogo from "@/assets/redsens-logo.png";

const Header = () => {
  return (
    <header className="bg-royal-blue-header shadow-soft px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Logo as image only - contained so scaling doesn't change header height */}
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 overflow-visible flex items-center justify-center">
            <img
              src={redSensLogo}
              alt="RedSens Logo"
              className="w-12 h-12 object-contain transform transition-transform duration-200 hover:scale-110"
            />
          </div>
        </div>

        {/* Hamburger Menu */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 p-3">
              <Menu className="h-8 w-8" />
            </Button>
          </SheetTrigger>
          <SheetContent className="bg-card border-l border-border">
            <div className="flex flex-col gap-6 mt-8 px-4">
              <Button 
                variant="ghost" 
                className="justify-start gap-4 text-foreground hover:bg-accent py-4 text-lg"
              >
                <User className="h-6 w-6" />
                Perfil
              </Button>
              <Button 
                variant="ghost" 
                className="justify-start gap-4 text-foreground hover:bg-accent py-4 text-lg"
              >
                <CreditCard className="h-6 w-6" />
                Plan Actual
              </Button>
              <Button 
                variant="ghost" 
                className="justify-start gap-4 text-foreground hover:bg-accent py-4 text-lg"
              >
                <FileText className="h-6 w-6" />
                Reporte
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};

export default Header;