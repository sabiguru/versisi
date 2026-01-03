import Image from "next/image";
import Link from "next/link";

type LogoProps = {
  href?: string;
  priority?: boolean;
  className?: string;
};

export function Logo({ href = "/", priority = false, className = "" }: LogoProps) {
  const baseClasses = "h-auto w-[60px] sm:w-[72px] md:w-[88px] lg:w-[108px]";
  const logoImage = (
    <Image
      src="/logo-opt.webp"
      alt="Versisi"
      width={110}
      height={29}
      priority={priority}
      sizes="(min-width:1280px) 140px, (min-width:1024px) 130px, (min-width:768px) 110px, 90px"
      className={`${baseClasses} ${className}`.trim()}
    />
  );

  return href ? (
    <Link href={href} className="inline-flex items-center">
      <span className="sr-only">Versisi</span>
      {logoImage}
    </Link>
  ) : (
    logoImage
  );
}
