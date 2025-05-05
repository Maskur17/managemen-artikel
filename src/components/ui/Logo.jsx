
export default function Logo({ src = "/logo.svg", alt = "Logo" }) {
    return <img src={src} alt={alt} className="w-20 sm:w-24 md:w-28" />;
}
