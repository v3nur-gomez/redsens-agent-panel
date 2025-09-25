import { Menu, User, CreditCard, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import redSensLogo from "@/assets/redsens-logo.png";
import redSensBadge from "@/assets/redsens.png";

interface HeaderProps {
  /** Tailwind class to apply as left margin/padding for the logo container (e.g. 'ml-4' or 'pl-6') */
  logoLeftClass?: string;
}

const Header = ({ logoLeftClass = "" }: HeaderProps) => {
  return (
    <header className="bg-royal-blue-header shadow-soft px-6 py-4">
      <div className="flex ml-3 items-center justify-between">
        {/* Logo as image only - contained so scaling doesn't change header height */}
            <div className={`flex items-center gap-4 ${logoLeftClass}`}>
              {/* Logo container */}
              <div className="w-14 h-14 overflow-visible flex items-center justify-center">
                <img
                  src={redSensLogo}
                  alt="RedSens Logo"
                  className="w-12 h-12 mr-2 object-contain transform scale-[2] origin-center transition-transform duration-200 hover:scale-[2]"
                />
              </div>

              {/* Badge container - separate space */}
              <div className="w-10 h-10 ml-32 overflow-visible flex items-center justify-center">
                <img
                  src={redSensBadge}
                  alt="RedSens Badge"
                  className="w-10 h-10 object-contain transform scale-[7] origin-center transition-transform duration-200 hover:scale-[7]"
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