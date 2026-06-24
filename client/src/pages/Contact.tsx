import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { companyInfo } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Mail, Phone, MapPin, Clock, Loader2, CheckCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useLocation } from 'wouter';
import PageTransition from '@/components/PageTransition';
import PageHero from '@/components/PageHero';

// Using internal API to save to CRM and send emails using nodemailer

export default function Contact() {
  const [location] = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [lastSubmitTime, setLastSubmitTime] = useState(0);
  const [honeypot, setHoneypot] = useState(''); // Anti-spam honeypot
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    category: '',
    message: ''
  });


  useEffect(() => {
    // Extract category from URL query parameter
    const params = new URLSearchParams(location.split('?')[1]);
    const category = params.get('category');
    if (category) {
      setFormData(prev => ({
        ...prev,
        category: category
      }));
    }
  }, [location]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Honeypot check — real users never fill this hidden field
    if (honeypot) {
      toast.success('Message sent successfully!'); // Fake success to fool bots
      return;
    }

    // Validate form
    if (!formData.name || !formData.email || !formData.phone || !formData.message) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Input length limits
    if (formData.name.length > 100) {
      toast.error('Name is too long (max 100 characters)');
      return;
    }
    if (formData.message.length > 2000) {
      toast.error('Message is too long (max 2000 characters)');
      return;
    }

    // Email validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    // Phone validation — allow digits, spaces, +, -, ()
    const phoneClean = formData.phone.replace(/[\s\-()]/g, '');
    if (!/^\+?\d{7,15}$/.test(phoneClean)) {
      toast.error('Please enter a valid phone number');
      return;
    }

    // Rate limiting — prevent rapid repeated submissions
    const now = Date.now();
    if (now - lastSubmitTime < 10000) {
      toast.error('Please wait a few seconds before submitting again');
      return;
    }

    setIsSubmitting(true);
    setLastSubmitTime(now);

    try {
      const response = await fetch('/api/enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          productInterest: formData.category,
          message: formData.message,
          source: 'contact_page'
        }),
      });

      const result = await response.json();

      if (result.success) {
        setIsSuccess(true);
        toast.success('Message sent successfully! We will contact you shortly.');
        setFormData({ name: '', email: '', phone: '', category: '', message: '' });
        // Reset success state after 5 seconds
        setTimeout(() => setIsSuccess(false), 5000);
      } else {
        toast.error(result.error || 'Failed to send message. Please try again or call us directly.');
      }
    } catch (error) {
      toast.error('Network error. Please check your connection or call us directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-white">
        <Header />

        {/* Hero Section */}
        <PageHero 
          title="Get In Touch" 
          subtitle="Have questions about our products? We'd love to hear from you. Send us a message and we'll respond as soon as possible." 
        />


      {/* Main Content */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
            {/* Contact Info */}
            <div className="lg:col-span-1 space-y-6">
              {/* Address */}
              <div className="bg-secondary p-6 rounded-lg">
                <div className="flex items-start gap-4">
                  <MapPin className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-foreground mb-2">Address</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {companyInfo.address}
                    </p>
                  </div>
                </div>
              </div>

              {/* Phone */}
              <div className="bg-secondary p-6 rounded-lg">
                <div className="flex items-start gap-4">
                  <Phone className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-foreground mb-2">Phone</h3>
                    <a href={`tel:${companyInfo.phone}`} className="text-primary hover:underline font-semibold">
                      {companyInfo.phone}
                    </a>
                  </div>
                </div>
              </div>

              {/* Email */}
              <div className="bg-secondary p-6 rounded-lg">
                <div className="flex items-start gap-4">
                  <Mail className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-foreground mb-2">Email</h3>
                    <a href={`mailto:${companyInfo.email}`} className="text-primary hover:underline font-semibold">
                      {companyInfo.email}
                    </a>
                  </div>
                </div>
              </div>

              {/* Business Hours */}
              <div className="bg-secondary p-6 rounded-lg">
                <div className="flex items-start gap-4">
                  <Clock className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-foreground mb-2">Business Hours</h3>
                    <p className="text-sm text-muted-foreground">
                      Monday - Friday: 9:00 AM - 6:00 PM<br />
                      Saturday: 10:00 AM - 4:00 PM<br />
                      Sunday: Closed
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="bg-secondary p-8 rounded-lg">
                <h2 className="text-2xl font-bold text-foreground mb-6">
                  Send us a Message
                </h2>

                <div className="space-y-6">
                  {/* Honeypot — hidden from real users, catches bots */}
                  <div className="absolute -left-[9999px]" aria-hidden="true">
                    <input
                      type="text"
                      name="website"
                      value={honeypot}
                      onChange={(e) => setHoneypot(e.target.value)}
                      tabIndex={-1}
                      autoComplete="off"
                    />
                  </div>

                  {/* Name */}
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      maxLength={100}
                      required
                      className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200"
                      placeholder="Your name"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      maxLength={254}
                      required
                      className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200"
                      placeholder="your@email.com"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      maxLength={20}
                      required
                      className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200"
                      placeholder="+91 XXXXXXXXXX"
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      Product Category {formData.category && '(Pre-filled)'}
                    </label>
                    <input
                      type="text"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      maxLength={100}
                      className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200"
                      placeholder="Which product category are you interested in?"
                    />
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      Message *
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows={6}
                      maxLength={2000}
                      required
                      className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200 resize-none"
                      placeholder="Tell us about your storage needs..."
                    />
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full py-3 font-semibold transition-all duration-300 ${isSuccess
                      ? 'bg-green-600 hover:bg-green-600 text-white'
                      : 'bg-primary hover:bg-primary/90 text-white'
                      }`}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Sending...
                      </span>
                    ) : isSuccess ? (
                      <span className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5" />
                        Message Sent Successfully!
                      </span>
                    ) : (
                      'Send Message'
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>

          {/* Interactive Map Section */}
          <div className="mt-16 bg-secondary p-4 rounded-xl shadow-inner border border-gray-100">
            <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              Find us on Google Maps
            </h3>
            <div className="rounded-lg overflow-hidden shadow-lg border border-gray-200 aspect-[16/9] md:aspect-[21/9] w-full bg-gray-200">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.467475355673!2d78.71887467590858!3d10.775466489373307!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3baaf50821df26df%3A0xe54d920cd767a9cf!2sVJ%20Rack-supermarket%20rack%20manufacturer!5e0!3m2!1sen!2sin!4v1718160000000!5m2!1sen!2sin"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="VJ Rack Head Office Google Map"
                className="w-full h-full min-h-[350px]"
              />
            </div>
          </div>
        </div>
      </section>

        <Footer />
      </div>
    </PageTransition>
  );
}
