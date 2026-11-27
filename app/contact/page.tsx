import {
  Clock,
  ExternalLink,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
  Sparkles,
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
      title: "WhatsApp Live Chat",
      subtitle: "Fastest response time",
      value: "+254 716 836 551",
      actionText: "Chat on WhatsApp",
      href: whatsappUrl,
      external: true,
      highlight: true,
      color: "text-[#25D366]",
      bg: "bg-[#25D366]/10",
      border: "border-[#25D366]/30",
    },
    {
      icon: Phone,
      title: "Phone Call Support",
      subtitle: "Direct voice line",
      value: "+254 716 836 551",
      actionText: "Call Now",
      href: "tel:+254716836551",
      external: false,
      color: "text-primary",
      bg: "bg-primary/10",
      border: "border-border",
    },
    {
      icon: Mail,
      title: "Email Support",
      subtitle: "Inquiries & feedback",
      value: "hello@bloomshop.com",
      actionText: "Send Email",
      href: "mailto:hello@bloomshop.com",
      external: false,
      color: "text-primary",
      bg: "bg-primary/10",
      border: "border-border",
    },
    {
      icon: MapPin,
      title: "Physical Store",
      subtitle: "Uhuru Street, Thika Town",
      value: "Kiambu County, Kenya",
      actionText: "Get Directions",
      href: "https://maps.google.com/?q=Uhuru+Street+Thika+Kenya",
      external: true,
      color: "text-primary",
      bg: "bg-primary/10",
      border: "border-border",
    },
  ];

  const highlights = [
    {
      icon: Truck,
      title: "Fast Countrywide Delivery",
      description: "Quick dispatch across Kenya directly to your doorstep.",
    },
    {
      icon: MessageCircle,
      title: "Instant Sizing Assistance",
      description: "Chat with us on WhatsApp to verify measurements before ordering.",
    },
    {
      icon: ShieldCheck,
      title: "100% Authentic Quality",
      description: "Hand-picked premium streetwear fabrics, durable stitching, and comfort.",
    },
  ];

  return (
    <div className="bg-background min-h-screen">
      {/* Hero Header */}
      <section className="border-b border-border/60 bg-gradient-to-b from-primary/5 via-background to-background py-10 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold mb-4">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Customer Care & Direct Inquiries</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-foreground tracking-tight">
            We&apos;re here to <span className="text-primary">help you.</span>
          </h1>
          <p className="mt-3 sm:mt-4 text-sm sm:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Have a question about a product, sizing, or an existing order? Connect
            with our team directly via WhatsApp, phone, or visit our Thika store.
          </p>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="py-10 sm:py-14">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl space-y-10 sm:space-y-12">
          {/* Contact Channels Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {contactChannels.map((channel) => (
              <a
                key={channel.title}
                href={channel.href}
                target={channel.external ? "_blank" : undefined}
                rel={channel.external ? "noopener noreferrer" : undefined}
                className={`group relative p-5 sm:p-6 rounded-2xl bg-card border ${channel.border} shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between cursor-pointer`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`w-11 h-11 rounded-xl ${channel.bg} ${channel.color} flex items-center justify-center shrink-0`}
                    >
                      <channel.icon className="h-5 w-5" />
                    </div>
                    {channel.highlight && (
                      <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#25D366]/15 text-[#25D366] border border-[#25D366]/30">
                        Recommended
                      </span>
                    )}
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-foreground">
                    {channel.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {channel.subtitle}
                  </p>
                  <p className="text-sm font-semibold text-foreground mt-2">
                    {channel.value}
                  </p>
                </div>

                <div className="pt-5 mt-4 border-t border-border/50 flex items-center justify-between text-xs font-semibold text-primary group-hover:text-primary/80 transition-colors">
                  <span>{channel.actionText}</span>
                  <ExternalLink className="h-3.5 w-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
              </a>
            ))}
          </div>

          {/* Location & Store Hours (Side-by-side or Stacked on Mobile) */}
          <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-xs">
            <div className="p-5 sm:p-6 border-b border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-muted/20">
              <div>
                <span className="text-xs uppercase tracking-wider font-semibold text-primary">
                  Storefront Location
                </span>
                <h2 className="text-lg sm:text-xl font-bold text-foreground mt-0.5">
                  BloomShop Physical Store
                </h2>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <span>Uhuru Street, Thika Town, Kiambu County, Kenya</span>
                </p>
              </div>

              {/* Operating hours pill */}
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-background border border-border/80 shrink-0">
                <Clock className="h-4 w-4 text-primary shrink-0" />
                <div className="text-xs">
                  <p className="font-semibold text-foreground">Mon - Sat: 10:00 AM - 8:00 PM</p>
                  <p className="text-muted-foreground text-[11px]">Sunday: Closed</p>
                </div>
              </div>
            </div>

            {/* Embedded Google Map */}
            <div className="relative w-full h-[280px] sm:h-[360px] bg-muted/40">
              <iframe
                title="BloomShop Thika Store Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3989.1554562217684!2d37.0693343!3d-1.0332801!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182f4e8574d53cb1%3A0x6e9f196be1492ba2!2sThika%2C%20Kenya!5e0!3m2!1sen!2ske!4v1710000000000!5m2!1sen!2ske"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-full opacity-90 hover:opacity-100 transition-opacity"
              />
            </div>
          </div>

          {/* Highlights Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            {highlights.map((h) => (
              <div
                key={h.title}
                className="p-5 rounded-xl border border-border/70 bg-card/60 flex items-start gap-3.5"
              >
                <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <h.icon className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-foreground">
                    {h.title}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    {h.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Direct WhatsApp Callout Banner */}
          <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-[#25D366]/15 via-background to-primary/10 border border-[#25D366]/30 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-foreground">
                Need quick answers before ordering?
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                Our support team is online on WhatsApp to help with product availability, sizes, and instant checkout.
              </p>
            </div>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 h-11 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-sm shadow-md transition-colors shrink-0"
            >
              <MessageCircle className="h-4 w-4" />
              <span>Message on WhatsApp</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
