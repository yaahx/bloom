import {
  ArrowUpRight,
  Clock,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
  Truck,
} from "lucide-react";

export const metadata = {
  title: "Contact Us — BloomShop",
  description:
    "Get in touch with BloomShop. Reach us directly via WhatsApp, phone, or email, or visit our physical store on Uhuru Street, Thika Town, Kenya.",
};

export default function ContactPage() {
  const whatsappUrl = `https://wa.me/254716836551?text=${encodeURIComponent(
    "Hello BloomShop! I'd like to ask a question about your products and orders."
  )}`;

  const contactChannels = [
    {
      icon: MessageCircle,
      title: "WhatsApp",
      description: "Chat with us for sizing, stock checks, and instant orders.",
      value: "+254 716 836 551",
      href: whatsappUrl,
      external: true,
      iconColor: "text-[#25D366]",
    },
    {
      icon: Phone,
      title: "Phone",
      description: "Call our support line directly during store hours.",
      value: "+254 716 836 551",
      href: "tel:+254716836551",
      external: false,
      iconColor: "text-foreground",
    },
    {
      icon: Mail,
      title: "Email",
      description: "For order inquiries, feedback, and general support.",
      value: "hello@bloomshop.com",
      href: "mailto:hello@bloomshop.com",
      external: false,
      iconColor: "text-foreground",
    },
    {
      icon: MapPin,
      title: "Visit Our Store",
      description: "In-person shopping, fittings, and order pickup.",
      value: "Uhuru Street, Thika Town, Kenya",
      href: "https://maps.google.com/?q=Uhuru+Street+Thika+Kenya",
      external: true,
      iconColor: "text-foreground",
    },
  ];

  const highlights = [
    {
      icon: Truck,
      title: "Countrywide Delivery",
      description: "Fast dispatch across Kenya straight to your doorstep.",
    },
    {
      icon: MessageCircle,
      title: "Sizing Assistance",
      description: "Confirm measurements on WhatsApp before placing an order.",
    },
    {
      icon: ShieldCheck,
      title: "Authentic Quality",
      description: "Curated streetwear, durable fabrics, and everyday comfort.",
    },
  ];

  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl py-10 sm:py-16">
        {/* Header */}
        <header className="pb-8 sm:pb-10 border-b border-border/60">
          <h1 className="text-3xl sm:text-5xl font-extrabold text-foreground tracking-tight">
            Contact Us
          </h1>
          <p className="mt-3 text-sm sm:text-base text-muted-foreground max-w-xl leading-relaxed">
            Have a question about a product, sizing, or an existing order? Reach
            out directly through any of the channels below or visit us in Thika.
          </p>
        </header>

        {/* Direct Contact Channels — Clean open list, no cards */}
        <section className="divide-y divide-border/60">
          {contactChannels.map((channel) => (
            <a
              key={channel.title}
              href={channel.href}
              target={channel.external ? "_blank" : undefined}
              rel={channel.external ? "noopener noreferrer" : undefined}
              className="group py-6 flex items-start justify-between gap-4 transition-colors hover:bg-muted/20 -mx-3 px-3 rounded-xl"
            >
              <div className="flex items-start gap-4 min-w-0">
                <div className={`mt-0.5 shrink-0 ${channel.iconColor}`}>
                  <channel.icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-sm font-semibold text-foreground">
                    {channel.title}
                  </h2>
                  <p className="text-base sm:text-lg font-bold text-foreground mt-0.5 break-words group-hover:text-primary transition-colors">
                    {channel.value}
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                    {channel.description}
                  </p>
                </div>
              </div>

              <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0 mt-1" />
            </a>
          ))}
        </section>

        {/* Store Hours */}
        <section className="py-6 border-t border-border/60 flex items-start gap-4">
          <Clock className="h-5 w-5 text-foreground shrink-0 mt-0.5" />
          <div className="flex-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h2 className="text-sm font-semibold text-foreground">
                Opening Hours
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                Uhuru Street, Thika Town
              </p>
            </div>
            <div className="text-sm text-foreground sm:text-right">
              <p className="font-semibold">Mon – Sat: 10:00 AM – 8:00 PM</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Sunday: Closed
              </p>
            </div>
          </div>
        </section>

        {/* Service Highlights */}
        <section className="pt-8 mt-2 border-t border-border/60 grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
          {highlights.map((item) => (
            <div key={item.title} className="space-y-1.5">
              <item.icon className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-bold text-foreground">
                {item.title}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
