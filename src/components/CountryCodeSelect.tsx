import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CountryCodeSelectProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const countryCodes = [
  { code: "+1", country: "US/CA", flag: "🇺🇸" },
  { code: "+44", country: "UK", flag: "🇬🇧" },
  { code: "+91", country: "IN", flag: "🇮🇳" },
  { code: "+86", country: "CN", flag: "🇨🇳" },
  { code: "+81", country: "JP", flag: "🇯🇵" },
  { code: "+49", country: "DE", flag: "🇩🇪" },
  { code: "+33", country: "FR", flag: "🇫🇷" },
  { code: "+39", country: "IT", flag: "🇮🇹" },
  { code: "+34", country: "ES", flag: "🇪🇸" },
  { code: "+61", country: "AU", flag: "🇦🇺" },
  { code: "+55", country: "BR", flag: "🇧🇷" },
  { code: "+7", country: "RU", flag: "🇷🇺" },
  { code: "+82", country: "KR", flag: "🇰🇷" },
  { code: "+52", country: "MX", flag: "🇲🇽" },
  { code: "+31", country: "NL", flag: "🇳🇱" },
  { code: "+46", country: "SE", flag: "🇸🇪" },
  { code: "+47", country: "NO", flag: "🇳🇴" },
  { code: "+45", country: "DK", flag: "🇩🇰" },
  { code: "+48", country: "PL", flag: "🇵🇱" },
  { code: "+41", country: "CH", flag: "🇨🇭" },
  { code: "+43", country: "AT", flag: "🇦🇹" },
  { code: "+32", country: "BE", flag: "🇧🇪" },
  { code: "+351", country: "PT", flag: "🇵🇹" },
  { code: "+30", country: "GR", flag: "🇬🇷" },
  { code: "+420", country: "CZ", flag: "🇨🇿" },
  { code: "+358", country: "FI", flag: "🇫🇮" },
  { code: "+353", country: "IE", flag: "🇮🇪" },
  { code: "+64", country: "NZ", flag: "🇳🇿" },
  { code: "+65", country: "SG", flag: "🇸🇬" },
  { code: "+60", country: "MY", flag: "🇲🇾" },
  { code: "+66", country: "TH", flag: "🇹🇭" },
  { code: "+63", country: "PH", flag: "🇵🇭" },
  { code: "+84", country: "VN", flag: "🇻🇳" },
  { code: "+62", country: "ID", flag: "🇮🇩" },
  { code: "+27", country: "ZA", flag: "🇿🇦" },
  { code: "+20", country: "EG", flag: "🇪🇬" },
  { code: "+234", country: "NG", flag: "🇳🇬" },
  { code: "+254", country: "KE", flag: "🇰🇪" },
  { code: "+971", country: "AE", flag: "🇦🇪" },
  { code: "+966", country: "SA", flag: "🇸🇦" },
  { code: "+92", country: "PK", flag: "🇵🇰" },
  { code: "+880", country: "BD", flag: "🇧🇩" },
  { code: "+94", country: "LK", flag: "🇱🇰" },
];

export const CountryCodeSelect = ({ value, onChange, disabled }: CountryCodeSelectProps) => {
  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger className="w-[120px] bg-background">
        <SelectValue placeholder="+1" />
      </SelectTrigger>
      <SelectContent className="max-h-[300px] bg-background">
        {countryCodes.map((item) => (
          <SelectItem key={item.code} value={item.code}>
            <span className="flex items-center gap-2">
              <span>{item.flag}</span>
              <span>{item.code}</span>
              <span className="text-muted-foreground text-xs">({item.country})</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
