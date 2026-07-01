'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { motion, AnimatePresence } from 'motion/react';
import { isSupabaseConfigured, supabase, getMockDatabase } from '@/lib/supabase';
import { Mail, Phone, MapPin, Send, CheckCircle, Clock, MessageSquare } from 'lucide-react';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    if (!name.trim() || !email.trim() || !message.trim()) {
      setErrorMessage('Please fill out all required fields.');
      setIsSubmitting(false);
      return;
    }

    try {
      if (isSupabaseConfigured()) {
        const { error } = await supabase
          .from('messages')
          .insert({
            name,
            email,
            message
          });

        if (error) throw error;
      } else {
        // Mock Sandbox persistence
        const mockDb = getMockDatabase();
        const currentMessages = mockDb.messages;
        const newMsg = {
          id: 'msg-' + Math.random().toString(36).substring(2, 11),
          name,
          email,
          message,
          created_at: new Date().toISOString()
        };
        mockDb.messages = [newMsg, ...currentMessages];
      }

      setSubmitSuccess(true);
      // Reset fields
      setName('');
      setEmail('');
      setMessage('');
    } catch (err: any) {
      console.error('Error submitting contact form:', err);
      setErrorMessage(err.message || 'An error occurred while transmitting your message.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col justify-between">
      <Header />

      <main className="flex-1 py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-12">
        
        {/* Page title HUD */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#8B1E2A]/5 border border-[#8B1E2A]/20 text-[#8B1E2A] text-xs font-bold uppercase tracking-widest rounded-none">
            <MessageSquare className="w-3.5 h-3.5 text-[#C5A059]" />
            Imperial Support Concierge
          </div>
          <h1 className="font-heading text-3xl sm:text-5xl font-light italic text-[#1A1A1A]">
            Contact <span className="text-[#8B1E2A] font-bold not-italic">Our Artisans</span>
          </h1>
          <p className="text-sm text-[#554D4D] font-light leading-relaxed">
            Reach out to our Flagship office in Lahore or dispatch a formal inquiry. Our expert chemical color consultants typically respond within 12 royal hours.
          </p>
        </div>

        {/* Form and info split container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left Column: Office Contacts (5 Columns) */}
          <div className="lg:col-span-5 space-y-8 text-left">
            
            {/* Flagship Lahore Hub card */}
            <div className="bg-[#F5F1E9] border-2 border-[#D4CBB3] p-8 space-y-6 relative overflow-hidden shadow-sm">
              <div className="absolute top-0 right-0 bg-[#C5A059] text-white text-[9px] font-bold px-3 py-1 rounded-none tracking-widest uppercase">
                HEAD OFFICE
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#8B1E2A] font-mono">
                  Lahore Corporate Flagship
                </span>
                <h3 className="font-heading text-xl font-bold text-[#1A1A1A]">
                  New Mughal Paint 
                </h3>
              </div>

              <hr className="border-[#D4CBB3]/60" />

              <div className="space-y-4 text-xs text-[#554D4D]">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4.5 h-4.5 text-[#C5A059] shrink-0 mt-0.5" />
                  <span>7-A Guldasht Town Zarar Shaheed Road Near Ranger HeadQuarter Lahore Pakistan</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4.5 h-4.5 text-[#C5A059] shrink-0" />
                  <a href="tel:+924237654321" className="hover:text-[#8B1E2A] font-semibold transition-colors">
                    +92 3289467399
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-4.5 h-4.5 text-[#C5A059] shrink-0" />
                  <a href="mailto:support@newmughalpaint.com" className="hover:text-[#8B1E2A] font-semibold transition-colors">
                    allendedsolutions@gmail.com
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-4.5 h-4.5 text-[#C5A059] shrink-0" />
                  <span>Monday - Sunday: 09:00 AM - 10:00 PM (PKT)</span>
                </div>
              </div>
            </div>

            {/* Helpline Advisory Callout */}
            <div className="bg-white border-2 border-[#D4CBB3] p-6 text-xs space-y-3">
              <h4 className="font-bold text-[#8B1E2A] uppercase tracking-wider">PROJECT ADVISORY</h4>
              <p className="text-[#554D4D] font-light leading-relaxed">
                Planning a large commercial heritage site painting or seeking specialized weathering specifications for public monuments? Email our executive council for dedicated support files:
              </p>
              <a 
                href="mailto:projects@newmughalpaint.com" 
                className="text-[#C5A059] font-bold hover:underline tracking-wider font-mono uppercase block"
              >
                allendedsolutions@gmail.com
              </a>
            </div>
          </div>

          {/* Right Column: Contact Form (7 Columns) */}
          <div className="lg:col-span-7 bg-white border-2 border-[#D4CBB3] p-6 sm:p-10 text-left shadow-sm">
            
            <AnimatePresence mode="wait">
              {submitSuccess ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="py-12 text-center space-y-5"
                >
                  <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto border border-green-200 shadow-sm">
                    <CheckCircle className="w-8 h-8 stroke-[1.5]" />
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="font-heading text-2xl font-bold text-[#1A1A1A]">Transmission Successful!</h3>
                    <p className="text-sm text-[#554D4D] font-light max-w-md mx-auto">
                      Thank you. Your message has been safely logged in our database. Our color advisors will review your inquiry shortly.
                    </p>
                  </div>

                  <div className="pt-4">
                    <button
                      onClick={() => setSubmitSuccess(false)}
                      className="bg-[#8B1E2A] text-white px-6 py-2.5 text-xs font-bold uppercase tracking-widest border-b-2 border-r-2 border-[#C5A059] hover:bg-[#721822]"
                    >
                      SEND ANOTHER MESSAGE
                    </button>
                  </div>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  
                  <div className="space-y-2">
                    <h3 className="font-heading text-lg font-bold text-[#1A1A1A] uppercase tracking-wider">
                      Transmit a Message
                    </h3>
                    <p className="text-xs text-neutral-400 font-light leading-relaxed">
                      Please enter your valid communication credentials to start a dialogue.
                    </p>
                  </div>

                  {errorMessage && (
                    <div className="p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-xs font-semibold">
                      {errorMessage}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Name input */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#1A1A1A] uppercase tracking-wider font-mono">
                        Your Full Name <span className="text-red-500">*</span>
                      </label>
                      <input 
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Ali"
                        className="w-full p-3 border-2 border-[#D4CBB3] rounded-none text-sm text-[#1A1A1A] bg-[#FAF8F5] focus:outline-none focus:border-[#8B1E2A]"
                      />
                    </div>

                    {/* Email input */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#1A1A1A] uppercase tracking-wider font-mono">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <input 
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g. ali@gmail.com"
                        className="w-full p-3 border-2 border-[#D4CBB3] rounded-none text-sm text-[#1A1A1A] bg-[#FAF8F5] focus:outline-none focus:border-[#8B1E2A]"
                      />
                    </div>
                  </div>

                  {/* Message body */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#1A1A1A] uppercase tracking-wider font-mono">
                      Your Message <span className="text-red-500">*</span>
                    </label>
                    <textarea 
                      rows={5}
                      required
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Specify your shade requests, delivery inquiries, or project estimates here..."
                      className="w-full p-3 border-2 border-[#D4CBB3] rounded-none text-sm text-[#1A1A1A] bg-[#FAF8F5] focus:outline-none focus:border-[#8B1E2A]"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full sm:w-auto bg-[#8B1E2A] text-white py-3 px-8 text-xs font-bold tracking-widest uppercase border-b-2 border-r-2 border-[#C5A059] hover:bg-[#721822] disabled:bg-[#8B1E2A]/70 flex items-center justify-center gap-2"
                    >
                      <Send className="w-3.5 h-3.5 text-[#C5A059]" />
                      {isSubmitting ? 'TRANSMITTING INQUIRY...' : 'TRANSMIT DECREE'}
                    </button>
                  </div>

                </form>
              )}
            </AnimatePresence>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
