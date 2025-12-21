import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { AlertTriangle, Plane } from "lucide-react";

interface UserCaseType {
  id: string;
  label: string;
  icon: React.ReactNode;
  description: string;
  examples: string[];
}

const userCaseTypes: UserCaseType[] = [
  {
    id: "general-emergency",
    label: "General Emergency",
    icon: <AlertTriangle className="w-6 h-6" />,
    description: "Criminal situations, witness protection, immediate legal help",
    examples: [
      "Witnessed a crime and need guidance",
      "Victim of theft or assault",
      "Harassment or threats",
      "Self-defense situations"
    ]
  },
  {
    id: "transport",
    label: "Transport & Immigration",
    icon: <Plane className="w-6 h-6" />,
    description: "Visa issues, travel problems, immigration emergencies",
    examples: [
      "Visa expired abroad",
      "Passport lost or stolen",
      "Detained at airport/border",
      "Immigration documentation issues"
    ]
  },
];

interface UserCaseSelectorProps {
  onSelect: (caseType: string) => void;
}

export const UserCaseSelector = ({ onSelect }: UserCaseSelectorProps) => {
  return (
    <div className="space-y-8 py-8">
      <div className="text-center space-y-4">
        <h2 className="text-4xl md:text-5xl font-display tracking-tight text-foreground">
          How Can We <span className="text-gradient">Help</span>?
        </h2>
        <p className="text-lg text-muted-foreground font-medium max-w-md mx-auto">
          Select the type of situation you're facing and get instant legal guidance
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {userCaseTypes.map((type) => (
          <Card
            key={type.id}
            className={cn(
              "p-8 cursor-pointer transition-smooth hover:shadow-elegant hover:border-accent hover:scale-[1.02]",
              "flex flex-col space-y-5 group"
            )}
            onClick={() => onSelect(type.id)}
          >
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl gradient-gold shadow-glow flex items-center justify-center text-primary group-hover:scale-110 transition-smooth">
                {type.icon}
              </div>
              <div>
                <h3 className="font-display text-xl text-foreground tracking-tight">{type.label}</h3>
                <p className="text-sm text-muted-foreground font-medium">{type.description}</p>
              </div>
            </div>
            
            <div className="border-t border-border pt-5">
              <p className="text-xs font-bold text-muted-foreground mb-3 uppercase tracking-wide">Common situations:</p>
              <ul className="text-sm text-muted-foreground space-y-2">
                {type.examples.map((example, idx) => (
                  <li key={idx} className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full gradient-gold"></span>
                    <span className="font-medium">{example}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Card>
        ))}
      </div>
      
      <div className="text-center">
        <p className="text-sm text-muted-foreground max-w-lg mx-auto font-medium">
          🛡️ Our AI assistant will guide you through your situation with relevant legal information and protective measures.
        </p>
      </div>
    </div>
  );
};
