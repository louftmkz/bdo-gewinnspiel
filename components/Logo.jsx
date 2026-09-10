import Image from "next/image";

export default function Logo() {
  return (
    <Image
      src="/logo.png"
      alt="Berlin Dance Open"
      width={927}
      height={443}
      priority
      className="w-52 sm:w-64 h-auto select-none pointer-events-none drop-shadow-[0_4px_14px_rgba(0,0,0,0.55)]"
    />
  );
}
