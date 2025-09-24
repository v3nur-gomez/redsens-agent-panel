import { Menu, User, CreditCard, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import redSensLogo from "@/assets/redsens-logo.png";

const Header = () => {
  return (
    <header className="bg-royal-blue-header shadow-soft px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Logo and Company Name */}
        <div className="flex items-center gap-3">
          <img 
            src={redSensLogo} 
            alt="RedSens Logo" 
            className="w-10 h-10 object-contain"
          />
          <h1 className="text-white text-x2 font-bold tracking-wide">
            RedSens
          </h1>
        </div>

        {/* Hamburger Menu */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent className="bg-card border-l border-border">
            <div className="flex flex-col gap-4 mt-8">
              <Button 
                variant="ghost" 
                className="justify-start gap-3 text-foreground hover:bg-accent"
              >
                <User className="h-5 w-5" />
                Perfil
              </Button>
              <Button 
                variant="ghost" 
                className="justify-start gap-3 text-foreground hover:bg-accent"
              >
                <CreditCard className="h-5 w-5" />
                Plan Actual
              </Button>
              <Button 
                variant="ghost" 
                className="justify-start gap-3 text-foreground hover:bg-accent"
              >
                <FileText className="h-5 w-5" />
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