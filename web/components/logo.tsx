
import Image from "next/image";
import { cn } from "~/styles/utils";

export function Logo({ className, ...props }: { className?: string }) {
  return (
    <Image
      src="/logo.png"
      alt="codexa logo"
      width={25}
      height={25}
      className={cn("w-6 h-6", className)}
      priority
      {...props}
    />
  );
}
